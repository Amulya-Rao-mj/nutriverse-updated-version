# 🌱 Nutriverse

A modern, personalized nutrition website with a full-stack architecture. Users can track their profile, get personalized meal suggestions, plan meals, and book consultations with doctors.
Whereas the doctors can accept or cancel an appointment.

## Features

- **User Authentication**: Secure login and signup system with JWT tokens
- **Editable Profile**: Manage your personal information including:
  - Name, Age, Gender
  - Diet Type (Vegetarian, Non-Vegetarian, or Vegan)
  - Height and Weight with automatic BMI calculation
  - Fitness Plan selection
- **Personalized Meal Suggestions**: Get meal recommendations based on your diet type and fitness plan
- **Exercise Recommendations**: Get personalized exercise suggestions based on your fitness plan
- **Weekly Meal Planner**: Generate and manage your weekly meal plans
- **Online Consultations**: Book appointments with nutritionists and dietitians
- **Doctor Dashboard**: Doctors can view and manage appointment requests
- **Multi-Device Access**: Access your data from any device with internet connection
- **Database Storage**: All data is securely stored in MongoDB

## Technology Stack

### Frontend
- HTML5
- CSS3 (with modern features like Grid and Flexbox)
- Vanilla JavaScript
- Fetch API for backend communication

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher) - [Download MongoDB](https://www.mongodb.com/try/download/community)
- npm (comes with Node.js)

## Getting Started

### 1. Install MongoDB

If you haven't already, install MongoDB on your system:
- **Windows**: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
- **macOS**: `brew install mongodb-community`
- **Linux**: Follow [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)

Start MongoDB service:
```bash
# Windows (if installed as service, it should start automatically)
# Or run: mongod

# macOS/Linux
mongod
```

### 2. Set Up Backend

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the `backend` directory:
```bash
cp .env.example .env
```

Edit `.env` and configure:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nutriverse
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

**Important**: Change `JWT_SECRET` to a strong, random string in production!

Start the backend server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The backend server will run on `http://localhost:5000`

### 3. Set Up Frontend

The frontend is a static website. You can:

**Option A: Open directly in browser**
- Simply open `index.html` in your web browser
- Note: You may need to configure CORS if opening as a file

**Option B: Use a local server (Recommended)**

Using Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Using Node.js (http-server):
```bash
npm install -g http-server
http-server -p 8000
```

Then open `http://localhost:8000` in your browser.

**Option C: Use VS Code Live Server**
- Install the "Live Server" extension in VS Code
- Right-click on `index.html` and select "Open with Live Server"

### 4. Configure API URL

If your backend is running on a different URL or port, update the `API_BASE_URL` in `script.js`:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

## Project Structure

```
nutri/
├── backend/
│   ├── models/          # MongoDB schemas
│   │   ├── User.js
│   │   ├── MealPlan.js
│   │   └── Appointment.js
│   ├── routes/          # API routes
│   │   ├── auth.js
│   │   ├── profile.js
│   │   ├── meals.js
│   │   ├── exercises.js
│   │   ├── mealPlanner.js
│   │   └── appointments.js
│   ├── middleware/     # Custom middleware
│   │   └── auth.js
│   ├── utils/          # Utility functions
│   │   └── meals.js
│   ├── server.js       # Express server
│   ├── package.json
│   └── .env            # Environment variables (create this)
├── index.html          # Frontend HTML
├── script.js           # Frontend JavaScript
├── styles.css          # Frontend CSS
└── README.md          # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new user account
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/me` - Get current user info (requires auth)

### Profile
- `GET /api/profile` - Get user profile (requires auth)
- `PUT /api/profile` - Update user profile (requires auth)

### Meals
- `GET /api/meals` - Get personalized meal suggestions (requires auth)

### Exercises
- `GET /api/exercises` - Get personalized exercise recommendations (requires auth)

### Meal Planner
- `GET /api/meal-planner` - Get weekly meal plan (requires auth)
- `POST /api/meal-planner/generate` - Generate new weekly meal plan (requires auth)
- `DELETE /api/meal-planner` - Clear meal plan (requires auth)

### Appointments
- `GET /api/appointments` - Get user appointments (requires auth)
- `POST /api/appointments` - Book new appointment (requires auth)
- `DELETE /api/appointments/:id` - Cancel appointment (requires auth)
- `GET /api/appointments/all` - Get all appointments (doctor only)
- `PATCH /api/appointments/:id/status` - Update appointment status (doctor only)

## Usage

1. **Sign Up**: Create a new account with your email and password
2. **Login**: Use your credentials to access your dashboard
3. **Complete Profile**: Fill in your profile information including diet type and fitness plan
4. **View Meals**: Navigate to "Meal Suggestions" to see personalized meal recommendations
5. **View Exercises**: Navigate to "Exercises" to see personalized exercise recommendations
6. **Plan Meals**: Use "Meal Planner" to generate and view your weekly meal plan
7. **Book Consultation**: Schedule appointments with nutritionists and dietitians

## Database

The application uses MongoDB to store:
- User accounts and profiles
- Weekly meal plans
- Appointment bookings

Data persists across sessions and devices (when logged in with the same account).

## Security Features

- Passwords are hashed using bcryptjs
- JWT tokens for secure authentication
- Protected API routes with authentication middleware
- CORS enabled for cross-origin requests

## Browser Support

Works on all modern browsers including Chrome, Firefox, Safari, and Edge.

## Troubleshooting

### Backend won't start
- Ensure MongoDB is running: `mongod` or check MongoDB service status
- Check if port 5000 is available
- Verify `.env` file exists and has correct configuration

### Frontend can't connect to backend
- Ensure backend server is running on port 5000
- Check browser console for CORS errors
- Verify `API_BASE_URL` in `script.js` matches your backend URL

### Database connection errors
- Ensure MongoDB is installed and running
- Check `MONGODB_URI` in `.env` file
- Verify MongoDB is accessible at the specified URI

## Development

### Running in Development Mode

Backend with auto-reload:
```bash
cd backend
npm run dev
```

### Environment Variables

Create a `.env` file in the `backend` directory with:
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)

## Production Deployment 

For production deployment:

1. Set `NODE_ENV=production` in `.env`
2. Use a strong, random `JWT_SECRET`
3. Use a production MongoDB instance (MongoDB Atlas recommended)
4. Configure CORS to allow only your frontend domain
5. Use environment variables for sensitive data
6. Enable HTTPS
7. Set up proper error logging and monitoring.

## Notes

- This application requires both frontend and backend to be running
- MongoDB must be installed and running for the backend to work
- All API endpoints require authentication except `/api/auth/signup` and `/api/auth/login`
- JWT tokens are stored in localStorage (consider using httpOnly cookies for enhanced security in production)
