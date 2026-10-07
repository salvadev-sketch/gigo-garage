# GIGO Garage

EV and hybrid garage + spare parts shop for Burundi (TypeScript full stack).

## Features
- **Shop**: parts "Available in shop" and "Available in China"
- **Garage**: service booking (confirmed by SMS/WhatsApp)
- **Cart & Checkout**: Lumicash and bank transfer
- **Order from China**: request quote, deposit, order tracking
- **Shop dashboard** (`/dashboard/shop`): orders and payment confirmation, China requests, parts (prices and stock)
- **Garage dashboard** (`/dashboard/garage`): bookings and the waiting list; "Car fixed" invalidates the Car ID

## Stack
- Client: React + TypeScript + Vite + React Router
- Server: Node + Express + TypeScript + Mongoose
- Database: MongoDB
- Shared types: `shared/types.ts`

## Structure
```
shared/                 types and pricing used by client and server
server/src/
  index.ts              app bootstrap (Express + MongoDB)
  config.ts             business settings from env
  middleware/admin.ts   temporary admin key guard
  models/               one Mongoose model per file (Part, Booking, Order, ChinaRequest, Counter)
  services/queue.ts     garage waiting list logic
  routes/               one router per area (parts, bookings, queue, orders, chinaRequests)
  seed.ts               sample parts
client/src/             React app (pages: Home, Shop, Garage, Cart, Checkout, Order, dashboard/)
scripts/check-lines.mjs fails if any file is longer than 300 lines
```

Rule: no source file longer than 300 lines. Check with `node scripts/check-lines.mjs`.

## Run locally
```bash
# server
cd server && cp .env.example .env && npm install && npm run seed && npm run dev
# client (new terminal)
cd client && npm install && npm run dev
```

## Environment (server/.env)
- `MONGODB_URI` MongoDB connection string
- `ADMIN_KEY_SHOP` key for the shop dashboard (temporary, replace with real auth)
- `ADMIN_KEY_GARAGE` key for the garage dashboard (temporary, replace with real auth)
- `PORT` default 4000
- `CHINA_DEPOSIT_PERCENT` share of a China part's price paid now as deposit (placeholder: 50)
- `DELIVERY_FEE` delivery fee in BIF (placeholder: 0)

## API
| Method | Path | Purpose |
|---|---|---|
| GET | /api/parts?source=shop\|china | List parts |
| POST | /api/bookings | Create booking, returns Car ID (GA-0001) and waiting list position |
| GET | /api/queue | Public waiting list of cars in the garage |
| GET | /api/track/:carId | Public status and position by Car ID |
| GET | /api/admin/shop/ping, /api/admin/garage/ping | Check a dashboard key |
| GET | /api/bookings (garage key) | List all bookings |
| PATCH | /api/bookings/:id (garage key) | Update status. `done` or `cancelled` invalidates the Car ID and removes the car from the waiting list |
| GET | /api/config | Deposit percent and delivery fee |
| POST | /api/orders | Create order (server recomputes totals), returns order number |
| POST | /api/china-requests | Request a part from China |
| GET/PATCH | /api/china-requests (shop key) | List / add quote and update status |
| GET/PATCH | /api/orders (shop key) | List orders / confirm payment, mark done |
| POST/PATCH/DELETE | /api/parts (shop key) | Manage the parts catalogue |

## Roadmap
1. Seed parts and vehicle catalogue
2. Product detail page
3. Lumicash and bank payment confirmation
4. Real admin auth, SMS/WhatsApp notifications
5. Deploy (Vercel + Render)
