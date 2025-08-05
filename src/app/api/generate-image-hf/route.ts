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
  } catch (error) {
    console.error("Image generation error:", error);
    
    let errorMessage = "Resim oluşturulurken bir hata oluştu.";
    
    if (error instanceof Error) {
      if (error.message.includes("network") || error.message.includes("timeout")) {
        errorMessage = "Resim servisi şu anda erişilebilir değil. Lütfen daha sonra tekrar deneyin.";
      } else if (error.message.includes("invalid") || error.message.includes("malformed")) {
        errorMessage = "Resim oluşturma isteği geçersiz. Lütfen farklı bir açıklama deneyin.";
      }
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      success: false 
    }, { status: 500 });
  }
}
