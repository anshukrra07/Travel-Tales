fetch(`${BACKEND_URL}/api/capture-data`)
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("logs-container");
    const userSet = new Set();
    const userSelect = document.getElementById("user-select");

    container.innerHTML = ""; // Clear previous logs if any
    userSelect.innerHTML = `
      <option value="">-- Select a user --</option>
      <option value="__anonymous__">Anonymous User</option>
    `;

    data.forEach((log, index) => {
      // Collect unique usernames
      if (log.username) userSet.add(log.username);

      // Create log card
      const card = document.createElement("div");
      card.className = "log-card";

      const username = log.username || "—";
      const time = new Date(log.createdAt).toLocaleString();

      card.innerHTML = `
         <div class="log-header">
    <span>👤 Triggered By: ${log.triggeredBy}</span>
    <span>🕒 ${time}</span>
    <span>👥 Username: ${username}</span>
  </div>

        <div class="media">
          <div><strong>📸 Selfie:</strong><br/><img src="${BACKEND_URL}/${log.selfiePath}" /></div>
          <div>
            <strong>🎥 Video with Audio:</strong><br/>
            <video id="video-${index}" controls style="max-width: 250px; border-radius: 8px;" muted>
              <source src="${BACKEND_URL}/${log.videoPath}" type="video/webm">
            </video>
            <audio id="audio-${index}" src="${BACKEND_URL}/${log.audioPath}" style="display: none;"></audio>
          </div>
        </div>

        <div id="map-${index}" class="map"></div>
      `;

      container.appendChild(card);

      // Sync video and audio
      const video = document.getElementById(`video-${index}`);
      const audio = document.getElementById(`audio-${index}`);

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

      // Google Maps
      if (log.location?.lat && log.location?.lon) {
        const mapDiv = document.getElementById(`map-${index}`);
        const position = { lat: log.location.lat, lng: log.location.lon };

        const map = new google.maps.Map(mapDiv, {
          zoom: 13,
          center: position,
        });

        new google.maps.Marker({
          position,
          map,
          title: "Captured Location"
        });
      }
    });

    // Populate dropdown
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

// 🔘 Trigger capture for selected user
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

// 📡 Trigger API call
function triggerForUser(username) {
  fetch(`${BACKEND_URL}/api/manual-capture`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }) // can be null for anonymous
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
    populateUserDropdown(allLogs); // if needed for admin trigger
  })

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

    card.innerHTML = `
      <div class="log-header">
    <span>👤 Triggered By: ${log.triggeredBy}</span>
    <span>🕒 ${time}</span>
    <span>👥 Username: ${username}</span>
    <button onclick="deleteLog('${log._id}')">🗑️ Delete</button>
    <button onclick="downloadLog('${log._id}')">⬇️ Download ZIP</button>
  </div>

      <div class="media">
        <div><strong>📸 Selfie:</strong><br/><img src="${BACKEND_URL}/${log.selfiePath}" /></div>
        <div>
          <strong>🎥 Video with Audio:</strong><br/>
          <video id="video-${index}" controls muted style="max-width: 250px;">
            <source src="${BACKEND_URL}/${log.videoPath}" type="video/webm" />
          </video>
          <audio id="audio-${index}" src="${BACKEND_URL}/${log.audioPath}" style="display:none;"></audio>
        </div>
      </div>

      <div id="map-${index}" class="map" style="height: 250px; margin-top: 10px;"></div>
    `;

    container.appendChild(card);

    const video = document.getElementById(`video-${index}`);
    const audio = document.getElementById(`audio-${index}`);

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

    // Google Map
    if (log.location?.lat && log.location?.lon) {
      const position = { lat: log.location.lat, lng: log.location.lon };
      const map = new google.maps.Map(document.getElementById(`map-${index}`), {
        center: position,
        zoom: 13
      });
      new google.maps.Marker({ position, map });
    }
  });
  
  updateActiveUsers();
}

function updateActiveUsers() {
  fetch(`${BACKEND_URL}/api/active-users`)
    .then(res => res.json())
    .then(data => {
      const list = data.activeUsers?.length ? data.activeUsers.join(", ") : "None";
      document.getElementById("active-users").textContent = list;
    })
    .catch(err => console.error("Active users fetch error:", err));
}

// Every 10 seconds
setInterval(updateActiveUsers, 20000); // auto refresh every 20s

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
  link.download = `capture-log-${id}.zip`; // optional: let server set filename
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
