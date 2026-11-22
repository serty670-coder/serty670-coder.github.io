// ============================================================
// api.js - 최종 디버깅 버전
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
    
    // [핵심] 서버가 주는 데이터를 가공 없이 통째로 alert로 띄웁니다.
    // 이 알림창에 뜨는 내용을 저에게 알려주시면 바로 해결됩니다.
    alert("🚨 [서버 응답 데이터 확인]\n" + JSON.stringify(room, null, 2));

    const rId = room.room_id || room.id;
    const rToken = room.host_token || room.token || room.token_id;

    if (rId && rToken) {
        const storageKey = "hostToken:" + rId;
        localStorage.setItem(storageKey, rToken);
        localStorage.setItem("currentRoomId", rId);
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
