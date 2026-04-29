import type { CSSProperties } from "react";
import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "../contexts/CartContext";

// UPDATED: This changes your browser tab title and logo!
export const metadata: Metadata = {
  title: "Hopecard",
  description: "Support meaningful causes and make an impact in different communities.",
  icons: {
    icon: '/logo_h.png', // Uses your logo_h.png from the public folder
  },  
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={
          {
            "--font-geist-sans": "Arial, Helvetica, sans-serif",
            "--font-geist-mono": '"Courier New", Courier, monospace',
          } as CSSProperties
        }
      >
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
