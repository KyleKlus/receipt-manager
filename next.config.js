/**
 * @format
 * @type {import('next').NextConfig}
 */

const nextConfig = {
  reactStrictMode: true,
  basePath: '/receipt-manager',
  output: 'export',
  images: { unoptimized: true },
  env: {
    basePath: '/receipt-manager',
    NEXT_PUBLIC_FIREBASE_API_KEY: 'AIzaSyChYZbQkmc4s9csPwyeeadexqhbJeXJKN4',
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: 'receipt-manager-25bc4.firebaseapp.com',
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'receipt-manager-25bc4',
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: 'receipt-manager-25bc4.appspot.com',
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: '531877776041',
    NEXT_PUBLIC_FIREBASE_APP_ID: '1:531877776041:web:5229281461b26e7cfef7b8',
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: 'G-M4R39LKG7B',
  },
  webpack: (config) => {
    config.module.rules?.push({
      test: /templates/,
      loader: "ignore-loader",
    });
    return config;
  },
};

module.exports = nextConfig;
