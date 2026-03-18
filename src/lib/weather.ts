// Weather API service using OpenWeatherMap
import axios from "axios";

interface WeatherData {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  date: string;
}

export async function getWeatherForecast(city: string, date: Date): Promise<WeatherData | null> {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    // If no API key, return mock data for demo
    if (!apiKey || apiKey === "demo") {
      return {
        temp: 22,
        feelsLike: 20,
        description: "Partly cloudy",
        icon: "02d",
        humidity: 65,
        windSpeed: 3.5,
        date: date.toISOString(),
      };
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast`,
      {
        params: {
          q: city,
          appid: apiKey,
          units: "metric",
          cnt: 40, // 5 days forecast
        },
      }
    );

    // Find forecast closest to event date
    const targetTime = date.getTime();
    const forecasts = response.data.list;

    const closest = forecasts.reduce((prev: any, curr: any) => {
      const currTime = new Date(curr.dt * 1000).getTime();
      const prevTime = new Date(prev.dt * 1000).getTime();
      return Math.abs(currTime - targetTime) < Math.abs(prevTime - targetTime) ? curr : prev;
    });

    return {
      temp: Math.round(closest.main.temp),
      feelsLike: Math.round(closest.main.feels_like),
      description: closest.weather[0].description,
      icon: closest.weather[0].icon,
      humidity: closest.main.humidity,
      windSpeed: closest.wind.speed,
      date: new Date(closest.dt * 1000).toISOString(),
    };
  } catch (error) {
    console.error("Weather API error:", error);
    return null;
  }
}
