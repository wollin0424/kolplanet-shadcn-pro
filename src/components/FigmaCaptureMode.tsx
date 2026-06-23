"use client";

import { useEffect } from "react";

export default function FigmaCaptureMode() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("figmaCapture") !== "1") return;

    document.documentElement.classList.add("figma-capture");

    const width = params.get("figmaWidth");
    if (width && /^\d+$/.test(width)) {
      document.documentElement.style.setProperty("--figma-capture-width", `${width}px`);
    }

    const scrollTimer = window.setTimeout(() => {
      const scrollHeight = document.documentElement.scrollHeight;
      window.scrollTo({ top: scrollHeight, behavior: "instant" });
      window.setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
      }, 400);
    }, 2500);

    return () => {
      window.clearTimeout(scrollTimer);
      document.documentElement.classList.remove("figma-capture");
    };
  }, []);

  return null;
}
