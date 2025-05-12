# 📨 Campaign Management System

A full-stack AI-powered campaign management system that enables employees to create, segment, and track customer campaigns with real-time delivery and analytics.

---

## 🔧 Tech Stack

### Frontend
- **React.js** — UI framework
- **Material UI (MUI)** — Component library for styling
- **Tailwind CSS** — Utility-first CSS framework

### Backend
- **Node.js** & **Express.js** — REST API
- **Mongoose** — MongoDB ODM for customer and campaign data

### Messaging & AI
- **Nodemailer** — For sending campaign emails
- **RabbitMQ** — Message queue to simulate delivery
- **Google Gemini API** — For AI-based customer segmentation and personalized message generation

---

## 🏗️ Architecture

```
  A[Employee Signup/Login] --> B[Dashboard]
  B --> C[Create New Campaign]
  C --> D[Enter Details (name, budget, goal, start date)]
  D --> E[Segmentation Rule (e.g. 'total spent > 500 and state = Maharashtra')]
  E --> F[AI interprets rule → Matches Customers from DB]
  F --> G[Save Campaign]
  G --> H[Send to RabbitMQ (message queue)]
  H --> I[Simulate Delivery (90% success, 10% failure)]
  I --> J[Nodemailer sends emails]
  J --> K[Email Tracker Applied (opened, clicked)]
  B --> L[View Campaign Analytics]
````

---

## 💻 Local Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/LAKSHAYBANSAL879/XENOCRM
cd XENOCRM
```

### 2. Set Up the Backend

```bash
cd backend
npm install
# Add a .env file with required variables:
# MONGO_URI, GEMINI_API_KEY, EMAIL_USER, EMAIL_PASS, RABBITMQ_URL
node index.js
```

### 3. Set Up the Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🧠 AI Usage

* **Natural Language Segmentation**:

  * Uses Google Gemini API to interpret customer selection rules written in natural language (e.g., "customers from Maharashtra who spent more than ₹500").
* **Message Personalization**:

  * Generates dynamic email messages for each customer based on campaign intent and user data.

---

## 📉 Known Limitations

* ❌ **Email Open Tracking**:

  * Tracking who opened emails via hidden image pixels is **blocked by Gmail**, so "opened" metrics may be inaccurate.
* 🛠️ **No Retry Logic** for failed message deliveries (enhancements planned).

---

## ✅ Features

* Campaign creation with goal, budget, and targeting.
* AI-powered customer filtering and personalized messaging.
* Real-time email sending with simulated delivery results.
* Campaign analytics with delivery, click, and open status.
* Built with scalability and modularity in mind.


```
