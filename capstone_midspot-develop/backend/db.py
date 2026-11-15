# 인메모리 저장소 (공용). 요청 시 접근하는 모듈은 여기서 참조한다.
import json
import os
from models import Room
from schemas import Participant

DATA_FILE = "data.json"

def load_data():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"rooms": {}, "participants": {}}

def save_data(data):
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

# 초기 데이터 로드
db = load_data()
rooms_db = db["rooms"]
participants_db = db["participants"]

# 데이터 변경이 일어날 때마다 save_data({"rooms": rooms_db, "participants": participants_db})를 호출해 주면 됩니다.
