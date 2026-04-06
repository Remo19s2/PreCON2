# Indian Movie Recommendation System

A full-stack movie recommendation system featuring Indian cinema with hybrid recommendation engine (content-based + collaborative filtering) and admin-controlled user authentication.

## 🎯 Features

- **Movie Database**: Browse Indian movies from TMDb API (Hindi, Tamil, Telugu, Malayalam)
- **Smart Recommendations**: Hybrid recommendation system combining:
  - Content-based filtering (60%): Genre and language preferences
  - Collaborative filtering (40%): User similarity-based recommendations
- **User Authentication**: Simple userId-based login system
- **Admin Dashboard**: Admin can create and manage users
- **User Profiles**: Generated users with preferences
- **Filters**: Language and genre filtering
- **Beautiful UI**: Modern React interface with Tailwind CSS

## 🛠️ Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- TMDb API integration
- Hybrid recommendation engine
- Role-based access control

### Frontend
- React 18 (Vite)
- React Router with protected routes
- Context API for auth
- Tailwind CSS
- Axios

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (running on localhost:27017)
- TMDb API key (get from https://www.themoviedb.org/settings/api)

### Backend Setup

```bash
cd server
npm install
```

Edit `server/.env` and add your TMDb API key:
```
TMDB_API_KEY=your_api_key_here
```

### Frontend Setup

```bash
cd client
npm install
```

## 🚀 Running the Application

### Start MongoDB
Make sure MongoDB is running on `localhost:27017`

### Start Backend Server

```bash
cd server
npm start
```

Server will run on `http://localhost:5000`

### Start Frontend

```bash
cd client
npm run dev
```

Frontend will run on `http://localhost:3000`

## 📊 Initialize Data

Once the backend is running, initialize the database:

**Option 1: Using API call**
```bash
POST http://localhost:5000/api/users/initialize
```

**Option 2: Visit the app**
- The system will automatically fetch movies from TMDb
- Generate 100 users with preferences
- Create ratings for the recommendation system
- Create default admin user (userId: "admin")

## 🔑 Login Credentials

### Default Admin
- **User ID**: `admin`
- **Role**: Admin (can create users)

### Sample Users
- **User ID**: `user1`, `user2`, `user3`, ... `user100`
- **Role**: User (can get recommendations)

## 🎬 Usage

### For Admin:
1. Login with userId: `admin`
2. Access Admin Dashboard
3. Create new users with preferences
4. View all existing users

### For Users:
1. Login with userId: `user1` (or any user1-user100)
2. View personalized recommendations
3. Browse movies with filters

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with userId

### Movies
- `GET /api/movies` - List movies (with filters)
- `GET /api/movies/languages` - Get available languages
- `GET /api/movies/genres` - Get available genres
- `POST /api/movies/fetch` - Fetch movies from TMDb

### Users (Admin Protected)
- `GET /api/users` - List all users (Admin only)
- `POST /api/users/create` - Create new user (Admin only)
- `GET /api/users/:userId` - Get user details
- `POST /api/users/initialize` - Initialize all data

### Recommendations
- `GET /api/recommendations/:userId` - Get hybrid recommendations

## 🔐 Authentication Flow

1. User enters userId on login page
2. Backend validates userId exists
3. User data stored in localStorage
4. Protected routes check authentication
5. Admin-only routes check role
6. Navbar displays user info and logout

## 🧮 Recommendation Algorithm

### Rating Generation
For each user rating:
```
base = random(2.5-3.5)
+ 1.0 if genre matches
+ 0.8 if language matches
+ 1.5 if both match
capped at 5.0
```

### Hybrid Score
```
content_score = 0.6 * genre_match + 0.4 * language_match
collaborative_score = weighted_average(similar_users_ratings)
final_score = 0.6 * content_score + 0.4 * collaborative_score
```

## 📁 Project Structure

```
precon3/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components (Login, Admin, etc.)
│   │   ├── services/       # API services
│   │   ├── context/        # Auth context
│   │   └── App.jsx
│   └── package.json
├── server/                 # Node.js backend
│   ├── models/             # MongoDB models (User with role)
│   ├── routes/             # API routes (auth, users, etc.)
│   ├── services/           # Business logic
│   ├── middleware/         # Auth middleware
│   ├── utils/              # Utilities
│   └── server.js
└── README.md
```

## 🔑 Environment Variables

### Server (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/indian-movies
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
```

## 🎨 Features Showcase

### Authentication & Authorization
- ✅ Simple userId-based login (no passwords)
- ✅ Role-based access control (admin/user)
- ✅ Protected routes in frontend
- ✅ Admin middleware for backend
- ✅ LocalStorage session management

### Admin Features
- ✅ Create new users
- ✅ Set user preferences (genre, language)
- ✅ View all users
- ✅ Admin dashboard UI

### User Features
- ✅ Personalized recommendations
- ✅ Movie browsing with filters
- ✅ User profile display

### Technical Features
- ✅ Real movie data from TMDb
- ✅ 100 generated users + admin
- ✅ Smart hybrid recommendation engine
- ✅ Responsive design
- ✅ Movie posters and details

## 📝 Notes

- No password authentication (userId only)
- Admin can create users via dashboard
- Users cannot self-register
- First run creates default admin user
- TMDb API has rate limits
- MongoDB must be running locally

---

Built with ❤️ for Indian Cinema

