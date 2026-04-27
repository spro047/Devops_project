# Inventory Core (MVP)

This workspace contains a minimal, in-memory Inventory Core service implementing the project's core logic: on-hand stock, reservations, commits, and releases.

Files:
- inventory_service/service.py — core logic
- inventory_service/models.py — pydantic models for API
- inventory_service/main.py — FastAPI app exposing endpoints

Run locally (recommended in a virtualenv):

```powershell
pip install -r requirements.txt
uvicorn inventory_service.main:app --reload
```
# Devops_project