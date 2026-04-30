# IMS Pro - Simple Inventory Management System

IMS Pro is a stable, functional, and premium-designed Inventory Management System built with **React** and **Flask**. It is designed for small to medium businesses to track products, stock levels, and transaction history with ease.

![Aesthetics](https://img.shields.io/badge/Design-Premium-blueviolet)
![Status](https://img.shields.io/badge/Status-Stable-success)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)

---

## 🚀 Execution Methods

You can run this project in three different ways depending on your needs.

### Option 1: Docker Compose (Quickest)
The easiest way to run the project locally. It sets up both the backend and frontend automatically.

1. Ensure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is installed and running.
2. Run the following command in the project root:
   ```bash
   docker compose up --build
   ```
3. Access the application:
   - **Frontend UI**: [http://localhost](http://localhost) (Port 80)
   - **Backend API**: [http://localhost:5000](http://localhost:5000)

---

### Option 2: Kubernetes (Scalable / Production-Ready)
Run the application inside a local Kubernetes cluster using the provided manifests.

1. Enable Kubernetes in Docker Desktop (or use Minikube).
2. Ensure you have built the local Docker images (or pushed them to a registry). If using local Docker Desktop, the images from `docker compose build` will be available to K8s.
3. Apply the manifests from the project root:
   ```bash
   kubectl apply -f k8s/
   ```
4. Verify the pods and services are running:
   ```bash
   kubectl get pods
   kubectl get services
   ```
5. Access the application on `http://localhost` (or the IP provided by the LoadBalancer).

---

### Option 3: Manual Execution (Local Development)
If you prefer to run the components manually for coding or debugging:

#### 1. Backend Setup (Flask)
1. Navigate to the `backend` directory: `cd backend`
2. Create a virtual environment: `python -m venv venv`
3. Activate the environment:
   - Windows: `.\venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run the server: `python run.py`
   - The API will be live at `http://localhost:5000`.

#### 2. Frontend Setup (React + Vite)
1. Open a new terminal and navigate to the `frontend` directory: `cd frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`
   - The UI will be live at `http://localhost:5173`.

---

## ✨ Key Features
- **Real-time Dashboard**: Monitor total items, inventory value, and low-stock alerts.
- **Product Management**: SKU-based catalog with price and threshold tracking.
- **Activity Log**: Full historical record of all stock "IN" and "OUT" movements.
- **Search & Filter**: Find products quickly by name, SKU, or category.
- **Premium UI**: Modern dark-mode interface with Glassmorphism effects and responsive design.

---

## 📂 Project Structure
- `backend/`: Flask REST API, Database models, and MongoDB configuration.
- `frontend/`: React source code, components, and premium CSS.
- `.github/workflows/`: CI/CD build verification scripts.
- `docker-compose.yml`: Orchestration for the entire stack.

---

## 📝 Stability Note
This project uses **MongoDB Atlas** for scalable and cloud-native data storage. The connection URI is managed via the `backend/.env` file. Ensure your MongoDB Atlas cluster is accessible and the URI is correctly configured for the application to function.
