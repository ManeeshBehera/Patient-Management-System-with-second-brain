import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Cabinet Intake OS - Dr Amraoui Demo",
  description: "Clickable mock healthcare workflow demo for intake and quiet clinical intelligence."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
