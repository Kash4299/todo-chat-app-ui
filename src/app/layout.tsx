import type { Metadata } from "next";
import QueryProvider from "@/components/QueryProvider";
import { Be_Vietnam_Pro } from "next/font/google";
import { validateServerEnv } from "@/lib/env";
import "./globals.css";

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "TodoChat — Productivity & Collaboration",
  description:
    "A modern productivity app with todo management and real-time chat. Stay organized and connected.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  validateServerEnv();

  return (
    <html lang="en">
      <body className={`${beVietnamPro.className} antialiased`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
