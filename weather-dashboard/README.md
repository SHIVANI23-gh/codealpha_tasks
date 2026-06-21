# AuraWeather - Premium Weather Forecast Dashboard

AuraWeather is a state-of-the-art, responsive Weather Forecast Dashboard built from scratch using clean, modern Vanilla HTML5, CSS3, and JavaScript. This project has been designed with premium user experience guidelines, featuring dynamic ambient weather-reactive layouts, fully interactive graphics, search telemetry history, and a robust offline simulation engine.

Developed as a submission for the **CodeAlpha Web Development Internship**.

---

## 🌟 Key Features

1. **Reactive Glassmorphism Themes**: 
   - A modern user interface utilising blur backdrops, glass highlights, and responsive layouts.
   - Core elements dynamically change their accent colors, box shadows, and background gradients to reflect the active weather condition:
     - **Sunny/Clear**: Warm sky gradients with ambient gold rays.
     - **Rainy**: Deep slate oceanic tones with downpour effects.
     - **Snowy**: Soft ice-blue and frosted white tones.
     - **Cloudy**: Muted silver and gray overcast.
     - **Stormy**: Cosmic dark purple and black with electric purple accents.
     - **Night**: Midnight blue with soft purple gradients and twinkling stellar backdrops.

2. **60 FPS Atmospheric Particle Engine**:
   - A HTML5 canvas overlays the application, rendering real-time fluid animations representing active weather.
   - Includes custom rendering algorithms for falling rain streaks, swirling snowflakes, drifting cloud mist, glowing solar dust, twinkling night stars, and random storm lightning flashes that temporarily shake the layout grid.

3. **Dual-Mode Data Architecture**:
   - **Simulated Demonstration Engine**: Out-of-the-box pre-configured high-fidelity weather patterns for major global cities (Tokyo, London, Reykjavik, Cairo, Sydney, and New York) and dynamic procedurally-generated profiles for search queries of any other city. Allows reviewers to evaluate the interface instantly without configuring API keys.
   - **Live OpenWeatherMap API Mode**: A toggleable settings interface that lets users insert their personal OpenWeatherMap API key to pull real-time atmospheric metrics from anywhere in the world.

4. **Interactive Temperature Trend Lines**:
   - Integrated with Chart.js to render a sleek, theme-adaptive line chart illustrating 24-hour hourly temperature curves alongside precipitation probability bars.

5. **Search Telemetry & History**:
   - Dynamic search capabilities with a local storage-backed "Search History" cache. Users can easily toggle back and forth between recent searches with immediate reload transitions, or clear history items from the list.

6. **Instant Metric/Imperial Conversions**:
   - Toggle temperature units instantly between Celsius (°C, km/h, hPa, km) and Fahrenheit (°F, mph, pressure, visibility conversions) across all panels.

---

## 📂 File Architecture

```
weather-dashboard/
├── index.html     # Semantic structure, layout templates, and CDN linkages
├── style.css      # Core CSS custom properties, themes, layouts, animations, and typography
├── app.js         # State management, data client, particle animations, and DOM engine
└── README.md      # Detailed documentation (this file)
```

---

## 🛠️ Getting Started

### 1. Run the Project Locally
Simply open the `index.html` file in any modern web browser:
```bash
# On Windows (PowerShell):
Start-Process "index.html"
```
Or use a local server like Live Server (VS Code Extension) or simple HTTP servers:
```bash
npx serve .
```

### 2. Live API Key Configuration (Optional)
To use live weather data rather than the built-in simulation engine:
1. Obtain a free API key from the [OpenWeatherMap Portal](https://openweathermap.org/).
2. On the AuraWeather side panel, toggle **Data Engine** from **Simulated** to **Live API**.
3. Paste your key in the **OpenWeatherMap Key** input field.
4. The application will save the key locally in your browser (`localStorage`) and immediately fetch live weather metrics for your queried city.
