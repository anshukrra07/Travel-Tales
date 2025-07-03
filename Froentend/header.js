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


// Detect iOS device
const isIOS = /iPhone/.test(navigator.userAgent) && !window.MSStream;

if (isIOS) {
  const header = document.querySelector('header');
  const body = document.querySelector('body');

  // Adjust header padding (example: move header below notch/status bar)
  if (header) {
    header.style.paddingTop = '35px';  // Adjust as needed for header
  }

  // Adjust body padding (example: to avoid content underlap)
  if (body) {
    body.style.paddingTop = '25px';  // Adjust as needed for body content
  }
}


