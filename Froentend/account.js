  const token = localStorage.getItem("token");

  if (!token) {
    alert("You are not logged in.");
    window.location.href = "login.html";
  }

  fetch(`${BACKEND_URL}/api/auth/me`,{
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
  .then(res => {
    if (!res.ok) throw new Error("Unauthorized");
    return res.json();
  })
  .then(data => {
    const user = data.user;
    document.getElementById("sidebar-username").textContent = user.username;
    document.getElementById("sidebar-email").textContent = user.email;
    document.getElementById("username").textContent = user.username || "N/A";
    document.getElementById("email").textContent = user.email || "N/A";
    document.getElementById("dob").textContent = user.dob
      ? new Date(user.dob).toLocaleDateString()
      : "Not provided";
    document.getElementById("createdAt").textContent = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString()
      : "Not available";
  })
  .catch(err => {
    console.error("Fetch error:", err);
    alert("Session expired or invalid token. Please login again.");
    localStorage.clear();
    window.location.href = "login.html";
  });

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('loggedInUser');
    window.location.href = "index.html";
    checkLoginStatus();
  }








// console.log("account.js loaded");

// document.addEventListener('DOMContentLoaded', function () {
//     const token = localStorage.getItem('token');
//     console.log("Token:", token);

//     if (!token) {
//         // Redirect to login if token is missing
//         // window.location.href = 'login.html';
//         return;
//     }

//     // Fetch user-related data
//     fetchUserData();
//     loadFavorites();
//     loadBookingHistory();
// });

// function fetchUserData() {
//     const token = localStorage.getItem('token'); // ✅ fixed key

//     fetch(`${BACKEND_URL}/api/auth/me`, {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${token}`
//         }
//     })
//     .then(response => {
//         if (!response.ok) {
//             console.log("Status:", response.status); // ✅ now reachable
//             throw new Error('Failed to fetch user data');
//         }
//         return response.json();
//     })
//     .then(data => {
//         if (data.status === 'success') {
//             displayUserData(data.user);
//             console.log("User data:", data);
//         } else {
//             throw new Error(data.message || 'Failed to fetch user data');
//         }
//     })
//     .catch(error => {
//         console.error('Error:', error);
//         alert('Error fetching user data. Please login again.');
//         logout();
//     });
// }

// function displayUserData(user) {
//     document.getElementById('account-username').textContent = user.username || 'N/A';
//     document.getElementById('account-email').textContent = user.email || 'N/A';

//     document.getElementById('profile-username').textContent = user.username || 'N/A';
//     document.getElementById('profile-email').textContent = user.email || 'N/A';

//     if (user.dob) {
//         const dobDate = new Date(user.dob);
//         document.getElementById('profile-dob').textContent = dobDate.toLocaleDateString();
//     } else {
//         document.getElementById('profile-dob').textContent = 'Not provided';
//     }

//     if (user.createdAt) {
//         const createdDate = new Date(user.createdAt);
//         document.getElementById('profile-created').textContent = createdDate.toLocaleDateString();
//     } else {
//         document.getElementById('profile-created').textContent = 'Not available';
//     }
// }

// function loadFavorites() {
//     const token = localStorage.getItem('token');

//     fetch(`${BACKEND_URL}/api/user/favorites`, {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${token}`
//         }
//     })
//     .then(response => response.json())
//     .then(data => {
//         const favoritesList = document.getElementById('favorites-list');
//         favoritesList.innerHTML = '';

//         if (data.status !== 'success' || !Array.isArray(data.favorites)) {
//             favoritesList.innerHTML = '<p>Failed to load favorites.</p>';
//             return;
//         }

//         if (data.favorites.length === 0) {
//             favoritesList.innerHTML = '<p>You have no favorite places yet.</p>';
//             return;
//         }

//         data.favorites.forEach(place => {
//             const placeElement = document.createElement('div');
//             placeElement.className = 'place-item';
//             placeElement.innerHTML = `
//                 <h3>${place.name}</h3>
//                 <p>${place.location}</p>
//                 <button onclick="removeFavorite('${place._id}')">Remove</button>
//             `;
//             favoritesList.appendChild(placeElement);
//         });
//     })
//     .catch(error => {
//         console.error('Error loading favorites:', error);
//     });
// }

// function loadBookingHistory() {
//     const token = localStorage.getItem('token');

//     fetch(`${BACKEND_URL}/api/user/bookings`, {
//         method: 'GET',
//         headers: {
//             'Authorization': `Bearer ${token}`
//         }
//     })
//     .then(response => response.json())
//     .then(data => {
//         const historyList = document.getElementById('history-list');
//         historyList.innerHTML = '';

//         if (data.status !== 'success' || !Array.isArray(data.bookings)) {
//             historyList.innerHTML = '<p>Failed to load bookings.</p>';
//             return;
//         }

//         if (data.bookings.length === 0) {
//             historyList.innerHTML = '<p>You have no booking history yet.</p>';
//             return;
//         }

//         data.bookings.forEach(booking => {
//             const bookingDate = new Date(booking.date);
//             const formattedDate = bookingDate.toLocaleDateString();

//             const bookingElement = document.createElement('div');
//             bookingElement.className = 'booking-item';
//             bookingElement.innerHTML = `
//                 <div class="booking-header">
//                     <h3>${booking.destination}</h3>
//                     <span class="booking-date">${formattedDate}</span>
//                 </div>
//                 <div class="booking-details">
//                     <p>Type: ${booking.type}</p>
//                     <p>Status: ${booking.status}</p>
//                 </div>
//             `;
//             historyList.appendChild(bookingElement);
//         });
//     })
//     .catch(error => {
//         console.error('Error loading booking history:', error);
//     });
// }

// function showSection(sectionId) {
//     // Update active sidebar item
//     document.querySelectorAll('.account-nav li').forEach(item => {
//         item.classList.remove('active');
//     });
//     document.querySelector(`.account-nav li[onclick="showSection('${sectionId}')"]`).classList.add('active');

//     // Show selected content section
//     document.querySelectorAll('.content-section').forEach(section => {
//         section.style.display = 'none';
//     });
//     document.getElementById(`${sectionId}-section`).style.display = 'block';
// }

// function logout() {
//     localStorage.removeItem('token');
//     localStorage.removeItem('loggedInUser');
//     // window.location.href = 'login.html';
// }
