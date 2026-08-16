export type Forecast = {
  name: string;
  detail: string;
  location: string;
};

export async function forecastForPlace(place: string): Promise<Forecast> {
  const q = place.trim();
  if (!q) throw new Error("Set your city in Settings first");

  const geoRes = await fetch(
    `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
      q,
      format: "json",
      limit: "1",
    })}`,
    { headers: { "User-Agent": "WeddingOS/1.0 (coordination hub)" }, next: { revalidate: 3600 } }
  );
  const geo = (await geoRes.json().catch(() => [])) as { lat: string; lon: string; display_name?: string }[];
  if (!geo[0]) throw new Error("Could not find that city");

  const points = await fetch(`https://api.weather.gov/points/${geo[0].lat},${geo[0].lon}`, {
    headers: { "User-Agent": "WeddingOS/1.0 (coordination hub)", Accept: "application/geo+json" },
    next: { revalidate: 1800 },
  });
  if (!points.ok) throw new Error("Forecast is only available for US locations");
  const pointData = await points.json();
  const forecastUrl = pointData.properties?.forecast;
  if (!forecastUrl) throw new Error("No forecast for that point");

  const forecast = await fetch(forecastUrl, {
    headers: { "User-Agent": "WeddingOS/1.0 (coordination hub)", Accept: "application/geo+json" },
    next: { revalidate: 1800 },
  });
  const data = await forecast.json();
  const period = data.properties?.periods?.[0];
  if (!period) throw new Error("No forecast periods");
  return {
    name: period.name,
    detail: `${period.temperature}°${period.temperatureUnit} · ${period.shortForecast}. ${period.detailedForecast || ""}`.trim(),
    location: geo[0].display_name || q,
  };
}
