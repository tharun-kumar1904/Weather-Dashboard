const apiKey = 'YOUR_API_KEY_HERE'; // Replace with your OpenWeatherMap API key

document.getElementById('getWeatherBtn').addEventListener('click', () => {
  const city = document.getElementById('cityInput').value.trim();
  if (!city) {
    alert('Please enter a city name');
    return;
  }
  fetchWeather(city);
});

function fetchWeather(city) {
  clearDisplay();
  // Fetch current weather
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
    .then(res => {
      if (!res.ok) throw new Error('City not found');
      return res.json();
    })
    .then(currentData => {
      displayCurrentWeather(currentData);
      // Fetch 5-day forecast
      return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
    })
    .then(res => res.json())
    .then(forecastData => {
      const dailyForecasts = parseDailyForecasts(forecastData);
      displayForecast(dailyForecasts);
    })
    .catch(err => {
      showError(err.message);
    });
}

function displayCurrentWeather(data) {
  const container = document.getElementById('currentWeather');
  container.innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}" />
    <p><strong>Temperature:</strong> ${data.main.temp.toFixed(1)} °C</p>
    <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
    <p><strong>Condition:</strong> ${data.weather[0].description}</p>
  `;
}

function parseDailyForecasts(data) {
  const daily = {};
  data.list.forEach(item => {
    const date = item.dt_txt.split(' ')[0];
    if (!daily[date]) daily[date] = [];
    daily[date].push(item);
  });

  const today = new Date().toISOString().split('T')[0];
  return Object.keys(daily)
    .filter(date => date !== today)
    .slice(0, 5)
    .map(date => {
      // Pick forecast closest to midday 12:00:00
      const midday = daily[date].find(f => f.dt_txt.includes('12:00:00')) || daily[date][0];
      return {
        date,
        temp: midday.main.temp.toFixed(1),
        weather: midday.weather[0].description,
        icon: midday.weather[0].icon,
      };
    });
}

function displayForecast(dailyForecasts) {
  const container = document.getElementById('forecast');
  container.innerHTML = '';
  dailyForecasts.forEach(day => {
    const div = document.createElement('div');
    div.classList.add('forecast-day');
    div.innerHTML = `
      <h4>${day.date}</h4>
      <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="${day.weather}" />
      <p><strong>${day.temp} °C</strong></p>
      <p>${day.weather}</p>
    `;
    container.appendChild(div);
  });
}

function clearDisplay() {
  document.getElementById('currentWeather').innerHTML = '';
  document.getElementById('forecast').innerHTML = '';
}

function showError(message) {
  clearDisplay();
  document.getElementById('currentWeather').innerHTML = `<p style="color:red; text-align:center;">${message}</p>`;
}
