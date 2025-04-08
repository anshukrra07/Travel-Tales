// Toggle mobile dropdown menu
document.addEventListener('DOMContentLoaded', () => {
    let menuIcon = document.getElementById('menu-icon');
    let navbar = document.querySelector('.navbar');

    menuIcon.addEventListener('click', function () {
        navbar.classList.toggle('open');
    });

    // Close menu when clicking outside
    document.addEventListener('click', function (event) {
        if (!navbar.contains(event.target) && event.target !== menuIcon) {
            navbar.classList.remove('open');
        }
    });
});

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



