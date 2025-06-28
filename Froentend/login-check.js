document.addEventListener("DOMContentLoaded", function () {
    checkLoginStatus();
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

        
        // Update mobile view
        if (mobileLoginBtn) mobileLoginBtn.style.display = "none";
        if (mobileAccountContainer) {
            mobileAccountContainer.style.display = "block";

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
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    checkLoginStatus();
}


