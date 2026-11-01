# Fencing Supply — Student Prototype

India's Premier Fencing Equipment Marketplace (Student Project)

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@demo.com | Demo@123 |
| Supplier | supplier@demo.com | Demo@123 |
| Admin | admin@demo.com | Demo@123 |
| Staff | staff@demo.com | Demo@123 |

## Quick Start

```bash
npm install
npm run init-db
npm run seed
npm start
```

Visit http://localhost:3000

## Tech Stack
- **Backend:** Node.js, Express, SQLite (better-sqlite3)
- **Frontend:** Vanilla JS SPA, CSS3 with animations
- **Auth:** Session cookies with bcrypt password hashing

## Money
All monetary values stored as integer paise (1 INR = 100 paise).

## Timestamps
Stored in UTC, displayed in Asia/Kolkata.
