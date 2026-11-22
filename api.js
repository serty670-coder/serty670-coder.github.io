// ============================================================
// 공통 API 클라이언트 (백엔드 FastAPI와 통신)
// ============================================================
const API_BASE = "https://capstone-midspot-1.onrender.com";

function getRoomIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("room");
}

function getCurrentRoomId() {
    // 공유 링크의 방 ID가 브라우저에 남은 이전 방 ID보다 우선합니다.
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
    
    // [수정된 강력한 로직] 서버 응답 데이터의 필드명을 유연하게 매칭하여 저장합니다.
    const rId = room.room_id || room.id;
    const rToken = room.host_token;

    if (rId && rToken) {
        const storageKey = "hostToken:" + rId;
        localStorage.setItem(storageKey, rToken);
        localStorage.setItem("currentRoomId", rId);
        console.log("✅ [Success] Room Created & Token Saved:", storageKey, rToken);
    } else {
        // 만약 토큰이 없다면, 서버가 주는 실제 데이터를 콘솔에 찍어서 확인할 수 있게 합니다.
        console.error("❌ [Fail] Room Created but Token Missing. Server Response:", room);
        // 프론트엔드 alert를 통해 사용자에게 정확한 상태를 알립니다.
        alert("⚠️ 방 생성은 됐으나 토큰 저장에 실패했습니다.\n서버 응답: " + JSON.stringify(room));
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
    
    // 디버깅 로그
    console.log("--- 삭제 시도 ---");
    console.log("Room ID:", roomId);
    console.log("Token 확인:", token ? "있음" : "없음");

    if (!token) {
        throw new Error("방장 토큰이 없습니다. 방을 만든 브라우저인지 확인하세요.");
    }

    // 서버의 x_host_token: str = Header() 에 맞춰 정확하게 X-Host-Token을 사용합니다.
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
