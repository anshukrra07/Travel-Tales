let photoUrls = [];
let currentIndex = -1;
let hideTimeout;

const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const mainImage = document.getElementById("place-image");
const defaultImageSrc = mainImage.src;

// Function to fetch photos from Pexels
async function fetchPexelsPhotos(query) {
    const apiKey = "6GUi9qGWyNrsy9WyXGwEKWAOjQQob2SSaQEzp6AGXerQlOMDgSLn5eoq";
    const perPage = 50;
    const url = `https://api.pexels.com/v1/search?query=${query}&per_page=${perPage}`;

    try {
        const response = await fetch(url, {
            headers: { Authorization: apiKey }
        });

        if (!response.ok) {
            console.error("Failed to fetch photos:", response.statusText);
            return [];
        }

        const data = await response.json();
        return data.photos.map(photo => photo.src.large2x);
    } catch (error) {
        console.error("Error fetching photos from Pexels:", error);
        return [];
    }
}

// Function to display photos in the gallery
function displayPhotos(photos) {
    const galleryContainer = document.getElementById("photo-gallery-container");
    galleryContainer.innerHTML = ""; 

    if (photos.length === 0) {
        galleryContainer.innerHTML = "<p>No photos available for this destination.</p>";
        return;
    }

    photoUrls = photos;

    photos.forEach((photoUrl, index) => {
        const img = document.createElement("img");
        img.src = photoUrl;
        img.alt = "Destination Photo";
        img.classList.add("gallery-image");

        img.addEventListener("click", () => {
            mainImage.src = photoUrl;
            currentIndex = index;
            resetHideTimeout();
        });

        galleryContainer.appendChild(img);
    });
}

// Function to navigate images
function changeImage(direction) {
    if (photoUrls.length === 0) return;

    if (direction === "next") {
        currentIndex = (currentIndex + 1) % (photoUrls.length + 1);
    } else if (direction === "prev") {
        currentIndex = (currentIndex - 1 + (photoUrls.length + 1)) % (photoUrls.length + 1);
    }

    mainImage.src = currentIndex === -1 || currentIndex === photoUrls.length ? defaultImageSrc : photoUrls[currentIndex];
    resetHideTimeout();
}

// Hide navigation buttons after 5 seconds
function hideNavButtons() {
    prevBtn.style.opacity = "0";
    nextBtn.style.opacity = "0";
}

// Show navigation buttons and reset hide timeout
function resetHideTimeout() {
    clearTimeout(hideTimeout);
    prevBtn.style.opacity = "1";
    nextBtn.style.opacity = "1";
    hideTimeout = setTimeout(hideNavButtons, 2000);
}

// Show buttons only when hovering over them
prevBtn.addEventListener("mouseenter", () => {
    prevBtn.style.opacity = "1";
    resetHideTimeout();
});

nextBtn.addEventListener("mouseenter", () => {
    nextBtn.style.opacity = "1";
    resetHideTimeout();
});

// Hide buttons when not hovering
prevBtn.addEventListener("mouseleave", () => {
    hideTimeout = setTimeout(hideNavButtons, 250);
});

nextBtn.addEventListener("mouseleave", () => {
    hideTimeout = setTimeout(hideNavButtons, 250);
});

// Handle keyboard navigation (Arrow Left & Right)
document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
        changeImage("next");
    } else if (event.key === "ArrowLeft") {
        changeImage("prev");
    }
    resetHideTimeout();
});

// Handle swipe navigation (touch + mouse drag)
let startX = 0;
let endX = 0;

mainImage.addEventListener("touchstart", (event) => {
    startX = event.touches[0].clientX;
});

mainImage.addEventListener("touchend", (event) => {
    endX = event.changedTouches[0].clientX;
    handleSwipe();
    resetHideTimeout();
});

let isDragging = false;

mainImage.addEventListener("mousedown", (event) => {
    isDragging = true;
    startX = event.clientX;
    resetHideTimeout();
});

document.addEventListener("mouseup", () => {
    isDragging = false;
});

document.addEventListener("mousemove", (event) => {
    if (isDragging) {
        endX = event.clientX;
        handleSwipe();
        isDragging = false;
    }
});

function handleSwipe() {
    const swipeThreshold = 50;
    if (startX - endX > swipeThreshold) {
        changeImage("next");
    } else if (endX - startX > swipeThreshold) {
        changeImage("prev");
    }
}

// Update the DOMContentLoaded event listener
document.addEventListener("DOMContentLoaded", async function () {
    const urlParams = new URLSearchParams(window.location.search);
    const placeName = urlParams.get("name") || "Dynamic Destination";

    const photos = await fetchPexelsPhotos(placeName);
    displayPhotos(photos);

    prevBtn.addEventListener("click", () => changeImage("prev"));
    nextBtn.addEventListener("click", () => changeImage("next"));
});