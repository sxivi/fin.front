const API_KEY = '33a1d83dd2281a8aabdb684caa9449bc'; 

// --- DOM Elements ---
const searchBtn = document.getElementById('searchBtn');
const cityInput = document.getElementById('cityInput');
const resultContainer = document.getElementById('resultContainer');
const header = document.getElementById('mainHeader');

// --- 1. LOCAL STORAGE (Cookie Banner) ---
const cookieBanner = document.getElementById('cookieBanner');

if (!localStorage.getItem('cookiesAccepted')) {
    cookieBanner.classList.remove('hidden');
}
document.getElementById('acceptCookies').addEventListener('click', () => {
    localStorage.setItem('cookiesAccepted', 'true');
    cookieBanner.classList.add('hidden');
});


const themeToggle = document.getElementById('themeToggle');

// Check local storage to see if they previously chose dark mode
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.innerText = "☀️ Light Mode";
}

// Toggle logic
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    // Check if dark mode is currently active
    if (document.body.classList.contains('dark-mode')) {
        themeToggle.innerText = "☀️ Light Mode";
        localStorage.setItem('theme', 'dark'); // Save preference
    } else {
        themeToggle.innerText = "🌑 Dark Mode";
        localStorage.setItem('theme', 'light'); // Save preference
    }
});


// --- 4. API FETCH LOGIC ---
searchBtn.addEventListener('click', async () => {
    const city = cityInput.value;
    if (city === "") return alert("Please enter a city.");

    try {
        searchBtn.innerText = "Loading...";

        // A. Get Coordinates
        let geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`);
        let geoData = await geoRes.json();
        let lat = geoData[0].lat;
        let lon = geoData[0].lon;

        // B. Get Temperature
        let weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
        let weatherData = await weatherRes.json();
        

        // C. Get Air Quality
        let aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        let aqiData = await aqiRes.json();
        
        // D. Send to Display Function
        displayData(geoData[0].name, weatherData.main.temp,weatherData.weather[0].description, aqiData.list[0].main.aqi, aqiData.list[0].components);
        
        searchBtn.innerText = "Analyze";
    } catch (error) {
        alert("Error finding city. Check spelling or API key.");
        searchBtn.innerText = "Analyze";
    }
});

// Decides if a pollutant level is Good, Moderate, or Poor
function getHealthStatus(value, goodLimit, moderateLimit) {
    if (value <= goodLimit) return `<span class="text-good">Good</span>`;
    if (value <= moderateLimit) return `<span class="text-fair">Moderate</span>`;
    return `<span class="text-bad">Poor</span>`;
}


// --- 5. UI DISPLAY LOGIC ---
function displayData(cityName, temp, weatherD, aqiLevel, pollutants) {
    // Generate text based on index
    const aqiText = ["", "Good", "Fair", "Moderate", "Poor", "Hazardous"][aqiLevel];

    // Build the HTML card using our helper function
    const html = `
        <div class="climate-card">
            <h2>${cityName}</h2>
            <p style="text-transform: capitalize; margin-bottom: 10px; color: #718096;">${weatherDesc}</p>
            <div class="temperature">${Math.round(temp)}°C</div>
            <div class="status-badge aqi-${aqiLevel}">Overall AQI: ${aqiLevel} - ${aqiText}</div>

            <div class="data-grid">
                <div class="data-box">
                    <span>PM 2.5 (Micro-Particles)</span>
                    <strong>${pollutants.pm2_5} μg/m3</strong>
                    <br> Status: ${getHealthStatus(pollutants.pm2_5, 15, 35)}
                </div>
                <div class="data-box">
                    <span>PM 10 (Coarse Dust)</span>
                    <strong>${pollutants.pm10} μg/m3</strong>
                    <br> Status: ${getHealthStatus(pollutants.pm10, 25, 50)}
                </div>
                <div class="data-box">
                    <span>Carbon Monoxide (CO)</span>
                    <strong>${pollutants.co} μg/m3</strong>
                    <br> Status: ${getHealthStatus(pollutants.co, 4400, 9400)}
                </div>
                <div class="data-box">
                    <span>Ozone (O3)</span>
                    <strong>${pollutants.o3} μg/m3</strong>
                    <br> Status: ${getHealthStatus(pollutants.o3, 60, 100)}
                </div>
            </div>
        </div>
    `;

    resultContainer.innerHTML = html;
    resultContainer.classList.remove('hidden');
}
