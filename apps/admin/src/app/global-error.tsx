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
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", backgroundColor: "#f8fafc" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1e293b", marginBottom: "0.5rem" }}>
              Critical Error
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#64748b", marginBottom: "1.5rem" }}>
              Something went wrong. Please refresh the page.
            </p>
            {error.digest && (
              <p style={{ fontSize: "0.75rem", color: "#94a3b8", fontFamily: "monospace", marginBottom: "1rem" }}>
                ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                padding: "0.625rem 1.25rem",
                backgroundColor: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
