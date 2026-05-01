"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isDev = process.env.NODE_ENV === "development";

  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0A0A0A",
          color: "#E8E4DC",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420, padding: 20 }}>
          <h1 style={{ fontSize: 28, marginBottom: 12 }}>Произошла ошибка</h1>
          <p style={{ fontSize: 14, color: "#9C9A94", marginBottom: 24 }}>
            Что-то пошло не так. Попробуйте обновить страницу.
          </p>
          {isDev && (
            <pre
              style={{
                textAlign: "left",
                fontSize: 11,
                color: "#7a786f",
                marginBottom: 20,
                maxHeight: 160,
                overflow: "auto",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {error.message}
              {error.digest ? `\n\ndigest: ${error.digest}` : ""}
            </pre>
          )}
          {!isDev && error.digest ? (
            <p style={{ fontSize: 12, color: "#7a786f", marginBottom: 20 }}>Код: {error.digest}</p>
          ) : null}
          <button
            onClick={reset}
            style={{
              padding: "12px 28px",
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              borderRadius: 9999,
              border: "1px solid rgba(15,61,46,0.4)",
              background: "transparent",
              color: "#E8E4DC",
              cursor: "pointer",
            }}
          >
            Попробовать снова
          </button>
        </div>
      </body>
    </html>
  );
}
