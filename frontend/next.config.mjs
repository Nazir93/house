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
    /** Шире диапазон — меньше апскейла крупных PNG на мониторах 2K+ (герой 100vw). */
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2048, 2560, 3840],
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
      {
        protocol: "https",
        hostname: "images.unsplash.com",
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
