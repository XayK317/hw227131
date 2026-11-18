const searchForm = document.querySelector("#weather-search");
const feedback = document.querySelector("#feedback");
const loading = document.querySelector("#loading");
const results = document.querySelector("#weather-results");
const authDialog = document.querySelector("#auth-dialog");

const labelFor = (key) =>
  key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const formatValue = (value) => {
  if (value === null) return "Not available";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
};

function renderDataTree(value, label) {
  if (value === null || typeof value !== "object") {
    const row = document.createElement("div");
    row.className = "data-row";
    const name = document.createElement("dt");
    name.textContent = label;
    const detail = document.createElement("dd");
    detail.textContent = formatValue(value);
    row.append(name, detail);
    return row;
  }

  const section = document.createElement("details");
  section.className = "data-group";
  const summary = document.createElement("summary");
  summary.textContent = `${label} (${Array.isArray(value) ? value.length : Object.keys(value).length})`;
  section.append(summary);

  const contents = document.createElement(Array.isArray(value) ? "ol" : "dl");
  contents.className = Array.isArray(value) ? "data-list" : "data-list data-list--definition";

  for (const [key, nestedValue] of Object.entries(value)) {
    const displayLabel = Array.isArray(value) ? `Item ${Number(key) + 1}` : labelFor(key);
    const child = renderDataTree(nestedValue, displayLabel);
    if (Array.isArray(value)) {
      const item = document.createElement("li");
      item.append(child);
      contents.append(item);
    } else {
      contents.append(child);
    }
  }

  section.append(contents);
  return section;
}

function makeMetric(label, value, unit = "") {
  const card = document.createElement("article");
  card.className = "metric-card";
  const title = document.createElement("span");
  title.className = "metric-card__label";
  title.textContent = label;
  const reading = document.createElement("strong");
  reading.className = "metric-card__value";
  reading.textContent = `${value ?? "—"}${unit}`;
  card.append(title, reading);
  return card;
}

function renderWeather(data) {
  const { location, current, forecast, alerts } = data;
  const wrapper = document.createElement("div");
  wrapper.className = "weather-view";
  wrapper.id = "today";

  const heading = document.createElement("div");
  heading.className = "section-heading";
  const titleGroup = document.createElement("div");
  const city = document.createElement("p");
  city.className = "eyebrow";
  city.textContent = `${location.name}${location.region ? `, ${location.region}` : ""}`;
  const title = document.createElement("h2");
  title.textContent = location.country;
  const localTime = document.createElement("p");
  localTime.className = "muted";
  localTime.textContent = `Local time ${location.localtime} · ${location.tz_id}`;
  titleGroup.append(city, title, localTime);
  const update = document.createElement("p");
  update.className = "updated-label";
  update.textContent = `Updated ${current.last_updated}`;
  heading.append(titleGroup, update);
  wrapper.append(heading);

  const currentCard = document.createElement("article");
  currentCard.className = "current-card";
  const mainReading = document.createElement("div");
  mainReading.className = "current-card__main";
  const icon = document.createElement("img");
  icon.className = "condition-icon";
  icon.src = `https:${current.condition.icon}`;
  icon.alt = "";
  icon.width = 80;
  icon.height = 80;
  const temperature = document.createElement("strong");
  temperature.className = "current-card__temperature";
  temperature.textContent = `${Math.round(current.temp_f)}°`;
  const summary = document.createElement("div");
  summary.className = "current-card__summary";
  const condition = document.createElement("h3");
  condition.textContent = current.condition.text;
  const feels = document.createElement("p");
  feels.textContent = `Feels like ${Math.round(current.feelslike_f)}°F`;
  summary.append(condition, feels);
  mainReading.append(icon, temperature, summary);

  const currentMetrics = document.createElement("div");
  currentMetrics.className = "metrics-grid";
  currentMetrics.append(
    makeMetric("Humidity", current.humidity, "%"),
    makeMetric("Wind", current.wind_mph, " mph"),
    makeMetric("UV index", current.uv),
    makeMetric("Visibility", current.vis_miles, " mi")
  );
  currentCard.append(mainReading, currentMetrics);
  wrapper.append(currentCard);

  if (forecast.forecastday.length > 0) {
    const forecastSection = document.createElement("section");
    forecastSection.className = "forecast-section";
    forecastSection.id = "forecast";
    const forecastHeading = document.createElement("div");
    forecastHeading.className = "section-heading section-heading--compact";
    const forecastTitle = document.createElement("h2");
    forecastTitle.textContent = "The days ahead";
    const forecastNote = document.createElement("p");
    forecastNote.className = "muted";
    forecastNote.textContent = `${forecast.forecastday.length}-day outlook`;
    forecastHeading.append(forecastTitle, forecastNote);
    const forecastGrid = document.createElement("div");
    forecastGrid.className = "forecast-grid";

    for (const day of forecast.forecastday) {
      const card = document.createElement("article");
      card.className = "forecast-card";
      const date = document.createElement("p");
      date.className = "forecast-card__date";
      date.textContent = new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric"
      });
      const dayIcon = document.createElement("img");
      dayIcon.src = `https:${day.day.condition.icon}`;
      dayIcon.alt = day.day.condition.text;
      dayIcon.width = 56;
      dayIcon.height = 56;
      const range = document.createElement("p");
      range.className = "forecast-card__range";
      range.textContent = `${Math.round(day.day.maxtemp_f)}° / ${Math.round(day.day.mintemp_f)}°`;
      const description = document.createElement("p");
      description.className = "muted";
      description.textContent = day.day.condition.text;
      const chance = document.createElement("p");
      chance.className = "forecast-card__chance";
      chance.textContent = `Rain chance ${day.day.daily_chance_of_rain}%`;
      const details = document.createElement("details");
      details.className = "day-details";
      const summaryText = document.createElement("summary");
      summaryText.textContent = "Explore this day";
      details.append(summaryText, renderDataTree(day, "All daily & hourly data"));
      card.append(date, dayIcon, range, description, chance, details);
      forecastGrid.append(card);
    }
    forecastSection.append(forecastHeading, forecastGrid);
    wrapper.append(forecastSection);
  }

  const dataSection = document.createElement("section");
  dataSection.className = "data-section";
  dataSection.id = "weather-data";
  const dataHeading = document.createElement("div");
  dataHeading.className = "section-heading section-heading--compact";
  const dataTitle = document.createElement("h2");
  dataTitle.textContent = "Under the forecast";
  const dataSubtitle = document.createElement("p");
  dataSubtitle.className = "muted";
  dataSubtitle.textContent = "Explore the complete response, including location, current conditions, air quality, astronomy, hourly readings, and alerts.";
  dataHeading.append(dataTitle, dataSubtitle);

  const tree = document.createElement("div");
  tree.className = "data-tree";
  for (const [key, value] of Object.entries(data)) {
    const group = renderDataTree(value, labelFor(key));
    if (key === "location" || key === "current" || key === "forecast" || key === "alerts") {
      group.open = key === "alerts" && Array.isArray(value?.alert) && value.alert.length > 0;
    }
    tree.append(group);
  }
  dataSection.append(dataHeading, tree);
  wrapper.append(dataSection);

  if (Array.isArray(alerts?.alert) && alerts.alert.length > 0) {
    const alertBanner = document.createElement("aside");
    alertBanner.className = "alert-banner";
    alertBanner.textContent = `${alerts.alert.length} weather alert${alerts.alert.length === 1 ? "" : "s"} available. Review Weather data below.`;
    wrapper.prepend(alertBanner);
  }

  results.replaceChildren(wrapper);
}

searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const formData = new FormData(searchForm);
  const place = String(formData.get("q")).trim();
  const days = String(formData.get("days"));
  if (!place) return;

  feedback.hidden = true;
  feedback.textContent = "";
  results.replaceChildren();
  loading.hidden = false;
  searchForm.querySelector("button[type=submit]").disabled = true;

  try {
    const response = await fetch(`/api/weather?${new URLSearchParams({ q: place, days })}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "The forecast couldn't be loaded.");
    renderWeather(data);
  } catch (error) {
    feedback.textContent = error.message || "Something went wrong. Please try again.";
    feedback.hidden = false;
  } finally {
    loading.hidden = true;
    searchForm.querySelector("button[type=submit]").disabled = false;
  }
});

document.querySelectorAll(".auth-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#auth-title").textContent = button.dataset.auth;
    authDialog.showModal();
  });
});

const menuToggle = document.querySelector(".menu-toggle");
menuToggle.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
  document.querySelector(".navigation").classList.toggle("navigation--open", !expanded);
});
