# Project Documentation Index

**System:** Online Food Delivery System (Microservices Architecture)  
**Course:** SWE4007: Software Application Architecture (First Review)  
**Guide:** Prof. Tauseef Khan · VIT Vellore  
**Main Project Readme:** [`../README.md`](../README.md)  

**Team Members:**  
- Krishnakanth (23MIC7004)  
- Aadith M Mathew (23MIC7005)  
- Mithran (23MIC7008)  
- Nihal (23MIC7009)  
- Harika (23MIC7014)  

---

## Documentation & Architecture Assets

| Document / Asset | Description |
| :--- | :--- |
| 📘 [`food_delivery_architecture_plan.md`](food_delivery_architecture_plan.md) | **Master Architecture Blueprint:** Details Database-per-Service, traffic separation, Eventual Consistency, viva defense strategies, and scaling matrices. |
| 🗺️ [`implementation_roadmap.md`](implementation_roadmap.md) | **Phased Implementation Roadmap:** Sequential 7-phase plan from Phase 0 (Infrastructure) to Phase 5 (Client UI) and Phase 6 (Review deliverables). |
| 🚀 [`phase_0_plan.md`](phase_0_plan.md) | **Phase 0 Execution Plan:** Step-by-step foundation plan (Docker bridge network, MongoDB, RabbitMQ, Redis, and API Gateway). |
| 🔑 [`phase_1_plan.md`](phase_1_plan.md) | **Phase 1 Execution Plan:** Identity & Catalog services (Auth Service, User Service, Restaurant Service + Redis Cache). |
| 💳 [`phase_2_plan.md`](phase_2_plan.md) | **Phase 2 Execution Plan:** Core Transaction Engine (Order Service & Payment Service via RabbitMQ Saga Choreography). |
| 🛵 [`phase_3_plan.md`](phase_3_plan.md) | **Phase 3 Execution Plan:** Fulfillment & Auxiliary Services (Delivery Service, Notification Service, Review Service). |
| ⚖️ [`phase_4_plan.md`](phase_4_plan.md) | **Phase 4 Execution Plan:** Horizontal Scaling & Resilience (Container Replicas, Load Balancing, Chaos Fault Isolation). |
| 💻 [`phase_5_plan.md`](phase_5_plan.md) | **Phase 5 Execution Plan:** Customer Web Application (React SPA partitioned into 7 self-contained screen sub-phases). |
| 🖼️ [`food_delivery_architecture_diagram.png`](food_delivery_architecture_diagram.png) | **High-Resolution Architecture Diagram:** Publication-ready 2x PNG for Word reports and presentation slide decks. |
| 📐 [`food_delivery_architecture_diagram.svg`](food_delivery_architecture_diagram.svg) | **Scalable Vector Graphic (SVG):** Infinitely scalable vector diagram. |
| 🌐 [`food_delivery_architecture_diagram.html`](food_delivery_architecture_diagram.html) | **Interactive Editorial HTML Diagram:** Standalone webpage featuring defense cards, typography, and live-ready design tokens. |
