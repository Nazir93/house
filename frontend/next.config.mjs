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
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920],
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
        ],
      },
    ];
  },
};

export default nextConfig;
