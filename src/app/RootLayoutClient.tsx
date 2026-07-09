"use client";

import { useEffect } from "react";

export function ServiceWorkerInit() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      // Service workers can break Next.js HMR in dev and appear as reload loops.
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.unregister().catch(() => {
            // Best effort cleanup in development.
          });
        });
      });
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("Service Worker registration failed:", error);
    });
  }, []);

  return null;
}
