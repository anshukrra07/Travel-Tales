const weatherAPIKey = "7eee27b2db5b867e0c753f2ab5231d67"; // 🔁 Replace with your OpenWeatherMap key


function fetchWeather(city) {
  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherAPIKey}&units=metric`;

  fetch(weatherUrl)
    .then(res => res.json())
    .then(data => {
      if (data.cod === 200) {
        document.getElementById("weather-city").textContent = city;
        document.getElementById("weather-temp").textContent = `${data.main.temp.toFixed(1)}°C`;
        document.getElementById("weather-condition").textContent = data.weather[0].description;
        document.getElementById("weather-icon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        document.getElementById("weather-icon").alt = data.weather[0].description;

        document.getElementById("weather-feelslike").textContent = `${data.main.feels_like.toFixed(1)}°C`;
        document.getElementById("weather-humidity").textContent = `${data.main.humidity}%`;
        document.getElementById("weather-wind").textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`; // convert m/s to km/h
      } else {
        document.getElementById("weather-info").innerHTML = `<p style="color:red;">❌ Weather not found for "${city}"</p>`;
      }
    })
    .catch(err => {
      console.error("Weather fetch error:", err);
      document.getElementById("weather-info").innerHTML = `<p style="color:red;">❌ Failed to load weather data.</p>`;
    });
}

function openWeatherPopup() {
 const city = document.getElementById("weather-city").textContent.trim();
  if (!city) return alert("City not found!");

  const url = `weather.html?city=${encodeURIComponent(city)}`;
  window.location.href = url;
}




