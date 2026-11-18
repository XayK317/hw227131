# Cloudline Weather App

Cloudline is a responsive weather dashboard built for HW 227131. Search by city or ZIP/postal code, choose a 1–3 day forecast, and browse current conditions, daily and hourly readings, air quality, astronomy, and alerts returned by WeatherAPI.

## Run locally

1. Install Node.js 18 or newer.
2. Install project dependencies with `npm install`.
3. Copy `.env.example` to `.env` and add your WeatherAPI key as `WEATHER_API_KEY`.
4. Start the app with `npm start`.
5. Open [http://localhost:3000](http://localhost:3000).

The API key is read by the Express server and is not sent to the browser. Do not commit `.env`; it is excluded by `.gitignore`. When deploying, set `WEATHER_API_KEY` as a private environment variable in the hosting service.

## Features

- Search feedback, loading status, and clear error messages.
- City and ZIP/postal-code lookup.
- Selectable one-, two-, or three-day forecast.
- Responsive weather-app layout styled in Sass; `npm start` compiles `scss/main.scss` to `public/styles.css`.
- Accessible navigation, mobile menu, and account-demo dialogs.
- Expandable views of the complete returned JSON data, including nested forecast and hourly details.

## Links

- Weather service: [WeatherAPI](https://www.weatherapi.com/)
- GitHub repository: _Add the repository URL after publishing._
- Web 4 deployment: _Add the course server URL after deployment._
