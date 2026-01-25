# 🏏 Cricket Auction System

A complete, production-ready, local-hosted cricket auction system that runs fully on your laptop and can be accessed by multiple users on the same Wi-Fi network.

## 🎯 Features

- **Real-time Bidding**: Socket.IO powered real-time updates
- **Role-based Access**: Admin and Team Owner dashboards
- **Session-based Authentication**: Secure login system
- **SQLite Database**: Local file-based database
- **Network Access**: Accessible from any device on your local network

## 🛠 Tech Stack

- **Frontend**: React (Vite) + Tailwind CSS
- **Backend**: Node.js + Express
- **Realtime**: Socket.IO
- **Database**: SQLite
- **Authentication**: express-session

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## 🚀 Setup Instructions

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Seed the Database

```bash
npm run seed
```

This will create:
- 1 admin account
- 1 host/audience account
- 8 team owner accounts
- 20 demo players

See **Login Credentials** section below for all login details.

### 3. Start the Backend Server

```bash
npm start
```

The backend will run on `http://0.0.0.0:4000`

### 4. Install Frontend Dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

### 5. Start the Frontend Server

```bash
npm run dev
```

The frontend will run on `http://0.0.0.0:5173`

## 🌐 Network Access Setup

To access the application from other devices on your local network:

### Step 1: Find Your Local IP Address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually starts with 192.168.x.x or 10.x.x.x)

**Mac/Linux:**
```bash
ifconfig
```
or
```bash
ip addr show
```
Look for your local IP address (usually starts with 192.168.x.x or 10.x.x.x)

### Step 2: Access from Other Devices

1. Make sure your laptop and other devices are on the same Wi-Fi network
2. On other devices, open a web browser and navigate to:
   ```
   http://<YOUR_LOCAL_IP>:5173
   ```
   For example: `http://192.168.1.100:5173`

### Step 3: Configure Frontend API URL (if needed)

If you need to change the API URL, create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://<YOUR_LOCAL_IP>:4000/api
```

Then restart the frontend server.

## 👥 Login Credentials

For complete login credentials, please see **[LOGIN_CREDENTIALS.md](./LOGIN_CREDENTIALS.md)**

### Quick Reference

**Admin:**
- Username: `admin` | Password: `admin123`

**Host/Audience (Read-Only):**
- Username: `host` | Password: `host123`

**Team Owners:**
- Password for all teams: `owner123`
- Usernames: `mahavir_group`, `naveen_jewellers`, `gurudev_rice`, `nandani_construction`, `senior_citizen`, `manju_sales`, `mahesh_eleven`, `satyam_furniture`

## 🎮 How to Use

### Admin Dashboard

1. Login with admin credentials
2. **Load a Player**: Select a player from the dropdown and click "Load"
3. **Start Auction**: Click "START" to begin bidding
4. **Monitor Bids**: See all bids in real-time in the sidebar
5. **Control Auction**:
   - PAUSE: Temporarily pause bidding
   - STOP: End the auction
   - Lock Bidding: Prevent all owners from bidding
   - Undo Last Bid: Remove the most recent bid
   - Reset Bidding: Clear all bids for current player
6. **Mark Player**: Mark as SOLD or UNSOLD
7. **Update Increments**: Change bid increment values anytime

### Team Owner Dashboard

1. Login with team owner credentials
2. **View Current Player**: See player details and current bid
3. **Place Bids**: Use the three bid buttons (+500, +1000, +5000)
4. **Real-time Updates**: See bid updates instantly
5. **Status Indicators**: 
   - Green = You are leading
   - Yellow = Another team is leading
   - Locked = Bidding is disabled by admin

## 🔒 Security Features

- Session-based authentication
- Role-based route protection
- Server-side bid validation
- Prevents duplicate/invalid bids
- Prevents owners from accessing admin routes

## 📊 Database

The SQLite database (`backend/auction.db`) contains:

- **users**: User accounts (admin and team owners)
- **teams**: Team information
- **players**: Player roster
- **bids**: All bid history
- **auction_state**: Current auction state

## 🐛 Troubleshooting

### Port Already in Use

If port 4000 or 5173 is already in use:

**Backend**: Edit `backend/server.js` and change `PORT = 4000` to another port
**Frontend**: Edit `frontend/vite.config.js` and change `port: 5173` to another port

### Cannot Access from Network

1. Check firewall settings - allow Node.js through firewall
2. Ensure all devices are on the same Wi-Fi network
3. Verify your local IP address is correct
4. Try accessing from the same device first (localhost:5173)

### Database Errors

If you encounter database errors:
```bash
cd backend
rm auction.db
npm run seed
```

## 📝 Notes

- The application runs entirely locally - no internet required
- All data is stored in the SQLite database file
- Sessions persist for 24 hours
- Real-time updates work via Socket.IO WebSocket connections

## 🎨 Features Implemented

✅ Admin dashboard with full controls
✅ Team owner dashboard with bidding interface
✅ Real-time bid updates
✅ Player management
✅ Auction state management (START/PAUSE/STOP)
✅ Bid increment configuration
✅ Bid history
✅ Undo last bid
✅ Lock/unlock bidding
✅ Mark players as SOLD/UNSOLD
✅ Network access support
✅ Session-based authentication
✅ Role-based access control

## 📄 License

This project is for local use only.

---

**Enjoy your cricket auction! 🏏**

