const apiKey = '1dc78ac7acc94112909fc4cc594fe14b';  // <-- Replace this with your actual API key

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

  // Get current + 5-day forecast from WeatherAPI
  fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=6`)
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch weather data');
      return res.json();
    })
    .then(data => {
      displayCurrentWeather(data);
      const next5Days = data.forecast.forecastday.slice(1, 6); // skip today
      displayForecast(next5Days);
    })
    .catch(err => {
      showError(err.message);
    });
}

function displayCurrentWeather(data) {
  const current = data.current;
  const location = data.location;
  currentWeatherDiv.innerHTML = `
    <h2>${location.name}, ${location.country}</h2>
    <img src="${current.condition.icon}" alt="${current.condition.text}" />
    <p><strong>Temperature:</strong> ${current.temp_c} °C</p>
    <p><strong>Humidity:</strong> ${current.humidity}%</p>
    <p><strong>Condition:</strong> ${current.condition.text}</p>
    <p><strong>Local Time:</strong> ${location.localtime}</p>
  `;
}

function displayForecast(days) {
  forecastDiv.innerHTML = '';
  days.forEach(day => {
    const div = document.createElement('div');
    div.classList.add('forecast-day');
    div.innerHTML = `
      <h4>${formatDate(day.date)}</h4>
      <img src="${day.day.condition.icon}" alt="${day.day.condition.text}" />
      <p><strong>${day.day.avgtemp_c} °C</strong></p>
      <p>${day.day.condition.text}</p>
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
  return new Date(dateStr).toLocaleDateString(undefined, options);
}
