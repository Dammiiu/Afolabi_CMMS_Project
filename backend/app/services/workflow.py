from sqlalchemy.orm import Session
from app.models.maintenance_request import MaintenanceRequest, StatusEnum
from app.models.work_order import WorkOrder, WOStatusEnum
from app.models.maintenance_record import MaintenanceRecord
from app.models.inventory import InventoryItem, InventoryTransaction
from app.models.audit_log import AuditLog
from app.models.user import User
from app.services.triage import triage_request
from app.services.assignment import suggest_technicians
from app.services.notification_service import create_notification, notify_role
from datetime import datetime

async def process_submission(db: Session, request: MaintenanceRequest, user: User):
    triage_info = triage_request(db, request.category, request.location_id, request.description)
    request.priority = triage_info.suggested_priority
    if triage_info.is_duplicate:
        request.status = StatusEnum.rejected
        request.description += f" [Auto-rejected: Duplicate of {triage_info.duplicate_request_id}]"
    else:
        request.status = StatusEnum.triaged

    db.add(request)
    db.commit()
    db.refresh(request)

    log = AuditLog(user_id=user.id, action="Submitted Request", entity_type="MaintenanceRequest", entity_id=request.id)
    db.add(log)
    db.commit()

    if not triage_info.is_duplicate:
        await notify_role(db, "supervisor", f"New request #{request.id} requires approval.", request.id)
    
    return request, triage_info

async def approve_request(db: Session, request_id: int, supervisor: User, priority_override: str = None):
    req = db.query(MaintenanceRequest).filter(MaintenanceRequest.id == request_id).first()
    if not req: return None

    req.status = StatusEnum.approved
    if priority_override:
        req.priority = priority_override

    wo = WorkOrder(
        request_id=req.id,
        created_by=supervisor.id,
        priority=req.priority,
        status=WOStatusEnum.pending
    )
    db.add(wo)
    
    log = AuditLog(user_id=supervisor.id, action="Approved Request", entity_type="MaintenanceRequest", entity_id=req.id)
    db.add(log)
    db.commit()
    db.refresh(wo)

    await create_notification(db, req.requestor_id, f"Your request #{req.id} has been approved.", req.id)
    return wo

async def complete_work_order(db: Session, work_order_id: int, technician: User, completion_data: dict):
    wo = db.query(WorkOrder).filter(WorkOrder.id == work_order_id).first()
    wo.status = WOStatusEnum.completed
    wo.request.status = StatusEnum.completed

    record = MaintenanceRecord(
        work_order_id=wo.id,
        technician_id=technician.id,
        completion_notes=completion_data.get("completion_notes"),
        parts_used=completion_data.get("parts_used"),
        time_spent_minutes=completion_data.get("time_spent_minutes")
    )
    db.add(record)

    # Deduct inventory
    if record.parts_used:
        for part in record.parts_used:
            item = db.query(InventoryItem).filter(InventoryItem.id == part['item_id']).first()
            if item:
                item.quantity_in_stock -= part['quantity']
                txn = InventoryTransaction(
                    inventory_item_id=item.id,
                    work_order_id=wo.id,
                    quantity_used=part['quantity'],
                    logged_by=technician.id
                )
                db.add(txn)

    log = AuditLog(user_id=technician.id, action="Completed Work Order", entity_type="WorkOrder", entity_id=wo.id)
    db.add(log)
    db.commit()

    await create_notification(db, wo.request.requestor_id, f"Work order for request #{wo.request_id} has been completed.", wo.request_id)
    await notify_role(db, "supervisor", f"Work order #{wo.id} completed by {technician.full_name}.")
    return wo
