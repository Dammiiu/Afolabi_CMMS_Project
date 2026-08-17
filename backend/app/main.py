from fastapi import FastAPI, Depends, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database import engine, Base
from app.api import auth, users, locations, requests, work_orders, maintenance_records, inventory, notifications, analytics, audit
from app.websocket.manager import manager
from app.core.security import decode_token
from app.models.user import User
from app.database import SessionLocal
import os

# Create tables (for dev)
Base.metadata.create_all(bind=engine)

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title="AATU CMMS API",
    description="Backend for Abiola Ajimobi Technical University Maintenance Management System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(locations.router, prefix="/api/locations", tags=["Locations"])
app.include_router(requests.router, prefix="/api/requests", tags=["Maintenance Requests"])
app.include_router(work_orders.router, prefix="/api/work-orders", tags=["Work Orders"])
app.include_router(maintenance_records.router, prefix="/api/maintenance-records", tags=["Maintenance Records"])
app.include_router(inventory.router, prefix="/api/inventory", tags=["Inventory"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(audit.router, prefix="/api/audit", tags=["Audit Log"])

@app.get("/api/seed", tags=["Admin"])
def seed_production_database():
    import traceback
    try:
        import sys
        import os
        sys.path.insert(0, os.path.abspath(os.path.dirname(__file__) + '/..'))
        import seed
        seed.seed_db()
        return {"message": "Database seeded successfully!"}
    except Exception as e:
        return {"error": str(e), "traceback": traceback.format_exc()}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...)):
    payload = decode_token(token)
    if not payload or not payload.get("sub"):
        await websocket.close(code=1008)
        return
    
    user_id = int(payload.get("sub"))
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming WS messages if needed
    except WebSocketDisconnect:
        await manager.disconnect(websocket, user_id)
