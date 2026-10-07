# Phase 3 Plan: Fulfillment & Auxiliary Services
**Project:** Online Food Delivery System (Microservices Architecture)  
**Course:** SWE4007 – Software Application Architecture  
**Dependencies:** Phase 0, Phase 1, and Phase 2 must be live.  

---

## 1. Objective

Phase 3 implements the **fulfillment, real-time alert, and customer feedback services**, completing the full backend suite of all 8 microservices specified in the SRS.

By the end of Phase 3:
1. **Delivery Service (:5006)** will consume `payment.completed` from RabbitMQ, automatically assign a delivery driver, track coordinates, and manage delivery status.
2. **Notification Service (:5007)** will consume all domain events (`order.*`, `payment.*`, `delivery.*`) and maintain an active notification event feed.
3. **Review Service (:5008)** will allow customers to rate orders and restaurants (1–5 stars) and calculate aggregated ratings in `review_db`.
4. **All 8 microservices and 6 isolated databases** from the architecture specification will be running live simultaneously in Docker!

---

## 2. Directory Layout for Phase 3

```text
food-delivery-system/
├── docker-compose.yml                  # Updated with all 8 microservices
├── api-gateway/                        # (All 8 routes mapped and health monitored)
└── services/
    ├── delivery-service/               # Port 5006 (Driver dispatch & tracking)
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/
    │       ├── index.js
    │       ├── models/Delivery.js
    │       └── rabbitmq.js
    ├── notification-service/           # Port 5007 (Stateless event consumer)
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/
    │       ├── index.js
    │       └── rabbitmq.js
    └── review-service/                 # Port 5008 (Ratings & reviews)
        ├── Dockerfile
        ├── package.json
        └── src/
            ├── index.js
            └── models/Review.js
```

---

## 3. End-to-End Event Choreography (Complete Chain)

```
[ Customer ] ──► POST /api/orders (Sync REST)
     │
     ▼
[ Order Service (:5004) ] ──► Emits: "order.created"
                                     │
     ┌───────────────────────────────┴───────────────────────────────┐
     ▼                                                               ▼
[ Payment Service (:5005) ]                                   [ Notification Svc (:5007) ]
     │ (Charges user)                                                │ (Logs: "Order Placed")
     ▼
  Emits: "payment.completed"
     │
     ├───────────────────────────────┬───────────────────────────────┐
     ▼                               ▼                               ▼
[ Order Service (:5004) ]     [ Delivery Service (:5006) ]    [ Notification Svc (:5007) ]
  (Status: CONFIRMED)           │ (Assigns Rider "Ramesh")      (Logs: "Payment Confirmed")
                                ▼
                             Emits: "delivery.assigned"
                                │
                                ▼
                             [ Notification Svc (:5007) ]
                               (Logs: "Rider is heading to restaurant")
```

---

## 4. Detailed Service Specifications

### Step 3.1: Delivery Service (Port 5006)
* **Directory:** `services/delivery-service/`
* **Database URI:** `mongodb://mongodb:27017/delivery_db`
* **RabbitMQ URI:** `amqp://rabbitmq:5672`
* **Key Dependencies:** `express`, `mongoose`, `amqplib`, `cors`, `morgan`
* **Data Model (`Delivery`):**
  * `deliveryId` (String, unique e.g. `DEL-619283`)
  * `orderId` (String, unique reference)
  * `userId` (String)
  * `partnerName` (String: "Ramesh Kumar")
  * `partnerPhone` (String: "+91 98765 43210")
  * `status` (Enum: `ASSIGNED` $\rightarrow$ `PICKED_UP` $\rightarrow$ `OUT_FOR_DELIVERY` $\rightarrow$ `DELIVERED`)
  * `etaMinutes` (Number: 25)
  * `currentLocation` (Object: `{ text: "En route to Hostel Block D, VIT Vellore" }`)
  * `timestamps`
* **Async Consumer (`payment.completed`):**
  * Listens to `payment.completed` on RabbitMQ.
  * Auto-assigns driver and creates delivery record with status `ASSIGNED`.
  * Publishes `delivery.assigned` event.
  * Simulates automatic progression: updates status to `OUT_FOR_DELIVERY` after 15 seconds, and `DELIVERED` after 40 seconds.
* **Endpoints (routed via `/api/delivery` on Gateway):**
  * `GET /track/:orderId` — Fetches current driver, ETA, and delivery status.
  * `PATCH /status/:orderId` — Manual status override for viva demonstration.
  * `GET /health` — Service health check.

---

### Step 3.2: Notification Service (Port 5007)
* **Directory:** `services/notification-service/`
* **Database URI:** *None (Stateless Queue Consumer)*
* **RabbitMQ URI:** `amqp://rabbitmq:5672`
* **Key Dependencies:** `express`, `amqplib`, `cors`, `morgan`
* **Async Consumer (Wildcard Events):**
  * Listens to all events on topic exchange `food_delivery_events`:
    * `order.created` $\rightarrow$ Formats notification: *"Order #{orderId} placed! Waiting for payment..."*
    * `payment.completed` $\rightarrow$ Formats notification: *"Payment of ₹{amount} confirmed! Food is being prepared."*
    * `delivery.assigned` $\rightarrow$ Formats notification: *"Rider Ramesh Kumar assigned! ETA: 25 mins."*
  * Stores recent notifications in an in-memory ring buffer (up to 100 items).
* **Endpoints (routed via `/api/notifications` on Gateway):**
  * `GET /user/:userId` — Retrieves all notifications for customer.
  * `GET /order/:orderId` — Retrieves chronological notifications for an order.
  * `GET /health` — Service health check.

---

### Step 3.3: Review Service (Port 5008)
* **Directory:** `services/review-service/`
* **Database URI:** `mongodb://mongodb:27017/review_db`
* **Key Dependencies:** `express`, `mongoose`, `cors`, `morgan`
* **Data Model (`Review`):**
  * `reviewId` (String, unique e.g. `REV-391824`)
  * `userId` (String)
  * `orderId` (String, unique per review)
  * `restaurantId` (String)
  * `rating` (Number: 1 to 5)
  * `comment` (String)
  * `tags` (Array: e.g. `["Fast Delivery", "Hot Food", "Delicious"]`)
  * `createdAt` (Date)
* **Endpoints (routed via `/api/reviews` on Gateway):**
  * `POST /` — Body: `{ userId, orderId, restaurantId, rating, comment, tags }` $\rightarrow$ Saves review.
  * `GET /restaurant/:restaurantId` — Returns all reviews and calculated average rating.
  * `GET /health` — Service health check.
* **Auto-Seed on Startup:**
  * Pre-seeds 3 authentic reviews for *Pizza Corner* (Rating 5/5: *"Great farmhouse pizza delivered fast to Hostel Block D!"*), *Burger Hub* (4/5), and *Biryani Palace* (5/5).

---

## 5. Updates to `docker-compose.yml`

Add the final 3 services to complete all 8 microservices:
```yaml
  delivery-service:
    build: ./services/delivery-service
    environment:
      - PORT=5006
      - MONGO_URI=mongodb://mongodb:27017/delivery_db
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      mongodb:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    networks:
      - food-delivery-net

  notification-service:
    build: ./services/notification-service
    environment:
      - PORT=5007
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      rabbitmq:
        condition: service_healthy
    networks:
      - food-delivery-net

  review-service:
    build: ./services/review-service
    environment:
      - PORT=5008
      - MONGO_URI=mongodb://mongodb:27017/review_db
    depends_on:
      mongodb:
        condition: service_healthy
    networks:
      - food-delivery-net
```

---

## 6. Verification & Acceptance Sequence

Once Phase 3 is implemented, we will verify the full end-to-end chain:

### Step 1: Complete System Health Probe
```bash
curl http://localhost:5000/api/health
```
**Expected:** All 8 microservices (`auth`, `user`, `restaurant`, `order`, `payment`, `delivery`, `notification`, `review`) reported as `UP`.

### Step 2: Trigger End-to-End Choreography
Submit an order via `POST /api/orders`.

### Step 3: Verify Delivery Auto-Assignment
Wait 1–2 seconds:
```bash
curl http://localhost:5000/api/delivery/track/<ORDER_ID>
```
**Expected:** Returns driver "Ramesh Kumar" assigned to the order with ETA 25 mins.

### Step 4: Verify Notification Feed
```bash
curl http://localhost:5000/api/notifications/order/<ORDER_ID>
```
**Expected:** Returns chronological alerts:
1. "Order placed..."
2. "Payment confirmed..."
3. "Rider Ramesh Kumar assigned..."

### Step 5: Submit and Retrieve a Review
```bash
curl -X POST http://localhost:5000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "65f000000000000000000001",
    "orderId": "<ORDER_ID>",
    "restaurantId": "rest-1",
    "rating": 5,
    "comment": "Hot pizza delivered right to Hostel Block D! Excellent.",
    "tags": ["Fast Delivery", "Hot & Fresh"]
  }'

curl http://localhost:5000/api/reviews/restaurant/rest-1
```
**Expected:** Returns 5-star review and updated restaurant average rating.

---

## 7. What Happens Next (Transition to Phase 4)

With Phase 3 complete:
* The **entire backend microservices suite is 100% finished**.
* In **Phase 4**, we will test **Horizontal Scaling** (`--scale order-service=2 --scale restaurant-service=2`) and verify load balancing across container replicas!
