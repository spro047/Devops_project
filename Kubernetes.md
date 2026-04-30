# Kubernetes Implementation Guide

This guide outlines how to transition the **IMS Pro** project from Docker Compose to a scalable **Kubernetes (K8s)** orchestration.

---

## 🏗️ Architecture Overview

In a Kubernetes environment, the application is broken down into the following components:

1.  **Backend Deployment**: Runs the Flask API pods.
2.  **Frontend Deployment**: Runs the React (Nginx) pods.
3.  **Services**: Provide stable network endpoints for pods.
4.  **Ingress**: Manages external access (HTTP/HTTPS) and routing.
5.  **Secrets/ConfigMaps**: Manage environment variables like `MONGODB_URI`.

---

## 🛠️ Step-by-Step Implementation

### 1. Containerize the Applications
Ensure your `Dockerfile`s are optimized for production.
- **Backend**: Use a production server like `gunicorn` instead of the Flask dev server.
- **Frontend**: Use a multi-stage build to compile React and serve it via `Nginx`.

### 2. Create Kubernetes Manifests
You will need to create a directory (e.g., `k8s/`) containing the following YAML files:

#### **A. Secrets (Secret.yaml)**
Store sensitive data like your MongoDB connection string.
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: ims-secrets
type: Opaque
data:
  MONGODB_URI: <base64-encoded-uri>
```

#### **B. Backend Deployment (Backend-Deployment.yaml)**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ims-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ims-backend
  template:
    metadata:
      labels:
        app: ims-backend
    spec:
      containers:
      - name: backend
        image: your-dockerhub-user/ims-backend:latest
        ports:
        - containerPort: 5000
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: ims-secrets
              key: MONGODB_URI
```

#### **C. Backend Service (Backend-Service.yaml)**
```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: ims-backend
  ports:
    - protocol: TCP
      port: 5000
      targetPort: 5000
```

#### **D. Frontend Deployment (Frontend-Deployment.yaml)**
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ims-frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: ims-frontend
  template:
    metadata:
      labels:
        app: ims-frontend
    spec:
      containers:
      - name: frontend
        image: your-dockerhub-user/ims-frontend:latest
        ports:
        - containerPort: 80
```

### 3. Deploy to Cluster
Assuming you have `kubectl` configured and a cluster (like Minikube, EKS, or GKE) running:

1.  **Apply Manifests**:
    ```bash
    kubectl apply -f k8s/
    ```

2.  **Verify Status**:
    ```bash
    kubectl get pods
    kubectl get services
    ```

---

## 🚀 Future Enhancements
- **Helm Charts**: Package these manifests into a Helm chart for easier versioning and deployment.
- **HPA (Horizontal Pod Autoscaler)**: Automatically scale pods based on CPU/Memory usage.
- **CI/CD Integration**: Use GitHub Actions to build and push images to a registry, then trigger a rollout in K8s.
