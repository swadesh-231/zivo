import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

import { APP_META } from "@/design/app-meta";
import "./globals.css";

/**
 * Three families, fixed.
 *
 * A design direction is largely a typographic decision — an editorial layout
 * needs a real display serif and a utility layout needs true monospace
 * metadata — so the range has to exist before the agent can reach for it. It
 * ships here rather than being installed per design: `next/font` rewrites the
 * layout it is declared in, and the layout is shell the agent may not touch.
 */
const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: `${APP_META.name} — design`,
  description: APP_META.tagline,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${geistMono.variable} ${display.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
