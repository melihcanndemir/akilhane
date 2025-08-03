import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, topic, subject } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt gerekli' }, { status: 400 });
    }

    console.log('🎨 Pollinations.ai ile görsel üretiliyor...');

    const cleanPrompt = `Educational illustration: ${prompt}. Clean, professional, educational diagram for Turkish students. Subject: ${subject || 'education'}. Topic: ${topic || 'science'}. High quality, detailed, informative`;

    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=768&height=768&seed=${seed}&enhance=true&nologo=true`;

    console.log('✅ Görsel URL oluşturuldu:', imageUrl);

    return NextResponse.json({
      imageUrl,
      success: true,
      confidence: 0.9,
    });

  } catch (error) {
    console.error('💥 Pollinations API error:', error);
    return NextResponse.json({ error: 'Hata oluştu' }, { status: 500 });
  }
}
