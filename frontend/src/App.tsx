import { useEffect, useState } from "react";

type ApiHealth = {
  status: string;
  message: string;
};

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export default function App() {
  const [health, setHealth] = useState<ApiHealth | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${apiUrl}/api/health`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Backend returned HTTP ${response.status}`);
        }
        return (await response.json()) as ApiHealth;
      })
      .then(setHealth)
      .catch((requestError: unknown) => {
        if (requestError instanceof DOMException && requestError.name === "AbortError") {
          return;
        }
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Could not connect to the backend.",
        );
      });

    return () => controller.abort();
  }, []);

  return (
    <main className="page">
      <section className="card">
        <div className="eyebrow">FULL-STACK STARTER</div>
        <h1>Your app starts here.</h1>
        <p className="intro">
          React frontend and FastAPI backend, running independently and ready to
          build on.
        </p>

        <div className="status" aria-live="polite">
          <span
            className={`status-dot ${error ? "status-dot-error" : health ? "status-dot-ok" : ""}`}
          />
          <div>
            <strong>{error ? "Backend not connected" : health ? "Backend connected" : "Checking backend…"}</strong>
            <p>{error ?? health?.message ?? "Waiting for the FastAPI health check."}</p>
          </div>
        </div>

        <div className="footer">
          <span>Frontend</span>
          <code>localhost:5173</code>
          <span className="divider">·</span>
          <span>Backend</span>
          <code>localhost:8000</code>
        </div>
      </section>
    </main>
  );
}
