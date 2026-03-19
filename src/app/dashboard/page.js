"use client";

export default function DashboardPage() {
  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Dashboard</h1>
      <p>You are logged in.</p>

      <button
        type="button"
        onClick={handleLogout}
        style={{
          marginTop: "1rem",
          padding: "0.75rem 1rem",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </main>
  );
}