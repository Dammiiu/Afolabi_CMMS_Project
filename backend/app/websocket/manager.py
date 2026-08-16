from fastapi import WebSocket
from typing import Dict, List
import json

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
    
    async def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
                
    async def send_to_user(self, user_id: int, message: dict):
        if user_id in self.active_connections:
            msg_str = json.dumps(message)
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(msg_str)
                except Exception:
                    pass

    async def broadcast_to_role(self, db, role: str, message: dict):
        from app.models.user import User, RoleEnum
        role_enum = RoleEnum(role)
        users = db.query(User).filter(User.role == role_enum, User.is_active == True).all()
        for user in users:
            await self.send_to_user(user.id, message)

manager = ConnectionManager()
