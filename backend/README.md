# PDF2Sheet Auto - Backend API

**Phase 1: Project Foundation & Authentication** ✅

## 🚀 Quick Start

### Prerequisites
- Node.js v18+ installed
- MongoDB Atlas account (or local MongoDB)

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Configure environment variables**
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your MongoDB URI and JWT secret
```

3. **Start the development server**
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js         # MongoDB connection
│   ├── models/
│   │   └── User.js            # User schema
│   ├── controllers/
│   │   └── authController.js  # Auth logic
│   ├── routes/
│   │   └── auth.js            # Auth endpoints
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   ├── validation.js      # Input validation
│   │   └── errorHandler.js    # Error handling
│   └── app.js                 # Express app setup
├── server.js                  # Entry point
├── .env.example              # Environment template
└── package.json
```

## 🔌 API Endpoints

### Health Check
```
GET /health
```

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "userId": "...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "forwardingEmail": "user-abc123@pdf2sheet.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "forwardingEmail": "user-abc123@pdf2sheet.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

**Response (200)**:
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "forwardingEmail": "user-abc123@pdf2sheet.com",
    "subscription": {
      "plan": "free",
      "status": "active"
    }
  }
}
```

## 🧪 Testing Phase 1

Use the test cases in the development phases document to manually test all endpoints.

### Using Postman/Thunder Client

1. **Test Health Check**: `GET http://localhost:5000/health`
2. **Register User**: `POST http://localhost:5000/api/auth/register`
3. **Login**: `POST http://localhost:5000/api/auth/login`
4. **Get Profile**: `GET http://localhost:5000/api/auth/profile` (with Bearer token)

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Input validation with Joi
- ✅ Security headers with Helmet
- ✅ CORS protection
- ✅ Error handling and logging

## 📝 Environment Variables

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

## 🛠️ Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests (to be implemented)

## ✅ Phase 1 Completion Checklist

- [x] Project initialization
- [x] MongoDB connection setup
- [x] User model with password hashing
- [x] JWT authentication middleware
- [x] Input validation
- [x] Auth routes (register, login, profile)
- [x] Error handling
- [x] Security middleware (helmet, cors)
- [x] Request logging

## 🔜 Next: Phase 2

Once Phase 1 is tested and approved, we'll move to Phase 2: Vendor Mapping System.
