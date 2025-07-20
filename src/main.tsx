import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Toaster } from "@/components/ui/toaster";
import { useThemeInit } from "@/hooks/useThemeInit";
import { useEffect } from "react";

const AppWithTheme = () => {
  useThemeInit();

  useEffect(() => {
    generateFaviconWithLucide();
  }, []);

  return (
    <>
      <App />
      <Toaster />
    </>
  );
};

createRoot(document.getElementById("root")!).render(<AppWithTheme />);

// ---- Favicon generation with Lucide icon ---- //
function generateFaviconWithLucide() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Draw white rounded rectangle
  const radius = 10;
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.moveTo(8 + radius, 8);
  ctx.lineTo(56 - radius, 8);
  ctx.quadraticCurveTo(56, 8, 56, 8 + radius);
  ctx.lineTo(56, 56 - radius);
  ctx.quadraticCurveTo(56, 56, 56 - radius, 56);
  ctx.lineTo(8 + radius, 56);
  ctx.quadraticCurveTo(8, 56, 8, 56 - radius);
  ctx.lineTo(8, 8 + radius);
  ctx.quadraticCurveTo(8, 8, 8 + radius, 8);
  ctx.closePath();
  ctx.fill();

  // Updated Lucide "BookOpen" SVG (larger viewBox for better scaling)
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none"
    stroke="black" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 7v14"/>
    <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>
  </svg>`;

  const svgBlob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();
  img.onload = () => {
    // Clear & draw background
    ctx.clearRect(0, 0, 64, 64);
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, 2 * Math.PI); // x, y, radius
    ctx.fill();
    ctx.fill();

    // Draw icon larger (take up 80% of canvas)
    const iconSize = 43; // 80% of 64 

    const offset = (64 - iconSize) / 2;
    ctx.drawImage(img, offset, offset, iconSize, iconSize);
    // Set favicon
    const faviconUrl = canvas.toDataURL("image/png");
    let link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = faviconUrl;

    URL.revokeObjectURL(url);
  };
  img.src = url;
}
