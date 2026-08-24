"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          background: "#0a0a0a",
          color: "#ededed",
        }}
      >
        <h1 style={{ fontSize: "1.125rem", fontWeight: 500 }}>
          Zivo could not load
        </h1>
        <p style={{ fontSize: "0.875rem", color: "#a3a3a3" }}>
          {error.digest ?? "An unexpected error stopped the app from starting."}
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            border: "1px solid #303030",
            borderRadius: "0.5rem",
            padding: "0.5rem 1rem",
            background: "transparent",
            color: "inherit",
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
