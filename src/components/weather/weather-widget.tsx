"use client";

import { useEffect, useState } from "react";
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
    let active = true;

    async function fetchWeather() {
      try {
        const res = await fetch(
          `/api/weather?city=${encodeURIComponent(city)}&date=${encodeURIComponent(date)}`,
        );
        if (!res.ok) {
          return;
        }

        const data = (await res.json()) as { weather?: WeatherData };
        if (active) {
          setWeather(data.weather ?? null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchWeather();

    return () => {
      active = false;
    };
  }, [city, date]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading weather...</div>;
  }

  if (!weather) {
    return null;
  }

  const weatherIcon = (() => {
    if (weather.icon.includes("01")) {
      return <Sun className="h-8 w-8 text-secondary" />;
    }

    if (weather.icon.includes("02") || weather.icon.includes("03")) {
      return <Cloud className="h-8 w-8 text-accent" />;
    }

    if (weather.icon.includes("09") || weather.icon.includes("10")) {
      return <CloudRain className="h-8 w-8 text-primary" />;
    }

    return <Cloud className="h-8 w-8 text-accent" />;
  })();

  return (
    <div className="rounded-[28px] border border-border bg-[linear-gradient(145deg,#eef5f3_0%,#e7efec_100%)] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Weather forecast
          </p>
          <h3 className="mt-2 text-2xl font-semibold leading-none text-foreground">
            {city}
          </h3>
        </div>
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-white/82">
          {weatherIcon}
        </div>
      </div>

      <div className="mt-5 flex items-end gap-3">
        <p className="text-4xl font-semibold leading-none text-foreground">{weather.temp}°C</p>
        <p className="text-sm capitalize text-muted-foreground">{weather.description}</p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[22px] border border-border bg-white/82 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Feels like</p>
          <p className="mt-2 font-semibold text-foreground">{weather.feelsLike}°C</p>
        </div>
        <div className="rounded-[22px] border border-border bg-white/82 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Humidity</p>
          <p className="mt-2 font-semibold text-foreground">{weather.humidity}%</p>
        </div>
        <div className="rounded-[22px] border border-border bg-white/82 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Wind</p>
          <p className="mt-2 flex items-center gap-2 font-semibold text-foreground">
            <Wind className="h-4 w-4 text-primary" />
            {weather.windSpeed} m/s
          </p>
        </div>
      </div>
    </div>
  );
}
