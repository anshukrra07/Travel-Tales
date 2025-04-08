// destination Search function
function searchPlaces() {
    let input = document.getElementById('search-bar').value.toLowerCase();
    let container = document.querySelector('.destination-content');
    container.innerHTML = ''; // Clear before adding filtered results

    let filtered = destinations.filter(dest => dest.name.toLowerCase().includes(input));

    filtered.forEach(dest => {
        let box = document.createElement('div');
        box.classList.add('box');
        box.innerHTML = `
            <img src="${dest.image}" alt="${dest.name}">
            <h4>${dest.name}</h4>
            <h6>${dest.location}</h6>
            <div class="row">
                <p><b>$99</b>/person</p>
                <a href="${dest.link}" class="button">View Details</a>
            </div>
        `;
        container.appendChild(box);
    });

}



// // to add nearby place section in page 
// <div id="nearby-places"></div>
// <h2>📍 Nearby Places</h2>
// </div>



// nearby script to display nearby options
function displayPlaces(category, places) {
    
    const container = document.getElementById("nearby-places");

    // Check if a section for this category already exists
    let existingSection = document.querySelector(`.info-section[data-category="${category}"]`);

    if (!existingSection) {
        // Create a new section if it doesn't exist
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

    // Clear previous places before adding new ones
    placesContainer.innerHTML = "";

    places.slice(0, 50).forEach(place => {
        const placeName = place.name || "Unknown Name";
        const placeAddress = place.vicinity || "Address not available";
        const placeRating = place.rating ? `⭐ ${place.rating}/5` : "No rating available";

        let placeImage = "images/default.jpg";
        if (place.photos && place.photos.length > 0) {
            placeImage = place.photos[0].getUrl({ maxWidth: 400 });
        }

        // Create Place Card
        const placeCard = document.createElement("div");
        placeCard.classList.add("place-card");
        placeCard.innerHTML = `
            <img src="${placeImage}" alt="${placeName}" class="place-img" onerror="this.onerror=null; this.src='images/default.jpg';">
            <div class="place-info">
                <strong>${placeName}</strong>
                <p>📍 ${placeAddress}</p>
                <p>${placeRating}</p>
            </div>
        `;

        // Add click event to open a new page
        placeCard.addEventListener("click", () => {
            const queryParams = new URLSearchParams({
                name: placeName,
                image: placeImage,
                address: placeAddress,
                rating: placeRating
            });
            window.open(`nearby-place.html?${queryParams.toString()}`, "_blank");
        });

        placesContainer.appendChild(placeCard);
    });
}


<header>
    <a href="index.html" class="logo">Tra<span>vel</span> Ta<span>les</span></a>
    <ul class="navbar">
        <li><a href="index.html">home</a></li>
        <li><a href="#about">about</a></li>
        <li><a href="#destinations">destinations</a></li>
        <li><a href="#tour">tour</a></li>
        <li><a href="#contact">contact</a></li>
    </ul>

    <!-- Search Bar and Prompt -->
   <div class="h-right">
        <input type="text" id="search-bar" placeholder="Search places..." onkeyup="searchPlaces()" class="nav-btn">

        <div id="search-prompt" class="search-prompt"></div> <!-- Prompt below the search bar -->

          <!-- Login Button and Account Dropdown -->
        <button id="login-btn" onclick="redirectToLogin()">Login</button>
        <div id="account-container" style="display: none;">
            <div id="user-icon" onclick="toggleDropdown()">
                <i class="fa fa-user"></i> <!-- FontAwesome user icon -->
            </div>
            <div id="account-dropdown" class="dropdown-menu">
                <span id="username-display"></span>
                <button id="logout-btn" onclick="logout()">Logout</button>
            </div>
        </div>

        <div class="fa fa-bars navbar-link" id="menu-icon"></div>
    </div>
</header>



document.addEventListener("DOMContentLoaded", function () {
    checkLoginStatus();
    handleScreenResize();
});

function checkLoginStatus() {
    const username = localStorage.getItem("loggedInUser");

    // Desktop elements
    const loginBtn = document.getElementById("login-btn");
    const accountContainer = document.getElementById("account-container");
    
    // Mobile elements
    const mobileLoginBtn = document.getElementById("mobile-login-btn");
    const mobileAccountContainer = document.getElementById("mobile-account-container");

    if (username) {
        // Update desktop view
        if (loginBtn) loginBtn.style.display = "none";
        if (accountContainer) accountContainer.style.display = "block";
        document.getElementById("username-display").textContent = username;
        
        // Update mobile view
        if (mobileLoginBtn) mobileLoginBtn.style.display = "none";
        if (mobileAccountContainer) {
            mobileAccountContainer.style.display = "block";
            document.getElementById("mobile-username-display").textContent = username;
        }
    } else {
        // Update desktop view
        if (loginBtn) loginBtn.style.display = "block";
        if (accountContainer) accountContainer.style.display = "none";
        
        // Update mobile view
        if (mobileLoginBtn) mobileLoginBtn.style.display = "block";
        if (mobileAccountContainer) mobileAccountContainer.style.display = "none";
    }
}

function redirectToLogin() {
    window.location.href = "login.html";
}

function logout() {
    localStorage.removeItem("loggedInUser");
    checkLoginStatus();
}

function toggleDropdown() {
    let dropdown = document.getElementById("account-dropdown");
    dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
    
    let mobileDropdown = document.getElementById("mobile-account-dropdown");
    if (mobileDropdown) {
        mobileDropdown.style.display = mobileDropdown.style.display === "block" ? "none" : "block";
    }
}

// Close dropdowns when clicking outside
document.addEventListener("click", function (event) {
    let dropdown = document.getElementById("account-dropdown");
    let userIcon = document.getElementById("user-icon");
    let mobileDropdown = document.getElementById("mobile-account-dropdown");
    let mobileUserIcon = document.getElementById("mobile-user-icon");

    if (dropdown && userIcon) {
        if (!userIcon.contains(event.target) && !dropdown.contains(event.target)) {
            dropdown.style.display = "none";
        }
    }
    
    if (mobileDropdown && mobileUserIcon) {
        if (!mobileUserIcon.contains(event.target) && !mobileDropdown.contains(event.target)) {
            mobileDropdown.style.display = "none";
        }
    }
});

// Hide mobile dropdown on larger screens and close if resizing to larger screen
function handleScreenResize() {
    const mobileAccountContainer = document.getElementById("mobile-account-container");
    const mobileDropdown = document.getElementById("mobile-account-dropdown");

    function checkScreenSize() {
        if (window.innerWidth > 768) {
            if (mobileAccountContainer) mobileAccountContainer.style.display = "none";
            if (mobileDropdown) mobileDropdown.style.display = "none";
        } else {
            checkLoginStatus();
        }
    }

    window.addEventListener("resize", checkScreenSize);
    checkScreenSize();
}
