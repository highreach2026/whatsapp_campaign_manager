import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "High Reach WhatsApp Campaign Manager",
  description: "Opt-in WhatsApp marketing campaign manager for High Reach",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
