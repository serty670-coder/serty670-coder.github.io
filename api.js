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
    // 방을 만든 브라우저에만 방장 토큰을 보관합니다.
    if (room.host_token) localStorage.setItem("hostToken:" + room.room_id, room.host_token);
    return room;
}

function getHostToken(roomId) {
    return localStorage.getItem("hostToken:" + roomId);
}

function isHost(roomId) {
    return Boolean(getHostToken(roomId));
}

async function deleteParticipant(roomId, participantId) {
    const token = getHostToken(roomId);
    
    // [모바일 디버깅용 alert 추가] 
    // 이 창이 뜨면 'Token: 없음'인지 'Token: 문자열'인지 확인해주세요.
    alert(
        "🔍 [디버깅 확인]\n" +
        "방 ID: " + roomId + "\n" +
        "토큰 상태: " + (token ? "✅ 있음 (" + token.substring(0, 5) + "...)" : "❌ 없음 (null)")
    );

    if (!token) {
        throw new Error("방장 토큰이 없습니다. 방을 만든 브라우저인지 확인하세요.");
    }

    // 서버의 x_host_token: str = Header() 설정에 맞춰 정확히 'X-Host-Token' 헤더를 사용합니다.
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
