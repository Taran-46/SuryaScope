import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "SURYASCOPE — Know Your Roof Before You Install",
    template: "%s | SURYASCOPE",
  },
  description: "Rooftop solar pre-feasibility platform. Understand your roof's solar potential, estimated savings, and payback before scheduling a physical site visit.",
  keywords: ["solar", "rooftop", "renewable energy", "solar potential", "solar calculator", "clean energy", "climate tech"],
  authors: [{ name: "SURYASCOPE" }],
  creator: "SURYASCOPE",
  publisher: "SURYASCOPE",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://suryascope.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://suryascope.com",
    siteName: "SURYASCOPE",
    title: "SURYASCOPE — Know Your Roof Before You Install",
    description: "Rooftop solar pre-feasibility platform. Understand your roof's solar potential, estimated savings, and payback before scheduling a physical site visit.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SURYASCOPE — Rooftop Solar Intelligence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SURYASCOPE — Know Your Roof Before You Install",
    description: "Rooftop solar pre-feasibility platform. Understand your roof's solar potential, estimated savings, and payback before scheduling a physical site visit.",
    images: ["/og-image.png"],
    creator: "@suryascope",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}