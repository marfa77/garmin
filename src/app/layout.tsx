import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wellness",
  description: "Recovery · Sleep · Strain — powered by Garmin Venu 2",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#000000",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
