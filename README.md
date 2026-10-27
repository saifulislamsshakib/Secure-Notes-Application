# Secure Notes Application

A full-stack web application built with React, Node.js, Express.js, and MongoDB. The application provides secure authentication, role-based access control, personal note management, public posts, and user administration.

Live Deployment

Frontend: https://secure-notes-application-qp9n.vercel.app/

Backend API: https://secure-notes-application-six.vercel.app/v1

## Demo Credentials

Use the following credentials to test the application.

### Admin Account

- **Email:** admin.secure@example.com
- **Password:** AdminSecure789!

### User Account

- **Email:** saifulislamshakibbb@gmail.com
- **Password:** Shakib123

- **Email:** saiful@gmail.com
- **Password:** Saiful123

**Note:** These are demonstration accounts for evaluation purposes only. Do not use real personal credentials.

## Features

### Authentication & Authorization

- User registration and login
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control for users and administrators

### Notes Management

- Create, view, update, and delete personal notes
- Users can manage their own notes
- Administrators can view all users' notes
- Paginated note listings

### User Management

- Administrators can create, view, update, and delete users
- Manage user roles and interests
- View users grouped by interests using MongoDB aggregation

### Public Posts

- Create public posts
- Retrieve public posts
- Retrieve posts belonging to a particular user using MongoDB aggregation and `$lookup`

### Database Optimization

- MongoDB with Mongoose
- Schema indexes for relevant queries
- Pagination for list operations
- Aggregation pipelines for the required scenarios

## Technology Stack

**Frontend**

- React
- Vite
- React Router

**Backend**

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcryptjs

## Project Structure

```text
secure-notes-app/
├── frontend/
│   ├── src/
│   └── package.json
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── package.json
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js and npm
- MongoDB database (local MongoDB or MongoDB Atlas)
- Git

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/secure-notes-app.git
cd secure-notes-app
```

### 2. Configure the backend

```bash
cd backend
npm install
```

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_strong_secret_key
JWT_EXPIRES_IN=1d
```

Use the actual environment variable names expected by your backend configuration. Never commit real credentials or secrets to GitHub.

### 3. Start the backend

```bash
npm run dev
```

The backend runs on `http://localhost:5000` by default, provided the port is available.

### 4. Configure the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite, usually `http://localhost:5173`.

## API Overview

The API uses the `/v1` prefix.

| Method | Endpoint                    | Description                      |
| ------ | --------------------------- | -------------------------------- |
| POST   | `/v1/auth/register`         | Register a user                  |
| POST   | `/v1/auth/login`            | Authenticate a user              |
| GET    | `/v1/users/me`              | Get the current user's profile   |
| GET    | `/v1/notes`                 | List personal notes              |
| POST   | `/v1/notes`                 | Create a note                    |
| PATCH  | `/v1/notes/:id`             | Update a note                    |
| DELETE | `/v1/notes/:id`             | Delete a note                    |
| GET    | `/v1/admin/users`           | List users (admin)               |
| POST   | `/v1/admin/users`           | Create a user (admin)            |
| PATCH  | `/v1/admin/users/:id`       | Update a user (admin)            |
| DELETE | `/v1/admin/users/:id`       | Delete a user (admin)            |
| GET    | `/v1/admin/notes`           | List all notes (admin)           |
| GET    | `/v1/admin/users/interests` | Group users by interests (admin) |
| GET    | `/v1/posts/public`          | Retrieve public posts            |
| POST   | `/v1/posts`                 | Create a public post             |

Most list endpoints support pagination using `page` and `limit` query parameters. Protected endpoints require a valid JWT, and admin endpoints require the administrator role.

## MongoDB Aggregation Scenarios

### 1. Group by Interests

Groups users according to their interests using a MongoDB aggregation pipeline.

### 2. User Posts

Uses `$lookup` to retrieve posts associated with a particular user from the separate posts collection.

## Security Notes

- Passwords are hashed before storage.
- JWT authentication protects restricted API endpoints.
- Administrator permissions are checked by the backend.
- Environment variables and database credentials must remain private.

## License

This project was developed as a technical interview assignment.
