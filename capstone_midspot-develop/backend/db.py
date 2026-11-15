# 인메모리 저장소 (공용). 요청 시 접근하는 모듈은 여기서 참조한다.
import json
import os

DB_FILE = "data.json"

def load_data():
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"rooms": {}, "participants": {}}

def save_data(data):
    with open(DB_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

# 기존 메모리 DB를 파일 데이터와 연동
_data = load_data()
rooms_db = _data.setdefault("rooms", {})
participants_db = _data.setdefault("participants", {})

def commit_db():
    """데이터가 변경될 때마다 호출하여 파일에 저장"""
    save_data({"rooms": rooms_db, "participants": participants_db})
