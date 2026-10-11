# Phase 5 Plan: Customer Web Application (React.js SPA)
**Project:** Online Food Delivery System (Microservices Architecture)  
**Course:** SWE4007 – Software Application Architecture  
**Guide:** Prof. Tauseef Khan  
**Architecture Context:** 8 Dockerized Microservices + API Gateway (Port 5000) are running and healthy.  
**Design Intelligence:** Powered by `/ui-ux-pro-max` and `/design-taste-frontend`.

---

## 🎨 Design System Brief & Dial Inference

### 1. Design Read
> **Reading this as:** High-conversion consumer food delivery marketplace with an integrated live microservice observability dashboard for academic evaluators, utilizing a vibrant culinary aesthetic (warm tomato `#EA580C`, slate ink `#0F172A`, emerald success `#10B981`, and telemetry blue `#2563EB`) paired with geometric display typography and tactile micro-interactions.

### 2. The Three Dials
* **`DESIGN_VARIANCE: 6`** (Balanced & Modern — clear visual hierarchy, intentional whitespace, split headers without clichés, responsive bento grids).
* **`MOTION_INTENSITY: 5`** (Fluid CSS & Motion springs — 150-250ms feedback, drawer slide-overs, pulse rings on active order steps, complete `prefers-reduced-motion` compliance).
* **`VISUAL_DENSITY: 5`** (Standard consumer marketplace spacing for Screens 1-5; Density 7-8 reserved for Screen 6 Architecture Monitor).

### 3. Typography Pairing
* **Display / Headings:** `Plus Jakarta Sans` (or `Outfit`) — `font-bold tracking-tight text-slate-900`.
* **Body / UI Labels:** `Plus Jakarta Sans` / `Inter` — `font-normal text-slate-600 leading-relaxed`.
* **Telemetry / System Data:** `JetBrains Mono` — `font-mono text-xs tracking-wide` (for container IDs, latencies, order IDs, port numbers).

### 4. Color Tokens (Light Mode Primary with Dark Slate Architecture View)
| Token Name | Hex Value | Semantic Purpose |
|---|---|---|
| `--color-canvas` | `#FAFAF9` (Stone-50) | Main application background (warm, clean off-white) |
| `--color-surface` | `#FFFFFF` | Card containers, modal backdrops, dropdowns |
| `--color-ink` | `#0F172A` (Slate-900) | Primary headlines and high-contrast labels |
| `--color-muted-ink` | `#64748B` (Slate-500) | Subtitles, helper text, timestamps |
| `--color-primary` | `#EA580C` (Orange-600) | Appetizing tomato/orange primary CTA buttons, brand badges |
| `--color-primary-hover`| `#C2410C` (Orange-700) | Active/hover state for primary actions |
| `--color-accent-blue` | `#2563EB` (Blue-600) | Telemetry highlights, delivery tracking ETA, Viva links |
| `--color-success` | `#10B981` (Emerald-500)| Redis cache HIT badge, confirmed status, healthy nodes |
| `--color-warning` | `#F59E0B` (Amber-500) | In-progress states, preparing food indicator |
| `--color-border` | `#E2E8F0` (Slate-200) | Subtle container dividers and input strokes |
| `--color-arch-canvas` | `#090D16` (Slate-950) | Screen 6 Architecture Live Monitor dark canvas |

### 5. Anti-Slop Frontend Directives (Mandatory Standards)
* **Zero Em-Dashes (`—`):** Banned across all headings, badges, text, and buttons. Use hyphens `-` or colons.
* **No Emoji As Icons:** All UI icons must come from an authentic icon library (`lucide-react` or `@phosphor-icons/react` with consistent `strokeWidth={1.75}`).
* **Viewport Stability:** Use `min-h-[100dvh]` on full-height views. Never use `h-screen` (which breaks on mobile browsers).
* **Button Tactile Feedback:** Every button must implement `:hover` (`-translate-y-[1px]`), `:active` (`scale-[0.98]`), and `:focus-visible` (`ring-2 ring-orange-500 ring-offset-2`).
* **Skeletal Loaders:** Use skeleton pulse placeholders matching card shapes instead of generic circular spinners.
* **Accessible Contrast:** Text on buttons, inputs, and badges must strictly maintain WCAG AA (≥ 4.5:1).
* **Real Imagery:** Use curated culinary photography (`picsum.photos/seed/...` or Unsplash direct food seeds) with proper aspect ratios (`aspect-video` and `aspect-square`).

---

## 📌 Context for a Fresh Chat (Read This First)

When starting a fresh chat session for any sub-phase, copy and paste this prompt:

```text
We are developing the React.js SPA frontend for the Online Food Delivery System (Microservices Architecture, course SWE4007).
The entire backend (8 microservices + API Gateway + MongoDB + RabbitMQ + Redis) is running in Docker Compose at /home/aadith/development/active-projects/food-delivery-system-SAA.
Working Directory: /home/aadith/development/active-projects/food-delivery-system-SAA
Design Guidelines: Follow /ui-ux-pro-max and /design-taste-frontend as defined in docs/phase_5_plan.md.
Please implement Phase 5.X now.
```

### Backend Sanity Check Command:
Run this in terminal to confirm backend availability before testing:
```bash
cd /home/aadith/development/active-projects/food-delivery-system-SAA
docker compose ps
curl http://localhost:5000/api/health
```

---

## Screen-by-Screen Phasing Roadmap

```
Phase 5.0: Frontend Foundation (Vite + React + Tailwind + API Client + Docker)
   │
Phase 5.1: Screen 1 — Authentication & Customer Profile (JWT + 1-Click Demo Login)
   │
Phase 5.2: Screen 2 — Restaurant Discovery & Menu Browsing (Redis Cache HIT Badge)
   │
Phase 5.3: Screen 3 — Cart Management & Instant Checkout (Optimistic Saga Order Placement)
   │
Phase 5.4: Screen 4 — Live Order Tracker & Status Stepper (RabbitMQ Event Choreography)
   │
Phase 5.5: Screen 5 — Order Reviews & Customer Feedback (Star Ratings & Tags)
   │
Phase 5.6: Screen 6 — The Architecture Live Monitor Tab (Prof. Tauseef Khan Viva Tool)
```

---

## Phase 5.0: Frontend Foundation & App Shell

> **Sub-Phase Goal:** Initialize a high-performance Vite + React SPA, configure Tailwind CSS with custom design tokens, build the persistent App Shell with responsive navigation and header controls, configure Axios with Gateway telemetry interceptors, and containerize via Docker.

### 1. Files to Create/Update
* `frontend/package.json` — Dependencies: `react`, `react-dom`, `lucide-react`, `axios`, `clsx`, `tailwind-merge`.
* `frontend/vite.config.js` — Vite configuration exposing dev server on port 3000 (host: true).
* `frontend/tailwind.config.js` — Custom color tokens, font families (`Plus Jakarta Sans`, `JetBrains Mono`), border radius scale.
* `frontend/src/index.css` — Tailwind directives, font imports, focus ring defaults, scrollbar styling.
* `frontend/src/api/client.js` — Axios instance targeting `http://localhost:5000/api`.
  * Request interceptor: automatically adds `Authorization: Bearer <token>` from `localStorage`.
  * Response interceptor: captures `X-Served-By` and `X-Cache` response headers into an event bus/callback for telemetry display.
* `frontend/src/context/AuthContext.jsx` — State for `user`, `token`, `isAuthenticated`, `login(credentials)`, `logout()`.
* `frontend/src/context/CartContext.jsx` — State for `items`, `restaurantId`, `addItem(dish, restaurant)`, `removeItem(dishId)`, `updateQty(dishId, delta)`, `clearCart()`.
* `frontend/src/components/Navbar.jsx` — Responsive header:
  * Brand: Orange delivery icon + `"FoodDash"` + pill `"Microservices"`.
  * Navigation links: "Restaurants", "My Orders", "Profile".
  * Cart Button: Shopping bag icon with animated bounce badge when items are present.
  * User Status: Avatar pill with user role ("Aadith - Customer").
  * **Architecture Toggle Button:** High-contrast pill button: `"⚡ Architecture Monitor"` with live ping indicator.
* `frontend/Dockerfile` — Multi-stage or dev server container running Node 20 Alpine on port 3000.
* `docker-compose.yml` — Add `frontend` service on port `3000:3000`.

### 2. Design & Component State Specifications
* **Navbar Layout:** Desktop height `h-16`, sticky top with `backdrop-blur-md bg-white/90 border-b border-slate-200/80 z-40`.
* **Navigation Links:** Active state indicated by `text-orange-600 font-semibold border-b-2 border-orange-600 pb-1`.
* **Mobile Responsiveness:** Drawer navigation menu on screens `< 768px`.

### 3. Verification & Acceptance Criteria
* `npm run build` or `docker compose up -d frontend` runs cleanly.
* Visiting `http://localhost:3000` renders the navbar, empty states, and verifies connectivity to `http://localhost:5000/api/health`.

---

## Phase 5.1: Screen 1 — Authentication & Customer Profile

> **Sub-Phase Goal:** Provide an accessible, secure authentication interface with tabbed Sign In / Register modes, form validation, token persistence, a customer profile drawer with saved delivery addresses, and a prominent 1-click demo login button for seamless viva grading.

### 1. Files to Create/Update
* `frontend/src/components/AuthModal.jsx` — Accessible modal dialog for user authentication.
* `frontend/src/components/ProfileDrawer.jsx` — Slide-over drawer displaying customer profile and address book.
* `frontend/src/components/AddressCard.jsx` — Display card for saved delivery locations with default tag.

### 2. Design & UX Specifications
* **Modal Backdrop:** `fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4`.
* **Modal Container:** `bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-8`.
* **Quick Demo Fill Button (Crucial for Viva Evaluation):**
  * Placed prominently at the top of the modal.
  * Styled with a subtle amber border: `bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-xl px-4 py-2.5 flex items-center justify-between text-sm font-medium transition-all`.
  * Label: *"⚡ One-Click Demo Login (Prof. Review)"*
  * Action: Populates `customer@vit.ac.in` / `password123` and submits instantly.
* **Form Inputs:**
  * Explicit labels above inputs: `text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5`.
  * Inputs: `w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`.
  * Inline error messages beneath inputs in `text-xs text-red-600 font-medium`.
* **Profile Drawer:**
  * Slides in from the right: `w-full max-w-md bg-white shadow-2xl p-6`.
  * Displays: Name (`Aadith`), Email (`customer@vit.ac.in`), Phone (`+91 98765 43210`), Role Badge (`CUSTOMER`).
  * Saved Address Card: Pre-loaded with `Hostel Block D, Room 412, VIT Vellore, Tamil Nadu - 632014`.
  * Add Address form: Clean inline accordion to append new addresses.

### 3. API Contracts Called
* `POST /api/auth/login` — Payload: `{ email, password }` $\rightarrow$ Returns: `{ token, user: { id, name, email, role } }`.
* `POST /api/auth/register` — Payload: `{ name, email, password, phone }` $\rightarrow$ Returns: `{ token, user }`.
* `GET /api/users/profile/:userId` — Returns: `{ profile: { name, addresses: [...] } }`.
* `POST /api/users/profile/:userId/addresses` — Payload: `{ label, addressLine, city, pincode }`.

### 4. Verification & Acceptance Criteria
* Clicking "Sign In" opens modal with focus trapped inside.
* Clicking "⚡ One-Click Demo Login" logs in within 200ms, stores JWT in `localStorage`, updates Navbar with customer badge, and loads the saved VIT Vellore address in the Profile Drawer.

---

## Phase 5.2: Screen 2 — Restaurant Discovery & Menu Browsing

> **Sub-Phase Goal:** Deliver an appetizing catalog experience with cuisine filter pills, live dish search, restaurant cards with prominent Redis Cache status badges, and an interactive categorized menu drawer with dish descriptions, prices, and cart controls.

### 1. Files to Create/Update
* `frontend/src/components/RestaurantList.jsx` — Catalog view with responsive grid and cache telemetry pill.
* `frontend/src/components/RestaurantCard.jsx` — High-craft card with banner image, rating, ETA, and tags.
* `frontend/src/components/CuisineFilter.jsx` — Filter pill bar (`All`, `Italian`, `Fast Food`, `Mughlai`).
* `frontend/src/components/SearchBar.jsx` — Debounced search input for dishes and restaurant names.
* `frontend/src/components/MenuModal.jsx` — Deep menu viewer with category tabs, dish photos, and quantity selectors.
* `frontend/src/components/CacheBadge.jsx` — Dedicated badge demonstrating Redis Cache-Aside architecture.

### 2. Design & UX Specifications
* **Hero Section (Appetizing & Disciplined):**
  * Left-aligned split banner: Headline: *"Crave it? We deliver it in minutes."* (2 lines max).
  * Subtext: *"Handcrafted dishes from top campus restaurants right to your hostel room."* (under 16 words).
  * No generic emojis; clean typography and subtle warm background tint (`bg-orange-50/60`).
* **Redis Cache Architecture Badge (`CacheBadge.jsx`):**
  * Floating badge placed near the catalog heading:
  * When `X-Cache: HIT`: Styled with emerald tint: `bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5`.
    * Icon: Lightning bolt + text: `"Redis Cache: HIT (Sub-10ms response)"`.
  * When `X-Cache: MISS`: Styled with blue tint: `bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-xs font-mono font-medium`.
    * Icon: Database + text: `"Redis Cache: MISS (Loaded from MongoDB)"`.
* **Restaurant Cards (`RestaurantCard.jsx`):**
  * Grid layout: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`.
  * Photography: `aspect-video w-full object-cover rounded-t-xl` with curated food photography.
    * Pizza Corner: Crisp wood-fired pizza photo.
    * Burger Hub: Gourmet smash burger photo.
    * Biryani Palace: Rich royal biryani bowl photo.
  * Rating Badge: Star icon + `4.8` with emerald background pill.
  * Delivery ETA pill: Clock icon + `25 mins`.
  * Hover interaction: `-translate-y-1 shadow-lg border-slate-300 transition-all duration-200`.
* **Menu Modal (`MenuModal.jsx`):**
  * Wide dialog (`max-w-3xl`) with restaurant header, cuisine badges, and category tabs (*Pizzas*, *Sides*, *Beverages*).
  * Dish Item Row: Left details (name, description, price `₹299`), right photo (`w-24 h-24 rounded-lg object-cover`) with absolute positioned "+ Add" button.
  * Add to Cart Button States:
    * Unadded: `bg-white hover:bg-orange-50 text-orange-600 border border-orange-300 font-semibold text-xs px-4 py-1.5 rounded-lg shadow-sm`.
    * Added: Turns into an active quantity counter `[ - ] 2 [ + ]` with tactile bounce animation.
  * Single Restaurant Constraint: If adding an item from a different restaurant, displays an alert dialog: *"Clear cart and start new order from Burger Hub?"*.

### 3. API Contracts Called
* `GET /api/restaurants` — Returns array of 3 restaurants; inspects response header `x-cache` (`HIT` or `MISS`).
* `GET /api/restaurants/:id/menu` — Returns categorized array of menu items with prices and descriptions.

### 4. Verification & Acceptance Criteria
* Initial page load triggers `GET /api/restaurants` and displays `Redis Cache: MISS` on first hit, then `Redis Cache: HIT` on second reload.
* Clicking "Pizza Corner" opens menu, tabs filter correctly, and clicking "+ Add" on Margherita Pizza adds item to CartContext with quantity 1.

---

## Phase 5.3: Screen 3 — Cart Management & Instant Checkout

> **Sub-Phase Goal:** Build an intuitive slide-over Cart drawer with real-time bill calculations (subtotal, delivery fee, taxes), saved address selection, payment method choices, and an instant Saga order submission trigger.

### 1. Files to Create/Update
* `frontend/src/components/CartDrawer.jsx` — Slide-over drawer with item review, price breakdown, and checkout CTA.
* `frontend/src/components/CartItemRow.jsx` — Individual item row with thumbnail, price calculation, and quantity controls.
* `frontend/src/components/CheckoutSummary.jsx` — Transparent billing card with delivery fee logic and platform fees.
* `frontend/src/components/PaymentSelector.jsx` — Radio card selector for payment options.

### 2. Design & UX Specifications
* **Drawer Motion & Layout:**
  * Fixed right panel: `w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-50`.
  * Backdrop: `bg-slate-900/40 backdrop-blur-sm transition-opacity`.
  * Motion: Slides in smoothly from `translateX(100%)` to `0` using CSS transition `duration-300 ease-out`.
* **Empty Cart State:**
  * Clean culinary illustration or bag icon.
  * Title: *"Your cart is empty"*.
  * Subtext: *"Explore our restaurants and add delicious dishes to your tray."*.
  * Action: Button *"Browse Restaurants"* that closes drawer and navigates to catalog.
* **Delivery Address Selector:**
  * Radio card pre-selecting the default address:
    * `Hostel Block D, Room 412, VIT Vellore (Default)`.
  * Option to select or switch to an alternate address.
* **Payment Method Selector (`PaymentSelector.jsx`):**
  * 3 segmented radio cards with icons:
    1. **UPI / Google Pay** (Icon: Zap · Pre-selected default).
    2. **Credit / Debit Card** (Icon: CreditCard).
    3. **Cash on Delivery** (Icon: Banknote).
* **Billing Summary Card (`CheckoutSummary.jsx`):**
  * Bordered slate card (`bg-slate-50 p-4 rounded-xl space-y-2`):
    * Subtotal: `₹399.00`
    * Delivery Partner Fee: `₹30.00` (highlighted: `FREE above ₹500`)
    * Platform & Taxes: `₹15.00`
    * Divider line
    * **Total Amount to Pay:** `₹444.00` in `text-lg font-bold text-slate-900`.
* **"Place Order & Pay" Primary CTA:**
  * High-contrast button: `w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 transition-all`.
  * Loading state: Displays animated skeleton/spinner with text *"Dispatching Saga Transaction..."*.

### 3. API Contracts Called
* `POST /api/orders` — Submits order payload:
  ```json
  {
    "userId": "user-demo-1",
    "restaurantId": "rest-1",
    "items": [
      { "menuItemId": "item-101", "name": "Margherita Pizza", "price": 299, "quantity": 1 }
    ],
    "deliveryAddress": {
      "addressLine": "Hostel Block D, Room 412",
      "city": "Vellore",
      "pincode": "632014"
    }
  }
  ```
* Gateway Response: HTTP 201 Created with `{ orderId: "ORD-958896", status: "PENDING", totalAmount: 344 }`.

### 4. Verification & Acceptance Criteria
* Clicking "+ Add" on 2 items opens the cart with correct subtotal calculation.
* Submitting the order sends `POST /api/orders`, completes in <100ms, clears the active cart, and automatically redirects the user to Screen 4 (Live Order Tracker).

---

## Phase 5.4: Screen 4 — Live Order Tracker & Status Stepper

> **Sub-Phase Goal:** Visually demonstrate Eventual Consistency and the RabbitMQ Choreography Saga in real-time. Render a 5-stage animated status stepper, active polling with celebration transitions, assigned delivery partner card, and an audit feed of RabbitMQ distributed events.

### 1. Files to Create/Update
* `frontend/src/components/OrderTracker.jsx` — Main tracking page with order metadata and live polling loop.
* `frontend/src/components/StatusStepper.jsx` — 5-stage horizontal/vertical milestone stepper with animated pulses.
* `frontend/src/components/DeliveryAgentCard.jsx` — Assigned driver profile card with live phone link and ETA counter.
* `frontend/src/components/RabbitMQEventFeed.jsx` — Real-time event log card showing backend message broker choreography.

### 2. Design & UX Specifications
* **Order Status Stepper (5 Choreographed Stages):**
  1. `PENDING` — Order Created (sent to RabbitMQ exchange `food_delivery_events`).
  2. `CONFIRMED` — Payment Authorized (Payment Service processed `order.created` and emitted `payment.completed`).
  3. `PREPARING` — Restaurant Kitchen accepted order.
  4. `OUT_FOR_DELIVERY` — Delivery Partner picked up order.
  5. `DELIVERED` — Order successfully handed over to customer.
* **Stepper Visual Language:**
  * Completed steps: Emerald circle `bg-emerald-500 text-white` with checkmark icon.
  * Active step: Pulsing ring `ring-4 ring-orange-500/30 bg-orange-600 text-white` with spinning/radar animation.
  * Upcoming steps: Slate gray outline `border-2 border-slate-300 text-slate-400 bg-white`.
* **State Transition Celebration:**
  * When status transitions from `PENDING` $\rightarrow$ `CONFIRMED` (usually within 1–2 seconds via RabbitMQ), display a toast notification and smooth badge celebration:
    * *"Payment Confirmed via RabbitMQ Saga! Transaction: TXN-..."*
* **Delivery Partner Card (`DeliveryAgentCard.jsx`):**
  * Card with rider avatar photo, name: **Ramesh Kumar**, rating: `4.9 ⭐ (840 deliveries)`.
  * Direct action: Clickable phone link `<a href="tel:+919876543210">` with phone icon.
  * ETA display: Large bold badge: `25 mins` with live subtitle: *"En route to Hostel Block D, VIT Vellore"*.
* **Live RabbitMQ Event Choreography Feed (`RabbitMQEventFeed.jsx`):**
  * Developer-friendly card demonstrating microservice architecture for the viva:
  * Styled as a clean audit log:
    * `[10:14:02]` 🔔 `order.created` emitted by Order Service.
    * `[10:14:03]` 💳 `payment.completed` emitted by Payment Service (Worker Replica).
    * `[10:14:04]` 🛵 `delivery.assigned` emitted by Delivery Service (Driver Ramesh Kumar).
  * Monospace font `font-mono text-xs text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200`.

### 3. API Contracts Called
* `GET /api/orders/:id` — Polled every 2.5 seconds until `DELIVERED`.
* `GET /api/delivery/track/:orderId` — Returns driver assignment, phone number, and ETA.
* `GET /api/notifications/order/:orderId` — Returns notification log generated from message broker events.

### 4. Verification & Acceptance Criteria
* Placing an order opens the tracker in `PENDING` state. Within 1–2 seconds, the stepper automatically progresses to `CONFIRMED` without any manual page refresh.
* Driver card renders with "Ramesh Kumar" and clickable phone link.
* Event feed shows all 3 RabbitMQ choreography stages.

---

## Phase 5.5: Screen 5 — Order Reviews & Customer Feedback

> **Sub-Phase Goal:** Allow customers to submit star ratings and feedback for completed orders, tag praises, and display aggregated customer reviews on restaurant menus to close the lifecycle loop.

### 1. Files to Create/Update
* `frontend/src/components/ReviewModal.jsx` — Interactive dialog for rating food and delivery experience.
* `frontend/src/components/StarRating.jsx` — Hoverable 5-star rating component with fill animations.
* `frontend/src/components/RestaurantReviews.jsx` — Review list embedded in restaurant details.

### 2. Design & UX Specifications
* **Interactive Star Rating Component:**
  * 5 large clickable star icons (`w-8 h-8`).
  * Hover state: Stars fill with warm amber `#F59E0B` and scale up slightly (`scale-110`).
  * Rating feedback text: `1 Star - Poor`, `2 Stars - Fair`, `3 Stars - Good`, `4 Stars - Very Good`, `5 Stars - Outstanding!`.
* **Quick Praise Tag Selector:**
  * Clickable toggle pills:
    * `["Hot & Fresh", "Lightning Fast Delivery", "Great Packaging", "Delicious Taste", "Polite Delivery Partner"]`.
  * Active tag styling: `bg-orange-100 text-orange-800 border-orange-300 font-medium`.
* **Feedback Textarea:**
  * Clean form area: `min-h-[100px] rounded-xl border border-slate-300 p-3 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500`.
* **Submit Action:**
  * Button: *"Submit Review & Complete Order"*.
  * On success: Shows confirmation checkmark and updates the restaurant's rating in the catalog.

### 3. API Contracts Called
* `POST /api/reviews` — Payload:
  ```json
  {
    "orderId": "ORD-958896",
    "restaurantId": "rest-1",
    "userId": "user-demo-1",
    "rating": 5,
    "comment": "Delicious hot Margherita pizza, arrived right at Block D on time!",
    "tags": ["Hot & Fresh", "Lightning Fast Delivery"]
  }
  ```
* `GET /api/reviews/restaurant/:restaurantId` — Fetches all ratings and calculate average score.

### 4. Verification & Acceptance Criteria
* Submitting a 5-star review returns HTTP 201 Created and persists to `review_db`.
* Navigating back to Pizza Corner reflects the new review and updated rating score.

---

## Phase 5.6: Screen 6 — The Architecture Live Monitor Tab (Review Viva Secret Weapon)

> **Sub-Phase Goal:** Build an embedded distributed systems telemetry dashboard directly inside the web app. This screen allows Prof. Tauseef Khan to observe all 15 Docker containers, instance load balancing (`X-Served-By`), RabbitMQ event flow, and Redis cache health live from the browser without running terminal commands.

### 1. Files to Create/Update
* `frontend/src/components/ArchitectureMonitor.jsx` — Standalone dashboard component toggled via Navbar button.
* `frontend/src/components/ServiceNodeCard.jsx` — Visual card representing an individual microservice container.
* `frontend/src/components/TopologyDiagram.jsx` — Interactive visual architecture diagram showing request routing.

### 2. Design & UX Specifications
* **Visual Theme:** Dedicated Slate-950 dark cockpit (`bg-[#090D16] text-slate-100 min-h-[100dvh] p-8`).
* **Header Controls:**
  * Title: *"FoodDash Microservices Fleet Telemetry"* with animated green radar ping.
  * Real-time refresh toggle (polls `GET /api/health` every 5 seconds).
  * Direct Link: *"Open RabbitMQ Management (Port 15672)"* (opens in new tab with target `_blank`).
* **Microservices Fleet Grid (10 Active Service Cards):**
  * `API Gateway (:5000)` — Gateway proxy status and active routing table.
  * `Auth Service (:5001)` — JWT authentication provider.
  * `User Service (:5002)` — Customer profiles and address manager.
  * `Restaurant Service (:5003 · 2 Replicas)` — Displays round-robin container IDs and Redis cache status.
  * `Order Service (:5004 · 2 Replicas)` — Shows competing consumer instances and last served hostname.
  * `Payment Service (:5005 · 2 Replicas)` — Shows RabbitMQ worker replicas and transaction counters.
  * `Delivery Service (:5006)` — Dispatch engine and rider assignment.
  * `Notification Service (:5007)` — Event listener ring buffer.
  * `Review Service (:5008)` — Ratings aggregation service.
  * `Infrastructure Trio` — `RabbitMQ (:5672)` · `Redis (:6379)` · `MongoDB (:27017)`.
* **Live Health Indicators on Each Card:**
  * Status Pill: `🟢 UP` with measured latency badge (e.g. `14ms`).
  * Container Hostname Badge: Displays `process.env.HOSTNAME` captured from `X-Served-By` headers.
  * Architecture Role Description: Explains the exact pattern (e.g., *"Saga Choreography Participant"*, *"Cache-Aside with Redis"*, *"Horizontal Scaling Replica"*).
* **Live Simulation Button for the Viva:**
  * Button: *"⚡ Test Round-Robin Load Balancing"*.
  * Action: Fires 4 parallel requests to `/api/restaurants` and displays the alternating container IDs side by side in real time!

### 3. API Contracts Called
* `GET /api/health` — Probes all 8 services and 3 infra components.
* `GET /api/restaurants` — Probes multiple times to demonstrate `X-Served-By` and `X-Cache`.

### 4. Verification & Acceptance Criteria
* Clicking "⚡ Architecture Monitor" in the Navbar transitions smoothly to the dark cockpit view.
* All microservices show green `UP` indicators with live latencies.
* Clicking "Test Load Balancing" displays alternating container hostnames, proving horizontal scaling to the evaluator.

---

## Complete Frontend Directory Structure

```text
frontend/
├── Dockerfile                      # Node 20 Alpine container definition
├── index.html                      # HTML entry with Plus Jakarta Sans & JetBrains Mono
├── package.json                    # React 19 / Vite / Tailwind / Lucide / Axios
├── vite.config.js                  # Vite server configuration (port 3000)
├── tailwind.config.js              # Theme colors, fonts, shadows, and animations
└── src/
    ├── main.jsx                    # React root entry point
    ├── App.jsx                     # Route coordinator & App shell
    ├── index.css                   # Global styles & Tailwind directives
    ├── api/
    │   └── client.js               # Centralized Axios client with telemetry interceptors
    ├── context/
    │   ├── AuthContext.jsx         # User authentication & JWT state
    │   └── CartContext.jsx         # Cart items & calculations
    ├── components/
    │   ├── Navbar.jsx              # Navigation header with monitor toggle
    │   ├── AuthModal.jsx           # Screen 1: Login & Register with 1-Click Demo
    │   ├── ProfileDrawer.jsx       # Screen 1: Saved address manager
    │   ├── RestaurantList.jsx      # Screen 2: Catalog grid & search
    │   ├── RestaurantCard.jsx      # Screen 2: Food cards with Redis badge
    │   ├── CuisineFilter.jsx       # Screen 2: Filter pills
    │   ├── MenuModal.jsx           # Screen 2: Dish selection & quantity counter
    │   ├── CartDrawer.jsx          # Screen 3: Slide-over cart & bill summary
    │   ├── PaymentSelector.jsx     # Screen 3: Payment method picker
    │   ├── OrderTracker.jsx        # Screen 4: Live 5-stage status stepper
    │   ├── DeliveryAgentCard.jsx   # Screen 4: Driver Ramesh Kumar card
    │   ├── RabbitMQEventFeed.jsx   # Screen 4: Saga event audit stream
    │   ├── ReviewModal.jsx         # Screen 5: Star ratings & praise tags
    │   ├── ArchitectureMonitor.jsx # Screen 6: Live 15-container fleet dashboard
    │   └── ServiceNodeCard.jsx     # Screen 6: Microservice telemetry card
    └── utils/
        └── formatters.js           # Currency (₹) and timestamp formatters
```

---

## Anti-Slop Pre-Flight Checklist (Run Before Completing Any Screen)

Every sub-phase must pass this checklist before declaring completion:

- [ ] **Zero Em-Dashes:** Output contains zero em-dash (`—`) characters in all UI strings, buttons, and headings.
- [ ] **No Emoji Icons:** Every visual symbol is an SVG icon from `lucide-react` with standardized `strokeWidth={1.75}`.
- [ ] **Tactile Feedback:** Every button and card has explicit `:hover`, `:active`, and `:focus-visible` state styling.
- [ ] **Viewport Stability:** All full-height sections use `min-h-[100dvh]`, never `h-screen`.
- [ ] **Accessible Contrast:** All text and button labels maintain WCAG AA contrast ratio (≥ 4.5:1).
- [ ] **Skeletal Loaders:** Loading states render skeletal box placeholders matching final layouts rather than generic spinners.
- [ ] **Mobile Collapse:** Multi-column grids explicitly collapse to single column (`grid-cols-1`) on mobile (`< 768px`).
- [ ] **Single Design System:** Tailwind classes and custom tokens strictly adhere to the defined palette and typography.
- [ ] **Docker Compatibility:** The React app builds cleanly and serves over port `3000` via Docker Compose.
