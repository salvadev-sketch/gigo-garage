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
- `FIREBASE_SERVICE_ACCOUNT` Firebase service account JSON on one line (or set `GOOGLE_APPLICATION_CREDENTIALS` to the key file path)
- `PORT` default 4000
- `CORS_ORIGINS` allowed browser origins, comma separated (default `http://localhost:5173`; in production set your Vercel URL)
- `CHINA_DEPOSIT_PERCENT` share of a China part's price paid now as deposit (placeholder: 50)
- `DELIVERY_FEE` delivery fee in BIF (placeholder: 0)
- `LUMICASH_NUMBER`, `BANK_NAME`, `BANK_ACCOUNT`, `PICKUP_ADDRESS` shown at checkout (placeholders until set)

## Load your real parts
Fill `server/data/parts.template.csv` (one part per row; years as `2010-2013` or `2010;2011`; source `shop` or `china`), then:
```bash
cd server
npm run import-parts -- data/parts.csv --dry-run   # checks every row, writes nothing
npm run import-parts -- data/parts.csv             # adds new parts, updates existing ones
```
Parts are matched by part number + make + model + source. Stock of existing parts is not overwritten (orders change it) unless you add `--update-stock`. If any row is invalid nothing is imported and the problem lines are listed.

## Deploy notes
- Server: `render.yaml` is a Render blueprint (build `npm run build`, start `npm start`, health check `/health`).
- Client: `client/vercel.json` makes page links such as `/shop/123` work on refresh. In Vercel set Root Directory to `client` and keep "Include source files outside of the Root Directory" on (the client imports `shared/`).
- Client (Vercel): set `VITE_API_URL` to the Render server URL, plus the `VITE_FIREBASE_*` values.
- Server (Render): set `MONGODB_URI`, `FIREBASE_SERVICE_ACCOUNT`, `CORS_ORIGINS`. Add the Vercel domain to Firebase > Authentication > Settings > Authorized domains.
- Rate limits: 300 requests / 15 min per IP on the API, 20 / hour on public create routes (bookings, orders, China requests).

## Staff auth (Firebase + RBAC)
Staff sign in with Firebase Auth (email and password). The role lives in a Firebase custom claim `role`:
- `owner`: both dashboards, and can give roles to others
- `shop_staff`: shop dashboard
- `garage_staff`: garage dashboard

Setup:
1. Firebase console: create a project, enable Authentication > Email/Password, add staff users.
2. Server: put the service account JSON in `server/.env` (`FIREBASE_SERVICE_ACCOUNT`).
3. Client: copy `client/.env.example` to `client/.env` and fill in the web app settings.
4. Make the first owner: `cd server && npm run set-role -- you@example.com owner`
5. After that the owner can use `POST /api/admin/roles` with `{ "email": "...", "role": "shop_staff" }` (`null` removes the role).
Users must sign in again after a role change.

## API
| Method | Path | Purpose |
|---|---|---|
| GET | /api/parts?source=shop\|china | List parts |
| POST | /api/bookings | Create booking, returns Car ID (GA-0001) and waiting list position |
| GET | /api/queue | Public waiting list of cars in the garage |
| GET | /api/track/:carId | Public status and position by Car ID |
| GET | /api/admin/shop/ping, /api/admin/garage/ping | Check dashboard access (Bearer token) |
| POST | /api/admin/roles (owner) | Set a staff role by email |
| GET | /api/bookings (garage staff) | List all bookings |
| PATCH | /api/bookings/:id (garage staff) | Update status. `done` or `cancelled` invalidates the Car ID and removes the car from the waiting list |
| GET | /api/config | Deposit percent and delivery fee |
| GET | /api/parts/:id | One part (product page) |
| POST | /api/orders | Create order. Server recomputes totals and reserves stock (409 if not enough) |
| GET | /api/orders/track/:orderNo | Public order status (no personal data) |
| POST | /api/china-requests | Customer requests a part from China, returns request number (CN-0001) |
| GET | /api/china-requests/track/:requestNo | Public status, quote and deposit |
| GET/PATCH | /api/china-requests (shop staff) | List / add quote and update status |
| GET/PATCH | /api/orders (shop staff) | List orders / confirm payment (records who and when; a payment reference can be used once), mark done, cancel (stock goes back) |
| POST/PATCH/DELETE | /api/parts (shop staff) | Manage the parts catalogue |

## Roadmap
1. Enter the real parts catalogue (import tool is ready, needs your data)
2. Automatic Lumicash / bank payment confirmation (needs a provider API; staff confirm by hand today)
3. SMS/WhatsApp notifications
4. Deploy (Vercel + Render)
