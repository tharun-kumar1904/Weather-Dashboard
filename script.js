const apiKey = "dd79e7fa0c55c26211061c00daf304a5"; // 🔑 Replace with your actual OpenWeatherMap API key

function getWeather() {
  const city = document.getElementById("cityInput").value;
  const resultBox = document.getElementById("weatherResult");

  if (!city) {
    resultBox.innerHTML = "<p>Please enter a city name.</p>";
    return;
  }

  // Current weather
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`)
    .then((response) => response.json())
    .then((data) => {
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

      // Forecast
      fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`)
        .then((res) => res.json())
        .then((forecastData) => {
          const forecastDiv = document.getElementById("forecast");
          forecastDiv.innerHTML = "";

          // Filter 12:00:00 entries
          const dailyData = forecastData.list.filter(item => item.dt_txt.includes("12:00:00"));

          dailyData.forEach(day => {
            const date = new Date(day.dt_txt);
            const icon = day.weather[0].icon;
            const description = day.weather[0].description;

            forecastDiv.innerHTML += `
              <div class="forecast-card">
                <p><strong>${date.toDateString()}</strong></p>
                <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" />
                <p>${description}</p>
                <p>${day.main.temp} °C</p>
              </div>
            `;
          });
        });
    })
    .catch(() => {
      resultBox.innerHTML = "<p>Error fetching weather data.</p>";
    });
}
