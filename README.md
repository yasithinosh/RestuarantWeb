# La Bella Cucina 🍝

> A full-stack restaurant management web application — online ordering, reservations, menu management, and an admin dashboard — all running in Docker.

---

## 📸 Screenshots

### Home Page
<!-- Add screenshot: frontend/home page -->
![Home Page](screenshots/home.png)

### Menu Page
<!-- Add screenshot: frontend/menu page -->
![Menu](screenshots/menu.png)

### Online Ordering
<!-- Add screenshot: frontend/order page -->
![Order Online](screenshots/order.png)

### Reservations
<!-- Add screenshot: frontend/reservations page -->
![Reservations](screenshots/reservations.png)

### Admin Dashboard
<!-- Add screenshot: admin/index.html -->
![Admin Dashboard](screenshots/admin-dashboard.png)

### Admin – Orders Management
<!-- Add screenshot: admin/orders.html -->
![Admin Orders](screenshots/admin-orders.png)

### Admin – Menu Management
<!-- Add screenshot: admin/menu.html -->
![Admin Menu](screenshots/admin-menu.png)

---

## Features

### Customer-Facing
- **Home** — Featured menu preview, restaurant stats, call-to-action sections
- **Menu** — Browse dishes by category with custom uploaded images
- **Online Ordering** — Add to cart, choose takeaway or delivery, pay via PayHere
- **Reservations** — Book a table with date, time, and guest count
- **Gallery & About** — Photo gallery and restaurant story pages
- **Contact** — Contact form and map

### Admin Panel
- **Dashboard** — Live stats: total orders, revenue, pending items, reservations
- **Orders** — View, filter, and update order statuses; see payment status
- **Menu Management** — Create, edit, and delete menu items with image upload
- **Reservations** — Manage and confirm customer reservations
- **Staff Management** — Add and manage staff accounts

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (via Sequelize ORM) |
| File Uploads | Multer (local disk storage) |
| Authentication | JWT (JSON Web Tokens) |
| Payment | PayHere (sandbox & live) |
| Web Server | nginx |
| Containerisation | Docker & Docker Compose |
| DB Admin | pgAdmin 4 |

---

## Project Structure

```
Restuarant/
├── backend/
│   ├── controllers/        # Route handler logic
│   │   ├── authController.js
│   │   ├── menuController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   └── reservationController.js
│   ├── middleware/
│   │   └── auth.js         # JWT verification, role guards
│   ├── models/             # Sequelize models (PostgreSQL)
│   │   ├── User.js
│   │   ├── MenuItem.js
│   │   ├── Order.js
│   │   └── Reservation.js
│   ├── routes/             # Express routers
│   ├── scripts/            # seed-admin.js
│   ├── uploads/            # Uploaded menu images (persisted via Docker volume)
│   ├── db.js               # Sequelize connection
│   ├── server.js           # Express app entry point
│   └── .env                # Environment variables (not committed)
├── frontend/
│   ├── admin/              # Admin panel pages
│   ├── css/                # Stylesheets
│   ├── js/                 # api.js, cart.js, auth.js
│   ├── index.html          # Home page
│   ├── menu.html
│   ├── order.html
│   ├── reservations.html
│   ├── login.html
│   ├── register.html
│   └── nginx.conf          # nginx config (proxies /api and /uploads to backend)
└── docker-compose.yml
```

---

## Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Restuarant
```

### 2. Configure environment variables

The backend reads from `backend/.env`. A template is provided:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your values:

```env
PORT=5000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=labellacucina
DB_USER=labella
DB_PASS=labella_secret

# JWT
JWT_SECRET=your_jwt_secret_here

# PayHere (get credentials from sandbox.payhere.lk)
PAYHERE_MERCHANT_ID=your_merchant_id
PAYHERE_SECRET=your_merchant_secret
PAYHERE_SANDBOX=true

# Frontend URL (used for CORS)
CLIENT_URL=http://localhost

# Admin seed account
ADMIN_EMAIL=admin@restaurant.com
ADMIN_PASSWORD=YourSecurePassword
```

### 3. Build and run

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Website | http://localhost |
| Backend API | http://localhost:5000/api |
| pgAdmin | http://localhost:5050 |

### 4. Seed the admin account

```bash
docker-compose exec backend node scripts/seed-admin.js
```

Then log in at **http://localhost/login.html** with the credentials from your `.env`.

---

## API Reference

### Authentication
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Auth | Get current user |
| GET | `/api/auth/users` | Admin | List all users |
| PUT | `/api/auth/users/:id` | Admin | Update user role/status |

### Menu
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/menu` | Public | Get available menu items |
| GET | `/api/menu/all` | Admin/Staff | Get all items including hidden |
| POST | `/api/menu` | Admin/Staff | Create menu item |
| PUT | `/api/menu/:id` | Admin/Staff | Update menu item |
| DELETE | `/api/menu/:id` | Admin | Delete menu item |

### Orders
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/orders` | Public | Place a new order |
| GET | `/api/orders` | Admin/Staff | List all orders |
| GET | `/api/orders/stats` | Admin/Staff | Order statistics |
| GET | `/api/orders/:id` | Public | Get order by ID |
| PUT | `/api/orders/:id` | Admin/Staff | Update order status |
| POST | `/api/orders/:id/confirm-payment` | Public | Mark order as paid (called on PayHere return) |

### Reservations
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/reservations` | Public | Create a reservation |
| GET | `/api/reservations` | Admin/Staff | List all reservations |
| GET | `/api/reservations/stats` | Admin/Staff | Reservation statistics |
| PUT | `/api/reservations/:id` | Admin/Staff | Update reservation status |
| DELETE | `/api/reservations/:id` | Admin | Delete reservation |

### Payment
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/payment/generate-hash` | Public | Generate PayHere payment hash |
| POST | `/api/payment/notify` | PayHere | Server-to-server payment webhook |

### File Upload
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/upload` | Admin/Staff | Upload a menu item image (max 5 MB) |

---

## Payment Integration (PayHere)

This project uses [PayHere](https://www.payhere.lk) for payments.

**Flow:**
1. Customer places order → backend creates order record
2. Frontend calls `/api/payment/generate-hash` to get a signed hash
3. Frontend auto-submits a form to PayHere checkout
4. On success, PayHere redirects to `checkout.html?success=true&order_id=...`
5. `checkout.html` calls `/api/orders/:id/confirm-payment` → order marked **Paid**
6. PayHere also sends a server-to-server webhook to `/api/payment/notify` (works when deployed publicly)

**For sandbox testing:** Set `PAYHERE_SANDBOX=true` in `.env` and use sandbox credentials from [sandbox.payhere.lk](https://sandbox.payhere.lk).

---

## Image Uploads

Menu item images are uploaded via the admin panel:
- Stored in `backend/uploads/` inside the Docker container
- Persisted using the `uploads_data` Docker named volume (survives `docker-compose down`)
- Served at `http://localhost/uploads/<filename>` via nginx proxy
- Accepted formats: JPG, PNG, WebP, GIF — max **5 MB**

---

## User Roles

| Role | Permissions |
|---|---|
| `customer` | Browse menu, place orders, make reservations |
| `staff` | All above + view/manage orders and reservations |
| `admin` | All above + manage menu, manage staff, delete records |

---

## Local Development (without Docker)

```bash
# Backend
cd backend
npm install
npm run dev     # runs with nodemon on port 5000

# Frontend
# Open frontend/index.html with VS Code Live Server (port 5500)
# api.js auto-detects Live Server and points to http://localhost:5000
```

---

## License

This project was created as an academic assignment and is intended for educational purposes.
