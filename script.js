// script.js
const apiKey = "dd79e7fa0c55c26211061c00daf304a5"; // 🔑 Replace with your OpenWeatherMap API key

function getWeather() {
  const city = document.getElementById("cityInput").value.trim();
  const resultBox = document.getElementById("weatherResult");
  if (!city) {
    resultBox.innerHTML = "<p>Please enter a city name.</p>";
    return;
  }

  // Fetch current weather
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      if (data.cod !== 200) {
        resultBox.innerHTML = `<p>City not found.</p>`;
        return;
      }
      const iconUrl = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      resultBox.innerHTML = `
        <h2>${data.name}, ${data.sys.country}</h2>
        <img src="${iconUrl}" alt="${data.weather[0].description}" />
        <p><strong>Temperature:</strong> ${data.main.temp} °C</p>
        <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
        <p><strong>Condition:</strong> ${data.weather[0].description}</p>
        <h3>5-Day Forecast</h3>
        <div id="forecast" class="forecast-grid"></div>
      `;

      // Fetch 5-day forecast
      return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`);
    })
    .then(res => res && res.json())
    .then(forecastData => {
      if (!forecastData || !forecastData.list) return;
      const forecastDiv = document.getElementById("forecast");
      // Filter readings at 12:00:00 each day
      const daily = forecastData.list.filter(item => item.dt_txt.includes("12:00:00"));
      daily.forEach(day => {
        const date = new Date(day.dt_txt).toDateString();
        const icon = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
        forecastDiv.innerHTML += `
          <div class="forecast-card">
            <p><strong>${date}</strong></p>
            <img src="${icon}" alt="${day.weather[0].description}" />
            <p>${day.weather[0].description}</p>
            <p>${day.main.temp} °C</p>
          </div>
        `;
      });
    })
    .catch(() => {
      document.getElementById("weatherResult").innerHTML = "<p>Error fetching weather data.</p>";
    });
}
