import sqlite3 from 'sqlite3';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new sqlite3.Database(join(__dirname, 'backend', 'auction.db'));

db.all("SELECT name FROM teams", (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        console.log("Teams in local DB:");
        rows.forEach(row => console.log("- " + row.name));
    }
    db.all("SELECT username, role FROM users", (err, users) => {
        if (err) {
            console.error(err);
        } else {
            console.log("\nUsers in local DB:");
            users.forEach(user => console.log(`- ${user.username} (${user.role})`));
        }
        db.close();
    });
});
