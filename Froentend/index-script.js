const destinations = [
    { name: "Mountain Hiking Tour", location: "Mountain Hiking Tour", image: "images/img1.jpg", rating: 4.5 },
    { name: "Machu Picchu, Peru", location: "Machu Picchu, Peru", image: "images/img2.jpg", rating: 4.8 },
    { name: "The Grand Canyon, Arizona", location: "The Grand Canyon, Arizona", image: "images/img3.jpg", rating: 4.7 },
    { name: "Mountain Bromo", location: "Mountain Bromo", image: "images/img4.jpg", rating: 4.6 },
    { name: "Serayu Rafting", location: "Serayu Rafting", image: "images/img5.jpg", rating: 4.3 },
    { name: "Curug Hiji Camp", location: "Curug Hiji Camp", image: "images/img6.jpg", rating: 4.2 },
    { name: "Bintang Hill", location: "Bintang Hill", image: "images/img7.jpg", rating: 4.1 },
    { name: "Statue of Liberty", location: "Statue of Liberty", image: "images/img8.jpg", rating: 4.9 },
    { name: "Taj Mahal", location: "Agra, India", image: "images/Taj-mahal.jpg", rating: 5.0 }
];

const categories = [
    { name: "Beach", image: "images/beach.jpg" },
    { name: "Desert", image: "images/desert.jpg" },
    { name: "Mountain", image: "images/mountain.jpg" },
    { name: "Temple", image: "images/temple.jpg" },
    { name: "Tower", image: "images/tower.jpg" },
    { name: "Pyramid", image: "images/pyramid.jpg" }
];

// open search bar and show prompt
function openSearchBar(event) {
    event.preventDefault(); // Stop the link from navigating anywhere

    let searchInput = document.getElementById("search-bar"); // Get the search bar
    let searchPrompt = document.getElementById("search-prompt"); // Get the prompt element

    if (searchInput) {
        // Scroll to the search bar smoothly
        searchInput.scrollIntoView({ behavior: "smooth" });

        // Focus on the input field
        searchInput.focus();

        // Show the prompt below the search bar
        if (searchPrompt) {
            searchPrompt.style.display = "block"; // Make the prompt visible
            searchPrompt.textContent = "Enter your destination to find the best travel options!"; // Set the prompt text

            // Fade-in the prompt
            setTimeout(() => {
                searchPrompt.style.opacity = "1";
            }, 10); // Small delay to trigger the transition

            // Hide the prompt after 3 seconds with fade-out
            setTimeout(() => {
                searchPrompt.style.opacity = "0"; // Start fade-out
                setTimeout(() => {
                    searchPrompt.style.display = "none"; // Hide after fade-out
                }, 500); // Match the duration of the fade-out transition
            }, 3000); // 3 seconds
        }

        // Hide the prompt when the user starts typing
        searchInput.addEventListener("input", () => {
            if (searchPrompt) {
                searchPrompt.style.opacity = "0"; // Start fade-out
                setTimeout(() => {
                    searchPrompt.style.display = "none"; // Hide after fade-out
                }, 500); // Match the duration of the fade-out transition
            }
        });

        // Add animation to the button
        const bookTripButton = event.target; // Get the clicked button
        bookTripButton.classList.add("button-clicked"); // Add animation class
        setTimeout(() => {
            bookTripButton.classList.remove("button-clicked"); // Remove animation class after 0.5s
        }, 500);
    } else {
        console.error("Search bar not found!");
    }
}


function loadCategories() {
    let container = document.querySelector('.categories-content');
    container.innerHTML = '';
    container.style.display = 'flex';
    container.style.overflowX = 'auto';
    container.style.scrollBehavior = 'smooth';

    categories.forEach(cat => {
        let div = document.createElement('div');
        div.classList.add('row');
        div.setAttribute("data-category", cat.name); // ✅ Add data-category attribute

        div.innerHTML = `
            <a href="search-results.html?query=${encodeURIComponent(cat.name)}" class="category-link">
                <div class="row-img">
                    <img src="${cat.image}" alt="${cat.name}">
                </div>
                <h4>${cat.name}</h4>
            </a>
        `;

        container.appendChild(div);
    });
}

function loadDestinations() {
    let container = document.querySelector('.destination-content');
    container.innerHTML = '';

    destinations.forEach(dest => {
        let box = document.createElement('div');
        box.classList.add('box');
        box.innerHTML = `
            <a href="nearby-place.html?destination=${encodeURIComponent(dest.name)}&name=${encodeURIComponent(dest.name)}&image=${encodeURIComponent(dest.image)}&address=${encodeURIComponent(dest.location)}&rating=${encodeURIComponent(dest.rating)}">
                <img src="${dest.image}" alt="${dest.name}">
                <h4>${dest.name}</h4>
                <h6>${dest.location}</h6>
                <div class="row">
                    <p><b>⭐ ${dest.rating}/5</b></p>
                    <a href="#" class="button view-details" 
                        data-name="${dest.name}" 
                        data-location="${dest.location}" 
                        data-image="${dest.image}" 
                        data-rating="${dest.rating}">Visit</a>
                </div>
            </a>
        `;
        container.appendChild(box);
    });

    // ✅ Add Click Event to "View Details" Button with Rating
    document.querySelectorAll(".view-details").forEach(button => {
        button.addEventListener("click", function (event) {
            event.preventDefault(); // Prevent default link behavior

            const name = encodeURIComponent(this.getAttribute("data-name"));
            const location = encodeURIComponent(this.getAttribute("data-location"));
            const image = encodeURIComponent(this.getAttribute("data-image"));
            const rating = encodeURIComponent(this.getAttribute("data-rating"));

            // ✅ Redirect to `nearby-place.html` with full details in URL
            window.location.href = `nearby-place.html?name=${name}&image=${image}&address=${location}&rating=${rating}`;
        });
    });
}



document.addEventListener('DOMContentLoaded', () => {
    loadDestinations();
    loadCategories();
});









