import { NextResponse } from "next/server";
import { LEADERBOARD } from "../../data/cityData";

export async function GET() {
  return NextResponse.json({
    leaderboard: LEADERBOARD,
  });
}
