require("dotenv").config();

const express = require("express");
const path = require("node:path");

const app = express();
const port = process.env.PORT || 3000;
const publicDirectory = path.join(__dirname, "public");

app.use(express.static(publicDirectory));

app.get("/api/weather", async (req, res) => {
  const place = typeof req.query.q === "string" ? req.query.q.trim() : "";
  const days = Number(req.query.days);

  if (!place || place.length > 100) {
    return res.status(400).json({ error: "Enter a city or ZIP/postal code." });
  }

  if (!Number.isInteger(days) || days < 1 || days > 3) {
    return res.status(400).json({ error: "Choose a forecast from 1 to 3 days." });
  }

  if (!process.env.WEATHER_API_KEY) {
    return res.status(503).json({
      error: "Weather service is not configured. Add WEATHER_API_KEY to the server's .env file."
    });
  }

  const params = new URLSearchParams({
    key: process.env.WEATHER_API_KEY,
    q: place,
    days: String(days),
    aqi: "yes",
    alerts: "yes"
  });

  try {
    const response = await fetch(`https://api.weatherapi.com/v1/forecast.json?${params}`);
    const data = await response.json();

    if (!response.ok) {
      const message = data.error?.message || "The weather service could not find that location.";
      return res.status(response.status === 400 ? 404 : 502).json({ error: message });
    }

    return res.json(data);
  } catch (error) {
    console.error("WeatherAPI request failed:", error);
    return res.status(502).json({
      error: "Couldn't reach the weather service. Check your connection and try again."
    });
  }
});

app.get("*path", (req, res) => {
  res.sendFile(path.join(publicDirectory, "index.html"));
});

app.listen(port, () => {
  console.log(`Weather app listening at http://localhost:${port}`);
});
