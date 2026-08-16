# Event type constants and helpers
class WSEvents:
    NEW_NOTIFICATION = "NEW_NOTIFICATION"
    REQUEST_UPDATED = "REQUEST_UPDATED"
    WORK_ORDER_ASSIGNED = "WORK_ORDER_ASSIGNED"

def build_event(event_type: str, payload: dict) -> dict:
    return {
        "event": event_type,
        "data": payload
    }
