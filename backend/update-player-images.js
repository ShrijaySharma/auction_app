import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { initDatabase } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Paths
const photosDir = join(__dirname, '../photos/file_zip');
const uploadsDir = join(__dirname, 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

async function updatePlayerImages() {
  const db = await initDatabase();

  console.log('🔄 Starting player image update...');

  return new Promise((resolve, reject) => {
    // Get all players from database
    db.all('SELECT id, serial_number, name FROM players ORDER BY serial_number', (err, players) => {
      if (err) {
        console.error('Error fetching players:', err);
        db.close();
        reject(err);
        return;
      }

      console.log(`📋 Found ${players.length} players in database`);

      let updated = 0;
      let missing = 0;
      let processed = 0;
      const totalPlayers = players.length;

      function checkComplete() {
        processed++;
        if (processed === totalPlayers) {
          console.log(`\n✅ Processed ${totalPlayers} players`);
          console.log(`✅ Updated ${updated} players with images`);
          console.log(`⚠️  ${missing} players missing images`);
          db.close();
          resolve();
        }
      }

      players.forEach((player) => {
        const serialNumber = player.serial_number;
        
        if (!serialNumber) {
          console.log(`⚠️  Player ${player.name} (ID: ${player.id}) has no serial number - skipping`);
          checkComplete();
          return;
        }

        const sourceImagePath = join(photosDir, `${serialNumber}.jpeg`);
        const imageExists = fs.existsSync(sourceImagePath);

        if (imageExists) {
          // Copy image to uploads folder with a new name
          const timestamp = Date.now();
          const newFileName = `player-${serialNumber}-${timestamp}.jpeg`;
          const destImagePath = join(uploadsDir, newFileName);
          
          try {
            fs.copyFileSync(sourceImagePath, destImagePath);
            const imagePath = `/uploads/${newFileName}`;
            
            // Update database
            db.run(
              'UPDATE players SET image = ? WHERE id = ?',
              [imagePath, player.id],
              function(updateErr) {
                if (updateErr) {
                  console.error(`❌ Error updating player ${player.name} (Serial: ${serialNumber}):`, updateErr);
                } else {
                  console.log(`✅ Updated ${player.name} (Serial: ${serialNumber}) with image`);
                  updated++;
                }
                checkComplete();
              }
            );
          } catch (copyErr) {
            console.error(`❌ Error copying image for ${player.name} (Serial: ${serialNumber}):`, copyErr);
            // Set placeholder for missing image
            db.run(
              'UPDATE players SET image = ? WHERE id = ?',
              ['?', player.id],
              function(updateErr) {
                if (updateErr) {
                  console.error(`❌ Error setting placeholder for ${player.name}:`, updateErr);
                } else {
                  console.log(`⚠️  Set placeholder (?) for ${player.name} (Serial: ${serialNumber}) - image file not found`);
                  missing++;
                }
                checkComplete();
              }
            );
          }
        } else {
          // Image file doesn't exist - set placeholder
          console.log(`⚠️  Image not found for serial ${serialNumber} (${player.name}) - setting placeholder`);
          db.run(
            'UPDATE players SET image = ? WHERE id = ?',
            ['?', player.id],
            function(updateErr) {
              if (updateErr) {
                console.error(`❌ Error setting placeholder for ${player.name}:`, updateErr);
              } else {
                missing++;
              }
              checkComplete();
            }
          );
        }
      });
    });
  });
}

updatePlayerImages().catch(console.error);

