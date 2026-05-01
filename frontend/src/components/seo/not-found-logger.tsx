"use client";

import { useEffect } from "react";

export function NotFoundLogger() {
  useEffect(() => {
    fetch("/api/log-404", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: window.location.pathname,
        referer: document.referrer || null,
      }),
    }).catch(() => {});
  }, []);

  return null;
}
