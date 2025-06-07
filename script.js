const apiKey = '9b522dd6488a4b0eb8e30358250706';  // <-- Replace this with your actual API key

const form = document.getElementById('weatherForm');
const cityInput = document.getElementById('cityInput');
const errorMsg = document.getElementById('errorMsg');
const currentWeatherDiv = document.getElementById('currentWeather');
const forecastDiv = document.getElementById('forecast');

form.addEventListener('submit', e => {
  e.preventDefault();
  const city = cityInput.value.trim();
  if (!city) {
    showError('Please enter a city name');
    return;
  }
  fetchWeather(city);
});

function fetchWeather(city) {
  clearDisplay();
  errorMsg.textContent = '';

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`)
    .then(res => {
      if (!res.ok) {
        return res.json().then(data => {
          throw new Error(data.message || 'Failed to fetch current weather');
        });
      }
      return res.json();
    })
    .then(currentData => {
      displayCurrentWeather(currentData);
      return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`);
    })
    .then(res => {
      if (!res.ok) {
        return res.json().then(data => {
          throw new Error(data.message || 'Failed to fetch forecast');
        });
      }
      return res.json();
    })
    .then(forecastData => {
      const dailyForecasts = parseDailyForecasts(forecastData);
      displayForecast(dailyForecasts);
    })
    .catch(err => {
      showError(err.message);
    });
}

function displayCurrentWeather(data) {
  currentWeatherDiv.innerHTML = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png" alt="${data.weather[0].description}" />
    <p><strong>Temperature:</strong> ${data.main.temp.toFixed(1)} °C</p>
    <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
    <p><strong>Condition:</strong> ${capitalize(data.weather[0].description)}</p>
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
      // Pick forecast at midday if possible
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
  forecastDiv.innerHTML = '';
  dailyForecasts.forEach(day => {
    const div = document.createElement('div');
    div.classList.add('forecast-day');
    div.innerHTML = `
      <h4>${formatDate(day.date)}</h4>
      <img src="https://openweathermap.org/img/wn/${day.icon}@2x.png" alt="${day.weather}" />
      <p><strong>${day.temp} °C</strong></p>
      <p>${capitalize(day.weather)}</p>
    `;
    forecastDiv.appendChild(div);
  });
}

function showError(message) {
  errorMsg.textContent = message;
  currentWeatherDiv.innerHTML = '';
  forecastDiv.innerHTML = '';
}

function clearDisplay() {
  errorMsg.textContent = '';
  currentWeatherDiv.innerHTML = '';
  forecastDiv.innerHTML = '';
}

function formatDate(dateStr) {
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  const dateObj = new Date(dateStr);
  return dateObj.toLocaleDateString(undefined, options);
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
