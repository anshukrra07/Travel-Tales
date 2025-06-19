let photoUrls = [];
let currentIndex = -1;
let hideTimeout;

// Zoom and drag variables
let isDragging = false;
let startX = 0, startY = 0;
let translateX = 0, translateY = 0;
let currentScale = 1;
let lastTap = 0;
let animationFrameId = null
let initialDistance = null;
let isPinching = false;
let enableSwipe = true;

const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const mainImage = document.getElementById("place-image");
const defaultImageSrc = mainImage.src;
const popupImage = document.getElementById("popup-image");

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
            openImagePopupFromGallery();
            resetZoom(); // Reset zoom when opening new image
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

// Update image transform with boundaries
function updateImageTransform() {
    const img = document.getElementById("popup-image");
    const container = document.querySelector(".image-popup-content");
    
    // Cancel any pending animation frame
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    // Smooth transform update using requestAnimationFrame
    animationFrameId = requestAnimationFrame(() => {
        if (currentScale > 1) {
            const imgRect = img.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            
            // Calculate maximum translation (1/2 of overflow)
            const maxX = Math.max(0, (imgRect.width * currentScale - containerRect.width) / 2);
            const maxY = Math.max(0, (imgRect.height * currentScale - containerRect.height) / 2);
            
            // Apply boundaries with easing
            translateX = Math.min(Math.max(translateX, -maxX), maxX);
            translateY = Math.min(Math.max(translateY, -maxY), maxY);
        } else {
            // Smoothly return to center when zoomed out
            translateX = lerp(translateX, 0, 0.2);
            translateY = lerp(translateY, 0, 0.2);
        }
        
        img.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentScale})`;
    });
}

// Linear interpolation for smooth transitions
function lerp(start, end, t) {
    return start * (1 - t) + end * t;
}


// Setup drag event listeners
function setupDrag() {
    const img = document.getElementById("popup-image");
    
    img.addEventListener('mousedown', (e) => {
        if (currentScale <= 1) return;
        
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        img.style.cursor = 'grabbing';
        img.style.transition = 'none'; // Disable transition during drag
        e.preventDefault();
    });

    const handleMove = (clientX, clientY) => {
        if (!isDragging) return;
        
        // Calculate movement with sub-pixel precision
        const dx = clientX - startX - translateX;
        const dy = clientY - startY - translateY;
        
        // Apply movement with momentum (0.9 creates smooth deceleration)
        translateX = (clientX - startX) * 0.9;
        translateY = (clientY - startY) * 0.9;
        
        updateImageTransform();
    };

    document.addEventListener('mousemove', (e) => {
        handleMove(e.clientX, e.clientY);
        e.preventDefault();
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            img.style.cursor = 'grab';
            img.style.transition = 'transform 0.2s ease-out';
            
            // Apply boundaries after drag ends
            setTimeout(updateImageTransform, 10);
        }
    });

    // Touch event handlers
    img.addEventListener('touchstart', (e) => {
        if (currentScale <= 1) return;
        
        isDragging = true;
        startX = e.touches[0].clientX - translateX;
        startY = e.touches[0].clientY - translateY;
        img.style.cursor = 'grabbing';
        img.style.transition = 'none';
        e.preventDefault();
    });

    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            handleMove(e.touches[0].clientX, e.touches[0].clientY);
            e.preventDefault();
        }
    });

    document.addEventListener('touchend', () => {
        if (isDragging) {
            isDragging = false;
            img.style.cursor = 'grab';
            img.style.transition = 'transform 0.2s ease-out';
            setTimeout(updateImageTransform, 10);
        }
    });
}

// Handle zoom with wheel
function handleZoom(e) {
    e.preventDefault();
    const img = document.getElementById("popup-image");
    const container = document.querySelector(".image-popup-content");
    
    // Get mouse position relative to container
    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Normalized position (0-1)
    const normX = mouseX / rect.width;
    const normY = mouseY / rect.height;
    
    // Current image dimensions
    const imgRect = img.getBoundingClientRect();
    const imgWidth = imgRect.width;
    const imgHeight = imgRect.height;
    
    // Zoom direction and intensity
    const zoomIntensity = 0.15;
    const direction = e.deltaY > 0 ? -1 : 1;
    const prevScale = currentScale;
    
    // Calculate new scale with clamping
    currentScale = Math.min(Math.max(1, currentScale + direction * zoomIntensity * currentScale), 3);
    
    // Only adjust position if we're zooming in/out (not at limits)
    if (currentScale > 1 && currentScale < 3) {
        // Calculate focal point in image coordinates
        const focalX = normX * imgWidth - imgWidth/2;
        const focalY = normY * imgHeight - imgHeight/2;
        
        // Adjust translation to maintain focal point
        translateX += focalX * (1 - currentScale/prevScale);
        translateY += focalY * (1 - currentScale/prevScale);
    }
    
    updateImageTransform();
}

function toggleZoom() {
    if (currentScale === 1) {
        // Zoom in to 2x at center
        currentScale = 2;
        translateX = 0;
        translateY = 0;
    } else {
        // Zoom out smoothly
        currentScale = 1;
    }
    updateImageTransform();
}

function resetZoom() {
    currentScale = 1;
    translateX = 0;
    translateY = 0;
    updateImageTransform();
}

// Open modal with current image
function openImagePopup() {
    if (currentIndex === -1 || !photoUrls[currentIndex]) return;
    popupImage.src = photoUrls[currentIndex];
    document.getElementById("image-popup").style.display = "block";
    resetZoom();
}

function showNextImage() {
    if (photoUrls.length === 0) return;
    currentIndex = (currentIndex + 1) % photoUrls.length;
    popupImage.src = photoUrls[currentIndex];
    mainImage.src = photoUrls[currentIndex];
    resetZoom();
}

function showPrevImage() {
    if (photoUrls.length === 0) return;
    currentIndex = (currentIndex - 1 + photoUrls.length) % photoUrls.length;
    popupImage.src = photoUrls[currentIndex];
    mainImage.src = photoUrls[currentIndex];
    resetZoom();
}

// Close modal
function closeImagePopup() {
    document.getElementById("image-popup").style.display = "none";
}

function openImagePopupFromGallery() {
    if (photoUrls.length === 0 || currentIndex < 0) return;
    popupImage.src = photoUrls[currentIndex];
    document.getElementById("image-popup").style.display = "block";
    resetZoom();
}

// Event listeners for swipe navigation
popupImage.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
        // Pinch zoom start
        isPinching = true;
        enableSwipe = false;
        initialDistance = getDistance(e.touches[0], e.touches[1]);
        e.preventDefault();
    } else if (currentScale <= 1) {
        // Single touch - prepare for swipe
        touchStartX = e.touches[0].clientX;
        enableSwipe = true;
    }
});

popupImage.addEventListener('touchmove', (e) => {
    if (isPinching && e.touches.length === 2) {
        // Handle pinch zoom
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / initialDistance;
        
        // Calculate new scale with limits
        const newScale = Math.min(Math.max(1, currentScale * scale), 3);
        
        // Only update if scale changed significantly
        if (Math.abs(newScale - currentScale) > 0.01) {
            currentScale = newScale;
            updateImageTransform();
        }
        e.preventDefault();
    } else if (enableSwipe && currentScale <= 1 && e.touches.length === 1) {
        // Handle swipe navigation only when not zoomed
        const touchEndX = e.touches[0].clientX;
        const swipeDistance = touchEndX - touchStartX;
        
        if (Math.abs(swipeDistance) > 30) {
            if (swipeDistance > 0) {
                showPrevImage();
            } else {
                showNextImage();
            }
            touchStartX = touchEndX;
        }
    }
});

popupImage.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
        isPinching = false;
        
        // Re-enable swipe after 300ms if not zoomed
        if (currentScale <= 1) {
            setTimeout(() => {
                enableSwipe = true;
            }, 300);
        }
    }
});

// Helper function to calculate distance between two touches
function getDistance(touch1, touch2) {
    return Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
    );
}


// Keyboard navigation
document.addEventListener("keydown", function(e) {
    const popup = document.getElementById("image-popup");
    if (popup.style.display === "block") {
        if (e.key === "ArrowRight") {
            showNextImage();
        } else if (e.key === "ArrowLeft") {
            showPrevImage();
        } else if (e.key === "Escape") {
            closeImagePopup();
        } else if (e.key === "0") {
            resetZoom();
        }
    }
});

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", async function() {
    try {
        // Ensure elements exist before setting up
        const popupImage = document.getElementById("popup-image");
        if (!popupImage) {
            throw new Error("Popup image element not found");
        }

        // Setup drag functionality first
        setupDrag();
        
        // Mouse wheel zoom with proper passive handling
        popupImage.addEventListener('wheel', handleZoom, { passive: false });

        // Improved double-tap zoom for mobile
        let lastTapTime = 0;
        popupImage.addEventListener('touchend', function(e) {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTapTime;
            
            // Only register as double-tap if:
            // 1. It's within 300ms of previous tap
            // 2. Finger didn't move much (not a swipe)
            if (tapLength < 300 && 
                Math.abs(e.changedTouches[0].clientX - touchStartX) < 10) {
                toggleZoom();
                e.preventDefault();
            }
            lastTapTime = currentTime;
        });

        // Load and display photos
        const urlParams = new URLSearchParams(window.location.search);
        const placeName = urlParams.get("name") || "Dynamic Destination";
        
        const photos = await fetchPexelsPhotos(placeName);
        if (!photos || photos.length === 0) {
            console.warn("No photos found for:", placeName);
        }
        displayPhotos(photos);

        // Button event listeners with null checks
        const prevBtn = document.getElementById("prev-btn");
        const nextBtn = document.getElementById("prev-btn");
        const mainImage = document.getElementById("place-image");
        
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener("click", () => changeImage("prev"));
            nextBtn.addEventListener("click", () => changeImage("next"));
        } else {
            console.warn("Navigation buttons not found");
        }
        
        if (mainImage) {
            mainImage.addEventListener("click", openImagePopup);
        }

        // Reset zoom when new image loads
        popupImage.addEventListener('load', resetZoom);

    } catch (error) {
        console.error("Initialization error:", error);
        // Fallback UI or error message
        document.getElementById("photo-gallery-container").innerHTML = 
            `<p class="error-message">Unable to load gallery. Please try again later.</p>`;
    }
});

// Prevent default image drag behavior
popupImage.addEventListener("dragstart", (e) => e.preventDefault());