# Cards Server

A Node.js/Express backend for managing **business cards** and **users**, built with MongoDB, JWT authentication, and validation layers.  

---

## Features

### Users
- **Sign up** with validation (name, email, password rules, phone, address, optional image).
- **Login** with:
  - JWT authentication
  - Password hashing (`bcryptjs`)
  - Account lockout after 3 failed attempts (24 hours).
- **Profile management**:
  - `GET /users/me` – fetch current user
  - `PUT /users/:id` – self or admin update
- **Admin actions**:
  - List all users
  - Toggle `isBusiness` status
  - Delete users

### Cards
- **CRUD operations**:
  - Create (only business users)
  - Read (all users)
  - Update (owner or admin)
  - Delete (owner or admin)
- **Like system**:
  - `PATCH /cards/:id/like` – toggle like
  - `GET /cards/liked` – see liked cards
- **Admin tools**:
  - `PATCH /cards/:id/biz-number` – regenerate business number
- **Validation** with Joi and shared Mongoose sub-schemas.

### Infrastructure
- **Authentication**: JWT (`x-auth-token` header).
- **Authorization**: Middleware (`auth`, `requireAdmin`).
- **Seeding**: Users + Cards via `seed.js`.
- **Configurable** via [`config`](https://www.npmjs.com/package/config) (development/production JSON).
- **Logging**:
  - Color-coded console logs (morgan + chalk).
  - File logs for errors in `logs/YYYY-MM-DD.log`.
  - Swappable logger (`morgan` vs `simple`).
- **Database**: MongoDB (Atlas or Local, chosen via config/env).
- **Static files** served from `/public`.

---

## 📦 Tech Stack
- Node.js
- Express 5
- MongoDB + Mongoose
- JWT
- Joi for validation
- bcryptjs for password hashing
- lodash
- morgan + chalk for logging
- config for environment settings
- dotenv for `.env` management

---

## Getting Started

### 1. Clone repo
```bash
git clone <your-repo-url>
cd cards-server
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment variables
Create a `.env` file with:
```env
PORT=3000
LOCAL_DB=mongodb://127.0.0.1:27017/cards
ATLAS_DB=<your-atlas-uri>
JWT_SECRET=<your-secret-key>
```

### 4. Run locally
```bash
npm run dev
```
This starts the server with nodemon and `NODE_ENV=development`.

### 5. Run in production
```bash
npm start
```
This starts with `NODE_ENV=production`.

### 6. Seed database (development only)
```bash
npm run seed
```
Seeds default **users** (regular, business, admin) and **sample cards**.

---

## API Overview

### Auth
- `POST /users` → Register
- `POST /users/login` → Login, returns JWT
- `GET /users/me` → Current user (auth required)

### Users
- `GET /users` → List all (admin)
- `PUT /users/:id` → Update (self/admin)
- `PATCH /users/:id` → Toggle `isBusiness` (admin)
- `DELETE /users/:id` → Delete user (admin)
- `GET /users/:id` → Get by id (self/admin)

### Cards
- `GET /cards` → List all
- `POST /cards` → Create (business user)
- `GET /cards/my-cards` → Current user’s cards
- `GET /cards/liked` → Current user’s liked cards
- `PATCH /cards/:id/like` → Like/unlike
- `PATCH /cards/:id/biz-number` → Reset biz number (admin)
- `PUT /cards/:id` → Update (owner/admin)
- `DELETE /cards/:id` → Delete (owner/admin)
- `GET /cards/:id` → Get card by ID

---

## Testing (manual)
Use a tool like Postman or Insomnia.  
Include `x-auth-token` header with your JWT for protected routes.

---

## Project Structure
```
.
├── auth/              # JWT provider, auth & admin middleware
├── cards/             # Models, controllers, services, validation
├── config/            # default/production/development JSON
├── db/                # dbService (connects mongoose)
├── helpers/           # Address, Name, Image sub-schemas, validators
├── middlewares/       # logger, loggerService, simpleLogger
├── public/            # static assets
├── router/            # central router
├── seed/              # seed.js, sample users/cards
├── users/             # Models, controllers, services, validation
├── utils/             # timeService
├── server.js          # main entry point
└── package.json
```

---

## Notes
- Passwords are hashed before saving.
- JWT secret must be set via `JWT_SECRET` in `.env`.
- Account lockout prevents brute force (3 attempts → lock for 24h).
