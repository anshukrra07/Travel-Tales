
// for loading search bar
function initializeAutocomplete() {
    var input = document.getElementById("search-bar");

    if (!input) {
        console.error("Search bar not found!");
        return;
    }

    var autocomplete = new google.maps.places.Autocomplete(input);

    autocomplete.addListener("place_changed", function () {
        var place = autocomplete.getPlace();

        if (!place.geometry) {
            console.log("No details available for input: '" + place.name + "'");
            return;
        }

        // Extracting place details
        let placeName = place.name;
        let placeImage = place.photos ? place.photos[0].getUrl({ maxWidth: 800, maxHeight: 600 }) : "images/default.jpg";
        let placeAddress = place.formatted_address || "Address not available";
        let placeRating = place.rating ? place.rating : "No rating available";

        // Redirect to a new page with place details in URL
        let queryString = `?name=${encodeURIComponent(placeName)}&image=${encodeURIComponent(placeImage)}&address=${encodeURIComponent(placeAddress)}&rating=${encodeURIComponent(placeRating)}`;
        window.location.href = `dynamic-destination.html${queryString}`;
    });
}

// load after page loads fully
window.onload = function () {
    initializeAutocomplete();
};

// Run when page loads
document.addEventListener("DOMContentLoaded", initializeAutocomplete);




// enter key press to redirect 
document.getElementById('search-bar').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        let input = this.value.trim().toLowerCase();
        if (input) {
            window.location.href = `search-results.html?query=${encodeURIComponent(input)}`;
        }
    }
});


// ✅ Google Maps Initialization fetching locations
function loadGoogleMap() {
    console.log("Loading Google Map...");

    const placeAddress = document.getElementById("place-address").textContent.trim(); // Trim to remove spaces
    if (!placeAddress) {
        console.error("❌ Address is missing.");
        document.getElementById("map").innerHTML = "<p style='color: red;'>Address not available.</p>";
        return;
    }

    console.log("Address to geocode:", placeAddress);

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: placeAddress }, function (results, status) {
        console.log("Geocoding status:", status); // Debugging

        if (status === "OK") {
            const location = results[0].geometry.location;
            console.log("Geocoded location:", location); // Debugging

            // ✅ Create Google Map
            const map = new google.maps.Map(document.getElementById("map"), {
                zoom: 14,
                center: location,
            });

            // ✅ Add Marker on the Map
            new google.maps.Marker({
                position: location,
                map: map,
                title: document.getElementById("place-name").textContent,
            });

            // ✅ Fetch Nearby Places (If Needed)
            if (typeof fetchNearbyPlaces === "function") {
                fetchNearbyPlaces(map, location);
            }
        } else {
            console.error("❌ Google Maps failed to load:", status);
            document.getElementById("map").innerHTML = "<p style='color: red;'>Google Maps failed to load.</p>";
        }
    });
}



// ✅ Fetch Nearby Places using proper place id from Google Maps API
function fetchNearbyPlaces(map, location) {
    const placesService = new google.maps.places.PlacesService(map);
    const categories = ["restaurant", "hospital", "tourist_attraction", "lodging"];

    categories.forEach(category => {
        const request = {
            location: location,
            radius: 30000, // Search within 15km radius
            type: category,
        };

        placesService.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                displayPlaces(category, results);
            } else {
                console.error(`Error fetching ${category}:`, status);
            }
        });
    });
}



// ✅ Fetch Places of not a proper place id text search Using Google Places API
function fetchPlaces(query, lat, lng, distanceFilter) {
    console.log("Fetching places with:", { query, lat, lng, distanceFilter });

    const map = new google.maps.Map(document.getElementById("hidden-map"), {
        center: { lat: lat || 0, lng: lng || 0 }, // Default center
        zoom: 12, // Default zoom
    });

    const service = new google.maps.places.PlacesService(map);

    let request = { query: query };

    if (lat && lng) {
        request.location = new google.maps.LatLng(lat, lng);

        // Set radius based on the distance filter
        switch (distanceFilter) {
            case "nearby":
                request.radius = 15000; // 15km
                break;
            case "city":
                request.radius = 50000; // 50km
                break;
            case "country":
                request.radius = 500000; // 500km
                break;
            case "world":
                // No radius limit (search globally)
                delete request.radius; // Remove radius for global search
                break;
            default:
                request.radius = 15000; // Default to 15km
        }
    } else {
        // If no location is available, search globally
        delete request.radius; // Remove radius for global search
    }

    console.log("Places API Request:", request);

    service.textSearch(request, (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && results.length > 0) {
            places = results;
            displayPlaces(places);
        } else {
            console.error("No places found or API error:", status);
            document.getElementById("all-places").innerHTML = "<p>No places found for your search. Try a different query.</p>";
        }
    });
}