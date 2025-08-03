import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { prompt, topic, subject } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt gerekli" }, { status: 400 });
    }

    // URL uzunluğunu azaltmak için prompt'u kısalt
    const shortPrompt = prompt.length > 200 ? `${prompt.substring(0, 200)}...` : prompt;

    // Daha kısa ve öz bir prompt oluştur
    const cleanPrompt = `Educational: ${shortPrompt}. Subject: ${subject || "education"}. Topic: ${topic || "science"}. Professional, detailed`;

    const seed = Math.floor(Math.random() * 1000000);

    // URL'yi daha kısa tut
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=768&height=768&seed=${seed}&enhance=true&nologo=true`;

    return NextResponse.json({
      imageUrl,
      success: true,
      confidence: 0.9,
    });
  } catch {
    return NextResponse.json({ error: "Hata oluştu" }, { status: 500 });
  }
}
