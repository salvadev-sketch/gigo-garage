# GIGO Garage

EV and hybrid garage + spare parts shop for Burundi (TypeScript full stack).

## Features
- **Shop**: parts "Available in shop" and "Available in China"
- **Garage**: service booking (confirmed by SMS/WhatsApp)
- **Cart & Checkout**: Lumicash and bank transfer
- **Order from China**: request quote, deposit, order tracking
- **Dashboard**: manage bookings, parts orders and China orders

## Stack
- Client: React + TypeScript + Vite + React Router
- Server: Node + Express + TypeScript + Mongoose
- Database: MongoDB
- Shared types: `shared/types.ts`

## Structure
```
shared/   types used by client and server
server/   Express API (src/index.ts, models.ts, routes.ts)
client/   React app (src/pages = Home, Shop, Garage, Cart, Checkout, Order, Dashboard)
```

## Run locally
```bash
# server
cd server && cp .env.example .env && npm install && npm run seed && npm run dev
# client (new terminal)
cd client && npm install && npm run dev
```

## Environment (server/.env)
- `MONGODB_URI` MongoDB connection string
- `ADMIN_KEY` secret for admin endpoints (temporary, replace with real auth)
- `PORT` default 4000

## API
| Method | Path | Purpose |
|---|---|---|
| GET | /api/parts?source=shop\|china | List parts |
| POST | /api/bookings | Create booking, returns Car ID (GA-0001) and waiting list position |
| GET | /api/queue | Public waiting list of cars in the garage |
| GET | /api/track/:carId | Public status and position by Car ID |
| GET/PATCH | /api/bookings (admin) | List / update status |
| POST | /api/orders | Create order |
| POST | /api/china-requests | Request a part from China |
| PATCH | /api/china-requests/:id (admin) | Add quote / update status |

## Roadmap
1. Seed parts and vehicle catalogue
2. Product detail page
3. Lumicash and bank payment confirmation
4. Real admin auth, SMS/WhatsApp notifications
5. Deploy (Vercel + Render)
