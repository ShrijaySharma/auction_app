import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initDatabase } from './db.js';

async function checkDb() {
    const db = await initDatabase();

    console.log('🔍 Checking database state...');

    db.serialize(() => {
        db.get('SELECT COUNT(*) as count FROM teams', (err, row) => {
            if (err) console.error(err);
            console.log(`Teams count: ${row.count} (Expected: 20)`);
        });

        db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
            if (err) console.error(err);
            console.log(`Users count: ${row.count} (Expected: 22 - 20 owners + admin + host)`);
        });

        db.get('SELECT COUNT(*) as count FROM players', (err, row) => {
            if (err) console.error(err);
            console.log(`Players count: ${row.count} (Expected: 0)`);
        });
    });
}

checkDb();
