# Quick Start Guide

## Prerequisites

- Node.js (v14+)
- MongoDB installed and running

## Step 1: Start MongoDB

**Windows:**

```bash
# MongoDB should start automatically as a service
# Or run manually:
mongod
```

**macOS/Linux:**

```bash
mongod
```

## Step 2: Set Up Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env if needed (defaults should work)
npm start
```

Backend will run on `http://localhost:5000`

## Step 3: Start Frontend

**Option 1: Simple HTTP Server (Python)**

```bash
# From project root
python -m http.server 8000
# Then open http://localhost:8000 in your browser
```

**Option 2: VS Code Live Server**

- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

**Option 3: Open directly**

- Just open `index.html` in your browser

## Step 4: Test the Application

1. Open the frontend in your browser
2. Sign up with a new account
3. Complete your profile
4. Explore meal suggestions, exercises, and meal planner

## Troubleshooting

**Backend won't start:**

- Check if MongoDB is running: `mongod` or check service status
- Verify port 5000 is not in use
- Check `.env` file exists in `backend/` folder

**Frontend can't connect:**

- Ensure backend is running on port 5000
- Check browser console for errors
- Verify `API_BASE_URL` in `script.js` is `http://localhost:5000/api`

**Database errors:**

- Ensure MongoDB is installed and running
- Check MongoDB connection string in `.env`
