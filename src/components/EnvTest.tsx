'use client';

import React from 'react';

const EnvTest = () => {
  const allEnvVars = {
    // Supabase Configuration
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    
    // AI Configuration (Note: server-side only, won't show in client)
    geminiKey: process.env.GEMINI_API_KEY,
    googleGenaiKey: process.env.GOOGLE_GENAI_API_KEY,
    googleAiKey: process.env.GOOGLE_AI_API_KEY,
    
    // Google OAuth
    googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    
    // Cloudinary Configuration (Note: server-side only, won't show in client)
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinaryPublicCloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
    
    // Demo Mode
    demoMode: process.env.NEXT_PUBLIC_DEMO_MODE,
    
    // System
    nodeEnv: process.env.NODE_ENV,
  };

  const allPublicVars = Object.keys(process.env).filter(key => 
    key.startsWith('NEXT_PUBLIC_')
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      background: 'rgba(0,0,0,0.9)',
      color: 'white',
      padding: '20px',
      fontSize: '12px',
      zIndex: 9999,
      maxHeight: '100vh',
      overflow: 'auto',
      width: '100vw'
    }}>
      <h2>🔍 Environment Variables Debug</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>📝 Client-side Variables (NEXT_PUBLIC_*):</h3>
        <div>NEXT_PUBLIC_SUPABASE_URL: {allEnvVars.supabaseUrl || '❌ MISSING'}</div>
        <div>NEXT_PUBLIC_SUPABASE_ANON_KEY: {allEnvVars.supabaseKey || '❌ MISSING'}</div>
        <div>NEXT_PUBLIC_GOOGLE_CLIENT_ID: {allEnvVars.googleClientId || '❌ MISSING'}</div>
        <div>NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: {allEnvVars.cloudinaryPublicCloudName || '❌ MISSING'}</div>
        <div>NEXT_PUBLIC_DEMO_MODE: {allEnvVars.demoMode || '❌ MISSING'}</div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>🔒 Server-side Variables (not visible in client):</h3>
        <div>GEMINI_API_KEY: {allEnvVars.geminiKey ? '✅ SET' : '❌ MISSING'}</div>
        <div>GOOGLE_GENAI_API_KEY: {allEnvVars.googleGenaiKey ? '✅ SET' : '❌ MISSING'}</div>
        <div>GOOGLE_AI_API_KEY: {allEnvVars.googleAiKey ? '✅ SET' : '❌ MISSING'}</div>
        <div>CLOUDINARY_CLOUD_NAME: {allEnvVars.cloudinaryCloudName ? '✅ SET' : '❌ MISSING'}</div>
        <div>CLOUDINARY_API_KEY: {allEnvVars.cloudinaryApiKey ? '✅ SET' : '❌ MISSING'}</div>
        <div>CLOUDINARY_API_SECRET: {allEnvVars.cloudinaryApiSecret ? '✅ SET' : '❌ MISSING'}</div>
        <div style={{ fontSize: '10px', color: '#888', marginTop: '5px' }}>
          ℹ️ Server-side variables are not exposed to the browser for security
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>🔍 All NEXT_PUBLIC_ Variables Found:</h3>
        {allPublicVars.length > 0 ? (
          allPublicVars.map(key => (
            <div key={key}>{key}: {process.env[key] || 'EMPTY'}</div>
          ))
        ) : (
          <div>❌ NO NEXT_PUBLIC_ VARIABLES FOUND!</div>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>🛠️ System Info:</h3>
        <div>NODE_ENV: {allEnvVars.nodeEnv}</div>
        <div>Current URL: {typeof window !== 'undefined' ? window.location.href : 'SSR'}</div>
        <div>User Agent: {typeof navigator !== 'undefined' ? navigator.userAgent : 'SSR'}</div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>🔧 Fix Instructions:</h3>
        <div>1. Check .env is in project ROOT (same level as package.json)</div>
        <div>2. Restart dev server completely (Ctrl+C, then npm run dev)</div>
        <div>3. Clear .next cache: rm -rf .next</div>
        <div>4. If using Turbopack: try npm run dev --no-turbo</div>
        <div>5. Make sure .env file has no spaces around = signs</div>
        <div>6. Server-side vars won't show in client - check server logs</div>
      </div>

      <button 
        onClick={() => window.location.reload()} 
        style={{
          padding: '10px 20px',
          background: 'blue',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Reload Page
      </button>
    </div>
  );
};

export default EnvTest; 