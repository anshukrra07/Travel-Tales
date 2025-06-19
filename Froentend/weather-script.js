const API_KEY = "7eee27b2db5b867e0c753f2ab5231d67";
let map, marker;

document.addEventListener('DOMContentLoaded', () => {
  loadRecentCities();
  document.getElementById('cityInput').focus();
  restoreVideoVolume();
});

document.addEventListener("DOMContentLoaded", () => {
  const city = new URLSearchParams(window.location.search).get("city");
  if (city) {
    document.getElementById("cityInput").value = city;
    getWeather(city);
  }
});

function getWeather(cityOverride = null) {
  const city = cityOverride || document.getElementById("cityInput").value.trim();
  if (!city) return showError("Please enter a city name");

  showLoading(true);
  clearError();
  document.getElementById("forecastContainer").style.display = "none";

  if (!cityOverride) saveRecentCity(city);

  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

  Promise.all([
    fetch(currentWeatherUrl).then(res => res.json()),
    fetch(forecastUrl).then(res => res.json())
  ])
  .then(([currentData, forecastData]) => {
    if (currentData.cod !== 200) throw new Error(currentData.message);
    if (forecastData.cod !== "200") throw new Error(forecastData.message);

    displayCurrentWeather(currentData);
    displayForecast(forecastData);
    displayHourlyForecast(forecastData);
    showMap(currentData.coord.lat, currentData.coord.lon);

    const weatherMain = currentData.weather[0].main.toLowerCase();
    const currentHour = new Date().getHours();
    const bgVideo = document.getElementById("backgroundVideo");
    const bgOverlay = document.getElementById("backgroundOverlay");

    bgOverlay.classList.add("video-loading");
    const newSrc = getBackgroundVideo(weatherMain, currentHour);

    const tempVideo = document.createElement('video');
    tempVideo.src = newSrc;
    tempVideo.preload = 'auto';
    tempVideo.muted = bgVideo.muted;
    tempVideo.onloadeddata = () => {
      bgVideo.src = newSrc;
      bgVideo.load();
      bgOverlay.classList.remove("video-loading");
    };
  })
  .catch(err => {
    showError(err.message);
  })
  .finally(() => {
    showLoading(false);
  });
}

function displayCurrentWeather(data) {
  const { name, sys, main, weather, wind, clouds, visibility, dt } = data;
  const sunrise = new Date(sys.sunrise * 1000).toLocaleTimeString();
  const sunset = new Date(sys.sunset * 1000).toLocaleTimeString();
  const lastUpdated = new Date(dt * 1000).toLocaleTimeString();

  const weatherIcon = getWeatherIcon(weather[0].id, new Date().getHours());
  
  document.getElementById("weatherDisplay").innerHTML = `
    <div class="weather-main">
      <h2>${name}, ${sys.country}</h2>
      <div class="weather-icon">${weatherIcon}</div>
      <div class="weather-temp">${Math.round(main.temp)}°C</div>
      <div class="weather-description">${weather[0].description}</div>
      <p>Feels like ${Math.round(main.feels_like)}°C</p>
    </div>
    <div class="weather-details">
      <div class="detail-item">
        <i class="fas fa-temperature-high detail-icon"></i>
        <div>
          <div>High: ${Math.round(main.temp_max)}°C</div>
          <div>Low: ${Math.round(main.temp_min)}°C</div>
        </div>
      </div>
      <div class="detail-item">
        <i class="fas fa-tint detail-icon"></i>
        <div>Humidity: ${main.humidity}%</div>
      </div>
      <div class="detail-item">
        <i class="fas fa-wind detail-icon"></i>
        <div>Wind: ${wind.speed} m/s</div>
      </div>
      <div class="detail-item">
        <i class="fas fa-cloud detail-icon"></i>
        <div>Clouds: ${clouds.all}%</div>
      </div>
      <div class="detail-item">
        <i class="fas fa-eye detail-icon"></i>
        <div>Visibility: ${visibility/1000} km</div>
      </div>
      <div class="detail-item">
        <i class="fas fa-sun detail-icon"></i>
        <div>
          <div>Sunrise: ${sunrise}</div>
          <div>Sunset: ${sunset}</div>
        </div>
      </div>
    </div>
    <div class="last-updated">Last updated: ${lastUpdated}</div>
  `;

  document.getElementById("weatherDisplay").style.display = "grid";
}

function displayForecast(data) {
  // Group forecast by day
  const dailyForecast = {};
  data.list.forEach(item => {
    const date = new Date(item.dt * 1000).toLocaleDateString();
    if (!dailyForecast[date]) {
      dailyForecast[date] = [];
    }
    dailyForecast[date].push(item);
  });

  // Get the next 5 days (excluding today)
  const forecastDays = Object.keys(dailyForecast).slice(1, 6);
  
  let forecastHTML = '<h2>5-Day Forecast</h2><div class="forecast-days">';
  
  forecastDays.forEach(day => {
    const dayData = dailyForecast[day];
    const dayName = new Date(day).toLocaleDateString('en-US', { weekday: 'short' });
    const dayTemp = dayData.reduce((acc, curr) => acc + curr.main.temp, 0) / dayData.length;
    const nightTemp = dayData[0].main.temp; // Assuming first item is night time
    
    // Find midday forecast for icon
    const middayForecast = dayData.find(item => {
      const hour = new Date(item.dt * 1000).getHours();
      return hour >= 11 && hour <= 14;
    }) || dayData[Math.floor(dayData.length / 2)];
    
    const weatherIcon = getWeatherIcon(middayForecast.weather[0].id, 12);
    
    forecastHTML += `
      <div class="forecast-day">
        <h3>${dayName}</h3>
        <div class="forecast-icon">${weatherIcon}</div>
        <div>${middayForecast.weather[0].description}</div>
        <div class="forecast-temp">
          <span class="forecast-high">${Math.round(dayTemp)}°</span>
          <span>${Math.round(nightTemp)}°</span>
        </div>
      </div>
    `;
  });
  
  forecastHTML += '</div>';
  document.getElementById("forecastContainer").innerHTML = forecastHTML;
  document.getElementById("forecastContainer").style.display = "grid";
}

function displayHourlyForecast(data) {
  const container = document.createElement('div');
  container.className = 'hourly-forecast';

  const nextHours = data.list.slice(0, 8); // next 24 hours (3-hour interval)
  container.innerHTML = '<h2>24-Hour Forecast</h2><div class="hourly-container">';

  nextHours.forEach(item => {
    const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const temp = Math.round(item.main.temp);
    const icon = getWeatherIcon(item.weather[0].id, new Date(item.dt * 1000).getHours());

    container.innerHTML += `
      <div class="hour-block">
        <div class="hour-time">${time}</div>
        <div class="hour-icon">${icon}</div>
        <div class="hour-temp">${temp}°C</div>
      </div>
    `;
  });

  container.innerHTML += '</div>';

  const forecastContainer = document.getElementById("forecastContainer");
  forecastContainer.insertAdjacentElement('afterbegin', container);
  forecastContainer.style.display = 'block';
}

// Keep existing utility and display functions unchanged.

function getWeatherIcon(weatherId, hour) {
  const isDayTime = hour > 6 && hour < 20;
  
  // Thunderstorm
  if (weatherId >= 200 && weatherId < 300) {
    return '<i class="fas fa-bolt"></i>';
  }
  // Drizzle
  else if (weatherId >= 300 && weatherId < 400) {
    return '<i class="fas fa-cloud-rain"></i>';
  }
  // Rain
  else if (weatherId >= 500 && weatherId < 600) {
    if (weatherId < 502) return '<i class="fas fa-cloud-rain"></i>';
    return '<i class="fas fa-cloud-showers-heavy"></i>';
  }
  // Snow
  else if (weatherId >= 600 && weatherId < 700) {
    return '<i class="far fa-snowflake"></i>';
  }
  // Atmosphere (mist, fog, etc.)
  else if (weatherId >= 700 && weatherId < 800) {
    return '<i class="fas fa-smog"></i>';
  }
  // Clear
  else if (weatherId === 800) {
    return isDayTime ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }
  // Clouds
  else if (weatherId > 800 && weatherId < 900) {
    if (weatherId === 801) return isDayTime ? '<i class="fas fa-cloud-sun"></i>' : '<i class="fas fa-cloud-moon"></i>';
    return '<i class="fas fa-cloud"></i>';
  }
  // Extreme or additional conditions
  else {
    return '<i class="fas fa-question"></i>';
  }
}

function showMap(lat, lon) {
  if (!map) {
    map = L.map('map').setView([lat, lon], 10);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    marker = L.marker([lat, lon]).addTo(map);
  } else {
    map.setView([lat, lon], 10);
    marker.setLatLng([lat, lon]);
  }
}

bgVideo.onerror = () => {
  console.warn("Video failed to load, using fallback image.");
  bgVideo.style.display = "none";
  document.getElementById("backgroundWrapper").style.backgroundImage = `url('https://images.pexels.com/photos/164024/pexels-photo-164024.jpeg?auto=compress&cs=tinysrgb&w=1200')`;
  document.getElementById("backgroundWrapper").style.backgroundSize = "cover";
  document.getElementById("backgroundWrapper").style.backgroundPosition = "center";
};


function getBackgroundVideo(weather, hour) {
  const isDay = hour >= 6 && hour < 17;
  const isEvening = hour >= 17 && hour < 20;
  const isNight = hour >= 20 || hour < 6;

  if (weather.includes("thunder")) {
    return "https://videos.pexels.com/video-files/6877513/6877513-hd_1920_1080_30fps.mp4";
  }

  if (weather.includes("rain")) {
    if (isNight) return "https://videos.pexels.com/video-files/7043616/7043616-hd_1280_720_25fps.mp4";
    if (isEvening) return "https://videos.pexels.com/video-files/5765474/5765474-uhd_2732_1366_24fps.mp4";
    return "https://videos.pexels.com/video-files/8549483/8549483-sd_640_360_25fps.mp4";
  }

  if (weather.includes("snow")) {
    return "https://videos.pexels.com/video-files/854856/854856-hd_1920_1080_24fps.mp4";
  }

  if (weather.includes("cloud")) {
    if (isNight) return "https://videos.pexels.com/video-files/3842236/3842236-hd_1920_1080_24fps.mp4";
    return "https://videos.pexels.com/video-files/4318100/4318100-uhd_2560_1440_30fps.mp4";
  }

  if (weather.includes("fog") || weather.includes("mist")) {
    return "https://videos.pexels.com/video-files/32494026/13855911_2560_1440_24fps.mp4";
  }

  if (weather.includes("clear")) {
    if (isNight) return "https://videos.pexels.com/video-files/856429/856429-uhd_2560_1440_30fps.mp4";
    if (isEvening) return "https://videos.pexels.com/video-files/1542008/1542008-hd_1920_1080_30fps.mp4";
    return "https://videos.pexels.com/video-files/854002/854002-hd_1920_1080_24fps.mp4";
  }

  return "https://videos.pexels.com/video-files/857027/857027-sd_640_360_30fps.mp4";
}

function showLoading(show) {
  document.getElementById('loading').style.display = show ? 'block' : 'none';
}

function showError(message) {
  const weatherDisplay = document.getElementById("weatherDisplay");
  weatherDisplay.innerHTML = `<div class="error"><i class="fas fa-exclamation-triangle"></i> ${message}</div>`;
  weatherDisplay.style.display = "block";
  document.getElementById("forecastContainer").style.display = "none";
}

function clearError() {
  const weatherDisplay = document.getElementById("weatherDisplay");
  if (weatherDisplay.querySelector('.error')) {
    weatherDisplay.innerHTML = '';
  }
}

function saveRecentCity(city) {
  let recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
  // Add city if not already in the list
  if (!recentCities.includes(city)) {
    recentCities.unshift(city); // Add to beginning
    // Keep only last 5 cities
    if (recentCities.length > 5) {
      recentCities = recentCities.slice(0, 5);
    }
    localStorage.setItem('recentCities', JSON.stringify(recentCities));
    loadRecentCities();
  }
}

function loadRecentCities() {
  const recentCities = JSON.parse(localStorage.getItem('recentCities')) || [];
  const datalist = document.getElementById('recentCities');
  datalist.innerHTML = '';
  recentCities.forEach(city => {
    const option = document.createElement('option');
    option.value = city;
    datalist.appendChild(option);
  });
}

// Theme toggle logic
const themeSwitch = document.getElementById("themeSwitch");
const savedTheme = localStorage.getItem("theme") || "dark";
document.body.classList.add(`${savedTheme}-theme`);
themeSwitch.checked = savedTheme === "light";

themeSwitch.addEventListener("change", () => {
  const theme = themeSwitch.checked ? "light" : "dark";
  document.body.classList.remove("light-theme", "dark-theme");
  document.body.classList.add(`${theme}-theme`);
  localStorage.setItem("theme", theme);
});

// Auto-detect location on page load
window.addEventListener("load", () => {
  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;
      getWeatherByCoords(latitude, longitude);
    }, error => {
      console.warn("Geolocation failed or denied. Using default city.");
      getWeather("Delhi"); // fallback
    });
  } else {
    console.warn("Geolocation not available. Using fallback.");
    getWeather("Delhi");
  }
});

function getWeatherByCoords(lat, lon) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const city = data.name;
      document.getElementById("cityInput").value = city;
      getWeather(city); // reuse the main function
    })
    .catch(err => {
      console.error("Error getting city from coords:", err);
    });
}












