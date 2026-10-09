import { NextResponse } from "next/server";
import { PLACES } from "../../data/cityData";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get("city") || "Pune";
  const list = PLACES[city] || PLACES.Pune || [];
  return NextResponse.json({
    city,
    places: list,
    count: list.length,
  });
}
