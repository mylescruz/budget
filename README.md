# Type-A Budget

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit-blue)](https://budget-mylescruzs-projects.vercel.app/)

A full-stack personal budgeting application built with Next.js, NextAuth.js, MongoDB, and React Bootstrap.
It provides month-to-month budgeting, transaction management, income tracking, visual summaries, and user account controls — all secured with session-based authentication.

---

## 🚀 Features

### 📅 Monthly Budgeting

- View the current month’s budget at a glance
- Category pie chart using **Recharts**
- Category table showing:
  - Fixed expenses
  - Changing/variable expenses (auto-calculated from transactions)
- Add, edit, delete:
  - Categories
  - Transactions
- Automatic category total recalculation based on transactions
- View previous and future months' budgets

### 💰 Income Tracking

- Add, edit, and delete paychecks
- Supports multiple income sources
- View income across the current year and previous years

### 📊 Summary Dashboard

- Aggregated financial insights
- Highest/lowest/average spending months
- Year-to-date category totals
- Built with **Recharts** for interactive analytics

### 👤 Account Management

- View account details
- Change email
- Update password (bcrypt hashing)
- Delete account

### 🔐 User Authentication

- Secure login via **NextAuth.js**
- Validates login credentials
- Protects all API endpoints and pages tied to user data
- Only authenticated sessions can access app functionality

---

## 🧱 Tech Stack

### **Frontend**

- Next.js
- React Bootstrap UI
- Recharts (data visualization)

### **Backend**

- Next.js API routes
- MongoDB
- MongoDB **Convenient API** for multi-document transactions

### **Security**

- **NextAuth.js** session-based authentication
- bcrypt for password hashing

---

## 🧪 Local Development Setup

### 1. Install dependencies

npm install

### 2. Environment Variables

Create a .env.local file with:

MONGODB_URI=your_mongodb_uri

MONGODB_DB=your_mongodb_db

NEXTAUTH_SECRET=your_secret

NEXTAUTH_URL=http://localhost:3000

### 3. Run the development server

npm run dev
