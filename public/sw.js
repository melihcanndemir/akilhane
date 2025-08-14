const CACHE_NAME = 'akilhane-v1.0.0';
const urlsToCache = [
  '/',
  '/quiz',
  '/flashcard',
  '/ai-chat',
  '/question-manager',
  '/subject-manager',
  '/settings',
  '/api/subjects',
  '/api/questions',
  '/api/quiz',
  '/api/results',
  '/api/analytics/performance',
  '/favicon.svg',
  '/favicon.ico',
  '/manifest.json'
];

// 🚫 SERVICE WORKER GEÇİCİ OLARAK DEVREDİŞI BIRAKILDI
// Sorun çözüldükten sonra tekrar aktif edilecek

// Install event - Cache static assets
// self.addEventListener('install', (event) => {
//   console.log('🎯 Service Worker installing...');
//   event.waitUntil(
//     caches.open(CACHE_NAME)
//       .then((cache) => {
//         console.log('📦 Caching static assets');
//         return cache.addAll(urlsToCache);
//       })
//       .then(() => {
//         console.log('✅ Service Worker installed successfully');
//         return self.skipWaiting();
//       })
//       .catch((error) => {
//         console.error('❌ Service Worker installation failed:', error);
//       })
//   );
// });

// Activate event - Clean up old caches
// self.addEventListener('activate', (event) => {
//   console.log('🔄 Service Worker activating...');
//   event.waitUntil(
//     caches.keys().then((cacheNames) => {
//       return Promise.all(
//         cacheNames.map((cacheName) => {
//           if (cacheName !== CACHE_NAME) {
//             console.log('🗑️ Deleting old cache:', cacheName);
//             return caches.delete(cacheName);
//           }
//         })
//       );
//     }).then(() => {
//       console.log('✅ Service Worker activated successfully');
//       return self.clients.claim();
//     })
//   );
// });

// Fetch event - Network first, cache fallback
// self.addEventListener('fetch', (event) => {
//   const { request } = event;
//   const url = new URL(request.url);

//   // Skip non-GET requests
//   if (request.method !== 'GET') {
//     return;
//   }

//   // Skip chrome-extension and other non-http requests
//   if (!url.protocol.startsWith('http')) {
//     return;
//   }

//   // API requests - Network first, cache fallback
//   if (url.pathname.startsWith('/api/')) {
//     event.respondWith(
//       fetch(request)
//         .then((response) => {
//           // Cache successful API responses
//           if (response.status === 200) {
//             const responseClone = response.clone();
//             caches.open(CACHE_NAME)
//               .then((cache) => {
//                 cache.put(request, responseClone);
//               });
//           }
//           return response;
//         })
//         .catch(() => {
//           // Return cached version if network fails
//           return caches.match(request)
//             .then((cachedResponse) => {
//               if (cachedResponse) {
//               console.log('📦 Serving cached API response:', url.pathname);
//               return cachedResponse;
//             }
//             // Return offline page for API requests
//             return new Response(
//               JSON.stringify({ 
//                 error: 'Offline mode - API not available',
//                 message: 'Lütfen internet bağlantınızı kontrol edin'
//               }),
//               {
//                 status: 503,
//                 statusText: 'Service Unavailable',
//                 headers: { 'Content-Type': 'application/json' }
//               }
//             );
//           });
//         })
//     );
//     return;
//   }

//   // Static assets and pages - Cache first, network fallback
//   event.respondWith(
//     caches.match(request)
//       .then((cachedResponse) => {
//         if (cachedResponse) {
//           console.log('📦 Serving cached response:', url.pathname);
//           return cachedResponse;
//         }

//         return fetch(request)
//           .then((response) => {
//             // Cache successful responses
//             if (response.status === 200) {
//               const responseClone = response.clone();
//               caches.open(CACHE_NAME)
//                 .then((cache) => {
//                   cache.put(request, responseClone);
//                 });
//             }
//             return response;
//           })
//           .catch(() => {
//             // Return offline page for navigation requests
//             if (request.destination === 'document') {
//               return caches.match('/offline.html')
//                 .then((offlineResponse) => {
//                   return offlineResponse || new Response(
//                     `
//                     <!DOCTYPE html>
//                     <html lang="tr">
//                     <head>
//                       <meta charset="UTF-8">
//                       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//                       <title>AkılHane - Çevrimdışı</title>
//                       <style>
//                         body { 
//                           font-family: 'Inter', sans-serif; 
//                           background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
//                           margin: 0; padding: 20px; min-height: 100vh;
//                           display: flex; align-items: center; justify-content: center;
//                         }
//                         .container { 
//                           background: white; padding: 40px; border-radius: 16px;
//                           text-align: center; max-width: 400px; box-shadow: 0 20px 40px rgba(0,0,0,0.1);
//                         }
//                         h1 { color: #3b82f6; margin-bottom: 20px; }
//                         p { color: #6b7280; line-height: 1.6; }
//                         .btn { 
//                           background: #3b82f6; color: white; padding: 12px 24px;
//                           border: none; border-radius: 8px; cursor: pointer;
//                           margin-top: 20px; text-decoration: none; display: inline-block;
//                         }
//                       </style>
//                     </head>
//                     <body>
//                       <div class="container">
//                         <h1>📱 AkılHane</h1>
//                         <p>Şu anda çevrimdışısınız. İnternet bağlantınızı kontrol edip tekrar deneyin.</p>
//                         <button class="btn" onclick="window.location.reload()">Yenile</button>
//                       </div>
//                     </body>
//                     </html>
//                     `,
//                     {
//                       status: 200,
//                       statusText: 'OK',
//                       headers: { 'Content-Type': 'text/html' }
//                     }
//                   );
//                 });
//             }
//             return new Response('Offline', { status: 503 });
//           });
//       })
//   );
// });

// Background sync for offline actions
// self.addEventListener('sync', (event) => {
//   console.log('🔄 Background sync triggered:', event.tag);
  
//   if (event.tag === 'background-sync') {
//     event.waitUntil(
//       // Handle background sync tasks
//       console.log('🔄 Processing background sync...')
//     );
//   }
// });

// Push notification handling
// self.addEventListener('push', (event) => {
//   console.log('📱 Push notification received');
  
//   const options = {
//     body: event.data ? event.data.text() : 'AkılHane\'den yeni bildirim',
//     icon: '/favicon.svg',
//     badge: '/favicon.svg',
//     vibrate: [100, 50, 100],
//     data: {
//       dateOfArrival: Date.now(),
//       primaryKey: 1
//     },
//     actions: [
//       {
//         action: 'explore',
//         title: 'Aç',
//         icon: '/favicon.svg'
//       },
//       {
//         action: 'close',
//         title: 'Kapat',
//         icon: '/favicon.svg'
//       }
//     ]
//   };

//   event.waitUntil(
//     self.registration.showNotification('AkılHane', options)
//   );
// });

// Notification click handling
// self.addEventListener('notificationclick', (event) => {
//   console.log('📱 Notification clicked:', event.action);
  
//   event.notification.close();

//   if (event.action === 'explore') {
//     event.waitUntil(
//       clients.openWindow('/')
//     );
//   }
// }); 