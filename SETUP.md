# Quick Setup Guide

## Step-by-Step Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Seed the database (creates admin, 8 owners, 20 players)
npm run seed

# Start the backend server
npm start
```

The backend will start on `http://0.0.0.0:4000`

### 2. Frontend Setup

Open a **new terminal** window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the frontend server
npm run dev
```

The frontend will start on `http://0.0.0.0:5173`

### 3. Find Your Local IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" (e.g., 192.168.1.100)

**Mac/Linux:**
```bash
ifconfig | grep "inet "
```
or
```bash
ip addr show | grep "inet "
```

### 4. Access the Application

**On your laptop:**
- Open browser: `http://localhost:5173`

**On other devices (same Wi-Fi):**
- Open browser: `http://<YOUR_LOCAL_IP>:5173`
- Example: `http://192.168.1.100:5173`

## Login Credentials

For complete login credentials, please see **[LOGIN_CREDENTIALS.md](./LOGIN_CREDENTIALS.md)**

**Quick Reference:**
- **Admin**: `admin` / `admin123`
- **Host**: `host` / `host123`
- **Team Owners**: See LOGIN_CREDENTIALS.md for all team usernames (password: `owner123` for all)

## Troubleshooting

### Firewall Issues
If other devices can't connect:
1. Windows: Allow Node.js through Windows Firewall
2. Mac: System Preferences → Security & Privacy → Firewall → Allow Node.js

### Port Already in Use
Change ports in:
- `backend/server.js` (line 26): Change `PORT = 4000`
- `frontend/vite.config.js` (line 6): Change `port: 5173`

### Database Reset
```bash
cd backend
rm auction.db
npm run seed
```

## Testing the Setup

1. Login as admin on your laptop
2. Load a player
3. Start the auction
4. Open another browser/device and login as a team owner
5. Place bids - you should see real-time updates!

---

**That's it! You're ready to run your EzAuction! 🏏**
