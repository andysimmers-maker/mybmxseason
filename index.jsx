import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled error in app:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: "#0d0d0d", minHeight: "100vh", color: "#f0f0f0",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "system-ui, sans-serif", textAlign: "center", padding: 24,
        }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Something went wrong</div>
            <div style={{ fontSize: 14, color: "#9a9a9a", marginBottom: 20 }}>Try refreshing the page.</div>
            <button onClick={() => window.location.reload()} style={{
              background: "#e63329", color: "#fff", border: "none",
              borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontSize: 14, fontWeight: 600,
            }}>
              Refresh
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const root = createRoot(document.getElementById("root"));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
