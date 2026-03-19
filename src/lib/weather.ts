import axios from "axios";

import { env } from "@/lib/env";

interface WeatherData {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  date: string;
}

type OpenWeatherForecastEntry = {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
};

type OpenWeatherForecastResponse = {
  list: OpenWeatherForecastEntry[];
};

export async function getWeatherForecast(
  city: string,
  date: Date,
): Promise<WeatherData | null> {
  try {
    const apiKey = env.OPENWEATHER_API_KEY;

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

    const response = await axios.get<OpenWeatherForecastResponse>(
      "https://api.openweathermap.org/data/2.5/forecast",
      {
        params: {
          q: city,
          appid: apiKey,
          units: "metric",
          cnt: 40,
        },
      },
    );

    const targetTime = date.getTime();
    const forecasts = response.data.list;

    if (!forecasts.length) {
      return null;
    }

    const closest = forecasts.reduce((previous, current) => {
      const currentTime = new Date(current.dt * 1000).getTime();
      const previousTime = new Date(previous.dt * 1000).getTime();

      return Math.abs(currentTime - targetTime) < Math.abs(previousTime - targetTime)
        ? current
        : previous;
    });

    return {
      temp: Math.round(closest.main.temp),
      feelsLike: Math.round(closest.main.feels_like),
      description: closest.weather[0]?.description ?? "Unknown",
      icon: closest.weather[0]?.icon ?? "01d",
      humidity: closest.main.humidity,
      windSpeed: closest.wind.speed,
      date: new Date(closest.dt * 1000).toISOString(),
    };
  } catch {
    return null;
  }
}
