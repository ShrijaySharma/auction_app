import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initDatabase } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mapping of old team names/owners to new team names and login IDs
const teamUpdates = [
  { oldName: 'Mumbai Indians', oldOwner: 'mumbai_owner', newName: 'Mahavir Group', newOwner: 'mahavir_group' },
  { oldName: 'Chennai Super Kings', oldOwner: 'chennai_owner', newName: 'Naveen Jewellers', newOwner: 'naveen_jewellers' },
  { oldName: 'Royal Challengers Bangalore', oldOwner: 'rcb_owner', newName: 'Gurudev Rice Mill', newOwner: 'gurudev_rice' },
  { oldName: 'Kolkata Knight Riders', oldOwner: 'kkr_owner', newName: 'Nandani Construction', newOwner: 'nandani_construction' },
  { oldName: 'Delhi Capitals', oldOwner: 'delhi_owner', newName: 'Senior Citizen Group', newOwner: 'senior_citizen' },
  { oldName: 'Sunrisers Hyderabad', oldOwner: 'srh_owner', newName: 'Manju Sales', newOwner: 'manju_sales' },
  { oldName: 'Punjab Kings', oldOwner: 'punjab_owner', newName: 'Mahesh Eleven', newOwner: 'mahesh_eleven' },
  { oldName: 'Rajasthan Royals', oldOwner: 'rajasthan_owner', newName: 'Satyam Furniture', newOwner: 'satyam_furniture' }
];

async function updateTeams() {
  const db = await initDatabase();

  console.log('🔄 Updating team names and login IDs...');

  db.serialize(() => {
    let updateCount = 0;
    
    teamUpdates.forEach((update, index) => {
      // First, try to find and update by team name
      db.get(
        `SELECT id, owner_id FROM teams WHERE name = ?`,
        [update.oldName],
        (err, team) => {
          if (err) {
            console.error(`Error finding team ${update.oldName}:`, err);
            updateCount++;
            if (updateCount === teamUpdates.length) {
              console.log('🎉 Team updates completed!');
              db.close();
            }
            return;
          }

          if (team) {
            // Update team name
            db.run(
              `UPDATE teams SET name = ? WHERE id = ?`,
              [update.newName, team.id],
              function(err) {
                if (err) {
                  console.error(`Error updating team ${update.oldName}:`, err);
                } else {
                  console.log(`✅ Updated team: "${update.oldName}" → "${update.newName}"`);
                  
                  // Update owner username
                  if (team.owner_id) {
                    db.run(
                      `UPDATE users SET username = ? WHERE id = ? AND role = 'owner'`,
                      [update.newOwner, team.owner_id],
                      (err) => {
                        if (err) {
                          console.error(`Error updating username for ${update.newName}:`, err);
                        } else {
                          console.log(`✅ Updated login ID: ${update.oldOwner} → ${update.newOwner}`);
                        }
                        updateCount++;
                        if (updateCount === teamUpdates.length) {
                          console.log('🎉 Team updates completed!');
                          db.close();
                        }
                      }
                    );
                  } else {
                    // Try to update by old username if owner_id is not set
                    db.run(
                      `UPDATE users SET username = ? WHERE username = ? AND role = 'owner'`,
                      [update.newOwner, update.oldOwner],
                      (err) => {
                        if (err) {
                          console.error(`Error updating username ${update.oldOwner}:`, err);
                        } else if (this.changes > 0) {
                          console.log(`✅ Updated login ID: ${update.oldOwner} → ${update.newOwner}`);
                        }
                        updateCount++;
                        if (updateCount === teamUpdates.length) {
                          console.log('🎉 Team updates completed!');
                          db.close();
                        }
                      }
                    );
                  }
                }
              }
            );
          } else {
            // Team not found by name, try updating username directly
            console.log(`⚠️  Team "${update.oldName}" not found, trying to update username...`);
            db.run(
              `UPDATE users SET username = ? WHERE username = ? AND role = 'owner'`,
              [update.newOwner, update.oldOwner],
              function(err) {
                if (err) {
                  console.error(`Error updating username ${update.oldOwner}:`, err);
                } else if (this.changes > 0) {
                  console.log(`✅ Updated login ID: ${update.oldOwner} → ${update.newOwner}`);
                }
                updateCount++;
                if (updateCount === teamUpdates.length) {
                  console.log('🎉 Team updates completed!');
                  db.close();
                }
              }
            );
          }
        }
      );
    });
  });
}

updateTeams().catch(console.error);

