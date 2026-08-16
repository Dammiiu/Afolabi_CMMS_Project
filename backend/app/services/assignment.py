from sqlalchemy.orm import Session
from app.models.user import User, RoleEnum
from app.models.work_order import WorkOrder, WOStatusEnum
from app.schemas.user import TechnicianScoreOut

def suggest_technicians(db: Session, category: str) -> list[TechnicianScoreOut]:
    technicians = db.query(User).filter(User.role == RoleEnum.technician, User.is_active == True).all()
    scores = []
    
    category_str = category.value if hasattr(category, 'value') else category

    for tech in technicians:
        skill_tags = tech.skill_tags or []
        
        # Skill match score
        if category_str in skill_tags:
            skill_match_score = 10.0
        else:
            skill_match_score = 0.0
            
        # Workload score
        active_orders = db.query(WorkOrder).filter(
            WorkOrder.assigned_technician_id == tech.id,
            WorkOrder.status.in_([WOStatusEnum.assigned, WOStatusEnum.in_progress])
        ).count()
        
        workload_score = max(0.0, 10.0 - (active_orders * 2.0))
        
        total_score = skill_match_score + workload_score
        
        scores.append(TechnicianScoreOut(
            technician_id=tech.id,
            technician_name=tech.full_name,
            skill_match_score=skill_match_score,
            workload_score=workload_score,
            total_score=total_score
        ))
        
    scores.sort(key=lambda x: x.total_score, reverse=True)
    return scores[:5]
