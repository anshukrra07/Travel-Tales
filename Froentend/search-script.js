let places = []; // Store fetched places
let currentQuery = ""; // Store the current search query
let currentLat = null; // Store the current latitude
let currentLng = null; // Store the current longitude

document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get("query");

    if (!query) {
        document.getElementById("search-query").textContent = "No Search Query Provided";
        return;
    }

    currentQuery = query; // Store the query
    document.getElementById("search-query").textContent = `Search Results for: ${query}`;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                currentLat = position.coords.latitude; // Store latitude
                currentLng = position.coords.longitude; // Store longitude
                fetchPlaces(query, currentLat, currentLng, "nearby"); // Default to "Nearby"
            },
            () => {
                console.warn("Geolocation failed. Falling back to global search.");
                fetchPlaces(query, null, null, "nearby"); // Fallback if geolocation fails
            }
        );
    } else {
        console.warn("Geolocation not supported. Falling back to global search.");
        fetchPlaces(query, null, null, "nearby"); // Fallback if geolocation is not supported
    }
});



// ✅ Apply Distance Filter
function applyDistanceFilter() {
    const distanceFilter = document.getElementById("distance-filter").value;
    fetchPlaces(currentQuery, currentLat, currentLng, distanceFilter);
}

// ✅ Display Places Properly
function displayPlaces(places) {
    const container = document.getElementById("all-places");
    container.innerHTML = ""; // Clear previous results

    places.forEach(place => {
        if (!place.geometry || !place.geometry.location) return; // Ensure lat/lng exists

        const placeName = place.name || "Unknown Name";
        const placeAddress = place.formatted_address || "Address not available";
        const placeRating = place.rating ? `⭐ ${place.rating}/5` : "No rating available";
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        let placeImage = "images/default.jpg";

        if (place.photos && place.photos.length > 0) {
            placeImage = place.photos[0].getUrl({ maxWidth: 400 });
        }

        const placeCard = document.createElement("div");
        placeCard.classList.add("place-card");
        placeCard.innerHTML = `
           <a href="nearby-place.html?name=${encodeURIComponent(placeName)}&image=${encodeURIComponent(placeImage)}&address=${encodeURIComponent(placeAddress)}&rating=${encodeURIComponent(placeRating)}&lat=${lat}&lng=${lng}">
                <img src="${placeImage}" alt="${placeName}" class="place-img" onerror="this.onerror=null; this.src='images/default.jpg';">
                <div class="place-info">
                    <strong>${placeName}</strong>
                    <p>📍 ${placeAddress}</p>
                    <p>${placeRating}</p>
                </div>
            </a>
        `;

        container.appendChild(placeCard);
    });
}

// ✅ Sort Places by Rating or Name
function sortPlaces() {
    const sortBy = document.getElementById("sort-by").value;
    if (sortBy === "rating") {
        places.sort((a, b) => (b.rating || 0) - (a.rating || 0)); // Sort by rating (high to low)
    } else if (sortBy === "name") {
        places.sort((a, b) => a.name.localeCompare(b.name)); // Sort by name (A-Z)
    }
    displayPlaces(places);
}