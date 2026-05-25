# 🛠️ Troubleshooting cAdvisor and Docker on Windows

This guide explains why **cAdvisor** and **Docker** are currently not working on your system, and provides step-by-step instructions to fix the issues.

---

## 🚨 Root Cause 1: Docker/WSL2 Service is Broken (Immediate Blocker)

When attempting to check the Docker status or start the WSL2 VM, the system returns the following error:
```text
The operation could not be started because a required feature is not installed. 
Error code: Wsl/Service/CreateInstance/CreateVm/HCS/HCS_E_SERVICE_NOT_AVAILABLE
```

### Why does this happen?
WSL2 and Docker Desktop run a lightweight Linux utility VM. This requires hardware-level virtualization to be active in your system's BIOS and registered in Windows. This error means either **Virtualization is disabled in your BIOS**, or the **Virtual Machine Platform** Windows feature is missing/not running.

### 💡 How to Fix:
Follow these steps to enable hardware and software virtualization:

#### Step 1: Enable Virtualization in BIOS (Hardware)
1. **Restart your computer**.
2. As it boots, repeatedly press the BIOS key (usually **F2**, **F10**, **Del**, or **Esc** depending on your motherboard).
3. Navigate to the **CPU Configuration**, **Advanced**, or **Security** tab.
4. Locate the virtualization setting:
   * **Intel CPUs**: Look for **Intel Virtualization Technology**, **Intel VT-x**, or **VMX**.
   * **AMD CPUs**: Look for **SVM Mode**, **AMD-V**, or **Secure Virtual Machine**.
5. Set it to **Enabled**.
6. Save changes and exit (usually **F10**) to reboot into Windows.

> [!TIP]
> You can verify if virtualization is enabled in Windows by opening **Task Manager** (`Ctrl + Shift + Esc`), clicking the **Performance** tab, selecting **CPU**, and looking for **Virtualization: Enabled** at the bottom-right.

#### Step 2: Enable Windows Virtualization Features (Software)
Once in Windows, you must ensure the required features are active:
1. Press the **Windows Key**, type `Turn Windows features on or off`, and open it.
2. In the list that appears, locate and check the following boxes:
   * **Virtual Machine Platform** (Crucial for WSL2)
   * **Windows Subsystem for Linux**
3. Click **OK** and let Windows install the components.
4. **Restart your computer** if prompted.

---

## ⚠️ Root Cause 2: cAdvisor Platform Compatibility on Windows

Once your Docker Desktop daemon is started and healthy, the `cadvisor` container service in your `docker-compose.yml` might still fail to run or collect metrics.

### Why does this happen?
cAdvisor is natively built to run on **Linux hosts**. It operates by mounting physical host directories like:
* `/sys:/sys:ro` (to access the Linux kernel control groups - cgroups)
* `/var/lib/docker:/var/lib/docker:ro` (to access container images and metadata)
* `/dev/disk:/dev/disk:ro` (to monitor disk I/O metrics)

On Windows (even with WSL2), **these paths do not exist on your host machine**. Mounting `/sys` or `/var/lib/docker` directly from Windows mounts empty or incorrect host directories to the container, causing cAdvisor to throw errors such as:
```text
Failed to start container manager: in-container startup failed: failed to initialize container helper for subcontainers: unable to find cpu controller
```

### 💡 How to Fix cAdvisor on Windows:

To run cAdvisor successfully under Windows Docker Desktop (WSL2 backend), you have two main options:

### Option A: Run cAdvisor directly inside your WSL2 Distro (Recommended)
Instead of starting cAdvisor via Windows Docker Compose, you can run cAdvisor directly inside your WSL2 distribution (e.g., Ubuntu) where the real Linux `/sys/fs/cgroup` and `/var/lib/docker` reside.

1. Open your terminal and start WSL:
   ```bash
   wsl -d Ubuntu
   ```
2. Run cAdvisor directly as a container inside the WSL environment using the following command:
   ```bash
   sudo docker run \
     --volume=/:/rootfs:ro \
     --volume=/var/run:/var/run:ro \
     --volume=/sys:/sys:ro \
     --volume=/var/lib/docker/:/var/lib/docker:ro \
     --volume=/dev/disk/:/dev/disk:ro \
     --publish=8089:8080 \
     --detach=true \
     --name=cadvisor \
     --privileged \
     --device=/dev/kmsg \
     gcr.io/cadvisor/cadvisor:v0.49.1
   ```
This allows cAdvisor to query the real WSL2 Linux kernel and return container stats on port `8089`.

---

### Option B: Use alternative flags in `docker-compose.yml`
If you want to keep cAdvisor in your `docker-compose.yml`, you must bypass certain cgroup mounting blockers by passing configuration arguments to the image.

Update your `cadvisor` service in `docker-compose.yml` as follows:

```yaml
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.49.1
    container_name: cadvisor
    privileged: true
    devices:
      - /dev/kmsg
    ports:
      - "8089:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    # Disable certain cgroups modules that Windows/WSL2 doesn't expose
    command:
      - '--housekeeping_interval=15s'
      - '--docker_only=true'
    restart: unless-stopped
```

* `--docker_only=true`: Tells cAdvisor to only gather container metrics and ignore system-level hardware stats that aren't available in WSL2.
* `--housekeeping_interval=15s`: Reduces the polling rate to avoid overloading the WSL2 virtual machine.
