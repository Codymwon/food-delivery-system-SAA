# Phase 5 Plan: Customer Web Application (React.js SPA)
**Project:** Online Food Delivery System (Microservices Architecture)  
**Course:** SWE4007 – Software Application Architecture  
**Guide:** Prof. Tauseef Khan  
**Architecture Context:** 8 Dockerized Microservices + API Gateway (Port 5000) are already live and healthy.  

---

## 📌 Context for a Fresh Chat (Read This First)

If you are starting a new chat session to work on Phase 5, provide this quick context to the assistant:

> *"We are building the React frontend for the Online Food Delivery System. The entire backend (8 microservices + API Gateway + MongoDB + RabbitMQ + Redis) is running in Docker Compose at `/home/aadith/development/active-projects/food-delivery-system-SAA`. Please follow `docs/phase_5_plan.md` and implement Phase 5.X."*

### Pre-Requisite Check Before Starting Any Screen:
Run in terminal to confirm backend availability:
```bash
cd /home/aadith/development/active-projects/food-delivery-system-SAA
docker compose ps
curl http://localhost:5000/api/health
```
* **API Gateway Base URL:** `http://localhost:5000/api`
* **Demo Credentials:** `customer@vit.ac.in` / `password123`
* **Demo Restaurants:** `rest-1` (Pizza Corner), `rest-2` (Burger Hub), `rest-3` (Biryani Palace)

---

## Screen-by-Screen Phasing Matrix

To allow working on one screen at a time without getting overwhelmed, Phase 5 is partitioned into 7 self-contained sub-phases:

```
Phase 5.0: Frontend Foundation (Vite + React + Tailwind + API Client + Docker)
   │
Phase 5.1: Screen 1 — Authentication & Customer Profile
   │
Phase 5.2: Screen 2 — Restaurant Discovery & Menu Browsing (with Redis Badge)
   │
Phase 5.3: Screen 3 — Cart Management & Instant Checkout
   │
Phase 5.4: Screen 4 — Live Order Tracker & Status Stepper (with RabbitMQ Alerts)
   │
Phase 5.5: Screen 5 — Order Reviews & Customer Feedback
   │
Phase 5.6: Screen 6 — The Architecture Live Monitor Tab (Review Viva Feature)
```

---

## Phase 5.0: Frontend Foundation & Setup

> **Goal:** Initialize a lightweight, high-performance Vite + React SPA with Tailwind CSS, global state, API client, and Docker containerization.

### Tasks to Perform:
1. **Initialize Project:**
   * Create `frontend/` directory using Vite (`react`).
   * Setup Tailwind CSS for styling with a clean, modern palette (Slate/Ink, Emerald for success, Indigo/Blue for primary actions, Coral/Orange for accents).
2. **API Client (`frontend/src/api/client.js`):**
   * Centralized Axios/fetch wrapper pointing to `http://localhost:5000/api`.
   * Automatically attaches `Authorization: Bearer <token>` from `localStorage`.
   * Intercepts `X-Served-By` and `X-Cache` headers and exposes them to the state.
3. **Global State Contexts (`frontend/src/context/`):**
   * `AuthContext.jsx`: Manages logged-in user, JWT token, and login/logout methods.
   * `CartContext.jsx`: Manages items in cart, quantities, restaurant ID constraint (only 1 restaurant per cart), and subtotal calculation.
4. **App Shell & Navbar (`frontend/src/components/Navbar.jsx`):**
   * Logo & App Title: *"FoodDash Microservices"*
   * Navigation links: Restaurants, Orders, Profile.
   * Cart icon with floating item count badge.
   * User badge showing active account.
   * **Toggle Button:** *"⚡ Architecture Monitor"* (toggles Screen 6).
5. **Docker Integration:**
   * Create `frontend/Dockerfile` (Node 20 Alpine serving Vite dev/preview on port `3000`).
   * Add `frontend` to `docker-compose.yml` on port `3000:3000`.

**Acceptance Criteria for Phase 5.0:**  
Visiting `http://localhost:3000` renders the clean app shell with navigation, responsive layout, and successful connection to `http://localhost:5000/api/health`.

---

## Phase 5.1: Screen 1 — Authentication & Customer Profile

> **Goal:** Enable user login and registration, store JWT in `localStorage`, and display customer profile with saved delivery addresses.

### UI Components:
* `AuthModal.jsx` or `LoginPage.jsx`:
  * Tabbed toggle between **Sign In** and **Create Account**.
  * Email & Password input fields with validation.
  * **"Quick Demo Login" Button (Vital for Viva):** 1-click button that auto-fills `customer@vit.ac.in` / `password123` and logs in instantly.
* `ProfileDrawer.jsx` or `ProfileCard.jsx`:
  * Displays user name ("Aadith"), email, phone number, and account role (`customer`).
  * Lists saved delivery addresses:
    * `[Default]` Hostel Block D, VIT Vellore, Tamil Nadu - 632014.
  * Form to add a new delivery address.

### API Endpoints Called:
* `POST /api/auth/login` — Receives JWT and user object.
* `POST /api/auth/register` — Creates new account.
* `GET /api/users/profile/:userId` — Retrieves customer details and addresses.
* `POST /api/users/profile/:userId/addresses` — Saves a new address.

**Acceptance Criteria for Phase 5.1:**  
Clicking "Quick Demo Login" logs the user in, changes the Navbar to display "Aadith (Customer)", persists the token, and shows the saved VIT Vellore address.

---

## Phase 5.2: Screen 2 — Restaurant Discovery & Menu Browsing

> **Goal:** Render the restaurant catalog with cuisine filters, live dish search, and interactive categorized menus.

### UI Components:
* `RestaurantList.jsx`:
  * Grid of restaurant cards:
    * **Pizza Corner** (Italian · ⭐ 4.6 · 25 mins)
    * **Burger Hub** (Fast Food · ⭐ 4.4 · 20 mins)
    * **Biryani Palace** (Mughlai · ⭐ 4.8 · 30 mins)
  * Each card displays thumbnail banner, rating badge, delivery ETA, and minimum order.
  * **Redis Cache Indicator Badge:** Small badge in the corner of the grid showing:  
    `⚡ Served via Redis Cache (Hit)` or `💾 Fetched from MongoDB`.
* `CuisineFilter.jsx`:
  * Filter pills: `All`, `Pizzas & Italian`, `Burgers & Fast Food`, `Biryani & Indian`.
* `SearchBar.jsx`:
  * Real-time search by dish name (e.g. "Margherita") or restaurant name.
* `MenuModal.jsx`:
  * Opens when clicking a restaurant card.
  * Categorized tabs: *Main Dishes*, *Sides*, *Desserts*, *Beverages*.
  * Dish card: Image, name, description, price (₹), and "+ Add to Cart" button.
  * If item is already in cart, turns into a quantity selector: `[ - ] 2 [ + ]`.

### API Endpoints Called:
* `GET /api/restaurants` — Retrieves restaurant listing (inspects `x-cache` header).
* `GET /api/restaurants/:id/menu` — Retrieves categorized dishes for the selected restaurant.

**Acceptance Criteria for Phase 5.2:**  
User can browse all 3 restaurants, filter by cuisine, open Pizza Corner's menu, and add Margherita Pizza and Garlic Breadsticks to the cart.

---

## Phase 5.3: Screen 3 — Cart Management & Instant Checkout

> **Goal:** Review cart items, calculate billing with taxes/fees, select a delivery address, and place the order.

### UI Components:
* `CartDrawer.jsx`:
  * Slides out from the right when clicking the Navbar Cart icon.
  * Lists added items with quantity adjustment (`+` / `-`) and item removal.
  * Shows restaurant name being ordered from.
* `CheckoutSection.jsx`:
  * **Delivery Address Picker:** Radio select showing saved addresses (pre-selects VIT Vellore).
  * **Payment Method Selector:** Clean radio cards for `UPI / Google Pay`, `Credit / Debit Card`, `Cash on Delivery`.
  * **Bill Summary Card:**
    * Item Subtotal: ₹...
    * Delivery Charge: ₹30 (or FREE if > ₹500)
    * Platform & Taxes: ₹15
    * **Total Amount to Pay: ₹...**
  * **"Place Order & Pay" Button:** Primary high-contrast button.

### API Endpoints Called:
* `POST /api/orders` — Submits `{ userId, restaurantId, items, deliveryAddress }`.
  * Receives immediate response: `{ orderId, status: "PENDING", totalAmount }`.

**Acceptance Criteria for Phase 5.3:**  
Clicking "Place Order" clears the cart, returns an instant `PENDING` response in <50ms, and automatically redirects the user to Screen 4 (Live Order Tracker).

---

## Phase 5.4: Screen 4 — Live Order Tracker & Status Stepper

> **Goal:** Visually demonstrate Eventual Consistency, the RabbitMQ Saga transition, and real-time delivery tracking.

### UI Components:
* `OrderTrackerPage.jsx`:
  * Displays Order ID (e.g. `ORD-958896`) and placed timestamp.
  * **Animated Status Stepper (5 Stages):**
    1. ⚪ **Order Placed** (`PENDING`)
    2. 🟢 **Payment Confirmed** (`CONFIRMED` with transaction badge `TXN-...`)
    3. 🟡 **Kitchen Preparing** (`PREPARING`)
    4. 🔵 **Out for Delivery** (`OUT_FOR_DELIVERY`)
    5. 🟣 **Delivered** (`DELIVERED`)
  * **Live Auto-Polling:** The frontend polls `GET /api/orders/:id` every 2.5 seconds.
  * When status transitions from `PENDING` $\rightarrow$ `CONFIRMED`, the stepper animates to green with a smooth celebration badge!
* `DeliveryAgentCard.jsx`:
  * Displays assigned driver card:
    * Name: **Ramesh Kumar**
    * Phone: **+91 98765 43210** (with clickable `tel:` link)
    * Live ETA badge: *"Arriving in 25 mins"*
    * Current location description: *"En route to Hostel Block D, VIT Vellore"*
* `LiveEventFeed.jsx` (Drawer or Box):
  * Displays the chronological event stream from RabbitMQ:
    * `[10:14:02]` 🔔 Order placed and sent to message broker.
    * `[10:14:03]` 💳 Payment authorized by worker replica.
    * `[10:14:04]` 🛵 Delivery partner Ramesh Kumar assigned.

### API Endpoints Called:
* `GET /api/orders/:id` — Live order status polling.
* `GET /api/delivery/track/:orderId` — Driver location and ETA.
* `GET /api/notifications/order/:orderId` — Real-time event notifications.

**Acceptance Criteria for Phase 5.4:**  
Placing an order loads the tracker. Within 1–2 seconds, the stepper automatically moves from `PENDING` to `CONFIRMED` on screen without refreshing the page!

---

## Phase 5.5: Screen 5 — Order Reviews & Customer Feedback

> **Goal:** Allow customers to submit star ratings and feedback for delivered orders and display aggregated ratings.

### UI Components:
* `ReviewModal.jsx`:
  * Triggers when order reaches `DELIVERED` status (or from order history).
  * Interactive 5-star rating selector (⭐ ⭐ ⭐ ⭐ ⭐).
  * Quick praise tag pills: `["Fast Delivery", "Hot & Fresh", "Tasty Food", "Polite Driver"]`.
  * Text area for custom feedback.
  * "Submit Review" button.
* `RestaurantReviewList.jsx`:
  * Displayed inside the Restaurant Menu modal (Screen 2).
  * Shows average score (e.g. `4.8 / 5.0`) and customer comments.

### API Endpoints Called:
* `POST /api/reviews` — Submits rating and review.
* `GET /api/reviews/restaurant/:restaurantId` — Fetches restaurant reviews and average score.

**Acceptance Criteria for Phase 5.5:**  
Customer submits a 5-star review, and the restaurant's review list immediately updates to reflect the new rating.

---

## Phase 5.6: Screen 6 — The Architecture Live Monitor Tab (Review Viva Secret Weapon)

> **Goal:** An embedded architectural control panel right inside the web app so Prof. Tauseef Khan can see the distributed system live without looking at terminal commands.

### UI Components:
* `ArchitectureMonitor.jsx` (Opened via Navbar toggle):
  * **Fleet Status Grid:** 10 visual cards representing all running services:
    * `API Gateway (:5000)` · `Auth Service (:5001)` · `User Service (:5002)`
    * `Restaurant Service (:5003 · 2 Replicas)` · `Order Service (:5004 · 2 Replicas)`
    * `Payment Service (:5005 · 2 Replicas)` · `Delivery Service (:5006)`
    * `Notification Service (:5007)` · `Review Service (:5008)`
    * `RabbitMQ Broker (:5672)` · `Redis Cache (:6379)` · `MongoDB (:27017)`
  * **Live Ping Indicators:** Green pulse dot + latency (e.g. `🟢 UP · 18ms`).
  * **Instance Tracking Display:** Shows which container hostname processed the last action (`X-Served-By: f606193f1dad`).
  * **Direct Links:** Button to open RabbitMQ Management Dashboard (`http://localhost:15672`) in a new tab.

### API Endpoints Called:
* `GET /api/health` — Probes all microservices and infrastructure.

**Acceptance Criteria for Phase 5.6:**  
Clicking "⚡ Architecture Monitor" opens a clean, dark-mode/dashboard view displaying all microservices and active container replicas with live green health indicators.

---

## Summary of Files to be Created in Phase 5

```text
frontend/
├── Dockerfile
├── package.json
├── index.html
├── vite.config.js
├── tailwind.config.js
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── api/
    │   └── client.js               # Gateway Axios instance
    ├── context/
    │   ├── AuthContext.jsx         # User & JWT state
    │   └── CartContext.jsx         # Cart items & calculations
    ├── components/
    │   ├── Navbar.jsx              # Navigation & cart badge
    │   ├── AuthModal.jsx           # Screen 1 (Login/Register)
    │   ├── RestaurantList.jsx      # Screen 2 (Catalog & Redis badge)
    │   ├── MenuModal.jsx           # Screen 2 (Dishes & Add to Cart)
    │   ├── CartDrawer.jsx          # Screen 3 (Checkout & Address)
    │   ├── OrderTracker.jsx        # Screen 4 (Status Stepper & Driver)
    │   ├── ReviewModal.jsx         # Screen 5 (Ratings & Reviews)
    │   └── ArchitectureMonitor.jsx # Screen 6 (Viva Health Dashboard)
    └── styles/
        └── index.css
```

---

## How to Continue in a Fresh Chat

When opening a fresh chat, you can pick any sub-phase and say:
> *"I am ready to implement Phase 5.0 (or Phase 5.1, etc.) of the Online Food Delivery System according to `docs/phase_5_plan.md`."*
