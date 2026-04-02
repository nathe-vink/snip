import type { Metadata } from "next";
import { Newsreader, Outfit, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-ibm-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Snip — Cut through SF's red tape",
  description:
    "Free interactive tool that maps every permit, license, and registration needed to open a business in San Francisco. Answer a few questions, get a personalized step-by-step roadmap.",
  openGraph: {
    title: "Snip — Every permit. One place.",
    description:
      "Free interactive tool that maps every permit, license, and registration needed to open a business in San Francisco.",
    type: "website",
    url: "https://permits.trashhuman.org",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${outfit.variable} ${ibmPlexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
