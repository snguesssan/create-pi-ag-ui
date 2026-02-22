import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pi AG-UI",
  description: "Pi coding agent with AG-UI protocol",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
