import os
import httpx

# 카카오 REST API 키 및 기본 URL 설정
KAKAO_REST_API_KEY = "682c2900a67a09db8d5d3c86d42a620f"
BASE_URL = "https://dapi.kakao.com/v2/local"

HEADERS = {
    "Authorization": f"KakaoAK {KAKAO_REST_API_KEY}"
}

async def search_address(query: str):
    """
    [기능] 입력받은 주소/지명을 좌표(경도 x, 위도 y)로 변환함.
    """
    url = f"{BASE_URL}/search/address.json"
    params = {"query": query}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=HEADERS, params=params)
        response.raise_for_status()
        data = response.json()
        
        results = []
        for doc in data.get("documents", []):
            results.append({
                "address_name": doc["address_name"],
                "x": float(doc["x"]),
                "y": float(doc["y"])
            })
        return results

async def search_stations_near_point(lat: float, lng: float, radius: int = 1000):
    """
    [기능] 기준 좌표 주변 반경 내 지하철역, 버스터미널, 기차역을 검색함.
    """
    url = f"{BASE_URL}/search/keyword.json"
    params = {
        "query": "역 터미널",      # '역' 또는 '터미널' 키워드 통합 검색
        "x": str(lng),
        "y": str(lat),
        "radius": radius,
        "sort": "distance"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=HEADERS, params=params)
        response.raise_for_status()
        data = response.json()
        
        stations = []
        for doc in data.get("documents", []):
            stations.append({
                "place_name": doc["place_name"],
                "address_name": doc["address_name"],
                "road_address_name": doc["road_address_name"],
                "place_url": doc["place_url"],
                "x": float(doc["x"]),
                "y": float(doc["y"]),
                "distance": int(doc["distance"])
            })
        return stations

async def search_places(lat: float, lng: float, category_code: str, radius: int = 1000):
    """
    [기능] 기준 좌표(lat, lng) 주변 반경(radius) 내 특정 카테고리 장소를 검색함.
    - category_code: CE7(카페), FD6(식당), SW8(지하철역 등 교통)
    """
    url = f"{BASE_URL}/search/category.json"
    params = {
        "category_group_code": category_code,
        "x": str(lng),
        "y": str(lat),
        "radius": radius,
        "sort": "distance"
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=HEADERS, params=params)
        response.raise_for_status()
        data = response.json()

        places = []
        for doc in data.get("documents", []):
            place_name = doc["place_name"]
            y_coord = float(doc["y"])
            x_coord = float(doc["x"])
            
            # 카카오맵 바로 연결 URL 생성 (공식 웹 URL 또는 커스텀 맵 스킴 URL)
            kakao_map_url = doc.get("place_url") or f"https://map.kakao.com/link/map/{place_name},{y_coord},{x_coord}"

            places.append({
                "place_name": place_name,
                "address_name": doc["address_name"],
                "road_address_name": doc["road_address_name"],
                "place_url": doc.get("place_url"),
                "kakao_map_url": kakao_map_url,  # 바로 연결용 명시적 URL
                "x": x_coord,
                "y": y_coord,
                "distance": int(doc["distance"])
            })
        return places


async def search_cafes_near_point(x: float, y: float, radius: int = 1000):
    """
    [기능] 기준 좌표(x, y) 주변 반경(radius) 내 카페 목록을 검색함.
    """
    url = f"{BASE_URL}/search/keyword.json"
    params = {
        "query": "카페",
        "x": str(x),
        "y": str(y),
        "radius": radius,
        "sort": "distance"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=HEADERS, params=params)
        response.raise_for_status()
        data = response.json()
        
        cafes = []
        for doc in data.get("documents", []):
            place_name = doc["place_name"]
            x_coord = float(doc["x"])
            y_coord = float(doc["y"])

            kakao_map_url = doc.get("place_url") or f"https://map.kakao.com/link/map/{place_name},{y_coord},{x_coord}"

            cafes.append({
                "place_name": place_name,
                "address_name": doc["address_name"],
                "road_address_name": doc["road_address_name"],
                "place_url": doc.get("place_url"),
                "kakao_map_url": kakao_map_url,
                "x": x_coord,
                "y": y_coord,
                "distance": int(doc["distance"])
            })
        return cafes
