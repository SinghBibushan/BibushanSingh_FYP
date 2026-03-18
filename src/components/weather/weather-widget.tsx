"use client";

import { useState, useEffect } from "react";
import { Cloud, CloudRain, Sun, Wind } from "lucide-react";

interface WeatherData {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

export function WeatherWidget({ city, date }: { city: string; date: string }) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeather();
  }, [city, date]);

  const fetchWeather = async () => {
    try {
      const res = await fetch(`/api/weather?city=${city}&date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setWeather(data.weather);
      }
    } catch (error) {
      console.error("Failed to fetch weather:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading weather...</div>;
  }

  if (!weather) {
    return null;
  }

  const getWeatherIcon = () => {
    if (weather.icon.includes("01")) return <Sun className="w-8 h-8 text-yellow-500" />;
    if (weather.icon.includes("02") || weather.icon.includes("03")) return <Cloud className="w-8 h-8 text-gray-500" />;
    if (weather.icon.includes("09") || weather.icon.includes("10")) return <CloudRain className="w-8 h-8 text-blue-500" />;
    return <Cloud className="w-8 h-8 text-gray-500" />;
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Cloud className="w-5 h-5" />
        Weather Forecast
      </h3>

      <div className="flex items-center gap-4">
        <div>{getWeatherIcon()}</div>
        <div>
          <p className="text-3xl font-bold">{weather.temp}°C</p>
          <p className="text-sm text-gray-600 capitalize">{weather.description}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-600">Feels like</p>
          <p className="font-semibold">{weather.feelsLike}°C</p>
        </div>
        <div>
          <p className="text-gray-600">Humidity</p>
          <p className="font-semibold">{weather.humidity}%</p>
        </div>
        <div className="col-span-2">
          <p className="text-gray-600">Wind Speed</p>
          <p className="font-semibold flex items-center gap-1">
            <Wind className="w-4 h-4" />
            {weather.windSpeed} m/s
          </p>
        </div>
      </div>
    </div>
  );
}
