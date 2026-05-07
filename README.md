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

---

## 🔄 CI/CD Implementation with Jenkins

This project includes a complete Jenkins CI/CD pipeline for automated building, testing, and deployment.

### Architecture Overview
- **Jenkins**: Orchestrates the CI/CD pipeline
- **Docker**: Containerizes the application components
- **GitHub**: Source code repository with webhooks for automatic triggers
- **Kubernetes** (Optional): Production deployment on K8s cluster

### Pipeline Flow
1. **Code Commit** → GitHub Webhook → Jenkins Trigger
2. **Checkout** → Clone repository
3. **Backend Tests** → Install dependencies, run pytest
4. **Frontend Tests** → Install dependencies, run npm test
5. **Build Docker Images** → Build backend, frontend, and Jenkins images
6. **Deploy** → Run docker-compose up or apply K8s manifests

### Setup Instructions

#### Prerequisites
- Ubuntu/Debian Linux server or WSL on Windows
- Root/sudo access
- Internet connection

#### 1. Install Jenkins and Docker
Run the provided setup script:
```bash
chmod +x setup.sh
sudo ./setup.sh
```

This script will:
- Install OpenJDK 17
- Install and start Jenkins
- Install Docker and Docker Compose
- Add Jenkins user to docker group
- Start all services

#### 2. Configure Jenkins
1. Open Jenkins at `http://localhost:8080`
2. Retrieve initial admin password:
   ```bash
   sudo cat /var/lib/jenkins/secrets/initialAdminPassword
   ```
3. Install suggested plugins during setup
4. Install additional plugins:
   - Docker Pipeline
   - Git
   - Pipeline
   - Kubernetes (if using K8s)

#### 3. Connect GitHub Repository
1. Create a new repository on GitHub
2. Push this project to GitHub:
   ```bash
   git remote add origin https://github.com/yourusername/yourrepo.git
   git push -u origin main
   ```
3. In Jenkins:
   - Create new Pipeline job
   - Select "Pipeline script from SCM"
   - SCM: Git
   - Repository URL: Your GitHub repo URL
   - Branch: main
   - Script Path: Jenkinsfile

#### 4. Configure Webhooks (Optional for auto-trigger)
1. In GitHub repository settings → Webhooks
2. Add webhook: `http://your-server:8080/github-webhook/`
3. Content type: application/json
4. Events: Push

#### 5. Run the Pipeline
- Manual: Click "Build Now" in Jenkins
- Automatic: Push to main branch

#### 6. Verify Deployment
```bash
docker ps  # Check running containers
curl http://localhost  # Frontend
curl http://localhost:5000  # Backend
```

### Commands Used
- **Jenkins Installation**: `sudo apt install jenkins`
- **Docker Installation**: `sudo apt install docker-ce`
- **Service Management**: `sudo systemctl start/stop jenkins`
- **Jenkins User Setup**: `sudo usermod -aG docker jenkins`
- **Pipeline Execution**: Jenkins UI or webhook trigger

### Screenshots Needed
1. Jenkins Dashboard with pipeline status
2. Pipeline build logs
3. Docker containers running (`docker ps`)
4. Application UI after deployment
5. GitHub webhook configuration

### Explanation for Viva
- **Why Jenkins?**: Industry-standard CI/CD tool with extensive plugin ecosystem
- **Docker Integration**: Ensures consistent environments across dev/test/prod
- **Pipeline as Code**: Jenkinsfile version-controlled with application code
- **Automated Testing**: Prevents broken code from reaching production
- **Scalability**: Easy to extend pipeline for additional stages (security scans, performance tests)
- **Kubernetes Ready**: Manifests prepared for cloud-native deployment

### Troubleshooting
- **Permission Issues**: Ensure Jenkins user is in docker group
- **Port Conflicts**: Check if ports 8080, 5000, 80 are available
- **Build Failures**: Check Jenkins logs and Docker image builds
- **Webhook Not Triggering**: Verify GitHub URL and Jenkins webhook endpoint
