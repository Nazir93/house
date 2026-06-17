/// <reference lib="esnext" />
/// <reference lib="webworker" />
import { CacheFirst, NetworkOnly, Serwist, StaleWhileRevalidate } from "serwist";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const RUNTIME_CACHE_VERSION = "v5";

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ request }) => request.mode === "navigate",
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ request }) =>
        request.headers.get("RSC") === "1" ||
        request.headers.get("Next-Router-Prefetch") === "1" ||
        request.headers.get("Next-Router-State-Tree") !== null,
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/"),
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ url }) => url.pathname.startsWith("/_next/static/"),
      handler: new CacheFirst({
        cacheName: `next-static-${RUNTIME_CACHE_VERSION}`,
      }),
    },
    {
      matcher: ({ request }) =>
        request.destination === "script" ||
        request.destination === "style" ||
        request.destination === "worker",
      handler: new NetworkOnly(),
    },
    {
      matcher: ({ request }) =>
        request.destination === "font" || request.destination === "image",
      handler: new StaleWhileRevalidate({
        cacheName: `static-media-${RUNTIME_CACHE_VERSION}`,
      }),
    },
  ],
});

serwist.addEventListeners();

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter(
            (name) =>
              (name.startsWith("static-assets") ||
                name.startsWith("static-media") ||
                name.startsWith("next-static")) &&
              !name.endsWith(RUNTIME_CACHE_VERSION)
          )
          .map((name) => caches.delete(name))
      )
    )
  );
});
