// ✅ JavaScript for Dynamic Destination Page

document.addEventListener("DOMContentLoaded", function () {
    console.log("Dynamic Script Loaded!");

    // ✅ Extract URL Parameters (Sent from index.html)
    const urlParams = new URLSearchParams(window.location.search);
    const placeName = urlParams.get("name") || "Dynamic Destination";
    const placeImage = urlParams.get("image") || "images/default.jpg";
    const placeAddress = urlParams.get("address") || "Address not available";
    const placeRating = urlParams.get("rating") || "No rating available";

    // ✅ Update Destination Page Elements
    document.getElementById("place-name").textContent = placeName;
    document.getElementById("place-image").src = placeImage;
    document.getElementById("place-address").textContent = placeAddress;
    document.getElementById("place-rating").textContent = placeRating;
    document.getElementById("destination-header").style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${placeImage})`;

    // ✅ Update Browser Tab Title
    document.title = `${placeName} - Travel Destination`;

    // ✅ Load Google Map if Address is Available
    if (placeAddress !== "Address not available") {
        setTimeout(loadGoogleMap, 1000);
    }
});

 
// ✅ Display Nearby Places in a Grid Format
function displayPlaces(category, places) {
    const categoryNames = {
        restaurant: "🍽 Restaurants",
        hospital: "🏥 Hospitals",
        tourist_attraction: "🗺 Tourist Attractions",
        lodging: "🏨 Hotels",
    };

    const container = document.getElementById("nearby-places");
    let existingSection = document.querySelector(`.info-section[data-category="${category}"]`);

    if (!existingSection) {
        existingSection = document.createElement("div");
        existingSection.classList.add("info-section");
        existingSection.setAttribute("data-category", category);

        const sectionHeader = document.createElement("h3");
        sectionHeader.textContent = categoryNames[category];

        const placesContainer = document.createElement("div");
        placesContainer.classList.add("places-container");

        existingSection.appendChild(sectionHeader);
        existingSection.appendChild(placesContainer);
        container.appendChild(existingSection);
    }

    const placesContainer = existingSection.querySelector(".places-container");
    placesContainer.innerHTML = "";

    places.slice(0, 50).forEach(place => {
        const placeName = place.name || "Unknown Name";
        const placeAddress = place.vicinity || "Address not available";
        const placeRating = place.rating ? `⭐ ${place.rating}/5` : "No rating available";
        let placeImage = "images/default.jpg";

        if (place.photos && place.photos.length > 0) {
            placeImage = place.photos[0].getUrl({ maxWidth: 400 });
        }

        // ✅ Create Place Card with Clickable Link
        const placeCard = document.createElement("div");
        placeCard.classList.add("place-card");
        placeCard.innerHTML = `
            <a href="nearby-place.html?name=${encodeURIComponent(placeName)}&image=${encodeURIComponent(placeImage)}&address=${encodeURIComponent(placeAddress)}&rating=${encodeURIComponent(placeRating)}">
                <img src="${placeImage}" alt="${placeName}" class="place-img" onerror="this.onerror=null; this.src='images/default.jpg';">
                <div class="place-info">
                    <strong>${placeName}</strong>
                    <p>📍 ${placeAddress}</p>
                    <p>${placeRating}</p>
                </div>
            </a>
        `;

        placesContainer.appendChild(placeCard);
    });
}

    document.addEventListener("DOMContentLoaded", function () {
        const urlParams = new URLSearchParams(window.location.search);
        const placeName = urlParams.get("name") || "Unknown Destination";
        document.getElementById("place-name").textContent = placeName;
    });



