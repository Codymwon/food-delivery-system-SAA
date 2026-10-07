# Phase 1 Plan: Identity & Catalog Services
**Project:** Online Food Delivery System (Microservices Architecture)  
**Course:** SWE4007 – Software Application Architecture  
**Dependencies:** Phase 0 (Infrastructure Foundation) must be live.  

---

## 1. Objective

Phase 1 establishes the **core identity and catalog services** without introducing complex inter-service message queues yet.

By the end of Phase 1:
1. **Auth Service (:5001)** will manage user registration, password hashing (`bcrypt`), and token issuing (`JWT`).
2. **User Service (:5002)** will manage customer profiles, phone numbers, and saved delivery addresses.
3. **Restaurant Service (:5003)** will provide search, restaurant catalogs, and menu browsing.
4. **Redis Cache Layer (:6379)** will cache restaurant catalog queries to demonstrate real-world read-heavy performance optimization.
5. All three services will be connected through the **API Gateway (:5000)** and isolated within their respective databases.

---

## 2. Directory Layout for Phase 1

```text
food-delivery-system/
├── docker-compose.yml                  # Updated to include Phase 1 services
├── api-gateway/                        # (Already live from Phase 0)
└── services/
    ├── auth-service/                   # Port 5001
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/
    │       ├── index.js
    │       └── models/UserAuth.js
    ├── user-service/                   # Port 5002
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/
    │       ├── index.js
    │       └── models/UserProfile.js
    └── restaurant-service/             # Port 5003
        ├── Dockerfile
        ├── package.json
        └── src/
            ├── index.js
            ├── models/Restaurant.js
            └── models/MenuItem.js
```

---

## 3. Detailed Service Specifications

### Step 1.1: Auth Service (Port 5001)
* **Directory:** `services/auth-service/`
* **Database URI:** `mongodb://mongodb:27017/user_db`
* **Key Dependencies:** `express`, `mongoose`, `bcryptjs`, `jsonwebtoken`, `cors`, `morgan`
* **Data Model (`UserAuth`):**
  * `email` (String, unique, lowercase)
  * `passwordHash` (String, bcrypt salt 10)
  * `role` (String: `customer` | `manager` | `agent` | `admin`)
  * `createdAt` (Date)
* **Endpoints (routed via `/api/auth` on Gateway):**
  * `POST /register` — Body: `{ email, password, role? }` $\rightarrow$ Returns `{ userId, email, role }`
  * `POST /login` — Body: `{ email, password }` $\rightarrow$ Returns `{ token, user: { userId, email, role } }`
  * `GET /verify` — Header: `Authorization: Bearer <token>` $\rightarrow$ Validates token and returns decoded claims.
  * `GET /health` — Returns service health status and DB connection.
* **Auto-Seed on Startup:**
  * Checks if `customer@vit.ac.in` exists. If not, auto-seeds default credentials:
    * Email: `customer@vit.ac.in`
    * Password: `password123`
    * Role: `customer`

---

### Step 1.2: User Service (Port 5002)
* **Directory:** `services/user-service/`
* **Database URI:** `mongodb://mongodb:27017/user_db`
* **Key Dependencies:** `express`, `mongoose`, `cors`, `morgan`
* **Data Model (`UserProfile`):**
  * `userId` (String, unique reference to Auth)
  * `name` (String)
  * `phone` (String)
  * `addresses` (Array of Address objects: `{ label, street, city, zipCode, isDefault }`)
* **Endpoints (routed via `/api/users` on Gateway):**
  * `GET /profile/:userId` — Retrieves customer name, phone, and addresses.
  * `PUT /profile/:userId` — Updates name and phone.
  * `POST /profile/:userId/addresses` — Adds a new delivery address.
  * `GET /profile/:userId/addresses` — Lists saved addresses.
  * `GET /health` — Service health check.
* **Auto-Seed on Startup:**
  * Seeds demo profile for `customer@vit.ac.in` with default address:
    * `Hostel Block D, VIT Vellore, Tamil Nadu - 632014`.

---

### Step 1.3: Restaurant & Menu Service (Port 5003) + Redis Cache
* **Directory:** `services/restaurant-service/`
* **Database URI:** `mongodb://mongodb:27017/restaurant_db`
* **Redis URI:** `redis://redis:6379`
* **Key Dependencies:** `express`, `mongoose`, `ioredis`, `cors`, `morgan`
* **Data Models:**
  * `Restaurant`: `{ id, name, cuisine, rating, deliveryTimeMinutes, minOrder, bannerImage, isOpen }`
  * `MenuItem`: `{ id, restaurantId, name, description, price, category, imageUrl, isAvailable }`
* **Endpoints (routed via `/api/restaurants` on Gateway):**
  * `GET /` — Lists all restaurants. Supports query filters: `?cuisine=Italian&search=Pizza`.
    * **Cache-Aside Pattern:** Checks Redis key `cache:restaurants`.
    * If cached: Returns data with header `X-Cache: HIT`.
    * If not cached: Fetches from MongoDB, writes to Redis with 60-second TTL, returns `X-Cache: MISS`.
  * `GET /:id` — Gets detailed restaurant info.
  * `GET /:id/menu` — Gets categorized menu items (Pizzas, Burgers, Sides, Drinks).
  * `GET /health` — Service health check (reports MongoDB & Redis status).
* **Auto-Seed on Startup:**
  * Pre-seeds 3 popular demo restaurants with complete menus and food photos:
    1. **Pizza Corner** (Italian, Rating 4.6, 25 mins) — Margherita Pizza, Farmhouse Special, Garlic Breadsticks.
    2. **Burger Hub** (American / Fast Food, Rating 4.4, 20 mins) — Classic Cheeseburger, Crispy Chicken Burger, Peri-Peri Fries.
    3. **Biryani Palace** (Mughlai / Indian, Rating 4.8, 30 mins) — Chicken Dum Biryani, Paneer Biryani, Mirchi Ka Salan.

---

## 4. Updates to `docker-compose.yml`

Add the 3 microservices with resource-efficient settings:
```yaml
  auth-service:
    build: ./services/auth-service
    environment:
      - PORT=5001
      - MONGO_URI=mongodb://mongodb:27017/user_db
      - JWT_SECRET=vit_swe4007_secret_key_2026
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - food-delivery-net

  user-service:
    build: ./services/user-service
    environment:
      - PORT=5002
      - MONGO_URI=mongodb://mongodb:27017/user_db
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - food-delivery-net

  restaurant-service:
    build: ./services/restaurant-service
    environment:
      - PORT=5003
      - MONGO_URI=mongodb://mongodb:27017/restaurant_db
      - REDIS_URL=redis://redis:6379
    depends_on:
      mongodb:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - food-delivery-net
```

---

## 5. Verification & Acceptance Sequence

Once Phase 1 is built, we will execute this verification suite through the API Gateway:

### Step 1: Health Check Verification
```bash
curl http://localhost:5000/api/health
```
**Expected:** Gateway returns HTTP 200 with `auth`, `user`, and `restaurant` services listed as `UP`.

### Step 2: Test Authentication (Login & JWT Generation)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@vit.ac.in", "password":"password123"}'
```
**Expected:** Returns JWT token and user details.

### Step 3: Test User Profile Lookup
```bash
curl http://localhost:5000/api/users/profile/<USER_ID>
```
**Expected:** Returns customer name and saved VIT Vellore delivery address.

### Step 4: Test Restaurant Browsing & Redis Caching
```bash
# Call 1 (Cache MISS - fetched from MongoDB)
curl -i http://localhost:5000/api/restaurants

# Call 2 (Cache HIT - instant response from Redis)
curl -i http://localhost:5000/api/restaurants
```
**Expected:** Returns list of restaurants with headers demonstrating cache utilization.

### Step 5: Test Restaurant Menu Listing
```bash
curl http://localhost:5000/api/restaurants/<RESTAURANT_ID>/menu
```
**Expected:** Returns categories and menu items with prices.

---

## 6. What Phase 1 Prepares for Phase 2

With Phase 1 complete:
* The user can log in and obtain a JWT.
* The customer has a delivery address.
* The customer can pick food items from real restaurant menus.
* **Phase 2 (Order & Payment Engine)** will simply take the selected menu items, user ID, and address, and trigger the RabbitMQ event stream!
