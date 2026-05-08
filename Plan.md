# Simple Inventory Management System - Project Plan

## 1. Project Overview
The goal is to build a stable, functional, and easy-to-maintain Inventory Management System (IMS). This project focuses on core utility and stability rather than enterprise-scale complexity. It provides a reliable way to track stock, manage products, and monitor inventory health.

## 2. Core Features (Scope)
- **Product Management**: 
  - Add, edit, and delete products (SKU, Name, Category, Price, Quantity).
  - Categorization for easier filtering.
- **Inventory Operations**:
  - Stock-in: Increase quantity with transaction notes.
  - Stock-out: Decrease quantity for sales or damage.
  - Basic transaction history log.
- **Real-time Dashboard**:
  - Total items in stock.
  - Total inventory value.
  - **Low Stock Alerts**: Highlight items below a defined threshold.
- **Search & Filter**:
  - Quick search by name or SKU.
  - Filter by category or stock status.

## 3. Simplified Technology Stack
To ensure stability and ease of development, we will use proven, lightweight technologies:
- **Backend**: **Flask (Python)** - Simple, stable, and powerful.
- **Database**: **MongoDB Atlas** - Cloud-native, scalable NoSQL database for flexible data management.
- **Frontend**: **React** with **Vite** - Modern, reactive UI for a premium user experience.
- **API**: **REST API** using Flask to serve the React frontend.
- **Tooling**: 
  - **Environment**: Virtualenv for dependency isolation.
  - **Containerization**: **Docker** for consistent environments across development and "production".

## 4. Simplified DevOps & Workflow
- **Version Control**: Git (GitHub) for source management.
- **CI/CD**: Simple GitHub Actions to run tests and build the Docker image.
- **Testing**: Basic unit tests for core inventory logic (e.g., ensuring stock cannot go negative).
- **Documentation**: A clear `README.md` and basic API documentation.

## 5. Development Roadmap
### Phase 1: Foundation (Week 1)
- Set up Flask environment.
- Define Database Schema (Products, Transactions).
- Implement basic CRUD API for Products.

### Phase 2: React UI & Integration (Week 1)
- Initialize React project with Vite.
- Implement the premium design system (Glassmorphism).
- Build Dashboard and Product management components.
- Connect React frontend to Flask API.

### Phase 3: Polish & Stability (Week 2)
- Add Low-stock alerts and visual indicators.
- Implement Transaction History view.
- Comprehensive testing and bug fixing.

### Phase 4: Portability (Week 2)
- Create `Dockerfile` and `docker-compose.yml`.
- Set up GitHub Actions for automated testing.
- Final documentation.

### Phase 5: Advanced Features & Expansion (New)
- **Supplier Management**: Track vendor details and purchase history.
- **Reporting & Exports**: Generate PDF/Excel reports for stock levels and transactions.
- **Predictive Analytics**: Basic forecasting of stock depletion based on historical trends.
- **Barcode/QR Support**: Scanning capabilities for mobile-friendly stock adjustments.
- **Role-Based Access (RBAC)**: Distinct permissions for Admin (full access) and Staff (view/adjust only).

### Phase 6: E-commerce Integration (Mini-Amazon)
- **Customer Storefront**: Build a lightweight "Mini-Amazon" frontend where users can browse and "buy" products.
- **Real-time Synchronization**: Implement automated inventory deduction in the IMS when an order is placed on the storefront.
- **Order Notifications**: Add a real-time activity feed in the IMS dashboard to show "New Order Placed" events as they happen.
- **Stock Reservation**: Logic to prevent overselling if two customers buy the last item simultaneously.

## 6. Future Roadmap (Ideas)
- **Email Notifications**: Automated alerts when items hit critical thresholds.
- **Multi-Warehouse Support**: Manage stock across different geographical locations.
- **Scalable Real-time**: Use WebSockets (Socket.io) for instant UI updates across all connected clients.
- **PWA Support**: Transform the frontend into a Progressive Web App for offline-first capabilities.

## 7. Stability & Performance Goals
- **Responsiveness**: UI should load in under 500ms.
- **Data Integrity**: Use database transactions to prevent inventory count mismatches.
- **Simplicity**: No external dependencies like message brokers or complex caching layers.
