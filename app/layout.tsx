import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://pixiebuddy.app"),
  title: "PixieBuddy — A tiny companion that lives on your desktop",
  description: "A gentle, collectible pixel-art desktop pet for Windows. 100% offline, no account, no telemetry. Get PixieBuddy for free.",
  icons: { icon: "/assets/icons/tray.webp", shortcut: "/assets/icons/tray.webp" },
  openGraph: {
    title: "PixieBuddy — A tiny universe on your desktop",
    description: "Care, evolve, collect and focus together. 100% offline for Windows · Free.",
    type: "website",
    images: [{ url: "/og-achievements.png", width: 1536, height: 1024, alt: "PixieBuddy with its cosmic achievement shelf" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PixieBuddy — A tiny universe on your desktop",
    description: "A gentle pixel-art desktop companion. 100% offline · Free.",
    images: ["/og-achievements.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}