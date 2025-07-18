import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { initScrollPerformance } from "./lib/scroll-performance";

// Create root element
window.addEventListener("DOMContentLoaded", () => {
  const imgs = document.querySelectorAll("img:not([loading])");
  imgs.forEach((img) => {
    img.setAttribute("loading", "lazy");
    img.setAttribute("decoding", "async");
  });
});
const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Initialize performance optimizations
window.addEventListener('DOMContentLoaded', () => {
  // Initialize scroll performance enhancements
  initScrollPerformance();
  
  // Add class to mark sections that can be lazy-loaded
  document.querySelectorAll('section:not(:first-child)').forEach(section => {
    section.classList.add('lazy-section');
  });
});
