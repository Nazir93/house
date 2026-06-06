import { withSerwist } from "@serwist/turbopack";

const cspReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://smartcaptcha.yandexcloud.net https://*.yandex.ru https://*.yandex.net https://*.yandex.com https://api-maps.yandex.ru",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https: http://localhost http://127.0.0.1",
  "font-src 'self' data:",
  "connect-src 'self' https://api.telegram.org https://smartcaptcha.yandexcloud.net https://*.yandex.ru https://*.yandex.net https://*.yandex.com https://*.bitrix24.ru https://*.bitrix24.com",
  "frame-src 'self' https://smartcaptcha.yandexcloud.net https://*.yandex.ru https://*.yandex.net https://*.yandex.com https://rtsp.me https://*.rtsp.me https://ivideon.com https://*.ivideon.com",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  images: {
    /** Кэш оптимизированных картинок на CDN/edge — повторный визит быстрее (сек.). */
    minimumCacheTTL: 60 * 60 * 24 * 7,
    formats: ["image/avif", "image/webp"],
    /**
     * Явные quality из кода (баннер, карточки). Без списка Next 16 ругается и может вести себя непредсказуемо.
     * Меньше «мегабайтных» брейкпоинтов — быстрее первый ответ `/_next/image` и меньше трафик, чем 2.5K–4K.
     */
    qualities: [75, 78, 80, 82, 85, 90, 96],
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2560, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: "http", hostname: "localhost" },
      { protocol: "http", hostname: "127.0.0.1" },
      {
        protocol: "https",
        hostname: "dom.ru",
      },
      {
        protocol: "https",
        hostname: "*.dom.ru",
      },
      {
        protocol: "https",
        hostname: "garantmontazh.ru",
      },
      {
        protocol: "https",
        hostname: "*.garantmontazh.ru",
      },
    ],
  },
  async redirects() {
    return [
      { source: "/services/projecting", destination: "/services/proektirovanie", permanent: true },
      { source: "/services/foundation", destination: "/services/fundament", permanent: true },
      { source: "/services/roofing", destination: "/services/krovlya", permanent: true },
      { source: "/services/engineering", destination: "/services/inzheneriya", permanent: true },
      { source: "/services/finishing", destination: "/services/otdelka", permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/uploads/:path*",
          destination: "/api/uploads/:path*",
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value: cspReportOnly,
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
