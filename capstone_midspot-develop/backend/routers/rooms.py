import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from models import Room, RoomPublic
from db import rooms_db
from services.cleanup import cleanup_expired_rooms

router = APIRouter(prefix="/api/rooms", tags=["Rooms"])


@router.post("", status_code=201)  # [수정] response_model=Room을 제거하여 필터링 방지
def create_room():
    room_id = str(uuid.uuid4())[:8]
    host_token = uuid.uuid4().hex
    now = datetime.now()
    
    # 1. DB에 저장할 객체 생성
    new_room = Room(
        room_id=room_id, 
        created_at=now, 
        host_token=host_token
    )
    rooms_db[room_id] = new_room
    
    # 2. [핵심] 모델을 거치지 않고 데이터를 직접 dict 형태로 반환
    # 이렇게 하면 FastAPI가 host_token을 삭제하지 못하고 클라이언트에 그대로 전달합니다.
    return {
        "room_id": room_id,
        "created_at": now,
        "host_token": host_token
    }


@router.get("/{room_id}", response_model=RoomPublic)
def get_room(room_id: str):
    if room_id not in rooms_db:
        raise HTTPException(status_code=404, detail="존재하지 않는 방입니다.")
    return rooms_db[room_id]


@router.delete("/cleanup")
def cleanup():
    return {"deleted": cleanup_expired_rooms()}
