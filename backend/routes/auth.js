import express from 'express';
import bcrypt from 'bcrypt';
import sqlite3 from 'sqlite3';

const router = express.Router();

// Login endpoint
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const db = req.app.locals.db;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  db.get(
    `SELECT u.*, t.id as team_id, t.name as team_name 
     FROM users u 
     LEFT JOIN teams t ON u.team_id = t.id 
     WHERE u.username = ?`,
    [username],
    async (err, user) => {
      if (err) {
        console.error('Database error during login:', err);
        return res.status(500).json({ error: 'Database error: ' + err.message });
      }

      if (!user) {
        console.log('Login attempt failed: User not found -', username);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      try {
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          console.log('Login attempt failed: Invalid password for user -', username);
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Set session
        req.session.userId = user.id;
        req.session.username = user.username;
        req.session.role = user.role;
        req.session.teamId = user.team_id;

        console.log('Login successful:', user.username, 'Role:', user.role);

        res.json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            teamId: user.team_id,
            teamName: user.team_name
          }
        });
      } catch (bcryptError) {
        console.error('Bcrypt error during login:', bcryptError);
        return res.status(500).json({ error: 'Authentication error' });
      }
    }
  );
});

// Logout endpoint
router.post('/logout', (req, res) => {
  const sessionCookieName = req.session.cookie?.name || 'connect.sid';
  
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    // Clear the session cookie
    res.clearCookie(sessionCookieName, {
      path: '/',
      httpOnly: true,
      secure: false
    });
    res.json({ success: true });
  });
});

// Check session endpoint
router.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const db = req.app.locals.db;
  db.get(
    `SELECT u.*, t.id as team_id, t.name as team_name 
     FROM users u 
     LEFT JOIN teams t ON u.team_id = t.id 
     WHERE u.id = ?`,
    [req.session.userId],
    (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      res.json({
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          teamId: user.team_id,
          teamName: user.team_name
        }
      });
    }
  );
});

export default router;

