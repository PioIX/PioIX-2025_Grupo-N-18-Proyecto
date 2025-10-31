// src/app/layout.js
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head />
      <body style={{ margin: 0, fontFamily: "Inter, Arial, sans-serif" }}>
        <header style={{
          background: "#0b1220",
          color: "#fff",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <h1 style={{ margin: 0 }}>🃏 Truco Argentino — 1 vs 1</h1>
        </header>

        <main style={{ minHeight: "calc(100vh - 88px)", background: "#08101a", color: "#e6eef8", padding: 20 }}>
          {children}
        </main>

        <footer style={{
          textAlign: "center",
          padding: "10px 8px",
          color: "#9fb0c8",
          background: "#071018"
        }}>
          Proyecto escolar — Truco 1v1 (sin chat) · Hecho con React + Next.js
        </footer>
      </body>
    </html>
  );
}
