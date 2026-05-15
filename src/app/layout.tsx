import type { Metadata, Viewport } from "next";
import { Bungee_Shade, Space_Mono } from "next/font/google";
import "./globals.css";

const bungeeShade = Bungee_Shade({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Chels Block Party - FestFlow",
    template: "%s | Chels Block Party",
  },
  description:
    "Upload your festival schedule screenshot and get a personalized itinerary. Built for Chels Block Party 2026.",
  openGraph: {
    title: "Chels Block Party",
    description:
      "Upload your schedule screenshot and get a personalized festival itinerary for Chels Block Party 2026.",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bungeeShade.variable} ${spaceMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
