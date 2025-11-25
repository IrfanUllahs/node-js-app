# Node.js MongoDB Application

A simple Node.js application with MongoDB connection, user authentication (registration, OTP login, forgot password), global error handling, and response handlers.

## Features

- ✅ MongoDB connection with graceful error handling
- ✅ User registration
- ✅ Login with OTP
- ✅ Forgot password functionality
- ✅ Global error handler middleware
- ✅ Response handler utility
- ✅ Health check API endpoint
- ✅ Environment variables with .env file
- ✅ Proper try-catch blocks
- ✅ Graceful shutdown handling

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory (copy from `.env.example`):
```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/nodeapp
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
OTP_EXPIRE_MINUTES=10
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@yourapp.com
```

3. Make sure MongoDB is running on your system.

## Running the Application

```bash
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000` (or the port specified in .env).

## API Endpoints

### Health Check
- **GET** `/api/health` - Check if application is running

### Authentication
- **POST** `/api/auth/register` - Register a new user
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```

- **POST** `/api/auth/request-otp` - Request OTP for login
  ```json
  {
    "email": "john@example.com"
  }
  ```

- **POST** `/api/auth/login` - Login with OTP
  ```json
  {
    "email": "john@example.com",
    "otp": "123456"
  }
  ```

- **POST** `/api/auth/forgot-password` - Request password reset
  ```json
  {
    "email": "john@example.com"
  }
  ```

- **POST** `/api/auth/reset-password/:token` - Reset password with token
  ```json
  {
    "password": "newpassword123"
  }
  ```

## Project Structure

```
node/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   └── authController.js    # Authentication controllers
├── middleware/
│   └── errorHandler.js      # Global error handler
├── models/
│   └── User.js              # User model
├── routes/
│   ├── authRoutes.js        # Authentication routes
│   └── healthRoutes.js      # Health check routes
├── utils/
│   ├── emailService.js      # Email service
│   ├── generateOTP.js       # OTP generator
│   └── responseHandler.js   # Response handler utility
├── .env                     # Environment variables
├── .env.example             # Environment variables example
├── .gitignore
├── package.json
├── README.md
└── server.js                # Main server file
```

## Error Handling

The application includes:
- Global error handler middleware
- Try-catch blocks in all async operations
- Graceful shutdown handling
- Unhandled promise rejection handling
- Uncaught exception handling

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": "Error details (in development mode)"
}
```

## Notes

- All files use CommonJS (`require`) instead of ES6 modules (`import`)
- OTP expires in 10 minutes (configurable via .env)
- Password reset token expires in 1 hour
- Passwords are hashed using bcryptjs
- JWT tokens are used for authentication

