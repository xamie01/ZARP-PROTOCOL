"use client";

import { useEffect, useRef } from "react";

type RevealDirection = "up" | "left" | "right";

interface ScrollRevealOptions {
  threshold?: number;
  delay?: number;
  direction?: RevealDirection;
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const { threshold = 0.15, delay = 0, direction = "up" } = options;
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const hiddenClass =
      direction === "left"
        ? "reveal-left"
        : direction === "right"
        ? "reveal-right"
        : "reveal-hidden";

    el.classList.add(hiddenClass);
    if (delay) el.style.transitionDelay = `${delay}ms`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.remove(hiddenClass);
          el.classList.add("reveal-visible");
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, delay, direction]);

  return ref;
}
