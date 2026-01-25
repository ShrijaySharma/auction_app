import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import fs from 'fs';
import { initDatabase } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper to generate random string
function randomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

async function reseed() {
    const db = await initDatabase();

    console.log('🌱 Starting database reset for 20 teams...');

    // Hash passwords for admin/host
    const adminPassword = await bcrypt.hash('admin123', 10);
    const hostPassword = await bcrypt.hash('host123', 10);

    // Clear existing data
    db.serialize(() => {
        // 1. Clear tables
        db.run('DELETE FROM bids');
        db.run('DELETE FROM players');
        db.run('DELETE FROM teams');
        db.run('DELETE FROM users');
        db.run('DELETE FROM sqlite_sequence'); // Reset auto-increment IDs

        console.log('✅ Cleared existing data');

        // 2. Insert admin and host
        const insertUser = db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
        insertUser.run('admin', adminPassword, 'admin');
        insertUser.run('host', hostPassword, 'host');
        insertUser.finalize();
        console.log('✅ Admin and Host users created');

        // 3. Generate 20 Teams
        const teams = [];
        const credentials = [];

        // Team names: using a base list or generic names if we run out
        const teamBaseNames = [
            "Royal Strikers", "Super Kings", "Thunder Bolts", "Knight Riders",
            "Mumbai Masters", "Delhi Dynamos", "Punjab Powers", "Kolkata Killers",
            "Rajasthan Royals", "Hyderabad Heroes", "Bangalore Blasters", "Chennai Champions",
            "Gujrat Giants", "Lucknow Legends", "Pune Panthers", "Jaipur Jaguars",
            "Goa Gladiators", "Indore Invincibles", "Bhopal Bulls", "Nagpur Ninjas"
        ];

        for (let i = 0; i < 20; i++) {
            const teamName = teamBaseNames[i] || `Team ${i + 1}`;
            const username = `team${i + 1}`;
            const passwordPlain = randomString(8);

            teams.push({
                name: teamName,
                username: username,
                password: passwordPlain
            });
        }

        // 4. Insert Teams and Owners
        let processedCount = 0;

        // We need to use async/await inside the loop or callbacks carefully. 
        // Since db.run is callback based, let's wrap the insertion logic.

        const insertTeamProcess = async () => {
            for (const team of teams) {
                const hashedPassword = await bcrypt.hash(team.password, 10);

                await new Promise((resolve, reject) => {
                    db.run(
                        `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
                        [team.username, hashedPassword, 'owner'],
                        function (err) {
                            if (err) {
                                console.error(`Error inserting user ${team.username}:`, err);
                                reject(err);
                                return;
                            }
                            const userId = this.lastID;

                            db.run(
                                `INSERT INTO teams (name, owner_id, budget, bidding_locked) VALUES (?, ?, ?, ?)`,
                                [team.name, userId, 1000000, 0], // Default budget
                                function (err) {
                                    if (err) {
                                        console.error(`Error inserting team ${team.name}:`, err);
                                        reject(err);
                                        return;
                                    }
                                    const teamId = this.lastID;

                                    // Link user back to team
                                    db.run(
                                        `UPDATE users SET team_id = ? WHERE id = ?`,
                                        [teamId, userId],
                                        (err) => {
                                            if (err) reject(err);
                                            else resolve();
                                        }
                                    );
                                }
                            );
                        }
                    );
                });
                credentials.push(`| ${team.name} | ${team.username} | ${team.password} |`);
            }

            // 5. Write Credentials to File
            const credsContent = `# Auction App Credentials - 20 Teams
Generated on: ${new Date().toLocaleString()}

## Admin
Username: admin
Password: admin123

## Host
Username: host
Password: host123

## Teams
| Team Name | Username | Password |
|-----------|----------|----------|
${credentials.join('\n')}
`;
            // Write to root directory (adjust path as needed, going up one level from backend)
            const rootPath = resolve(__dirname, '..');
            const credsPath = join(rootPath, 'NEW_CREDENTIALS.md');

            fs.writeFileSync(credsPath, credsContent);
            console.log(`✅ Generated 20 teams`);
            console.log(`📄 Credentials saved to: ${credsPath}`);

            db.close();
            console.log('🎉 Reset complete!');
        };

        insertTeamProcess().catch(err => console.error("Fatal error:", err));

    });
}

reseed().catch(console.error);
