// ============================================================
// 공통 API 클라이언트 (백엔드 FastAPI와 통신)
// ============================================================
const API_BASE = "https://capstone-midspot-1.onrender.com";

function getRoomIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("room");
}

function getCurrentRoomId() {
    return getRoomIdFromUrl() || localStorage.getItem("currentRoomId");
}

function getMyParticipantId() {
    return localStorage.getItem("myParticipantId");
}

async function apiRequest(method, path, body = null, extraHeaders = {}) {
    const url = API_BASE + path;
    const options = {
        method,
        headers: { "Content-Type": "application/json", ...extraHeaders },
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
        const msg = data.detail || `요청 실패 (HTTP ${res.status})`;
        throw new Error(msg);
    }
    return data;
}

async function createRoom() {
    const room = await apiRequest("POST", "/api/rooms");
    
    // [강력한 디버깅] 서버가 준 데이터를 통째로 보여줍니다. 
    // 여기서 host_token이 어떤 이름으로 들어있는지 확인해야 합니다.
    console.log("DEBUG: Raw Server Response:", room);
    
    // 1. 모든 가능한 토큰 필드명을 뒤집어서 찾습니다.
    const rToken = room.host_token || room.token || room.hostToken || room.token_id;
    // 2. 모든 가능한 ID 필드명을 뒤집어서 찾습니다.
    const rId = room.room_id || room.id;

    if (rId && rToken) {
        const storageKey = "hostToken:" + rId;
        localStorage.setItem(storageKey, rToken);
        localStorage.setItem("currentRoomId", rId);
        console.log("✅ [SUCCESS] Saved to LocalStorage:", storageKey, rToken);
    } else {
        // 여기서 alert가 뜨면, 그 안에 찍힌 JSON 내용을 저에게 알려주세요.
        alert("❌ [FAIL] 토큰을 못 찾음!\n서버 응답: " + JSON.stringify(room));
    }
    
    return room;
}

function getHostToken(roomId) {
    if (!roomId) return null;
    return localStorage.getItem("hostToken:" + roomId);
}

function isHost(roomId) {
    return Boolean(getHostToken(roomId));
}

async function deleteParticipant(roomId, participantId) {
    const token = getHostToken(roomId);
    if (!token) throw new Error("방장 토큰이 없습니다.");

    return await apiRequest(
        "DELETE",
        `/api/rooms/${roomId}/participants/${participantId}`,
        null,
        { "X-Host-Token": token }
    );
}

async function getRoom(roomId) {
    return await apiRequest("GET", `/api/rooms/${roomId}`);
}

async function addParticipant(roomId, payload) {
    return await apiRequest("POST", `/api/rooms/${roomId}/participants`, payload);
}

async function getParticipants(roomId) {
    return await apiRequest("GET", `/api/rooms/${roomId}/participants`);
}

async function voteCategory(roomId, payload) {
    return await apiRequest("POST", `/api/rooms/${roomId}/category-votes`, payload);
}

async function getCategoryVotes(roomId) {
    return await apiRequest("GET", `/api/rooms/${roomId}/category-votes`);
}

async function votePlace(roomId, payload) {
    return await apiRequest("POST", `/api/rooms/${roomId}/place-votes`, payload);
}

async function getPlaceVotes(roomId) {
    return await apiRequest("GET", `/api/rooms/${roomId}/place-votes`);
}

async function getResult(roomId, category = "cafe", radius = 1000) {
    return await apiRequest("GET", `/api/rooms/${roomId}/result?category=${category}&radius=${radius}`);
}
