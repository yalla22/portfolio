import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "fd-theme";

function getInitialTheme() {
  if (typeof document !== "undefined") {
    const current = document.documentElement.getAttribute("data-theme");
    if (current === "light" || current === "dark") return current;
  }
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      /* ignore */
    }
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", theme === "dark" ? "#0E1116" : "#FBFBF9");
  }, [theme]);

  // Enable the color transition only after first paint, to avoid a flash.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      document.documentElement.classList.add("theme-anim");
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const toggle = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggle, setTheme };
}
