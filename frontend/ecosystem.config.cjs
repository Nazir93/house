/**
 * PM2: процесс переживает выход из SSH и перезапускается при падении.
 * На VPS из папки frontend:
 *   npm ci && npm run build
 *   Схема БД (только Prisma из node_modules, не npx prisma без проекта — иначе подтянется Prisma 7+):
 *   export DATABASE_URL=... && npm run db:push:server
 *   (postinstall: prisma generate; при ошибках типов: npm run build:with-prisma)
 *   pm2 start ecosystem.config.cjs
 *   pm2 save
 *   pm2 startup   # один раз — выполнить выведенную команду sudo ...
 */
const path = require("path");

module.exports = {
  apps: [
    {
      name: "house-next",
      cwd: __dirname,
      script: path.join(__dirname, "node_modules/next/dist/bin/next"),
      args: "start -H 0.0.0.0",
      instances: 1,
      autorestart: true,
      watch: false,
      max_restarts: 15,
      min_uptime: "10s",
      max_memory_restart: "900M",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
  ],
};
