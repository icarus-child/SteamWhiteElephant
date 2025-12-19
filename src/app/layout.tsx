import type { Metadata } from "next";
import "./globals.css";
import { CookiesProvider } from "next-client-cookies/server";
import { Inter } from "next/font/google";
import { Fjalla_One } from "next/font/google";
import { Climate_Crisis } from "next/font/google";
import { Inknut_Antiqua } from "next/font/google";
import { Flavors } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fjalla = Fjalla_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-fjalla",
  display: "swap",
});

const climate = Climate_Crisis({
  subsets: ["latin"],
  variable: "--font-climate",
  display: "swap",
});

const inknut = Inknut_Antiqua({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-inknut",
  display: "swap",
});

const flavors = Flavors({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-flavors",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Steam White Elephant",
  description: "get in here",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CookiesProvider>
      <html
        lang="en"
        className={`bg-background text-text ${inter.variable} ${fjalla.variable} ${climate.variable} ${inknut.variable} ${flavors.variable}`}
      >
        <head>
          <meta charSet="UTF-8" />
          <meta name="description" content={metadata.description as string} />
          <title>{metadata.title as string}</title>
        </head>
        <body>{children}</body>
      </html>
    </CookiesProvider>
  );
}
