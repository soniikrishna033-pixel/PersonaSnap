/* 
  PersonaSnap 2.0 - Push Notification Service Worker (Monetag Placeholder)

  Instructions for Ad Integration:
  1. Once you create your Monetag account, they will provide a specific script snippet to place in your index.html <head>.
  2. They will also provide a service worker file (usually named 'sw.js' or similar). 
  3. Replace this file's contents with their exact code to enable Push Notifications.
  
  The strategy below outlines the Push Notification Retention Loop for PersonaSnap:
  - Day 1: "Welcome! Take your first quiz 🎯"
  - Day 3: "New article: Stop Overthinking"
  - Day 7: "🔥 Keep your streak alive!"
  - Day 14: "Your 2-week check-in is ready"
  - Day 30: "Retake your quiz — did you grow this month? 📈"
*/

self.addEventListener('install', (event) => {
  console.log('[PersonaSnap] Service Worker Installing...');
  // Monetag's script will handle the push subscription logic here
});

self.addEventListener('activate', (event) => {
  console.log('[PersonaSnap] Service Worker Activated.');
});

self.addEventListener('push', (event) => {
  console.log('[PersonaSnap] Push Notification Received', event);
  
  // Example placeholder for push payload
  const payload = event.data ? event.data.text() : 'Check out what is new on PersonaSnap!';
  
  const options = {
    body: payload,
    icon: '/assets/icon.png', // Add a 192x192 icon here
    badge: '/assets/badge.png', // Add a monochrome 96x96 badge here
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification('PersonaSnap 🧠', options)
  );
});
