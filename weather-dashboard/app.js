/**
 * AuraWeather - Premium Weather Dashboard Application Code
 * -------------------------------------------------------------
 * Powers state management, API data fetching, custom simulation,
 * interactive canvas particles, search history, and Chart.js graphs.
 */

// ==========================================================================
// 1. STATE & CONSTANTS DEFINITION
// ==========================================================================
const state = {
    activeCity: 'Tokyo',
    temperatureUnit: 'C', // 'C' or 'F'
    dataSource: 'simulated', // 'simulated' or 'live'
    apiKey: localStorage.getItem('aura_weather_api_key') || '',
    searchHistory: JSON.parse(localStorage.getItem('aura_weather_history')) || [
        { city: 'Tokyo', temp: 24, condition: 'sunny' },
        { city: 'London', temp: 14, condition: 'rainy' },
        { city: 'Reykjavik', temp: -2, condition: 'snowy' }
    ],
    weatherData: null,
    timeTicker: null
};

// SVG Assets for Weather Conditions (Ultra-premium custom designs)
const SVG_ICONS = {
    sunny: `
        <svg viewBox="0 0 64 64">
            <g class="weather-animate-sun">
                <circle cx="32" cy="32" r="12" fill="#ffd043" filter="drop-shadow(0 0 8px rgba(255, 208, 67, 0.8))" />
                <path d="M32 4 v6 M32 54 v6 M4 32 h6 M54 32 h6 M12.2 12.2 l4.2 4.2 M47.6 47.6 l4.2 4.2 M12.2 47.6 l4.2 -4.2 M47.6 12.2 l4.2 -4.2" 
                      stroke="#ffd043" stroke-width="3.5" stroke-linecap="round" />
            </g>
        </svg>
    `,
    night: `
        <svg viewBox="0 0 64 64">
            <path d="M42 38.5 A16.5 16.5 0 1 1 25.5 22 a1.5 1.5 0 0 0 0.5 -1.2 A15 15 0 0 0 43.2 39 a1.5 1.5 0 0 0 -1.2 -0.5 z" 
                  fill="#81d4fa" filter="drop-shadow(0 0 8px rgba(129, 212, 250, 0.6))" />
            <circle cx="16" cy="18" r="1" fill="#fff" opacity="0.8" />
            <circle cx="48" cy="14" r="1.5" fill="#fff" opacity="0.9" />
            <circle cx="50" cy="28" r="1" fill="#fff" opacity="0.6" />
        </svg>
    `,
    cloudy: `
        <svg viewBox="0 0 64 64">
            <g class="weather-animate-cloud">
                <path d="M46 38 a10 10 0 0 0 -9 -7 a12 12 0 1 0 -22 4 a10 10 0 0 0 1 13 h30 a10 10 0 0 0 0 -20 z" 
                      fill="rgba(255, 255, 255, 0.85)" filter="drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))" />
                <path d="M50 42 a8 8 0 0 0 -7.2 -5.6 a10 10 0 1 0 -18.3 3.3 a8 8 0 0 0 0.5 10.3 h25 a8 8 0 0 0 0 -16 z" 
                      fill="rgba(255, 255, 255, 0.55)" transform="translate(-6, -6)" />
            </g>
        </svg>
    `,
    rainy: `
        <svg viewBox="0 0 64 64">
            <g class="weather-animate-cloud">
                <path d="M46 32 a10 10 0 0 0 -9 -7 a12 12 0 1 0 -22 4 a10 10 0 0 0 1 13 h30 a10 10 0 0 0 0 -20 z" 
                      fill="rgba(255, 255, 255, 0.85)" />
            </g>
            <g stroke="#81d4fa" stroke-width="3" stroke-linecap="round">
                <line class="weather-animate-rain-1" x1="20" y1="44" x2="16" y2="52" stroke-dasharray="4 6" />
                <line class="weather-animate-rain-2" x1="32" y1="44" x2="28" y2="52" stroke-dasharray="4 6" />
                <line class="weather-animate-rain-3" x1="44" y1="44" x2="40" y2="52" stroke-dasharray="4 6" />
            </g>
        </svg>
    `,
    snowy: `
        <svg viewBox="0 0 64 64">
            <g class="weather-animate-cloud">
                <path d="M46 32 a10 10 0 0 0 -9 -7 a12 12 0 1 0 -22 4 a10 10 0 0 0 1 13 h30 a10 10 0 0 0 0 -20 z" 
                      fill="rgba(255, 255, 255, 0.9)" />
            </g>
            <g stroke="#e2e8f0" stroke-width="2" stroke-linecap="round">
                <!-- Snowflake symbols -->
                <path d="M20 45 l4 4 M24 45 l-4 4" />
                <path d="M32 46 l4 4 M36 46 l-4 4" />
                <path d="M44 45 l4 4 M48 45 l-4 4" />
            </g>
        </svg>
    `,
    stormy: `
        <svg viewBox="0 0 64 64">
            <g class="weather-animate-cloud">
                <path d="M46 32 a10 10 0 0 0 -9 -7 a12 12 0 1 0 -22 4 a10 10 0 0 0 1 13 h30 a10 10 0 0 0 0 -20 z" 
                      fill="rgba(255, 255, 255, 0.75)" />
            </g>
            <!-- Lightning Bolt -->
            <path d="M30 40 l-6 10 h8 l-4 8 l12 -12 h-8 z" fill="#ffd043" filter="drop-shadow(0 0 6px rgba(255, 208, 67, 1))" />
        </svg>
    `
};

// Pre-configured simulated database for major world cities
const SIMULATED_CITIES = {
    'tokyo': {
        name: 'Tokyo',
        temp: 24,
        condition: 'sunny',
        desc: 'Sunny and Clear',
        feelsLike: 25,
        windSpeed: 12,
        humidity: 54,
        precipitation: 0,
        uv: 6.5,
        aqi: 32,
        pressure: 1012,
        visibility: 10,
        hourly: [
            { time: '08:00', temp: 20, rain: 0 },
            { time: '11:00', temp: 23, rain: 0 },
            { time: '14:00', temp: 24, rain: 0 },
            { time: '17:00', temp: 22, rain: 0 },
            { time: '20:00', temp: 19, rain: 0 },
            { time: '23:00', temp: 17, rain: 0 },
            { time: '02:00', temp: 16, rain: 0 },
            { time: '05:00', temp: 15, rain: 0 }
        ],
        forecast: [
            { day: 'Mon', tempMax: 26, tempMin: 18, condition: 'sunny', desc: 'Sunny' },
            { day: 'Tue', tempMax: 27, tempMin: 19, condition: 'sunny', desc: 'Mostly Sunny' },
            { day: 'Wed', tempMax: 22, tempMin: 17, condition: 'cloudy', desc: 'Partly Cloudy' },
            { day: 'Thu', tempMax: 19, tempMin: 15, condition: 'rainy', desc: 'Showers' },
            { day: 'Fri', tempMax: 23, tempMin: 16, condition: 'sunny', desc: 'Clear Sky' }
        ]
    },
    'london': {
        name: 'London',
        temp: 14,
        condition: 'rainy',
        desc: 'Persistent Rain',
        feelsLike: 13,
        windSpeed: 24,
        humidity: 88,
        precipitation: 85,
        uv: 1.2,
        aqi: 18,
        pressure: 1006,
        visibility: 6,
        hourly: [
            { time: '08:00', temp: 12, rain: 60 },
            { time: '11:00', temp: 13, rain: 80 },
            { time: '14:00', temp: 14, rain: 85 },
            { time: '17:00', temp: 13, rain: 75 },
            { time: '20:00', temp: 12, rain: 40 },
            { time: '23:00', temp: 11, rain: 20 },
            { time: '02:00', temp: 10, rain: 10 },
            { time: '05:00', temp: 10, rain: 15 }
        ],
        forecast: [
            { day: 'Mon', tempMax: 15, tempMin: 10, condition: 'rainy', desc: 'Light Rain' },
            { day: 'Tue', tempMax: 16, tempMin: 11, condition: 'cloudy', desc: 'Overcast' },
            { day: 'Wed', tempMax: 18, tempMin: 12, condition: 'sunny', desc: 'Clearing Up' },
            { day: 'Thu', tempMax: 15, tempMin: 9, condition: 'stormy', desc: 'Thunderstorms' },
            { day: 'Fri', tempMax: 14, tempMin: 8, condition: 'rainy', desc: 'Showers' }
        ]
    },
    'reykjavik': {
        name: 'Reykjavik',
        temp: -2,
        condition: 'snowy',
        desc: 'Fresh Snowfall',
        feelsLike: -7,
        windSpeed: 32,
        humidity: 78,
        precipitation: 60,
        uv: 0.2,
        aqi: 9,
        pressure: 998,
        visibility: 4,
        hourly: [
            { time: '08:00', temp: -3, rain: 40 },
            { time: '11:00', temp: -2, rain: 50 },
            { time: '14:00', temp: -2, rain: 60 },
            { time: '17:00', temp: -4, rain: 45 },
            { time: '20:00', temp: -5, rain: 30 },
            { time: '23:00', temp: -6, rain: 10 },
            { time: '02:00', temp: -7, rain: 5 },
            { time: '05:00', temp: -7, rain: 10 }
        ],
        forecast: [
            { day: 'Mon', tempMax: -1, tempMin: -5, condition: 'snowy', desc: 'Snow Flurries' },
            { day: 'Tue', tempMax: -3, tempMin: -8, condition: 'snowy', desc: 'Heavy Snow' },
            { day: 'Wed', tempMax: -5, tempMin: -9, condition: 'cloudy', desc: 'Bitter Cold' },
            { day: 'Thu', tempMax: -2, tempMin: -6, condition: 'snowy', desc: 'Light Snow' },
            { day: 'Fri', tempMax: 0, tempMin: -3, condition: 'cloudy', desc: 'Cloudy' }
        ]
    },
    'cairo': {
        name: 'Cairo',
        temp: 36,
        condition: 'sunny',
        desc: 'Sunny and Scorching',
        feelsLike: 39,
        windSpeed: 18,
        humidity: 22,
        precipitation: 0,
        uv: 11.0,
        aqi: 88,
        pressure: 1014,
        visibility: 10,
        hourly: [
            { time: '08:00', temp: 30, rain: 0 },
            { time: '11:00', temp: 34, rain: 0 },
            { time: '14:00', temp: 36, rain: 0 },
            { time: '17:00', temp: 35, rain: 0 },
            { time: '20:00', temp: 31, rain: 0 },
            { time: '23:00', temp: 28, rain: 0 },
            { time: '02:00', temp: 26, rain: 0 },
            { time: '05:00', temp: 25, rain: 0 }
        ],
        forecast: [
            { day: 'Mon', tempMax: 37, tempMin: 26, condition: 'sunny', desc: 'Sunny' },
            { day: 'Tue', tempMax: 38, tempMin: 27, condition: 'sunny', desc: 'Sunny' },
            { day: 'Wed', tempMax: 36, tempMin: 25, condition: 'sunny', desc: 'Warm Breeze' },
            { day: 'Thu', tempMax: 35, tempMin: 24, condition: 'sunny', desc: 'Clear' },
            { day: 'Fri', tempMax: 37, tempMin: 25, condition: 'sunny', desc: 'Sunny' }
        ]
    },
    'sydney': {
        name: 'Sydney',
        temp: 19,
        condition: 'cloudy',
        desc: 'Overcast Sky',
        feelsLike: 19,
        windSpeed: 14,
        humidity: 68,
        precipitation: 15,
        uv: 4.0,
        aqi: 22,
        pressure: 1018,
        visibility: 9,
        hourly: [
            { time: '08:00', temp: 16, rain: 5 },
            { time: '11:00', temp: 18, rain: 10 },
            { time: '14:00', temp: 19, rain: 15 },
            { time: '17:00', temp: 18, rain: 10 },
            { time: '20:00', temp: 16, rain: 5 },
            { time: '23:00', temp: 15, rain: 5 },
            { time: '02:00', temp: 14, rain: 5 },
            { time: '05:00', temp: 13, rain: 5 }
        ],
        forecast: [
            { day: 'Mon', tempMax: 20, tempMin: 14, condition: 'cloudy', desc: 'Partly Cloudy' },
            { day: 'Tue', tempMax: 21, tempMin: 15, condition: 'sunny', desc: 'Mostly Clear' },
            { day: 'Wed', tempMax: 18, tempMin: 13, condition: 'rainy', desc: 'Passing Showers' },
            { day: 'Thu', tempMax: 19, tempMin: 12, condition: 'cloudy', desc: 'Broken Clouds' },
            { day: 'Fri', tempMax: 20, tempMin: 14, condition: 'sunny', desc: 'Sunny' }
        ]
    },
    'new york': {
        name: 'New York',
        temp: 22,
        condition: 'stormy',
        desc: 'Severe Thunderstorms',
        feelsLike: 23,
        windSpeed: 28,
        humidity: 92,
        precipitation: 95,
        uv: 2.0,
        aqi: 54,
        pressure: 996,
        visibility: 5,
        hourly: [
            { time: '08:00', temp: 20, rain: 50 },
            { time: '11:00', temp: 21, rain: 80 },
            { time: '14:00', temp: 22, rain: 95 },
            { time: '17:00', temp: 21, rain: 90 },
            { time: '20:00', temp: 19, rain: 60 },
            { time: '23:00', temp: 18, rain: 40 },
            { time: '02:00', temp: 17, rain: 20 },
            { time: '05:00', temp: 16, rain: 10 }
        ],
        forecast: [
            { day: 'Mon', tempMax: 24, tempMin: 17, condition: 'stormy', desc: 'Scattered Storms' },
            { day: 'Tue', tempMax: 23, tempMin: 16, condition: 'rainy', desc: 'Rain showers' },
            { day: 'Wed', tempMax: 21, tempMin: 14, condition: 'cloudy', desc: 'Partly Sunny' },
            { day: 'Thu', tempMax: 23, tempMin: 15, condition: 'sunny', desc: 'Pleasant & Clear' },
            { day: 'Fri', tempMax: 25, tempMin: 18, condition: 'sunny', desc: 'Warm & Sunny' }
        ]
    }
};

// ==========================================================================
// 2. ATMOSPHERIC CANVAS PARTICLE ENGINE
// ==========================================================================
const canvas = document.getElementById('ambient-canvas');
const ctx = canvas.getContext('2d');

let particles = [];
let animationFrameId = null;
let currentParticleTheme = '';
let lightningFlashIntensity = 0;

// Resize canvas dynamically
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Particle Blueprints
class RainParticle {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -20;
        this.length = Math.random() * 20 + 15;
        this.speed = Math.random() * 12 + 18;
        this.angle = -2; // Wind angle
        this.opacity = Math.random() * 0.35 + 0.15;
    }
    update() {
        this.y += this.speed;
        this.x += this.angle;
        if (this.y > canvas.height + 20 || this.x < -20 || this.x > canvas.width + 20) {
            this.reset();
        }
    }
    draw() {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(129, 212, 250, ${this.opacity})`;
        ctx.lineWidth = 1.5;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x + this.angle, this.y + this.length);
        ctx.stroke();
    }
}

class SnowParticle {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.radius = Math.random() * 3.5 + 1;
        this.speed = Math.random() * 1.5 + 0.8;
        this.density = Math.random() * 20;
        this.opacity = Math.random() * 0.6 + 0.2;
    }
    update() {
        this.y += this.speed;
        this.x += Math.sin(this.y / 30 + this.density) * 0.8;
        if (this.y > canvas.height + 10 || this.x < -10 || this.x > canvas.width + 10) {
            this.reset();
        }
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class SunDustParticle {
    constructor() {
        this.reset();
        this.y = Math.random() * canvas.height;
    }
    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 5 + 2;
        this.speedX = Math.random() * 0.4 - 0.2;
        this.speedY = Math.random() * -0.3 - 0.1; // Drift upwards
        this.opacity = Math.random() * 0.25 + 0.05;
        this.fadeSpeed = Math.random() * 0.005 + 0.001;
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= this.fadeSpeed;
        if (this.opacity <= 0 || this.y < -10) {
            this.reset();
            this.y = canvas.height + 10;
        }
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 241, 118, ${this.opacity})`;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 241, 118, 0.4)';
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow
    }
}

class CloudMistyParticle {
    constructor() {
        this.reset();
        this.x = Math.random() * canvas.width;
    }
    reset() {
        this.x = -300;
        this.y = Math.random() * (canvas.height * 0.4);
        this.radius = Math.random() * 80 + 100;
        this.speedX = Math.random() * 0.3 + 0.15;
        this.opacity = Math.random() * 0.12 + 0.04;
    }
    update() {
        this.x += this.speedX;
        if (this.x > canvas.width + 300) {
            this.reset();
        }
    }
    draw() {
        ctx.beginPath();
        let grad = ctx.createRadialGradient(this.x, this.y, this.radius * 0.2, this.x, this.y, this.radius);
        grad.addColorStop(0, `rgba(240, 244, 248, ${this.opacity})`);
        grad.addColorStop(1, 'rgba(240, 244, 248, 0)');
        ctx.fillStyle = grad;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

class StarParticle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5;
        this.maxOpacity = Math.random() * 0.8 + 0.2;
        this.opacity = Math.random() * this.maxOpacity;
        this.glowSpeed = Math.random() * 0.02 + 0.005;
        this.glowDirection = 1;
    }
    update() {
        this.opacity += this.glowSpeed * this.glowDirection;
        if (this.opacity >= this.maxOpacity) {
            this.glowDirection = -1;
        } else if (this.opacity <= 0.05) {
            this.glowDirection = 1;
        }
    }
    draw() {
        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Particle Engine Orchestrator
function setupParticles(theme) {
    if (currentParticleTheme === theme) return;
    currentParticleTheme = theme;
    particles = [];

    let count = 0;
    if (theme === 'rainy') {
        count = 120;
        for (let i = 0; i < count; i++) particles.push(new RainParticle());
    } else if (theme === 'snowy') {
        count = 100;
        for (let i = 0; i < count; i++) particles.push(new SnowParticle());
    } else if (theme === 'sunny') {
        count = 35;
        for (let i = 0; i < count; i++) particles.push(new SunDustParticle());
    } else if (theme === 'cloudy') {
        count = 8;
        for (let i = 0; i < count; i++) particles.push(new CloudMistyParticle());
    } else if (theme === 'stormy') {
        count = 150;
        for (let i = 0; i < count; i++) particles.push(new RainParticle());
    } else if (theme === 'night') {
        count = 120;
        for (let i = 0; i < count; i++) particles.push(new StarParticle());
    }
}

function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render active particles
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    // Special stormy weather effect: lightning flashes
    if (currentParticleTheme === 'stormy') {
        if (Math.random() < 0.003 && lightningFlashIntensity === 0) {
            lightningFlashIntensity = 1;
            // Visual card shake effect
            const dash = document.querySelector('.main-dashboard');
            if (dash) {
                dash.style.transform = `translate(${Math.random()*8-4}px, ${Math.random()*8-4}px)`;
                setTimeout(() => dash.style.transform = '', 120);
            }
        }

        if (lightningFlashIntensity > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${lightningFlashIntensity})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            lightningFlashIntensity -= 0.08;
            if (lightningFlashIntensity < 0) lightningFlashIntensity = 0;
        }
    }

    animationFrameId = requestAnimationFrame(animateParticles);
}

// Start particle render loop
animateParticles();


// ==========================================================================
// 3. WEATHER SIMULATION ENGINE
// ==========================================================================
function generateSimulatedWeatherData(cityName) {
    const cleanName = cityName.trim().toLowerCase();
    
    // Check if we have exact simulated profile
    if (SIMULATED_CITIES[cleanName]) {
        return JSON.parse(JSON.stringify(SIMULATED_CITIES[cleanName]));
    }
    
    // Otherwise, generate deterministic mock profile based on hashing the city name
    let hash = 0;
    for (let i = 0; i < cleanName.length; i++) {
        hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const absHash = Math.abs(hash);
    const conditions = ['sunny', 'cloudy', 'rainy', 'snowy', 'stormy'];
    const activeCond = conditions[absHash % conditions.length];
    
    // Generate realistic ranges based on conditions
    let temp = 15;
    if (activeCond === 'sunny') temp = 22 + (absHash % 15);
    else if (activeCond === 'cloudy') temp = 12 + (absHash % 10);
    else if (activeCond === 'rainy') temp = 8 + (absHash % 8);
    else if (activeCond === 'snowy') temp = -10 + (absHash % 8);
    else if (activeCond === 'stormy') temp = 18 + (absHash % 8);
    
    const formattedName = cityName.charAt(0).toUpperCase() + cityName.slice(1);
    
    const hourly = [];
    for (let h = 0; h < 8; h++) {
        let hourLabel = `${String((8 + h * 3) % 24).padStart(2, '0')}:00`;
        // Create sinus temperature fluctuation
        let tempDiff = Math.sin(h * 0.7) * 3;
        let rainChance = activeCond === 'rainy' ? 70 + (absHash % 20) : (activeCond === 'stormy' ? 90 : (activeCond === 'cloudy' ? 20 : 0));
        hourly.push({
            time: hourLabel,
            temp: Math.round(temp + tempDiff),
            rain: rainChance
        });
    }
    
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const currentDayIdx = new Date().getDay();
    const forecast = [];
    for (let d = 0; d < 5; d++) {
        let dayLabel = days[(currentDayIdx + d + 1) % 7];
        let dayCond = conditions[(absHash + d) % conditions.length];
        let maxT = Math.round(temp + (absHash % 4) + (d * 0.5));
        let minT = Math.round(temp - 4 - (absHash % 3) - (d * 0.2));
        let dDesc = dayCond.charAt(0).toUpperCase() + dayCond.slice(1);
        forecast.push({
            day: dayLabel,
            tempMax: maxT,
            tempMin: minT,
            condition: dayCond,
            desc: dDesc
        });
    }

    return {
        name: formattedName,
        temp: temp,
        condition: activeCond,
        desc: activeCond.charAt(0).toUpperCase() + activeCond.slice(1) + ' Sky',
        feelsLike: Math.round(temp + (activeCond === 'sunny' ? 2 : -2)),
        windSpeed: 10 + (absHash % 25),
        humidity: activeCond === 'rainy' || activeCond === 'stormy' ? 80 + (absHash % 15) : (activeCond === 'sunny' ? 30 + (absHash % 15) : 55),
        precipitation: activeCond === 'rainy' ? 80 : (activeCond === 'stormy' ? 95 : 0),
        uv: activeCond === 'sunny' ? 7 + (absHash % 4) : 1 + (absHash % 3),
        aqi: 20 + (absHash % 80),
        pressure: 1000 + (absHash % 25),
        visibility: activeCond === 'snowy' || activeCond === 'stormy' ? 4 + (absHash % 3) : 10,
        hourly: hourly,
        forecast: forecast
    };
}


// ==========================================================================
// 4. API INTEGRATION (REAL-TIME DATA CLIENT)
// ==========================================================================
async function fetchLiveWeatherData(cityName) {
    if (!state.apiKey) {
        throw new Error('Please enter a valid OpenWeatherMap API Key in settings.');
    }

    // 1. Fetch current weather
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=metric&appid=${state.apiKey}`;
    const weatherRes = await fetch(weatherUrl);
    
    if (weatherRes.status === 401) {
        throw new Error('Invalid API Key. Please verify in OpenWeatherMap dashboard.');
    } else if (weatherRes.status === 404) {
        throw new Error(`City "${cityName}" not found. Check spelling.`);
    } else if (!weatherRes.ok) {
        throw new Error('Failed to connect to weather service. Try again later.');
    }
    
    const weatherData = await weatherRes.json();
    const { lat, lon } = weatherData.coord;

    // 2. Fetch 5-day forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${state.apiKey}`;
    const forecastRes = await fetch(forecastUrl);
    if (!forecastRes.ok) {
        throw new Error('Failed to retrieve extended forecasts.');
    }
    const forecastData = await forecastRes.json();

    // 3. Map OpenWeatherMap structure to app structure
    return parseLiveResponse(weatherData, forecastData);
}

function parseLiveResponse(current, forecast) {
    // Map OpenWeather ID range to our simplified conditions
    function mapConditionCode(id, isNight) {
        if (id >= 200 && id < 300) return 'stormy';
        if (id >= 300 && id < 600) return 'rainy';
        if (id >= 600 && id < 700) return 'snowy';
        if (id >= 700 && id < 800) return 'cloudy'; // Fog, mist, etc.
        if (id === 800) return isNight ? 'night' : 'sunny';
        if (id > 800) return 'cloudy';
        return 'sunny';
    }

    const currentTimeStamp = new Date().getTime() / 1000;
    const isNight = currentTimeStamp < current.sys.sunrise || currentTimeStamp > current.sys.sunset;
    const currentCondition = mapConditionCode(current.weather[0].id, isNight);

    // Hourly outlook: first 8 values (24 hrs since steps are 3 hrs)
    const hourly = forecast.list.slice(0, 8).map(item => {
        const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        return {
            time: time,
            temp: Math.round(item.main.temp),
            rain: Math.round((item.pop || 0) * 100) // Probability of precipitation
        };
    });

    // 5-day extended forecast: aggregate maximum and minimum temps per day
    const dayAggregates = {};
    forecast.list.forEach(item => {
        const dateStr = new Date(item.dt * 1000).toLocaleDateString([], { weekday: 'short' });
        if (!dayAggregates[dateStr]) {
            dayAggregates[dateStr] = {
                day: dateStr,
                temps: [],
                codes: []
            };
        }
        dayAggregates[dateStr].temps.push(item.main.temp);
        dayAggregates[dateStr].codes.push(item.weather[0].id);
    });

    // Format forecast array, slice off first day (current day) if necessary to get 5 future days
    const forecastArray = Object.values(dayAggregates).slice(0, 5).map(day => {
        const maxT = Math.round(Math.max(...day.temps));
        const minT = Math.round(Math.min(...day.temps));
        // Find most common weather code during that day
        const modeCode = day.codes.sort((a,b) =>
            day.codes.filter(v => v===a).length - day.codes.filter(v => v===b).length
        ).pop();
        const cond = mapConditionCode(modeCode, false);
        return {
            day: day.day,
            tempMax: maxT,
            tempMin: minT,
            condition: cond,
            desc: cond.charAt(0).toUpperCase() + cond.slice(1)
        };
    });

    return {
        name: current.name,
        temp: Math.round(current.main.temp),
        condition: currentCondition,
        desc: current.weather[0].description,
        feelsLike: Math.round(current.main.feels_like),
        windSpeed: Math.round(current.wind.speed * 3.6), // convert m/s to km/h
        humidity: current.main.humidity,
        precipitation: hourly[0] ? hourly[0].rain : 0,
        uv: 4.5, // Default index since separate call or custom sub is required
        aqi: 35, // Default/Simulated placeholder for premium layout compatibility
        pressure: current.main.pressure,
        visibility: Math.round(current.visibility / 1000), // convert to km
        hourly: hourly,
        forecast: forecastArray
    };
}


// ==========================================================================
// 5. CHART ENGINE (CHART.JS LOADER)
// ==========================================================================
function renderHourlyTrendChart(hourlyData) {
    const ctxChart = document.getElementById('weather-trend-chart').getContext('2d');
    
    if (state.chartInstance) {
        state.chartInstance.destroy();
    }

    // Determine colors based on active styling
    const bodyStyles = getComputedStyle(document.body);
    const accentColor = bodyStyles.getPropertyValue('--accent-color').trim() || '#ffffff';
    const accentGlow = bodyStyles.getPropertyValue('--accent-glow').trim() || 'rgba(255, 255, 255, 0.2)';
    
    const labels = hourlyData.map(h => h.time);
    const temps = hourlyData.map(h => {
        return state.temperatureUnit === 'C' ? h.temp : Math.round(h.temp * 1.8 + 32);
    });
    const rainChances = hourlyData.map(h => h.rain);

    // Visual Gradient fills
    const tempGrad = ctxChart.createLinearGradient(0, 0, 0, 180);
    tempGrad.addColorStop(0, accentGlow);
    tempGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

    state.chartInstance = new Chart(ctxChart, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: `Temperature (°${state.temperatureUnit})`,
                    data: temps,
                    borderColor: accentColor,
                    backgroundColor: tempGrad,
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 4,
                    pointBackgroundColor: accentColor,
                    yAxisID: 'y'
                },
                {
                    label: 'Rain Probability (%)',
                    data: rainChances,
                    borderColor: 'rgba(129, 212, 250, 0.8)',
                    backgroundColor: 'rgba(129, 212, 250, 0.15)',
                    fill: false,
                    tension: 0.3,
                    borderWidth: 1.5,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Manage legends via custom UI overlays
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    titleFont: { family: 'Outfit', weight: 'bold' },
                    bodyFont: { family: 'Inter' },
                    borderColor: 'rgba(255, 255, 255, 0.15)',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.06)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)',
                        font: { family: 'Inter', size: 10 }
                    }
                },
                y: {
                    position: 'left',
                    grid: {
                        color: 'rgba(255, 255, 255, 0.06)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.6)',
                        font: { family: 'Inter', size: 10 }
                    }
                },
                y1: {
                    position: 'right',
                    grid: {
                        drawOnChartArea: false // prevent grid line collisions
                    },
                    min: 0,
                    max: 100,
                    ticks: {
                        color: 'rgba(129, 212, 250, 0.6)',
                        font: { family: 'Inter', size: 10 }
                    }
                }
            }
        }
    });
}


// ==========================================================================
// 6. DOM RENDER & EVENT CONTROLLERS
// ==========================================================================

// Global visual transition updates
function updateDynamicTheme(condition) {
    document.body.className = '';
    
    // Map theme structure
    let bodyClass = 'theme-sunny';
    if (condition === 'sunny') bodyClass = 'theme-sunny';
    else if (condition === 'rainy') bodyClass = 'theme-rainy';
    else if (condition === 'snowy') bodyClass = 'theme-snowy';
    else if (condition === 'cloudy') bodyClass = 'theme-cloudy';
    else if (condition === 'stormy') bodyClass = 'theme-stormy';
    else if (condition === 'night') bodyClass = 'theme-night';

    document.body.classList.add(bodyClass);
    setupParticles(condition);
}

// Convert temperature values
function displayTemperature(celsiusValue) {
    if (state.temperatureUnit === 'C') {
        return `${celsiusValue}°C`;
    }
    const fVal = Math.round(celsiusValue * 1.8 + 32);
    return `${fVal}°F`;
}

// Convert wind speed values based on unit
function displayWind(speedKmh) {
    if (state.temperatureUnit === 'C') {
        return `${speedKmh} km/h`;
    }
    const mphVal = Math.round(speedKmh * 0.621371);
    return `${mphVal} mph`;
}

// Display/render data changes
function renderWeatherData() {
    const data = state.weatherData;
    if (!data) return;

    // Header updates
    document.getElementById('active-city-name').textContent = data.name;
    
    // Banner indicator updates
    const banner = document.getElementById('data-engine-banner');
    const bannerText = document.getElementById('data-engine-text');
    if (state.dataSource === 'simulated') {
        banner.className = 'source-banner simulated';
        bannerText.textContent = 'Simulated Engine';
    } else {
        banner.className = 'source-banner live';
        bannerText.textContent = 'Live API Client';
    }

    // Hero Panel elements
    const unitText = state.temperatureUnit === 'C' ? '°C' : '°F';
    const dispTemp = state.temperatureUnit === 'C' ? data.temp : Math.round(data.temp * 1.8 + 32);
    const dispFeels = state.temperatureUnit === 'C' ? data.feelsLike : Math.round(data.feelsLike * 1.8 + 32);

    document.getElementById('hero-temp-val').textContent = dispTemp;
    document.getElementById('hero-temp-unit').textContent = unitText;
    document.getElementById('hero-weather-desc').textContent = data.desc;
    document.getElementById('hero-feels-like').textContent = `Feels like ${dispFeels}${unitText}`;
    
    // Set SVG Icon
    const iconContainer = document.getElementById('hero-weather-icon');
    iconContainer.innerHTML = SVG_ICONS[data.condition] || SVG_ICONS.sunny;

    // Secondary metrics
    document.getElementById('hero-wind-speed').textContent = displayWind(data.windSpeed);
    document.getElementById('hero-humidity').textContent = `${data.humidity}%`;
    document.getElementById('hero-precipitation').textContent = `${data.precipitation}%`;

    // Indices Panel
    document.getElementById('idx-uv').textContent = data.uv.toFixed(1);
    let uvDesc = 'Low';
    if (data.uv >= 8) uvDesc = 'Very High';
    else if (data.uv >= 6) uvDesc = 'High';
    else if (data.uv >= 3) uvDesc = 'Moderate';
    document.getElementById('idx-uv-desc').textContent = uvDesc;

    document.getElementById('idx-aqi').textContent = data.aqi;
    let aqiDesc = 'Excellent';
    if (data.aqi > 100) aqiDesc = 'Unhealthy';
    else if (data.aqi > 50) aqiDesc = 'Moderate';
    document.getElementById('idx-aqi-desc').textContent = aqiDesc;

    document.getElementById('idx-pressure').textContent = `${data.pressure} hPa`;
    document.getElementById('idx-visibility').textContent = `${data.visibility} km`;

    // Render Extended 5-Day forecast cards
    const forecastContainer = document.getElementById('forecast-cards-container');
    forecastContainer.innerHTML = '';

    data.forecast.forEach(item => {
        const card = document.createElement('div');
        card.className = 'forecast-card';
        
        const maxT = state.temperatureUnit === 'C' ? item.tempMax : Math.round(item.tempMax * 1.8 + 32);
        const minT = state.temperatureUnit === 'C' ? item.tempMin : Math.round(item.tempMin * 1.8 + 32);

        card.innerHTML = `
            <span class="forecast-day">${item.day}</span>
            <div class="forecast-icon-box">
                ${SVG_ICONS[item.condition] || SVG_ICONS.sunny}
            </div>
            <span class="forecast-desc">${item.desc}</span>
            <div class="forecast-temps">
                <span class="forecast-temp-max">${maxT}°</span>
                <span class="forecast-temp-min">${minT}°</span>
            </div>
        `;
        forecastContainer.appendChild(card);
    });

    // Refresh chart metrics
    renderHourlyTrendChart(data.hourly);
    
    // Add/Verify theme
    updateDynamicTheme(data.condition);
}

// Controller workflow orchestrating load states and error management
async function searchCity(cityName) {
    if (!cityName || cityName.trim() === '') return;
    
    const loader = document.getElementById('hero-loader');
    loader.classList.add('visible');

    try {
        let freshData;
        if (state.dataSource === 'simulated') {
            // Emulate minor loading latency for responsive design visual aesthetics
            await new Promise(resolve => setTimeout(resolve, 600));
            freshData = generateSimulatedWeatherData(cityName);
        } else {
            freshData = await fetchLiveWeatherData(cityName);
        }

        // Apply clean states
        state.weatherData = freshData;
        state.activeCity = freshData.name;
        
        // Add to history records
        addToSearchHistory(freshData.name, freshData.temp, freshData.condition);
        
        // Draw layouts
        renderWeatherData();
    } catch (err) {
        showError(err.message);
    } finally {
        loader.classList.remove('visible');
    }
}

// Search History record builders
function addToSearchHistory(city, temp, condition) {
    // Avoid double inserts
    state.searchHistory = state.searchHistory.filter(h => h.city.toLowerCase() !== city.toLowerCase());
    
    // Unshift to front
    state.searchHistory.unshift({ city, temp, condition });
    
    // Clamp to 5 history entries
    if (state.searchHistory.length > 5) {
        state.searchHistory.pop();
    }

    localStorage.setItem('aura_weather_history', JSON.stringify(state.searchHistory));
    renderSearchHistoryList();
}

function removeHistoryItem(index, event) {
    event.stopPropagation(); // prevent searching click events
    state.searchHistory.splice(index, 1);
    localStorage.setItem('aura_weather_history', JSON.stringify(state.searchHistory));
    renderSearchHistoryList();
}

function renderSearchHistoryList() {
    const listContainer = document.getElementById('search-history-list');
    listContainer.innerHTML = '';

    if (state.searchHistory.length === 0) {
        listContainer.innerHTML = `<p style="font-size:0.8rem; color:var(--text-secondary); text-align:center; padding:10px 0;">No searches yet</p>`;
        return;
    }

    state.searchHistory.forEach((item, index) => {
        const rawTemp = state.temperatureUnit === 'C' ? item.temp : Math.round(item.temp * 1.8 + 32);
        const unit = state.temperatureUnit === 'C' ? '°C' : '°F';
        
        const historyCard = document.createElement('div');
        historyCard.className = 'history-item';
        historyCard.innerHTML = `
            <div class="city-name">${item.city}</div>
            <div style="display:flex; align-items:center; gap:8px;">
                <span class="temp-badge">${rawTemp}${unit}</span>
                <button class="delete-history-btn" aria-label="Delete history entry">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `;
        
        // Bind event listeners
        historyCard.addEventListener('click', () => searchCity(item.city));
        historyCard.querySelector('.delete-history-btn').addEventListener('click', (e) => removeHistoryItem(index, e));
        
        listContainer.appendChild(historyCard);
    });
}

// Error Toast Visual Alert Manager
function showError(message) {
    const toast = document.getElementById('error-alert');
    const msgContainer = document.getElementById('error-message');
    msgContainer.textContent = message;
    toast.classList.add('visible');

    // Automatic fade out
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 4000);
}

// Synchronize date and time panels
function initTimeTicker() {
    if (state.timeTicker) clearInterval(state.timeTicker);
    
    function tick() {
        const dateElement = document.getElementById('active-date-time');
        if (!dateElement) return;

        const now = new Date();
        const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
        const datePart = now.toLocaleDateString('en-US', options);
        const timePart = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        
        dateElement.textContent = `${datePart} | ${timePart}`;
    }

    tick();
    state.timeTicker = setInterval(tick, 1000);
}


// ==========================================================================
// 7. INITIALIZATION & LISTENER BINDINGS
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Settings Switchers listeners
    // Temperature unit selectors
    document.getElementById('unit-celsius').addEventListener('click', (e) => {
        if (state.temperatureUnit === 'C') return;
        state.temperatureUnit = 'C';
        e.target.classList.add('active');
        document.getElementById('unit-fahrenheit').classList.remove('active');
        renderWeatherData();
        renderSearchHistoryList();
    });

    document.getElementById('unit-fahrenheit').addEventListener('click', (e) => {
        if (state.temperatureUnit === 'F') return;
        state.temperatureUnit = 'F';
        e.target.classList.add('active');
        document.getElementById('unit-celsius').classList.remove('active');
        renderWeatherData();
        renderSearchHistoryList();
    });

    // Data Source switchers
    const keyContainer = document.getElementById('api-key-container');
    
    document.getElementById('source-simulated').addEventListener('click', (e) => {
        if (state.dataSource === 'simulated') return;
        state.dataSource = 'simulated';
        e.target.classList.add('active');
        document.getElementById('source-live').classList.remove('active');
        keyContainer.classList.remove('visible');
        searchCity(state.activeCity);
    });

    document.getElementById('source-live').addEventListener('click', (e) => {
        if (state.dataSource === 'live') return;
        state.dataSource = 'live';
        e.target.classList.add('active');
        document.getElementById('source-simulated').classList.remove('active');
        keyContainer.classList.add('visible');
        
        // Automatically check if they have keys saved
        if (state.apiKey) {
            searchCity(state.activeCity);
        } else {
            showError('Please configure an OpenWeatherMap API Key in settings.');
        }
    });

    // API Key input field
    const apiKeyInput = document.getElementById('api-key-input');
    apiKeyInput.value = state.apiKey;
    apiKeyInput.addEventListener('change', (e) => {
        state.apiKey = e.target.value.trim();
        localStorage.setItem('aura_weather_api_key', state.apiKey);
        if (state.dataSource === 'live' && state.apiKey) {
            searchCity(state.activeCity);
        }
    });

    // 2. Search inputs binding
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('city-search-input');
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const cityQuery = searchInput.value.trim();
        if (cityQuery) {
            searchCity(cityQuery);
            searchInput.value = '';
        }
    });

    // 3. Kickstart Systems
    initTimeTicker();
    renderSearchHistoryList();
    searchCity(state.activeCity);
});
