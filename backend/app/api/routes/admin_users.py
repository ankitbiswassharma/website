from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_admin_session
from app.db.session import get_db
from app.schemas.user import StaffUserCreatedOut, StaffUserCreateIn, StaffUserOut, StaffUserUpdateIn
from app.services.user_service import user_service


router = APIRouter(prefix="/admin", tags=["admin-users"])


@router.get("/users", response_model=list[StaffUserOut])
def list_users(_: object = Depends(get_admin_session), db: Session = Depends(get_db)):
    users = user_service.list_users(db)
    return [StaffUserOut.model_validate(user) for user in users]


@router.post("/users", response_model=StaffUserCreatedOut)
def create_user(
    payload: StaffUserCreateIn,
    admin_session=Depends(get_admin_session),
    db: Session = Depends(get_db),
):
    user, emailed = user_service.create_user(
        db,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        address=payload.address,
        aadhaar_number=payload.aadhaar_number,
        qualification=payload.qualification,
        gender=payload.gender,
        date_of_birth=payload.date_of_birth,
        created_by=getattr(admin_session, "email", None),
    )
    return StaffUserCreatedOut(
        **StaffUserOut.model_validate(user).model_dump(),
        credentials_emailed=emailed,
    )


@router.patch("/users/{user_id}", response_model=StaffUserOut)
def update_user(
    user_id: str,
    payload: StaffUserUpdateIn,
    _: object = Depends(get_admin_session),
    db: Session = Depends(get_db),
):
    user = user_service.update_user(
        db,
        user_id,
        name=payload.name,
        phone=payload.phone,
        address=payload.address,
        aadhaar_number=payload.aadhaar_number,
        qualification=payload.qualification,
        gender=payload.gender,
        date_of_birth=payload.date_of_birth,
        is_active=payload.is_active,
    )
    return StaffUserOut.model_validate(user)
