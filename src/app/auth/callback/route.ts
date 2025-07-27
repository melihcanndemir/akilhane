import { NextRequest, NextResponse } from 'next/server';

// Force this route to be dynamic
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    // The Supabase client-side will handle the code exchange
    // We just need to redirect to the main page with the code in the URL
    // so the client-side auth can pick it up
    console.log('Auth callback received code, redirecting to:', next);
  }

  // Always redirect to the main page where client-side auth will handle the session
  return NextResponse.redirect(`${origin}${next}`);
} 