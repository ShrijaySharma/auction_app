import sqlite3 from 'sqlite3';
import bcrypt from 'bcrypt';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initDatabase } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function seed() {
  const db = await initDatabase();

  console.log('🌱 Starting database seeding...');

  // Hash passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const hostPassword = await bcrypt.hash('host123', 10);

  // Clear existing data
  db.serialize(() => {
    db.run('DELETE FROM bids');
    db.run('DELETE FROM players');
    db.run('DELETE FROM teams');
    db.run('DELETE FROM users');

    // Insert admin user
    db.run(
      `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
      ['admin', adminPassword, 'admin'],
      function(err) {
        if (err) {
          console.error('Error inserting admin:', err);
        } else {
          console.log('✅ Admin user created (username: admin)');
        }
      }
    );

    // Insert host/audience user
    db.run(
      `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
      ['host', hostPassword, 'host'],
      function(err) {
        if (err) {
          console.error('Error inserting host:', err);
        } else {
          console.log('✅ Host user created (username: host)');
        }
      }
    );

    // Insert 8 team owners
    const teams = [
      { name: 'Mahavir Group', owner: 'mahavir_group' },
      { name: 'Naveen Jewellers', owner: 'naveen_jewellers' },
      { name: 'Gurudev Rice Mill', owner: 'gurudev_rice' },
      { name: 'Nandani Construction', owner: 'nandani_construction' },
      { name: 'Senior Citizen Group', owner: 'senior_citizen' },
      { name: 'Manju Sales', owner: 'manju_sales' },
      { name: 'Mahesh Eleven', owner: 'mahesh_eleven' },
      { name: 'Satyam Furniture', owner: 'satyam_furniture' }
    ];

    let teamCount = 0;
    teams.forEach(async (team, index) => {
      const ownerPassword = await bcrypt.hash('owner123', 10);
      db.run(
        `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`,
        [team.owner, ownerPassword, 'owner'],
        async function(err) {
          if (err) {
            console.error(`Error inserting owner ${team.owner}:`, err);
          } else {
            const userId = this.lastID;
            db.run(
              `INSERT INTO teams (name, owner_id) VALUES (?, ?)`,
              [team.name, userId],
              function(err) {
                if (err) {
                  console.error(`Error inserting team ${team.name}:`, err);
                } else {
                  const teamId = this.lastID;
                  db.run(
                    `UPDATE users SET team_id = ? WHERE id = ?`,
                    [teamId, userId]
                  );
                  teamCount++;
                  console.log(`✅ Team "${team.name}" created (username: ${team.owner})`);
                  
                  if (teamCount === teams.length) {
                    insertPlayers();
                  }
                }
              }
            );
          }
        }
      );
    });

    function insertPlayers() {
      const players = [
        { serial: 1, name: 'Appu Bohra', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 2, name: 'Vicky Bohra', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 3, name: 'Kanha Sharma', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 4, name: 'Tanay Sancheti', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 5, name: 'Suraj Soni', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 6, name: 'Akshaya Sankhla', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 7, name: 'Nikunj Laddha', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 8, name: 'Hardik Golchha', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 9, name: 'Rahul Bohra', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 10, name: 'Rachit Kotak', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 11, name: 'Yogesh Soni', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 12, name: 'Rishi Khandelwal', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 13, name: 'Samrat Maheshwari', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 14, name: 'Sarvesh Gandhi', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 15, name: 'Pratik Pawar', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 16, name: 'Kartik Nair', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 17, name: 'Vikas Maheshwari', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 18, name: 'Shreyansh Sharma', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 19, name: 'Aarav Goyal', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 20, name: 'Shubh Manek', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 21, name: 'Animesh Chopra', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 22, name: 'Ansh Agarwal', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 23, name: 'Lakshya Mithiya', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 24, name: 'Sarang Pahade', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 25, name: 'Yash Soni', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 26, name: 'Pratham Bhojani', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 27, name: 'Shubham Patel', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 28, name: 'Kunal Sharma', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 29, name: 'Somil Golchha', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 30, name: 'Shubham Bhansali', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 31, name: 'Rohit Tatia', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 32, name: 'Harsh Mithia', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 33, name: 'Shubham Soni', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 34, name: 'Mukesh Gogad', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 35, name: 'Bharat Jethani', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 36, name: 'Harsh Bhojani', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 37, name: 'Darsheel Kothari', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 38, name: 'Krishna Patel', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 39, name: 'Lucky Daga', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 40, name: 'Shivam Patel', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 41, name: 'Saurabh Gandhi', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 42, name: 'Abhay Sankhla', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 43, name: 'Ajay Sankhla', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 44, name: 'Keshav Golchha', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 45, name: 'Yash Maheshwari', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 46, name: 'Shubham Jangail', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 47, name: 'Ashish Agarwal', role: 'Batsman', country: '', base_price: 1000 },
        { serial: 48, name: 'Raju Sahu', role: 'Batsman', country: '', base_price: 1000 }
      ];

      const stmt = db.prepare(`INSERT INTO players (name, serial_number, role, country, base_price) VALUES (?, ?, ?, ?, ?)`);
      
      players.forEach((player) => {
        stmt.run(player.name, player.serial, player.role, player.country, player.base_price);
      });
      
      stmt.finalize((err) => {
        if (err) {
          console.error('Error inserting players:', err);
        } else {
          console.log(`✅ ${players.length} players inserted`);
          console.log('🎉 Seeding completed!');
          db.close();
        }
      });
    }
  });
}

seed().catch(console.error);

