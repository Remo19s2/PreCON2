# 🚀 QUICK START GUIDE

## Prerequisites

1. ✅ MongoDB running on `localhost:27017`
2. ✅ TMDb API key in `server/.env`
3. ✅ Node.js installed

---

## Setup (One-Time)

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

---

## Start Servers

### Terminal 1 - Backend:
```bash
cd server
npm start

# Wait for:
✅ MongoDB connected successfully
✅ Admin user verified
🚀 Server running on port 5000
```

### Terminal 2 - Frontend:
```bash
cd client
npm run dev

# Opens on:
http://localhost:5173
```

---

## Test Flow

### Step 1: Admin Login
```
URL: http://localhost:5173
Enter: admin
Click: Login

✅ Redirects to /admin
```

### Step 2: Generate Data
```
Click: "✨ Generate Data"

Backend logs:
🚀 Admin triggered data generation...
✅ Data generation complete: 400 movies, 101 users, 3524 ratings

Frontend shows:
✅ Success message with statistics
```

### Step 3: User Login
```
Logout → Login as: user1

✅ Redirects to /recommendations
✅ Shows 12 personalized movie cards
```

---

## Default Credentials

| Role | UserId | Access |
|------|--------|--------|
| Admin | `admin` | Full access, data generation |
| User | `user1` - `user100` | Recommendations only |

---

## Troubleshooting

### "Unauthorized: No userId provided"
- **Fixed** ✅ Middleware now reads `req.headers.userid`

### "No recommendations available"
- **Solution:** Run "Generate Data" as admin first
- Check backend logs for movie/rating counts

### Generate Data button does nothing
- Check browser console for errors
- Check backend console for logs
- Verify TMDb API key in `.env`

---

## Console Logs to Watch

### Backend (server terminal):
```
✅ MongoDB connected successfully
✅ Admin user verified
🚀 Admin triggered data generation...
📊 Database stats: 400 movies, 3524 ratings
✅ Generated 12 recommendations for user1
```

### Frontend (browser console):
```
🚀 Triggering data generation...
✅ Generation result: { success: true, stats: {...} }
🔍 Loading recommendations for: user1
✅ Loaded 12 recommendations
```

---

## Features

✅ **Admin Dashboard**
- Generate movies, users, ratings
- Create individual users
- View all users
- Select role (admin/user)

✅ **User Recommendations**
- Hybrid algorithm (content + collaborative)
- Personalized based on genre + language
- Top 12 picks displayed

✅ **Error Handling**
- Clear messages
- Retry buttons
- Helpful guidance

---

## API Endpoints

### Admin Routes (Protected):
```
POST /api/admin/generate-data    - Generate all data
POST /api/admin/create-user       - Create single user
GET  /api/admin/users             - List all users
```

### Auth Routes:
```
POST /api/auth/login              - Login (userId only)
```

### Recommendations:
```
GET /api/recommendations/:userId  - Get recommendations
```

---

## Database Collections

After "Generate Data":
- **movies** - ~400 Indian movies (Hindi, Tamil, Telugu, Malayalam)
- **users** - 101 users (1 admin + 100 regular)
- **ratings** - ~3500 ratings (20-40 per user)

---

## Quick Commands

```bash
# Start everything
cd server && npm start &
cd client && npm run dev

# Check MongoDB
mongosh
use indian-movies
db.movies.countDocuments()
db.users.countDocuments()
db.ratings.countDocuments()

# View logs
# Backend: terminal 1
# Frontend: browser console (F12)
```

---

## Success Indicators

✅ Admin can login
✅ Generate Data completes with stats
✅ User can login
✅ Recommendations show movies
✅ Console logs appear
✅ No errors in browser/terminal

---

**Status:** ✅ Fully functional system ready to demo!
