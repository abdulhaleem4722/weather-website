const apiKey = '07d127d446d731ff7b474ba1633565d0'; // Replace with your OpenWeatherMap API key
const weatherDetailsDiv = document.querySelector('.weather-details');
const notFoundDiv = document.querySelector('.not-found');
const cityInput = document.getElementById('cityInput');
const searchBtn = document.querySelector('.search-btn');

// Prevent submitting empty or invalid city names
function isValidCity(city) {
    return city && /^[a-zA-Z\s-]+$/.test(city);
}

async function getWeatherData(city) {
    if (!isValidCity(city)) {
        alert('Please enter a valid city name');
        return;
    }

    setLoadingState(true);
    
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${apiKey}`
        );
        
        if (!response.ok) {
            throw new Error('City not found');
        }

        const data = await response.json();
        updateWeatherUI(data);
        
        weatherDetailsDiv.classList.add('active');
        notFoundDiv.classList.remove('active');
    } catch (error) {
        weatherDetailsDiv.classList.remove('active');
        notFoundDiv.classList.add('active');
        console.error('Error fetching weather data:', error);
    } finally {
        setLoadingState(false);
    }
}

function updateWeatherUI(data) {
    const weatherIcon = document.querySelector('.weather-icon');
    const temperature = document.querySelector('.temp');
    const cityName = document.querySelector('.city');
    const humidity = document.querySelector('.humidity');
    const windSpeed = document.querySelector('.wind');

    try {
        // Validate data before updating UI
        if (!data || !data.weather || !data.weather[0] || !data.main) {
            throw new Error('Invalid weather data received');
        }

        // Update weather icon
        const iconCode = data.weather[0].icon;
        weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

        // Update temperature and city
        temperature.textContent = `${Math.round(data.main.temp)}°C`;
        cityName.textContent = data.name;

        // Update humidity and wind speed
        humidity.textContent = `${data.main.humidity}%`;
        windSpeed.textContent = `${data.wind.speed} km/h`;

        // Add fade-in animation
        weatherDetailsDiv.style.opacity = '0';
        weatherDetailsDiv.style.display = 'block';
        setTimeout(() => {
            weatherDetailsDiv.style.opacity = '1';
        }, 10);
    } catch (error) {
        console.error('Error updating UI:', error);
        notFoundDiv.classList.add('active');
    }
}

// Loading state management
function setLoadingState(isLoading) {
    const searchButton = document.querySelector('.search-btn');
    const searchIcon = searchButton.querySelector('i');
    
    if (isLoading) {
        searchButton.style.pointerEvents = 'none';
        searchButton.style.opacity = '0.7';
        searchIcon.classList.remove('fa-magnifying-glass');
        searchIcon.classList.add('fa-spinner', 'fa-spin');
        cityInput.disabled = true;
    } else {
        searchButton.style.pointerEvents = 'auto';
        searchButton.style.opacity = '1';
        searchIcon.classList.add('fa-magnifying-glass');
        searchIcon.classList.remove('fa-spinner', 'fa-spin');
        cityInput.disabled = false;
    }
}

// Debounce function to prevent too many API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Event listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherData(city);
    }
});

cityInput.addEventListener('keyup', debounce((event) => {
    if (event.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
        }
    }
}, 300));

// Add error handling for network issues
window.addEventListener('offline', () => {
    alert('Please check your internet connection');
});

window.addEventListener('online', () => {
    const city = cityInput.value.trim() || 'London';
    getWeatherData(city);
});

// Handle API errors
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    setLoadingState(false);
    notFoundDiv.classList.add('active');
});

// Initial weather data for a default city
document.addEventListener('DOMContentLoaded', () => {
    getWeatherData('London');
}); 