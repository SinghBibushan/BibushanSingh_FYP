import { NextRequest, NextResponse } from "next/server";
import { getWeatherForecast } from "@/lib/weather";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");
    const dateStr = searchParams.get("date");

    if (!city || !dateStr) {
      return NextResponse.json({ error: "City and date required" }, { status: 400 });
    }

    const date = new Date(dateStr);
    const weather = await getWeatherForecast(city, date);

    if (!weather) {
      return NextResponse.json({ error: "Weather data unavailable" }, { status: 404 });
    }

    return NextResponse.json({ weather });
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json({ error: "Failed to fetch weather" }, { status: 500 });
  }
}
