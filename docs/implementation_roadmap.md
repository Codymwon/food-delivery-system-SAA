# Implementation Roadmap: Online Food Delivery System
**Course:** SWE4007 – Software Application Architecture  
**Review:** First Review (Fall Semester 2026–27)  
**Strategy:** Phased, service-by-service development. Keeping it simple, robust, and review-focused. The Client UI is intentionally isolated in the final phase.

---

## Roadmap Overview at a Glance

```
Phase 0: Foundation (Docker Network, Gateway, Message Broker, DB)
   │
Phase 1: Identity & Catalog Services (Auth, User, Restaurant + Redis)
   │
Phase 2: Core Transaction Engine (Order Service & Payment Service via RabbitMQ)
   │
Phase 3: Fulfillment & Auxiliary Services (Delivery, Notification, Review)
   │
Phase 4: Scaling & Resilience Verification (Replicas & Load Balancing)
   │
Phase 5: Client UI (React SPA — Kept Last on its own)
   │
Phase 6: Review Deliverables (Postman Collection & Live Demo Script)
```

---

## Phase 0: Infrastructure Foundation & Ingress

> **Objective:** Set up the shared Docker ecosystem so every service built thereafter has an immediate place to run and communicate.

* [ ] **0.1 Docker Compose Skeleton (`docker-compose.yml`)**
  * Define the internal bridge network (`food-delivery-net`).
  * Add the single **MongoDB container** (configured with separate database names per service).
  * Add the **RabbitMQ container** (`image: rabbitmq:3-management` on ports `5672` & `15672`).
  * Add the **Redis container** (`image: redis:alpine` on port `6379`).
* [ ] **0.2 API Gateway & Load Balancer (`api-gateway`)**
  * Basic Express/Nginx gateway on Port `5000`.
  * Reverse proxy routing rules mapped to upcoming microservice ports (`5001` through `5008`).
  * Aggregated health check route: `GET /api/health` (pings all services and reports status).

**Milestone 0 Acceptance Criteria:**  
Running `docker compose up` starts DB, RabbitMQ, Redis, and Gateway. Hitting `http://localhost:5000/api/health` returns HTTP 200 with Gateway status `UP`.

---

## Phase 1: Identity & Catalog Services

> **Objective:** Build the foundational read/write services with zero inter-service complexity.

### Step 1.1: Auth Service (Port 5001)
* **Database:** `user_db` (or `auth_db`)
* **Endpoints:**
  * `POST /api/auth/register` — Creates user with hashed password.
  * `POST /api/auth/login` — Returns signed JWT token with role (`customer`).
  * `GET /api/auth/verify` — Validates token.
* **Pre-seeded data:** Auto-create demo credentials (`customer@vit.ac.in` / `password123`).

### Step 1.2: User Service (Port 5002)
* **Database:** `user_db`
* **Endpoints:**
  * `GET /api/users/profile/:id` — Fetches customer profile.
  * `PUT /api/users/profile/:id` — Updates phone and default delivery address.

### Step 1.3: Restaurant Service (Port 5003) + Redis Cache
* **Database:** `restaurant_db`
* **Endpoints:**
  * `GET /api/restaurants` — Lists restaurants (supports cuisine/search filters).
  * `GET /api/restaurants/:id/menu` — Fetches catalog of menu items and prices.
* **Redis Caching:** Cache the restaurant list for 60 seconds. On cache hit, return immediately from Redis.
* **Pre-seeded data:** Auto-seed 3–4 realistic restaurants (Dominos Pizza, Burger King, Biryani House) with items and image URLs.

**Milestone 1 Acceptance Criteria:**  
You can register/login via Postman on port 5000, retrieve a JWT, view your profile, and browse pre-seeded restaurant menus with Redis cache hits.

---

## Phase 2: Core Transaction Engine (Order & Payment via RabbitMQ)

> **Objective:** Implement the asynchronous Choreography-based Saga pattern between ordering and payment.

### Step 2.1: Order Service (Port 5004)
* **Database:** `order_db`
* **Endpoints:**
  * `POST /api/orders` — Accepts cart items, creates an order in state `PENDING`, responds with `201 Created` immediately.
  * `GET /api/orders/:id` — Returns current status of an order (`PENDING`, `CONFIRMED`, `DELIVERED`).
  * `GET /api/orders/user/:userId` — Order history.
* **Event Publishing:** Emits `order.created` event onto RabbitMQ topic exchange `food_delivery_events`.

### Step 2.2: Payment Service (Port 5005)
* **Database:** `payment_db`
* **Async Consumer:**
  * Subscribes to `order.created` queue on RabbitMQ.
  * Processes payment (simulated 1-second delay, always approves with transaction ID).
  * Emits `payment.completed` event to RabbitMQ.
* **Order Status Sync:** Order Service listens to `payment.completed` and transitions order status from `PENDING` $\rightarrow$ `CONFIRMED`.

**Milestone 2 Acceptance Criteria:**  
Submitting an order via `POST /api/orders` returns an immediate `PENDING` response. Within 1–2 seconds, logs show Payment Service consuming the event, and polling the order shows status `CONFIRMED`.

---

## Phase 3: Fulfillment & Auxiliary Services

> **Objective:** Connect delivery fulfillment and passive services to the event bus.

### Step 3.1: Delivery Service (Port 5006)
* **Database:** `delivery_db`
* **Async Consumer:**
  * Subscribes to `payment.completed` on RabbitMQ.
  * Auto-assigns a mock driver (e.g., "Ramesh Kumar - +91 98765 43210").
  * Transitions delivery status: `ASSIGNED` $\rightarrow$ `OUT_FOR_DELIVERY` $\rightarrow$ `DELIVERED` (simulated timer).
* **Endpoints:**
  * `GET /api/delivery/track/:orderId` — Returns assigned driver and delivery ETA.

### Step 3.2: Notification Service (Port 5007)
* **Database:** *None (Stateless Queue Consumer)*
* **Async Consumer:**
  * Listens to all events (`order.created`, `payment.completed`, `delivery.assigned`).
  * Logs notifications to console and stores in-memory event stream for client polling.

### Step 3.3: Review Service (Port 5008)
* **Database:** `review_db`
* **Endpoints:**
  * `POST /api/reviews` — Submit rating (1–5 stars) and review text for a completed order.
  * `GET /api/reviews/restaurant/:restaurantId` — Get average rating and reviews.

**Milestone 3 Acceptance Criteria:**  
Placing an order triggers a complete end-to-end chain: Order $\rightarrow$ Payment $\rightarrow$ Delivery Assignment $\rightarrow$ Notifications logged, and reviews can be submitted.

---

## Phase 4: Horizontal Scaling & Resilience Verification

> **Objective:** Verify and demonstrate the architectural features for the review evaluation.

* [ ] **4.1 Scale Services:**
  * Run: `docker compose up --scale restaurant-service=2 --scale order-service=2 --scale payment-service=2`.
* [ ] **4.2 Verify Load Balancing:**
  * Send consecutive requests to `GET /api/restaurants` and `POST /api/orders`.
  * Confirm that consecutive responses return different container hostnames (`process.env.HOSTNAME`).
* [ ] **4.3 Fault Tolerance Test (Live Chaos Demo):**
  * Intentionally stop the Notification Service container: `docker stop notification-service`.
  * Place an order: verify that Order, Payment, and Delivery still succeed flawlessly without breaking the app.

---

## Phase 5: Client UI (React SPA — Kept Last)

> **Objective:** Build a single, polished frontend that visually demonstrates the working system.

* [ ] **5.1 Single Customer SPA (Port 3000):**
  * Modern, responsive interface (React + Vite + Tailwind CSS).
  * **Screen 1: Authentication** (Demo auto-fill button for 1-click login).
  * **Screen 2: Restaurant & Menu Browsing** (Search, cuisine tags, food cards, prices, pre-loaded images).
  * **Screen 3: Cart & Instant Checkout** (Item quantity, delivery address, subtotal, checkout button).
  * **Screen 4: Live Order Tracker** (Visual progress stepper: *Placed* $\rightarrow$ *Payment Confirmed* $\rightarrow$ *Preparing* $\rightarrow$ *Out for Delivery* $\rightarrow$ *Delivered*).
* [ ] **5.2 Architecture Live Monitor Tab (Review Game-Changer):**
  * A tab or toggle directly in the UI showing the live status of all 8 microservice containers, API Gateway, RabbitMQ, and Redis with live ping response times.

---

## Phase 6: Final Review Deliverables

> **Objective:** Package everything neatly for Prof. Tauseef Khan and the review committee.

* [ ] **6.1 Postman Test Collection (`food_delivery.postman_collection.json`):**
  * Pre-configured collection covering all 8 services through the API Gateway (matching SRS Section 3.8).
* [ ] **6.2 Review Demo Script (5-Minute Viva Walkthrough):**
  * Step-by-step presentation script for the 5 team members:
    1. Show `docker ps` with all running microservice containers.
    2. Place an order on the UI and watch the RabbitMQ event stream in terminal.
    3. Show horizontal scaling with `--scale order-service=2`.
    4. Kill a container to prove microservice fault isolation.
