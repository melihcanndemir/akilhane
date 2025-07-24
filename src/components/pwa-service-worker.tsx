'use client';

import { useEffect } from 'react';

export default function PWAServiceWorker() {
  useEffect(() => {
    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          console.log('🔧 Registering Service Worker...');
          
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/',
            updateViaCache: 'none'
          });

          console.log('✅ Service Worker registered successfully:', registration);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            console.log('🔄 Service Worker update found');
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('🆕 New version available');
                  // You can show a notification to the user here
                }
              });
            }
          });

          // Handle service worker updates
          let refreshing = false;
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (!refreshing) {
              refreshing = true;
              window.location.reload();
            }
          });

        } catch (error) {
          console.error('❌ Service Worker registration failed:', error);
        }
      } else {
        console.log('⚠️ Service Worker not supported');
      }
    };

    registerServiceWorker();
  }, []);

  return null; // This component doesn't render anything
} 