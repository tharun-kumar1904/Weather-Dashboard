const apiKey = '35c2c03617934118aadcb0deca17d441';  // <-- Put your WeatherAPI.com API key here

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

async function fetchWeather(city) {
  clearDisplay();
  errorMsg.textContent = '';

  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=6&aqi=no&alerts=no`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error?.message || 'Failed to fetch weather data');
    }
    const data = await res.json();
    displayCurrentWeather(data);
    displayForecast(data.forecast.forecastday.slice(1, 6)); // next 5 days
  } catch (error) {
    showError(error.message);
  }
}

function displayCurrentWeather(data) {
  const c = data.current;
  currentWeatherDiv.innerHTML = `
    <h2>${data.location.name}, ${data.location.country}</h2>
    <img src="${c.condition.icon}" alt="${c.condition.text}" />
    <p><strong>Temperature:</strong> ${c.temp_c.toFixed(1)} °C</p>
    <p><strong>Humidity:</strong> ${c.humidity}%</p>
    <p><strong>Condition:</strong> ${c.condition.text}</p>
  `;
}

function displayForecast(forecastDays) {
  forecastDiv.innerHTML = '';
  forecastDays.forEach(day => {
    const dateStr = formatDate(day.date);
    const icon = day.day.condition.icon;
    const temp = day.day.avgtemp_c.toFixed(1);
    const condition = day.day.condition.text;

    const div = document.createElement('div');
    div.classList.add('forecast-day');
    div.innerHTML = `
      <h4>${dateStr}</h4>
      <img src="${icon}" alt="${condition}" />
      <p><strong>${temp} °C</strong></p>
      <p>${condition}</p>
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
