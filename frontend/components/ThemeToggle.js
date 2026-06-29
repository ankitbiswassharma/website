"use client";

import { useEffect, useState } from "react";

const DEFAULT_THEME = "light";
const THEME_COOKIE = "muskit-theme";

function persistTheme(theme) {
  document.documentElement.dataset.theme = theme;
  window.localStorage.setItem(THEME_COOKIE, theme);
  document.cookie = `${THEME_COOKIE}=${encodeURIComponent(theme)}; path=/; max-age=31536000; SameSite=Lax`;
}

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState(DEFAULT_THEME);

  useEffect(() => {
    setMounted(true);
    const resolvedTheme =
      document.documentElement.dataset.theme ||
      window.localStorage.getItem(THEME_COOKIE) ||
      DEFAULT_THEME;

    persistTheme(resolvedTheme);
    setTheme(resolvedTheme);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    persistTheme(nextTheme);
    setTheme(nextTheme);
  }

  return (
    <button
      className="theme-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {mounted ? (theme === "dark" ? "Light mode" : "Dark mode") : "Theme"}
    </button>
  );
}
