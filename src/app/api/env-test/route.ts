import { NextResponse } from "next/server";

export async function GET() {
  const envVars = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "✅ SET" : "❌ MISSING",
    GOOGLE_GENAI_API_KEY: process.env.GOOGLE_GENAI_API_KEY
      ? "✅ SET"
      : "❌ MISSING",
    GOOGLE_AI_API_KEY: process.env.GOOGLE_AI_API_KEY ? "✅ SET" : "❌ MISSING",
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL
      ? "✅ SET"
      : "❌ MISSING",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? "✅ SET"
      : "❌ MISSING",
    NODE_ENV: process.env.NODE_ENV || "development",
  };

  const hasApiKey = Boolean(
    process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY ||
      process.env.GOOGLE_AI_API_KEY,
  );

  return NextResponse.json({
    environment: "server",
    hasApiKey,
    envVars,
    timestamp: new Date().toISOString(),
  });
}
