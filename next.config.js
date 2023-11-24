/**
 * @format
 * @type {import('next').NextConfig}
 */

const nextConfig = {
  reactStrictMode: true,
  basePath: '/receipt-manager',
  output: 'export',
  env: {
    basePath: '/receipt-manager',
    // NEXT_PUBLIC_FIREBASE_API_KEY: 'AIzaSyAYytnWLc4vB2glt1X8tWz27gpgclDvrls',
    // NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'protected-page-login.firebaseapp.com',
    // NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'protected-page-login',
    // NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'protected-page-login.appspot.com',
    // NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '1006126548565',
    // NEXT_PUBLIC_FIREBASE_APP_ID: '1:1006126548565:web:3968fb892dec003f15b6dc',
    // NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: 'G-G3GNEWJKK7',
  },
};

module.exports = nextConfig;
