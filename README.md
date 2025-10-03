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
- **Seeding**: Users + Cards via `seed.js` (supports both local and production DB).
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
- cross-env for cross-platform env handling

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
LOCAL_DB=mongodb://127.0.0.1:27017/business_card_app
ATLAS_DB=<your-atlas-uri>
JWT_SECRET=<your-secret-key>
```

### 4. Run locally
```bash
npm run dev
```
Starts the server with nodemon and `NODE_ENV=development`.

### 5. Run in production
```bash
npm start
```
Starts with `NODE_ENV=production`.

---

## 🌱 Database Seeding

The seed script inserts **3 users** (regular, business, admin) and **3 sample cards**.

### Seed Local (Development)
Connects to `LOCAL_DB` (from `.env`) with `NODE_ENV=development`:

```bash
npm run seed
# or explicitly
npm run seed:local
```

### Seed Production / Atlas (Explicit Opt-In)
Connects to `ATLAS_DB` (from `.env`) with `NODE_ENV=production`.  
⚠️ This is protected — you must explicitly allow it:

```bash
npm run seed:prod
```

This runs with:
```bash
cross-env NODE_ENV=production ALLOW_SEED_ANYWAY=true node ./seed/seed.js
```

> ⚠️ Be very careful: this writes to your **live Atlas DB**.  
> Double-check your `ATLAS_DB` string before running.

---

## API Overview

### Auth
- `POST /users` → Register
- `POST /users/login` → Login, returns JWT
- `GET /users/me` → Current user (auth required)

### Users
- `GET /users` → List all (admin)
- `PUT /users/:id` → Update (self/admin)
- `PATCH /users/:id` → Toggle `isBusiness` (self/admin)
- `DELETE /users/:id` → Delete user (self/admin)
- `GET /users/:id` → Get by id (self/admin)

### Cards
- `GET /cards` → List all
- `POST /cards` → Create (business user)
- `GET /cards/my-cards` → Current user’s cards
- `GET /cards/liked` → Current user’s liked cards
- `PATCH /cards/:id/like` → Like/unlike
- `PATCH /cards/:id/biz-number` → Reset biz number (admin)
- `PUT /cards/:id` → Update (owner/admin)
- `PATCH /cards/:id` → Partial update (owner/admin)
- `DELETE /cards/:id` → Delete (owner/admin)
- `GET /cards/:id` → Get card by ID

---

## Testing (manual)
Use Postman or Insomnia.  
Include `x-auth-token` header with your JWT for protected routes.

---

## Project Structure
```
.
├── auth/              # JWT provider, auth & admin middleware
├── cards/             # Models, controllers, services, validation
├── config/            # default/production/development JSON
├── DB/                # dbService (connects mongoose)
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
- Seeding can target **local** or **production (Atlas)** depending on the script used.  

---

## 🔑 Seeded Login Details

After running `npm run seed` or `npm run seed:prod`, you’ll have 3 users:

### Admin User
- **Email:** `admin@cards.com`
- **Password:** `Admin123!`

### Business User
- **Email:** `biz@cards.com`
- **Password:** `Biz123!`

### Regular User
- **Email:** `user@cards.com`
- **Password:** `User123!`

> You can use these accounts to test login, admin-only routes, business-only routes (like creating cards), and regular user restrictions.
