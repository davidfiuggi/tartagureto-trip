import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tartagureto Trip",
  description: "Plan your group vacation together",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
