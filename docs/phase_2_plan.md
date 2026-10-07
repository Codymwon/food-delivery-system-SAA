# Phase 2 Plan: Core Transaction Engine (Order & Payment Saga)
**Project:** Online Food Delivery System (Microservices Architecture)  
**Course:** SWE4007 – Software Application Architecture  
**Dependencies:** Phase 0 (Infrastructure) & Phase 1 (Identity & Catalogs) must be live.  

---

## 1. Objective

Phase 2 implements the **core transaction and event pipeline** of the microservices architecture using the **Choreography-based Saga pattern**.

By the end of Phase 2:
1. **Order Service (:5004)** will create orders in a non-blocking `PENDING` state and emit domain events onto RabbitMQ.
2. **Payment Service (:5005)** will consume `order.created` asynchronously, process payment, record the transaction in `payment_db`, and emit `payment.completed`.
3. **Order Service** will consume `payment.completed` and automatically transition order state from `PENDING` $\rightarrow$ `CONFIRMED`.
4. The system will demonstrate **Eventual Consistency** and **Fault Isolation** between ordering and payment.

---

## 2. Directory Layout for Phase 2

```text
food-delivery-system/
├── docker-compose.yml                  # Updated to include Phase 2 services
├── api-gateway/                        # (Routes already mapped for /api/orders & /api/payments)
└── services/
    ├── order-service/                  # Port 5004 (Saga Choreographer)
    │   ├── Dockerfile
    │   ├── package.json
    │   └── src/
    │       ├── index.js
    │       ├── models/Order.js
    │       └── rabbitmq.js             # Publisher & Subscriber logic
    └── payment-service/                # Port 5005 (Async Worker Pool)
        ├── Dockerfile
        ├── package.json
        └── src/
            ├── index.js
            ├── models/Payment.js
            └── rabbitmq.js             # Competing Consumer worker
```

---

## 3. Asynchronous Saga Choreography Flow

```
[ Customer ]
     │ (1) POST /api/orders (Synchronous REST)
     ▼
[ API Gateway ]
     │
     ▼
[ Order Service (:5004) ]
     ├──► Saves order in order_db (Status: PENDING)
     ├──► Responds immediately with HTTP 201 Created { orderId, status: "PENDING" }
     │
     └──► (2) Publishes event: "order.created"
                 │
                 ▼
     [ RabbitMQ: 'food_delivery_events' Exchange ]
                 │
                 ▼ (3) Asynchronous Queue Delivery
     [ Payment Service (:5005) Worker ]
           ├──► Simulates transaction processing (~800ms)
           ├──► Persists transaction record in payment_db (Status: SUCCESS)
           │
           └──► (4) Publishes event: "payment.completed"
                       │
                       ▼
           [ RabbitMQ: 'food_delivery_events' Exchange ]
                       │
                       ▼ (5) Consumed by Order Service
           [ Order Service (:5004) ]
                 └──► Updates order in order_db: Status: "CONFIRMED"
```

---

## 4. Detailed Service Specifications

### Step 2.1: Order Service (Port 5004)
* **Directory:** `services/order-service/`
* **Database URI:** `mongodb://mongodb:27017/order_db`
* **RabbitMQ URI:** `amqp://rabbitmq:5672`
* **Key Dependencies:** `express`, `mongoose`, `amqplib`, `cors`, `morgan`
* **Data Model (`Order`):**
  * `orderId` (String, unique e.g. `ORD-849201`)
  * `userId` (String, reference to Customer)
  * `restaurantId` (String)
  * `items` (Array: `[{ id, name, price, quantity }]`)
  * `deliveryAddress` (Object: `{ street, city, zipCode }`)
  * `totalAmount` (Number)
  * `status` (Enum: `PENDING` | `CONFIRMED` | `CANCELLED`)
  * `paymentId` (String, null until payment completes)
  * `timestamps`
* **Endpoints (routed via `/api/orders` on Gateway):**
  * `POST /` — Body: `{ userId, restaurantId, items, deliveryAddress }`.
    * Computes total amount.
    * Saves order in state `PENDING`.
    * Publishes `order.created` event to RabbitMQ.
    * Returns HTTP 201 Created immediately: `{ orderId, status: "PENDING", totalAmount }`.
  * `GET /:id` — Retrieves order status and details.
  * `GET /user/:userId` — Retrieves order history for customer.
  * `GET /health` — Service health check.
* **Event Consumer (`payment.completed`):**
  * Subscribes to queue `order_payment_completed_queue`.
  * On message: updates order record in `order_db` to status `CONFIRMED` and stores `paymentId`.

---

### Step 2.2: Payment Service (Port 5005)
* **Directory:** `services/payment-service/`
* **Database URI:** `mongodb://mongodb:27017/payment_db`
* **RabbitMQ URI:** `amqp://rabbitmq:5672`
* **Key Dependencies:** `express`, `mongoose`, `amqplib`, `cors`, `morgan`
* **Data Model (`PaymentTransaction`):**
  * `paymentId` (String, unique e.g. `TXN-391820`)
  * `orderId` (String)
  * `userId` (String)
  * `amount` (Number)
  * `method` (String: `UPI` | `CARD` | `COD`)
  * `status` (Enum: `SUCCESS` | `FAILED`)
  * `timestamps`
* **Async Consumer Worker (`order.created`):**
  * Binds to queue `payment_orders_queue` on RabbitMQ topic exchange `food_delivery_events`.
  * Uses the **Competing Consumers Pattern** (allows multiple payment worker containers to balance load).
  * On message:
    * Simulates payment authorization delay (approx. 800ms).
    * Generates unique transaction ID (`TXN-...`).
    * Saves record in `payment_db`.
    * Publishes `payment.completed` event with payload `{ paymentId, orderId, userId, amount, status: "SUCCESS" }`.
* **Endpoints (routed via `/api/payments` on Gateway):**
  * `GET /transaction/:orderId` — Retrieves payment transaction details for a given order.
  * `GET /health` — Service health check.

---

## 5. Updates to `docker-compose.yml`

Add `order-service` and `payment-service`:
```yaml
  order-service:
    build: ./services/order-service
    environment:
      - PORT=5004
      - MONGO_URI=mongodb://mongodb:27017/order_db
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      mongodb:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    networks:
      - food-delivery-net

  payment-service:
    build: ./services/payment-service
    environment:
      - PORT=5005
      - MONGO_URI=mongodb://mongodb:27017/payment_db
      - RABBITMQ_URL=amqp://rabbitmq:5672
    depends_on:
      mongodb:
        condition: service_healthy
      rabbitmq:
        condition: service_healthy
    networks:
      - food-delivery-net
```

---

## 6. Verification & Acceptance Sequence

Once Phase 2 is implemented, we will verify the asynchronous saga using this test suite:

### Step 1: Health Check Probe
```bash
curl http://localhost:5000/api/health
```
**Expected:** Gateway reports both `order` and `payment` services as `UP`.

### Step 2: Submit a New Food Order
```bash
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "65f000000000000000000001",
    "restaurantId": "rest-1",
    "items": [
      { "id": "item-pc-1", "name": "Margherita Pizza", "price": 249, "quantity": 2 },
      { "id": "item-pc-3", "name": "Garlic Breadsticks", "price": 129, "quantity": 1 }
    ],
    "deliveryAddress": {
      "street": "Hostel Block D",
      "city": "VIT Vellore",
      "zipCode": "632014"
    }
  }'
```
**Expected:** Immediate HTTP 201 Created response:
```json
{
  "orderId": "ORD-...",
  "status": "PENDING",
  "totalAmount": 627
}
```

### Step 3: Verify Asynchronous State Transition (Eventual Consistency)
Wait 1–2 seconds for the RabbitMQ event exchange to complete:
```bash
curl http://localhost:5000/api/orders/<ORDER_ID>
```
**Expected:** Status has automatically transitioned to `CONFIRMED` with a valid `paymentId` attached:
```json
{
  "orderId": "ORD-...",
  "status": "CONFIRMED",
  "paymentId": "TXN-...",
  "totalAmount": 627
}
```

### Step 4: Verify Payment Transaction Record
```bash
curl http://localhost:5000/api/payments/transaction/<ORDER_ID>
```
**Expected:** Returns transaction details persisted independently inside `payment_db`.

---

## 7. What Phase 2 Prepares for Phase 3

With Phase 2 complete:
* The transaction lifecycle is automated and decoupled via RabbitMQ.
* **Phase 3 (Delivery & Notification)** will simply listen to the existing `payment.completed` event on RabbitMQ to automatically assign a driver and send delivery alerts!
