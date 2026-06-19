:root {
  --bg: #F6F9FB;
  --surface: #FFFFFF;
  --border: #E2E8EF;
  --blue: #109BD7;
  --blue-dark: #0C7AAD;
  --bg-blue: #C9EAF7;
  --text: #1B2733;
  --text-secondary: #5B6B7A;
  --danger-bg: #FCEBEB;
  --danger-text: #791F1F;
  --warning-bg: #FAEEDA;
  --warning-text: #633806;
  --success-bg: #EAF3DE;
  --success-text: #27500A;
  --radius-md: 8px;
  --radius-lg: 12px;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", sans-serif;
  background: var(--bg);
  color: var(--text);
}

.app-shell { min-height: 100vh; display: flex; flex-direction: column; }

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  z-index: 10;
}

.brand { font-weight: 700; font-size: 16px; color: var(--blue-dark); }
.brand span { font-weight: 400; color: var(--text-secondary); font-size: 13px; margin-left: 6px; }

.topbar nav { display: flex; gap: 8px; }
.topbar nav a {
  text-decoration: none;
  font-size: 13px;
  color: var(--text-secondary);
  padding: 8px 14px;
  border-radius: var(--radius-md);
}
.topbar nav a.active { background: var(--bg-blue); color: var(--blue-dark); font-weight: 500; }

main { flex: 1; padding: 24px; max-width: 980px; margin: 0 auto; width: 100%; }

@media (max-width: 600px) {
  main { padding: 14px; }
  .topbar { padding: 10px 14px; flex-direction: column; gap: 8px; align-items: flex-start; }
}

button {
  font-family: inherit;
  cursor: pointer;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
}
button:hover { background: var(--bg-blue); }

table { border-collapse: collapse; width: 100%; font-size: 13px; }
th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid var(--border); }
th { color: var(--text-secondary); font-weight: 400; }
