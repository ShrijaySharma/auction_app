import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// All host routes require authentication
router.use(requireAuth);

// Get current player and bid info (read-only)
router.get('/current-info', (req, res) => {
  const db = req.app.locals.db;

  db.get('SELECT * FROM auction_state WHERE id = 1', (err, state) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!state || !state.current_player_id) {
      return res.json({
        player: null,
        highestBid: null,
        currentBid: 0,
        biddingLocked: state?.bidding_locked === 1,
        status: state?.status || 'STOPPED',
        bidIncrements: {
          increment1: state?.bid_increment_1 || 500,
          increment2: state?.bid_increment_2 || 1000,
          increment3: state?.bid_increment_3 || 5000
        }
      });
    }

    // Get player
    db.get('SELECT * FROM players WHERE id = ?', [state.current_player_id], (err, player) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Get highest bid
      db.get(
        `SELECT b.*, t.name as team_name, t.id as team_id
         FROM bids b
         JOIN teams t ON b.team_id = t.id
         WHERE b.player_id = ?
         ORDER BY b.amount DESC
         LIMIT 1`,
        [state.current_player_id],
        (err, highestBid) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          const currentBid = highestBid ? highestBid.amount : (player ? player.base_price : 0);

          // Get stats
          db.all('SELECT status FROM players', (err, allPlayers) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            const stats = {
              sold: allPlayers.filter(p => p.status === 'SOLD').length,
              unsold: allPlayers.filter(p => p.status === 'UNSOLD').length,
              available: allPlayers.filter(p => p.status === 'AVAILABLE').length
            };

            res.json({
              player,
              highestBid,
              currentBid,
              biddingLocked: state.bidding_locked === 1,
              status: state.status,
              bidIncrements: {
                increment1: state.bid_increment_1,
                increment2: state.bid_increment_2,
                increment3: state.bid_increment_3
              },
              stats
            });
          });
        }
      );
    });
  });
});

// Get all bids for current player (read-only)
router.get('/bids', (req, res) => {
  const db = req.app.locals.db;
  
  db.get('SELECT current_player_id FROM auction_state WHERE id = 1', (err, state) => {
    if (err || !state || !state.current_player_id) {
      return res.json({ bids: [] });
    }

    db.all(
      `SELECT b.*, t.name as team_name
       FROM bids b
       JOIN teams t ON b.team_id = t.id
       WHERE b.player_id = ?
       ORDER BY b.amount DESC, b.timestamp DESC`,
      [state.current_player_id],
      (err, bids) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json({ bids });
      }
    );
  });
});

// Get all teams with their budgets (read-only)
router.get('/teams', (req, res) => {
  const db = req.app.locals.db;
  
  db.all(
    `SELECT id, name, budget 
     FROM teams 
     ORDER BY name`,
    (err, teams) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(teams);
    }
  );
});

export default router;

