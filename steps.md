# 🚀 Project Setup & Execution Guide

Follow these steps to get the **IMS Pro** (Inventory Management System) project up and running on your local machine.

---

## 📋 Prerequisites
Before you begin, ensure you have the following installed:
*   **Docker Desktop** (Required for Option 1, 3, and 4)
*   **Node.js** (v18+) & **npm** (Required for Option 2)
*   **Python** (v3.9+) (Required for Option 2)
*   **Git**

---

## 🛠 Option 1: Docker Compose (Quickest & Recommended)
This is the easiest way to run the entire stack (Frontend, Backend, MongoDB, and Jenkins).

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/spro047/Devops_project.git
    cd Devops_project
    ```
2.  **Start all services**:
    ```bash
    docker compose up --build
    ```
3.  **Access the applications**:
    *   **Frontend UI**: [http://localhost](http://localhost) (Port 80)
    *   **Backend API**: [http://localhost:5000](http://localhost:5000)
    *   **Jenkins**: [http://localhost:8082](http://localhost:8082)

---

## 💻 Option 2: Local Development (Manual Setup)
Use this if you want to modify the code and see changes in real-time.

### 1. Backend Setup (Flask)
1.  Navigate to the backend folder:
    ```bash
    cd backend
    ```
2.  Create and activate a virtual environment:
    *   **Windows**: `python -m venv venv` then `.\venv\Scripts\activate`
    *   **Linux/Mac**: `python3 -m venv venv` then `source venv/bin/activate`
3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the backend:
    ```bash
    python run.py
    ```
    *API will be at `http://localhost:5000`*

### 2. Frontend Setup (React + Vite)
1.  Open a new terminal and navigate to the frontend folder:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
    *UI will be at `http://localhost:5173`*

---

## 🏗 Option 3: Jenkins CI/CD Setup
To use the built-in Jenkins pipeline:

1.  **Start Jenkins** (included in Docker Compose):
    ```bash
    docker compose up jenkins
    ```
2.  **Unlock Jenkins**:
    *   Go to `http://localhost:8082`
    *   Get password: `docker compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword`
3.  **Configure Pipeline**:
    *   Create a **New Item** -> **Pipeline**.
    *   Under **Pipeline**, select "Pipeline script from SCM".
    *   SCM: **Git**, Repository URL: `https://github.com/spro047/Devops_project.git`.
    *   Script Path: `Jenkinsfile`.

---

## ☸️ Option 4: Kubernetes Deployment
To run the app in a Kubernetes cluster:

1.  **Enable Kubernetes** in your Docker Desktop settings.
2.  **Apply Manifests**:
    ```bash
    kubectl apply -f k8s/
    ```
3.  **Check Status**:
    ```bash
    kubectl get pods
    kubectl get services
    ```
4.  **Access**: Use the External-IP of the `frontend-service` (usually `localhost`).

---

## 🚀 Option 5: Ansible Deployment (Cloud/Remote Server)
If you are deploying to a remote Ubuntu server:

1.  **Configure Inventory**: Edit `ansible/inventory.ini` with your server's IP and SSH key.
2.  **Run Playbook**:
    ```bash
    ansible-playbook -i ansible/inventory.ini ansible/deploy.yml
    ```
    *This will automatically install Docker, pull the code, and start the services on the remote host.*

---

## 🧪 Testing the APIs
You can test the backend health by visiting:
`http://localhost:5000/api/health`

---
