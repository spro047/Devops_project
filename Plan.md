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
- **Database**: **SQLite** - Serverless, zero-config, and extremely reliable for this scale.
- **Frontend**: **HTML5, Vanilla CSS, and JavaScript** - No complex frameworks; just clean, responsive UI using a modern CSS approach (or simple Bootstrap).
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

### Phase 2: Inventory Logic & UI (Week 1)
- Create the Inventory Adjustment logic (Stock-in/Stock-out).
- Build a clean, professional Dashboard UI.
- Implement Product listing and search.

### Phase 3: Polish & Stability (Week 2)
- Add Low-stock alerts and visual indicators.
- Implement Transaction History view.
- Comprehensive testing and bug fixing.

### Phase 4: Portability (Week 2)
- Create `Dockerfile` and `docker-compose.yml`.
- Set up GitHub Actions for automated testing.
- Final documentation.

## 6. Stability & Performance Goals
- **Responsiveness**: UI should load in under 500ms.
- **Data Integrity**: Use database transactions to prevent inventory count mismatches.
- **Simplicity**: No external dependencies like message brokers or complex caching layers.
