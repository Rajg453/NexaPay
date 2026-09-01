# Paystream Project Summary

This document outlines the current state of the Paystream project, detailing the features and architecture we have built so far.

## Overview
Paystream is a full-stack web application divided into a Node.js/Express backend and a React (Vite) frontend.

---

## 1. Backend (`/backend`)
The backend is built with Node.js, Express, and MongoDB (Mongoose). It includes authentication, payment integration, and AI features.

### Key Dependencies:
- **Express**: Web framework for routing.
- **Mongoose**: MongoDB object modeling.
- **JsonWebToken (JWT) & bcryptjs**: For secure user authentication and password hashing.
- **Razorpay**: For payment gateway integration.
- **@huggingface/inference**: For AI-powered features.
- **dotenv & cors**: For environment variable management and Cross-Origin Resource Sharing.

### Architecture:
- **Models**: Defines the database schema for the application.
  - `User.js`: Handles user data and credentials.
  - `Wallet.js`: Manages user wallet balances.
  - `Transaction.js`: Records payment and wallet transactions.
- **Routes**: API endpoints for different features.
  - `authRoutes.js`: User registration and login.
  - `walletRoutes.js`: Fetching and updating wallet balances.
  - `transactionRoutes.js`: Fetching transaction history.
  - `paymentRoutes.js`: Integration with Razorpay for handling payments.
  - `billRoutes.js`: Handling bill payments.
  - `aiRoutes.js`: AI-related endpoints.
- **Controllers**:
  - `aiController.js`: Logic for AI features using Huggingface.

---

## 2. Frontend (`/frontend`)
The frontend is a modern React application built with Vite and TypeScript.

### Key Dependencies:
- **React & React DOM**: UI library.
- **TypeScript**: Static typing for robustness.
- **Vite**: Fast build tool and development server.

### Architecture:
The frontend is primarily component-driven. The `src/components` directory contains the building blocks of the UI:
- **Header & Footer**: Main layout components.
- **BottomNav**: Mobile-friendly bottom navigation.
- **WalletCard**: Displays the user's current wallet balance and related information.
- **ActionButtons**: Quick actions for the user (e.g., Send Money, Add Money).
- **RecentTransactions**: A list displaying recent user activities and transactions.
- **Services**: A component showcasing available services (e.g., Mobile Recharge, Bill Payments).

### Current State:
- The UI components are built and ready to be assembled into full pages.
- The `src/pages` directory is currently empty, meaning the components are likely being rendered directly in `App.tsx` or awaiting page-level integration.

---

## Next Steps
1. **Frontend Integration**: Assemble the existing components into dedicated pages (e.g., Dashboard, Login, History) within the `pages/` directory.
2. **API Connection**: Ensure the frontend services are correctly calling the backend routes for authentication, wallet fetching, and transactions.
3. **Refine AI & Payments**: Finalize the Huggingface AI integrations and Razorpay webhooks/callbacks.
