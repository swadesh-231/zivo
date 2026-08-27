import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toast";
import { appUrl } from "@/lib/env";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(appUrl()),
  title: {
    default: "Zivo",
    template: "%s · Zivo",
  },
  description:
    "Zivo turns a description into a mobile app design. Describe the app or the look you want, and agents commit to a design direction and build six screens you can tap through and take away as code.",
  applicationName: "Zivo",
  openGraph: {
    type: "website",
    siteName: "Zivo",
    title: "Zivo — Describe an app, get its design",
    description:
      "Describe an app and get six mobile screens designed in a committed direction, yours as code.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Zivo — Describe an app, get its design",
    description:
      "Describe an app and get six mobile screens designed in a committed direction, yours as code.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <Toaster>{children}</Toaster>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
