import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ServiceWorkerInit } from "./RootLayoutClient";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#130c08",
};

export const metadata: Metadata = {
  title: "Истории кафе",
  description: "Сторис-меню с видео и анимированными карточками блюд",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  manifest: "/manifest.json",
  keywords: ["меню", "видео", "кафе", "ресторан", "планшет"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {process.env.NODE_ENV !== "production" ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function () {
                  if (typeof window === "undefined") return;
                  if (!("serviceWorker" in navigator) || !("caches" in window)) return;

                  Promise.all([
                    navigator.serviceWorker.getRegistrations().then(function (registrations) {
                      return Promise.all(
                        registrations.map(function (registration) {
                          return registration.unregister().catch(function () {});
                        })
                      );
                    }),
                    caches.keys().then(function (keys) {
                      return Promise.all(
                        keys.map(function (key) {
                          return caches.delete(key).catch(function () {});
                        })
                      );
                    }),
                  ]).finally(function () {
                    if (navigator.serviceWorker.controller) {
                      window.location.reload();
                    }
                  });
                })();
              `,
            }}
          />
        ) : null}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Видеоменю" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <ServiceWorkerInit />
      </body>
    </html>
  );
}
