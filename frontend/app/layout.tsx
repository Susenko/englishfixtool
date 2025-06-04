import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "English Fix Tool",
  description: "Analyze your English text with OpenAI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <nav className="bg-gray-100 px-6 py-4 border-b mb-6">
          <ul className="flex space-x-4 text-blue-600 font-medium">
            <li>
              <Link href="/">Додому</Link>
            </li>
            <li>
              <Link href="/analyze">Аналіз</Link>
            </li>
            <li>
              <Link href="/about">Про проєкт</Link>
            </li>
          </ul>
        </nav>
        <main className="px-6">{children}</main>
      </body>
    </html>
  );
}
