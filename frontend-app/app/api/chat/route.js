import { NextResponse } from "next/server";
import { PLACES } from "../../data/cityData";

const DHRUVA_PROMPT = `You are Dhruva (ध्रुव), an AI-powered urban exploration companion named after the Pole Star — the unwavering guide in the night sky.
Recommend places based on user preferences, time of day, and safety. Keep responses concise, warm, and helpful.`;

export async function POST(request) {
  try {
    const { message, city = "Pune" } = await request.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (apiKey) {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://dhruva.app",
            "X-Title": "Dhruva Explorer",
          },
          body: JSON.stringify({
            model: process.env.OPENROUTER_MODEL || "meta-llama/llama-3.1-8b-instruct:free",
            messages: [
              { role: "system", content: DHRUVA_PROMPT },
              { role: "user", content: `[City: ${city}] ${message}` },
            ],
            max_tokens: 400,
            temperature: 0.7,
          }),
        });
        const data = await res.json();
        if (data.choices && data.choices[0]?.message?.content) {
          return NextResponse.json({
            response: data.choices[0].message.content,
            source: "openrouter",
          });
        }
      } catch (err) {
        console.error("OpenRouter error:", err);
      }
    }

    // Dynamic intelligent fallback
    const cityPlaces = PLACES[city] || PLACES.Pune;
    const topSafe = [...cityPlaces].sort((a, b) => b.safety_score - a.safety_score)[0];
    const placeNames = cityPlaces.map((p) => p.name).slice(0, 3).join(", ");
    const reply = `🌟 Dhruva Guide for ${city}: Here are fantastic options to explore — ${placeNames}. My top safe recommendation right now is ${topSafe.name} (Safety Score: ${topSafe.safety_score}/100, Rating: ${topSafe.rating}★). Ideal visit window: ${topSafe.best_time}. Stay safe and enjoy your journey!`;

    return NextResponse.json({
      response: reply,
      source: "fallback",
    });
  } catch (err) {
    return NextResponse.json(
      { response: "I'm having a momentary hiccup. Try asking about local spots again!" },
      { status: 500 }
    );
  }
}
