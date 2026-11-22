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
    
    // [디버깅 추가] 서버에서 온 응답 확인
    console.log("서버 응답 데이터:", room);
    
    // 서버 응답의 필드명을 확인하여 안전하게 저장합니다.
    // room_id가 없으면 id를 사용합니다.
    const rId = room.room_id || room.id;
    const rToken = room.host_token;

    if (rId && rToken) {
        const storageKey = "hostToken:" + rId;
        localStorage.setItem(storageKey, rToken);
        alert(`✅ 방 생성 성공!\n저장된 키: ${storageKey}\n토큰 일부: ${rToken.substring(0,5)}...`);
    } else {
        alert(`❌ 방 생성은 됐으나 토큰 저장 실패!\n응답내용: ${JSON.stringify(room)}`);
    }
    
    return room;
}

function getHostToken(roomId) {
    if (!roomId) return null;
    const key = "hostToken:" + roomId;
    const token = localStorage.getItem(key);
    
    // [디버깅 추가] 토큰을 찾을 때의 로그
    console.log("토큰 조회 시도 - Key:", key, "Result:", token);
    return token;
}

function isHost(roomId) {
    return Boolean(getHostToken(roomId));
}

async function deleteParticipant(roomId, participantId) {
    const token = getHostToken(roomId);
    
    alert(
        "🔍 [삭제 시도 디버깅]\n" +
        "접속한 Room ID: " + roomId + "\n" +
        "찾으려는 Key: hostToken:" + roomId + "\n" +
        "토큰 상태: " + (token ? "✅ 있음 (" + token.substring(0, 5) + "...)" : "❌ 없음 (null)")
    );

    if (!token) {
        throw new Error("방장 토큰이 없습니다. 방을 만든 브라우저인지 확인하세요.");
    }

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