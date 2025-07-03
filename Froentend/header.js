// Toggle mobile dropdown menu
document.addEventListener('DOMContentLoaded', () => {
    let menuIcon = document.getElementById('menu-icon');
    let navbar = document.querySelector('.navbar');

    handleScreenResize();

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

function redirectToAccount() {
    window.location.href = "account.html";
}


// Hide mobile dropdown on larger screens and close if resizing to larger screen
function handleScreenResize() {
    const mobileAccountContainer = document.getElementById("mobile-account-container");

    function checkScreenSize() {
        if (window.innerWidth > 768) {
            if (mobileAccountContainer) mobileAccountContainer.style.display = "none";

        } else {
            checkLoginStatus();
        }
    } 

    window.addEventListener("resize", checkScreenSize);
    checkScreenSize();
}




