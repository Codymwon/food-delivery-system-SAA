# Phase 0 Plan: Infrastructure Foundation & Ingress
**Project:** Online Food Delivery System (Microservices Architecture)  
**Course:** SWE4007 – Software Application Architecture  
**Guide:** Prof. Tauseef Khan  

---

## 1. Objective

Phase 0 establishes the **shared execution and communication foundation** for the entire system before any application microservices are written.

By the end of Phase 0:
1. The **Docker internal bridge network** will be live.
2. The **Database engine (MongoDB)** will be operational and ready to host the 6 isolated service databases.
3. The **Message Broker (RabbitMQ)** and its management dashboard will be running.
4. The **In-memory cache (Redis)** will be operational.
5. The **API Gateway** will be built, containerized, and routing requests while exposing an aggregated `/api/health` diagnostic endpoint.

---

## 2. Directory Layout for Phase 0

All code and configurations will reside inside:  
`/home/aadith/.gemini/antigravity/scratch/food-delivery-system/`

```text
food-delivery-system/
├── docker-compose.yml              # Core multi-container orchestration
└── api-gateway/                    # Public Ingress & Reverse Proxy
    ├── Dockerfile                  # Lightweight Node 20 Alpine container
    ├── package.json                # Express + Proxy dependencies
    └── src/
        └── index.js                # Routing rules, CORS, and health-check logic
```

---

## 3. Container Specifications

| Container Name | Base Image | Host Port | Internal Port | Role & Architectural Purpose |
| :--- | :--- | :---: | :---: | :--- |
| **`mongodb`** | `mongo:7-jammy` | `27017` | `27017` | **DBMS Engine:** Hosts the 6 logical, isolated service databases (`user_db`, `restaurant_db`, `order_db`, `payment_db`, `delivery_db`, `review_db`). |
| **`rabbitmq`** | `rabbitmq:3-management` | `5672`<br>`15672` | `5672`<br>`15672` | **Message Broker:** Asynchronous East-West event backbone.<br>• `5672`: AMQP protocol for microservices.<br>• `15672`: Web UI for live review demonstration. |
| **`redis`** | `redis:7-alpine` | `6379` | `6379` | **Cache Layer:** Low-latency in-memory cache for restaurant catalog and menu browsing. |
| **`api-gateway`** | `node:20-alpine` | `5000` | `5000` | **Ingress Proxy:** Single public entry point. Routes client requests, eliminates CORS, and terminates JWT validation. |

---

## 4. Detailed Component Designs

### A. Network Configuration (`docker-compose.yml`)
* **Network Name:** `food-delivery-net`
* **Driver:** `bridge`
* **DNS Resolution:** Embedded Docker DNS enables containers to communicate using service names (e.g., `http://api-gateway:5000`, `mongodb://mongodb:27017`).

### B. API Gateway (`api-gateway/src/index.js`)
* **Framework:** Express + `http-proxy-middleware` + `cors` + `morgan`
* **Routing Table:**
  * `/api/auth/*` $\rightarrow$ `http://auth-service:5001`
  * `/api/users/*` $\rightarrow$ `http://user-service:5002`
  * `/api/restaurants/*` $\rightarrow$ `http://restaurant-service:5003`
  * `/api/orders/*` $\rightarrow$ `http://order-service:5004`
  * `/api/payments/*` $\rightarrow$ `http://payment-service:5005`
  * `/api/delivery/*` $\rightarrow$ `http://delivery-service:5006`
  * `/api/notifications/*` $\rightarrow$ `http://notification-service:5007`
  * `/api/reviews/*` $\rightarrow$ `http://review-service:5008`
* **Diagnostic Endpoint (`GET /api/health`):**
  * Verifies Gateway is healthy (`UP`).
  * Pings MongoDB, RabbitMQ, and Redis to verify connectivity.
  * Lists active routes and architectural metadata.

---

## 5. Verification & Acceptance Criteria (Step-by-Step)

Once Phase 0 files are written, we will run the following sequence to certify completion:

### Step 1: Build and Launch
```bash
cd /home/aadith/.gemini/antigravity/scratch/food-delivery-system
docker compose up --build -d
```

### Step 2: Verify Running Containers
```bash
docker compose ps
```
**Expected:** All 4 containers (`mongodb`, `rabbitmq`, `redis`, `api-gateway`) show state `Up` / `healthy`.

### Step 3: Test API Gateway Health Endpoint
```bash
curl http://localhost:5000/api/health
```
**Expected:** HTTP 200 JSON payload showing:
```json
{
  "gateway": "UP",
  "architecture": "Microservices with Database-per-Service Pattern",
  "infrastructure": {
    "mongodb": "CONNECTED",
    "rabbitmq": "CONNECTED",
    "redis": "CONNECTED"
  }
}
```

### Step 4: Verify Web Dashboard Access
* Open `http://localhost:15672` in a browser.
* Log in with credentials: `guest` / `guest`.
* **Expected:** RabbitMQ Management Overview screen is visible.

---

## 6. What Happens Next (Transition to Phase 1)

With Phase 0 certified:
* **MongoDB** will be waiting to accept connections for `user_db`.
* **API Gateway** will already have the route `/api/auth` configured.
* We can immediately build **Step 1.1: Auth Service** in its own folder (`services/auth-service/`) and see it plug seamlessly into the ecosystem.
