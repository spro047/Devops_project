# 🚀 AWS EC2 Deployment Guide

This guide provides step-by-step instructions to deploy the **IMS Pro (Inventory Management System)** onto an AWS EC2 instance using Docker and Docker Compose.

---

## 🏗️ Step 1: Launch an EC2 Instance

1. **Log in** to your [AWS Management Console](https://aws.amazon.com/console/).
2. Navigate to **EC2** > **Instances** > **Launch Instances**.
3. **Name your instance**: `IMS-Pro-Server`.
4. **Application and OS Image (AMI)**: Choose **Ubuntu 22.04 LTS** (Free Tier eligible).
5. **Instance Type**: Select `t2.micro` (or `t3.micro` if available in Free Tier).
6. **Key Pair**: Select an existing key pair or create a new one (e.g., `ims-pro-key.pem`). **Download and save this safely.**
7. **Network Settings**:
   - Create a security group.
   - Allow **SSH traffic** from your IP.
   - Allow **HTTP traffic (Port 80)** from anywhere (0.0.0.0/0).
   - Allow **Custom TCP (Port 5000)** from anywhere (for Backend API access, if needed separately).

---

## 🔐 Step 2: Connect to Your Instance

Open your terminal (PowerShell, CMD, or Terminal) and run:

```bash
# Set permissions for your key (Linux/Mac only)
chmod 400 ims-pro-key.pem

# Connect to the instance
ssh -i "ims-pro-key.pem" ubuntu@<YOUR_EC2_PUBLIC_IP>
```

---

## 🛠️ Step 3: Install Dependencies

Once logged into the Ubuntu instance, run the following commands to install Docker and Docker Compose:

```bash
# Update package list
sudo apt-get update

# Install Docker
sudo apt-get install -y docker.io

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add current user to docker group (to run docker without sudo)
sudo usermod -aG docker $USER
# Log out and log back in for this to take effect, or run:
newgrp docker

# Install Docker Compose
sudo apt-get install -y docker-compose
```

---

## 📂 Step 4: Deploy the Application

### 1. Clone the Repository
```bash
git clone <YOUR_REPOSITORY_URL>
cd Devops_project
```

### 2. Configure Environment Variables
The backend requires a MongoDB URI. Create the `.env` file in the `backend` directory:

```bash
nano backend/.env
```
Paste your MongoDB connection string:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ims_pro?retryWrites=true&w=majority
```
*Press `Ctrl+O`, `Enter`, then `Ctrl+X` to save and exit.*

### 3. Launch with Docker Compose
```bash
docker-compose up -d --build
```

---

## ✅ Step 5: Verification

1. **Check Containers**: Run `docker ps` to ensure both `backend` and `frontend` are running.
2. **Access Frontend**: Open your browser and go to `http://<YOUR_EC2_PUBLIC_IP>`.
3. **Access API**: Verify the backend is responding at `http://<YOUR_EC2_PUBLIC_IP>:5000`.

---

## ⚠️ Troubleshooting

- **Port 80 blocked**: Ensure no other service (like Nginx) is running on the host on port 80.
- **Connection Refused**: Check the **Security Group** settings in the AWS Console to ensure ports 80 and 5000 are open.
- **Database Connection**: Ensure your MongoDB Atlas cluster has the EC2 Public IP whitelisted (or allow access from anywhere `0.0.0.0/0` for testing).

---

> [!TIP]
> For production environments, it is recommended to use an Elastic IP to ensure your IP address remains static after instance restarts.
