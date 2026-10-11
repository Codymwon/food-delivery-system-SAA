# Phase 4 Plan: Horizontal Scaling & Resilience Verification
**Project:** Online Food Delivery System (Microservices Architecture)  
**Course:** SWE4007 – Software Application Architecture  
**Dependencies:** Phase 0, Phase 1, Phase 2, and Phase 3 must be complete.  

---

## 1. Objective

Phase 4 validates and demonstrates the **Non-Functional Requirements (NFRs)** specified in the SRS:
* **Section 3.4 (Scalability):** Horizontal container replication and dynamic load balancing.
* **Section 3.5 (Availability):** Redundancy and continuous service uptime.
* **Section 3.6 (Fault Isolation):** Failure resilience under degraded conditions (no cascading outages).

By the end of Phase 4:
1. **`restaurant-service`** will run with **2 replicas** load-balanced via Docker DNS round-robin.
2. **`order-service`** will run with **2 replicas** handling concurrent checkout bursts.
3. **`payment-service`** will run with **2 worker replicas** utilizing the **Competing Consumers pattern** on RabbitMQ.
4. Every response will declare its serving container ID via `X-Served-By` header and JSON metadata.
5. A live **Fault-Tolerance Chaos Demo** will prove that stopping a non-critical microservice does not crash the ordering pipeline.

---

## 2. Key Architecture Adjustments for Scaling

### A. Container Configuration in `docker-compose.yml`
When a service is scaled (`--scale service=2`):
1. **Remove static `container_name`:** Docker cannot assign the same custom name to multiple containers. Docker will automatically name replicas `food-delivery-system-restaurant-service-1` and `-2`.
2. **Remove static host port binding for replicas:** Two containers cannot bind to the same host port (e.g. `5003:5003`). Backend services should only expose ports internally (`expose: 5003`) on `food-delivery-net`. The API Gateway on port `5000` remains the sole public ingress.
3. **Docker DNS Round-Robin:** When `api-gateway` routes to `http://restaurant-service:5003`, Docker's built-in DNS automatically cycles IP addresses among active replicas.

### B. Instance Tracking Header (`X-Served-By`)
Add a lightweight middleware across the scalable services (`restaurant`, `order`, `payment`):
```javascript
app.use((req, res, next) => {
  res.setHeader('X-Served-By', process.env.HOSTNAME || 'unknown-instance');
  next();
});
```
This enables immediate visual confirmation of which replica processed the request.

---

## 3. Step-by-Step Implementation Steps

### Step 4.1: Instrument Services with Instance Metadata
* Update `restaurant-service`, `order-service`, and `payment-service` to return:
  * HTTP Header: `X-Served-By: <container-id>`
  * In JSON payloads: `servedBy: process.env.HOSTNAME`

### Step 4.2: Update `docker-compose.yml` for Scale Readiness
* Adjust `restaurant-service`, `order-service`, and `payment-service` definitions:
  * Remove rigid `container_name` constraints.
  * Keep internal port exposure via `expose: ["5003"]`, etc.
  * Keep singletons (`mongodb`, `rabbitmq`, `redis`, `api-gateway`, `auth-service`, `user-service`, `delivery-service`, `notification-service`, `review-service`) as standard instances.

### Step 4.3: Launch Scaled Cluster
Command to boot the scaled system:
```bash
docker compose up --build -d \
  --scale restaurant-service=2 \
  --scale order-service=2 \
  --scale payment-service=2
```
Expected: `docker compose ps` will show **15 active containers** running smoothly.

---

## 4. Verification & Live Review Demonstration Procedures

### Test 1: North-South Ingress Load Balancing (Restaurant Service)
Send 4 consecutive requests to the restaurant catalog through the Gateway:
```bash
for i in {1..4}; do
  curl -s -i http://localhost:5000/api/restaurants | grep -i "x-served-by"
done
```
**Expected Output:** Alternating container IDs proving round-robin distribution:
```text
X-Served-By: 4a2b9c1d0e11
X-Served-By: 7f8e9d0c1b22
X-Served-By: 4a2b9c1d0e11
X-Served-By: 7f8e9d0c1b22
```

### Test 2: Concurrent Order Ingress Load Balancing (Order Service)
Submit two consecutive orders:
```bash
curl -s -X POST http://localhost:5000/api/orders -H "Content-Type: application/json" -d '{...}'
curl -s -X POST http://localhost:5000/api/orders -H "Content-Type: application/json" -d '{...}'
```
**Expected Output:** Order 1 and Order 2 report different `servedBy` container IDs.

### Test 3: Competing Consumers Queue Balancing (Payment Workers)
Submit 4 rapid orders and inspect payment service logs:
```bash
docker compose logs --tail=20 payment-service
```
**Expected Output:**
* Replicas `payment-service-1` and `payment-service-2` alternate consuming `order.created` events from RabbitMQ without race conditions or duplicate transactions.

### Test 4: Fault Isolation & Chaos Resilience Test
1. **Simulate Outage:** Intentionally stop the Notification Service:
   ```bash
   docker stop $(docker compose ps -q notification-service)
   ```
2. **Submit Order:**
   ```bash
   curl -X POST http://localhost:5000/api/orders -H "Content-Type: application/json" -d '{...}'
   ```
3. **Verify Critical Path:** Order transitions `PENDING` $\rightarrow$ `CONFIRMED` and delivery driver is assigned. The system does **not** fail or return HTTP 500.
4. **Heal System:** Restart Notification Service:
   ```bash
   docker compose start notification-service
   ```
5. **Verify Zero Data Loss:** Notification Service reconnects and consumes accumulated RabbitMQ messages.

---

## 5. Review Viva Script (`scripts/demo-scaling.sh`)

We will create an executable script `scripts/demo-scaling.sh` in the repository that runs Tests 1, 2, 3, and 4 sequentially, giving the team a 1-command live demonstration for Prof. Tauseef Khan.

---

## 6. What Happens Next (Transition to Phase 5)

With Phase 4 verified:
* All backend services are scaled, load-balanced, resilient, and production-structured.
* We can proceed directly to **Phase 5: Client UI (React SPA)** to build the single, beautiful frontend dashboard that ties the whole project together visually!
