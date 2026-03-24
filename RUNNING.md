# Restaurant Management System - Run Guide

This project consists of two main parts: a **backend API** and an **admin frontend**.

## Prerequisites
- [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running locally on port 27017.

---

## 1. Backend Setup (`restaurant_management_backend`)

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd restaurant_management_backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure MongoDB is running. The default connection string is `mongodb://localhost:27017/restaurant_management`.
4. Start the server:
   ```bash
   npm start
   ```
   The backend will run on [http://localhost:5000](http://localhost:5000).

---

## 2. Admin Frontend Setup (`restaurant_management_admin`)

1. Open a **new** terminal window and navigate to the admin directory:
   ```bash
   cd restaurant_management_admin
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the admin panel at the URL provided in the terminal (usually [http://localhost:5173](http://localhost:5173)).

---

## Troubleshooting
- **Database Connection Error**: Ensure MongoDB is running and that the `MONGODB_URI` in `.env` is correct.
- **Port Conflict**: If port 5000 or 5173 is already in use, you can change them in the respective `.env` files or project configurations.
