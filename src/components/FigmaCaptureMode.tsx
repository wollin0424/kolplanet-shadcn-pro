"use client";

import { useEffect } from "react";

export default function FigmaCaptureMode() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("figmaCapture") !== "1") return;

    document.documentElement.classList.add("figma-capture");

    const scrollTimer = window.setTimeout(() => {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
    }, 1500);

    return () => {
      window.clearTimeout(scrollTimer);
      document.documentElement.classList.remove("figma-capture");
    };
  }, []);

  return null;
}
