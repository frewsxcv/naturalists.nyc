import * as React from "react";
import * as ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

const elem = document.getElementById("root");

if (!elem) {
  throw new Error("Root element not found");
}

// Automatically detect dark/light mode
(() => {
  const isDarkModeEnabled = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const setTheme = (theme: "dark" | "light") =>
    document.documentElement.setAttribute("data-bs-theme", theme);
  const updateTheme = () => setTheme(isDarkModeEnabled() ? "dark" : "light");
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", updateTheme);
  updateTheme();
})();

const root = ReactDOM.createRoot(elem);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
