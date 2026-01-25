# 🔐 Login Credentials

## Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Access**: Full admin dashboard with all controls

## Host/Audience Account (Read-Only)
- **Username**: `host`
- **Password**: `host123`
- **Access**: View-only dashboard for audience to watch the auction
- **Features**: Can see current player, bids, team balances, and auction status but cannot bid or modify anything

## Team Owner Accounts

All team owners use the same password: **`owner123`**

| Team Name | Username |
|-----------|----------|
| Mahavir Group | `mahavir_group` |
| Naveen Jewellers | `naveen_jewellers` |
| Gurudev Rice Mill | `gurudev_rice` |
| Nandani Construction | `nandani_construction` |
| Senior Citizen Group | `senior_citizen` |
| Manju Sales | `manju_sales` |
| Mahesh Eleven | `mahesh_eleven` |
| Satyam Furniture | `satyam_furniture` |

### Example Login
- **Team**: Mahavir Group
- **Username**: `mahavir_group`
- **Password**: `owner123`

---

**Note**: These credentials are created when you run `npm run seed` in the backend directory. If you need to reset the database, delete `backend/auction.db` and run `npm run seed` again.

