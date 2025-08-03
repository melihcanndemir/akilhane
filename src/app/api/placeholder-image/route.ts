import { NextResponse } from 'next/server';

export async function GET() {
  // SVG placeholder image
  const svg = `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#f3f4f6"/>
      <rect x="50" y="50" width="300" height="200" fill="#e5e7eb" stroke="#d1d5db" stroke-width="2"/>
      <text x="200" y="120" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle">
        AI Görsel Yükleniyor...
      </text>
      <text x="200" y="150" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af" text-anchor="middle">
        Görsel üretimi için AI kullanılıyor
      </text>
      <circle cx="200" cy="200" r="20" fill="#3b82f6" opacity="0.6">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  `;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
