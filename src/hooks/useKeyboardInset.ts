"use client";

import { useEffect } from "react";

export function useKeyboardInset() {
  useEffect(() => {
    const root = document.documentElement;
    const viewport = window.visualViewport;

    function updateKeyboardInset() {
      if (!viewport) {
        root.style.setProperty("--keyboard-inset", "0px");
        return;
      }
      const viewportBottom = viewport.offsetTop + viewport.height;
      const inset = Math.max(0, window.innerHeight - viewportBottom);
      root.style.setProperty("--keyboard-inset", `${Math.round(inset)}px`);
    }

    updateKeyboardInset();
    viewport?.addEventListener("resize", updateKeyboardInset);
    viewport?.addEventListener("scroll", updateKeyboardInset);
    window.addEventListener("orientationchange", updateKeyboardInset);

    return () => {
      viewport?.removeEventListener("resize", updateKeyboardInset);
      viewport?.removeEventListener("scroll", updateKeyboardInset);
      window.removeEventListener("orientationchange", updateKeyboardInset);
      root.style.setProperty("--keyboard-inset", "0px");
    };
  }, []);
}

