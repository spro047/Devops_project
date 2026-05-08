# Ansible for Devops_project

Overview
- This document explains how to use Ansible to provision and deploy the Devops_project repository.
- Included files: `ansible/deploy.yml` (basic playbook) and `ansible/inventory.ini` (example inventory).

Why use Ansible for this project
- Repeatable provisioning: install Docker and required packages with a single command.
- Consistent deployments: the same playbook runs on any server.
- Easy automation: integrate with CI/CD to deploy on push.

Prerequisites (Beginner-friendly)
- Control machine (where you run Ansible): Linux, macOS, or Windows with WSL2. Using WSL2/Ubuntu on Windows is recommended.
- Install Ansible on the control machine:
  - On Ubuntu (WSL): `sudo apt update && sudo apt install -y ansible`
  - On macOS: `brew install ansible`
  - On Windows: install WSL2 and then install Ansible inside the WSL distro.
- SSH access from the control machine to all target hosts. Use SSH keys for passwordless access.

Inventory
- Edit `ansible/inventory.ini` and replace `your_server_ip` with the target host(s).
- For quick local testing you can use the `local` group that points to `localhost`.

How the provided playbook works (`ansible/deploy.yml`)
- Targets group: `appservers` (defined in `ansible/inventory.ini`).
- Tasks:
  - updates apt cache (on Debian/Ubuntu)
  - installs `docker.io` and `docker-compose`
  - creates `/opt/devops_project` on the remote
  - copies the repository `docker-compose.yml` into that directory
  - starts Docker and runs `docker compose up -d`

Running the playbook (basic)
1. From the repository root, test locally (uses the `local` group):
```
ansible-playbook -i ansible/inventory.ini ansible/deploy.yml --limit local
```
2. To deploy to a remote host (replace `your_server_ip` in inventory):
```
ansible-playbook -i ansible/inventory.ini ansible/deploy.yml
```
Note: For remote hosts you may need `--ask-become-pass` if `sudo` requires a password.

Best practices & next steps
- Use roles: split responsibilities into `roles/backend`, `roles/frontend`, `roles/docker` for maintainability.
- Use variables: move host-specific values to group_vars or host_vars.
- Use `ansible-galaxy` to install community roles if needed (e.g., `geerlingguy.docker`).
- Add CI/CD: run Ansible playbooks from your pipeline (GitHub Actions, GitLab CI) to deploy after successful builds.

Beginner Plan to Implement Ansible in this Project
1. Setup
  - Install WSL2 (if on Windows) and Ansible inside WSL.
  - Generate SSH keys and ensure key-based auth to target hosts.
2. Proof of concept
  - Use `ansible/inventory.ini` local group and run the provided playbook locally.
  - Verify containers start and services are reachable.
3. Harden playbook
  - Replace direct `apt` installs with `geerlingguy.docker` role or similar.
  - Add idempotency checks and handlers.
4. Split into roles
  - Create `roles/backend` to build/pull backend images and run migrations.
  - Create `roles/frontend` to build frontend assets or pull images.
5. Testing and CI/CD
  - Add a GitHub Action that runs syntax checks `ansible-lint` and optionally deploys to a staging server.
6. Production readiness
  - Add monitoring, logging, secrets management (use Ansible Vault or external secret store).

Files added
- `ansible/deploy.yml` — basic playbook to deploy via Docker Compose.
- `ansible/inventory.ini` — example inventory with `appservers` and `local` groups.

Want help
- I can: test the playbook locally (requires WSL or a Linux host), split tasks into roles, or add CI steps. Which would you like next?
