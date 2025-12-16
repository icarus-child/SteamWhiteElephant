import type { Metadata } from "next";
import "./globals.css";
import { CookiesProvider } from "next-client-cookies/server";
import { Inter } from "next/font/google";
import { Fjalla_One } from "next/font/google";
import { Climate_Crisis } from "next/font/google";

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

export const metadata: Metadata = {
  title: "Steam White Elephant",
  description: "Created by IcarusChild",
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
        className={`bg-background text-text ${inter.variable} ${fjalla.variable} ${climate.variable}`}
      >
        <head>
          <meta charSet="UTF-8" />
          <meta name="description" content={metadata.description as string} />
          <title>{metadata.title as string}</title>
        </head>
        <body
        //className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </CookiesProvider>
  );
}
