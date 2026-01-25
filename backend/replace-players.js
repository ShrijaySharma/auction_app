import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initDatabase } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const newPlayers = [
  { serial: 1, name: 'Anil Patel' },
  { serial: 2, name: 'Prateek Golchha' },
  { serial: 3, name: 'Kanha Sharma' },
  { serial: 4, name: 'Tanay Sancheti' },
  { serial: 5, name: 'Nikunj Ladhha' },
  { serial: 6, name: 'Akshaya Sankhla' },
  { serial: 7, name: 'Naresh Khotele' },
  { serial: 8, name: 'Hardik Golchha' },
  { serial: 9, name: 'Rahul Bohra' },
  { serial: 10, name: 'Yash Maheshwari' },
  { serial: 11, name: 'Abhay Jain' },
  { serial: 12, name: 'Rishi Khandelwal' },
  { serial: 13, name: 'Samrat Maheshwari' },
  { serial: 14, name: 'Vicky Bohra' },
  { serial: 15, name: 'Pratik Pawar' },
  { serial: 16, name: 'Pravesh Golchha' },
  { serial: 17, name: 'Aryan Bagani' },
  { serial: 18, name: 'Bharat Jethani' },
  { serial: 19, name: 'Shubh Manek' },
  { serial: 20, name: 'Vinod Bohra' },
  { serial: 21, name: 'Animesh Chopra' },
  { serial: 22, name: 'Ansh Agrawal' },
  { serial: 23, name: 'Lakshya Mithiya' },
  { serial: 24, name: 'Sarang Pahade' },
  { serial: 25, name: 'Sarvesh Gandhi' },
  { serial: 26, name: 'Pratham Bhojani' },
  { serial: 27, name: 'Shubham Patel' },
  { serial: 28, name: 'Hardik Gogad' },
  { serial: 29, name: 'Somil Golchha' },
  { serial: 30, name: 'Shubham Bhansali' },
  { serial: 31, name: 'Durgesh Bagani' },
  { serial: 32, name: 'Rachit Kotak' },
  { serial: 33, name: 'Sheesh Agrawal' },
  { serial: 34, name: 'Sidharth Kothari' },
  { serial: 35, name: 'Aarav Goyal' },
  { serial: 36, name: 'Vaibhav Golchha' },
  { serial: 37, name: 'Meet Bagani' },
  { serial: 38, name: 'Rahul Kothari' },
  { serial: 39, name: 'Harsh Mithiya' },
  { serial: 40, name: 'Raju Sahu' },
  { serial: 41, name: 'Lalu Sankhla' },
  { serial: 42, name: 'Kunal Khangar' },
  { serial: 43, name: 'Mukesh Gogad' },
  { serial: 44, name: 'Harsh Bhojani' },
  { serial: 45, name: 'Darsheel Kothari' },
  { serial: 46, name: 'Laksh Daga' },
  { serial: 47, name: 'Saurabh Gandhi' },
  { serial: 48, name: 'Abhay Sankhla' },
  { serial: 49, name: 'Ajay Sankhla' },
  { serial: 50, name: 'Aditya Sharma' },
  { serial: 51, name: 'Vikash Maheshwari' },
  { serial: 52, name: 'Shubham Janghel' },
  { serial: 53, name: 'Keshav Golchha' },
  { serial: 54, name: 'Ashish Agrawal' },
  { serial: 55, name: 'Kunal Sharma' },
  { serial: 56, name: 'Ankit Agrawal' },
  { serial: 57, name: 'Rohit Tatiya' },
  { serial: 58, name: 'Yash Soni' }
];

async function replacePlayers() {
  const db = await initDatabase();

  console.log('🔄 Starting player replacement...');

  db.serialize(() => {
    // Delete all existing players and bids
    db.run('DELETE FROM bids', (err) => {
      if (err) {
        console.error('Error deleting bids:', err);
      } else {
        console.log('✅ Deleted all bids');
      }
    });

    db.run('DELETE FROM players', (err) => {
      if (err) {
        console.error('Error deleting players:', err);
      } else {
        console.log('✅ Deleted all existing players');
      }
    });

    // Reset auction state
    db.run('UPDATE auction_state SET current_player_id = NULL, status = ? WHERE id = 1', ['STOPPED'], (err) => {
      if (err) {
        console.error('Error resetting auction state:', err);
      }
    });

    // Insert new players
    const stmt = db.prepare(`INSERT INTO players (name, serial_number, role, country, base_price, status) VALUES (?, ?, ?, ?, ?, ?)`);
    
    let inserted = 0;
    newPlayers.forEach((player) => {
      // Assign default values: role as 'Batsman', country as empty, base_price as 1000
      stmt.run(
        player.name,
        player.serial,
        'Batsman', // Default role
        '', // No country
        1000, // Default base price
        'AVAILABLE',
        (err) => {
          if (err) {
            console.error(`Error inserting player ${player.name}:`, err);
          } else {
            inserted++;
            if (inserted === newPlayers.length) {
              console.log(`✅ Successfully inserted ${inserted} players`);
              stmt.finalize((err) => {
                if (err) {
                  console.error('Error finalizing statement:', err);
                } else {
                  console.log('🎉 Player replacement completed!');
                  db.close();
                }
              });
            }
          }
        }
      );
    });
  });
}

replacePlayers().catch(console.error);

