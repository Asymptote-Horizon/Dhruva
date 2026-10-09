import { NextResponse } from "next/server";
import { WEATHER } from "../../data/cityData";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") || "Pune";
  const data = WEATHER[city] || WEATHER.Pune;
  return NextResponse.json(data);
}
