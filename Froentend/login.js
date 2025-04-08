// Storage for registered users
const users = [];

// Server credentials (for testing)
const serverValidUsername = "serverUser123";
const serverValidPassword = "serverPass123";

// Event listener for regular login form submission
document.getElementById("loginButton").addEventListener("click", function (event) {
    event.preventDefault();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
    const messageElement = document.getElementById("login-message");

    if (!username || !password) {
        showMessage(messageElement, "Username and password cannot be empty.", "red");
        return;
    }

    fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username, // assuming login by email
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            localStorage.setItem("loggedInUser", username);
            showMessage(messageElement, "Login successful! Redirecting...", "green");
            setTimeout(() => {
                window.location.href = "index.html";
            }, 1500);
        } else {
            showMessage(messageElement, data.message || "Invalid username or password", "red");
        }
    })
    .catch(error => {
        console.error('Login error:', error);
        showMessage(messageElement, "Server error during login.", "red");
    });
});

// Event listener for signup form submission
document.getElementById("signupButton").addEventListener("click", function (event) {
    event.preventDefault();
    const newUsername = document.getElementById("new-username").value.trim();
    const email = document.getElementById("email").value.trim();
    const newPassword = document.getElementById("new-password").value.trim();
    const dob = document.getElementById("dob").value;
    const signupMessageElement = document.getElementById("signup-message");

    

    // Validate inputs
    if (!newUsername || !email || !newPassword || !dob) {
        showMessage(signupMessageElement, "All fields must be filled out.", "red");
        return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
        showMessage(signupMessageElement, "Email must end with @gmail.com.", "red");
        return;
    }

    // Validate username format
    if (!isValidUsername(newUsername)) {
        showMessage(signupMessageElement, "Username must be 7 to 15 characters long and contain only letters and numbers.", "red");
        return;
    }

    // Validate password format
    if (!isValidPassword(newPassword)) {
        showMessage(signupMessageElement, "Password must start with a capital letter and be 6-15 characters long, including special characters.", "red");
        return;
    }

    // Check if username or email already exists
    const existingUser = users.find(user => user.username === newUsername || user.email === email);

    if (existingUser) {
        if (existingUser.username === newUsername) {
            showMessage(signupMessageElement, "Username already registered.", "red");
        } else if (existingUser.email === email) {
            showMessage(signupMessageElement, "Email already registered.", "red");
        }
    } else {
        // Save the new user
        fetch('http://localhost:5001/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: newUsername,
                email: email,
                password: newPassword,
                dob: dob
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                showMessage(signupMessageElement, "Signup successful! You can now log in.", "green");
                setTimeout(() => showLogin(), 1500); // Switch to login form
            } else {
                showMessage(signupMessageElement, data.message || "Signup failed.", "red");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showMessage(signupMessageElement, "Server error during signup.", "red");
        });
    }
});

// Event listener for server login form submission
document.getElementById("serverLoginButton").addEventListener("click", function (event) {
    event.preventDefault();
    const username = document.getElementById("server-username").value.trim();
    const password = document.getElementById("server-password").value.trim();
    const messageElement = document.getElementById("server-login-message");

    // Validate server credentials
    if (!username || !password) {
        showMessage(messageElement, "Server username and password cannot be empty.", "red");
        return;
    }

    if (username === serverValidUsername && password === serverValidPassword) {
        showMessage(messageElement, "Server Login successful!", "green");
    } else {
        showMessage(messageElement, "Invalid server username or password", "red");
    }
});

// Event listener for forgot password form submission
document.getElementById("resetButton").addEventListener("click", function (event) {
    event.preventDefault();
    const email = document.getElementById("forgot-email").value.trim();
    const dob = document.getElementById("forgot-dob").value;
    const forgotMessageElement = document.getElementById("forgot-message");

    // Validate email and date of birth
    if (!email || !dob) {
        showMessage(forgotMessageElement, "Email and date of birth cannot be empty.", "red");
        return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
        showMessage(forgotMessageElement, "Email must end with @gmail.com.", "red");
        return;
    }

    // Check if email and date of birth match
    const user = users.find(user => user.email === email && user.dob === dob);

    if (user) {
        showMessage(forgotMessageElement, "Password reset link sent to your email!", "green");
    } else {
        showMessage(forgotMessageElement, "Email or date of birth not recognized.", "red");
    }
});

// Helper function to validate email format
function isValidEmail(email) {
    return /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email);
}

// Helper function to validate username format
function isValidUsername(username) {
    return /^[a-zA-Z0-9]{7,15}$/.test(username); // Allows only alphanumeric characters and limits to 7-15 characters
}

// Helper function to validate password format
function isValidPassword(password) {
    return /^[A-Z][A-Za-z0-9!@#$%^&*()_+]{5,14}$/.test(password); // Must start with a capital letter and be 6-15 characters long
}

// Helper function to display messages
function showMessage(element, message, color) {
    element.textContent = message;
    element.style.color = color;
    element.style.transition = "opacity 0.3s ease";
    element.style.opacity = 1;
    setTimeout(() => {
        element.style.opacity = 0;
    }, 3000);
}

// Show login form
function showLogin() {
    document.getElementById("login-form").style.display = "block";
    document.getElementById("signup-form").style.display = "none";
    document.getElementById("server-login-form").style.display = "none";
    document.getElementById("forgot-password-form").style.display = "none";
}

// Show signup form
function showSignUp() {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("signup-form").style.display = "block";
    document.getElementById("server-login-form").style.display = "none";
    document.getElementById("forgot-password-form").style.display = "none";
}

// Show server login form
function showServerLogin() {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("signup-form").style.display = "none";
    document.getElementById("server-login-form").style.display = "block";
    document.getElementById("forgot-password-form").style.display = "none";
}

// Show forgot password form
function showForgotPassword() {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("signup-form").style.display = "none";
    document.getElementById("server-login-form").style.display = "none";
    document.getElementById("forgot-password-form").style.display = "block";
}

// Initial load - show login form
showLogin();


// Password Strength Checker
document.getElementById("new-password").addEventListener("input", function () {
    const password = this.value;
    const strengthText = document.getElementById("password-strength-text");
    const strength = checkPasswordStrength(password);
    strengthText.textContent = strength;
    strengthText.style.color = strength === "Weak" ? "#ff4444" : strength === "Medium" ? "#ff914d" : "#4CAF50";
});

function checkPasswordStrength(password) {
    if (password.length < 6) return "Weak";
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*()_+]/.test(password)) return "Strong";
    return "Medium";
}

// Social Login Placeholders
function loginWithGoogle() {
    alert("Google login functionality will be added soon!");
}

function loginWithFacebook() {
    alert("Facebook login functionality will be added soon!");
}












