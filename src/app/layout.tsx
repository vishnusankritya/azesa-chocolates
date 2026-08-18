import type { Metadata } from "next";
import { Lilita_One, DM_Sans, Pacifico } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";

const lilitaOne = Lilita_One({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-lilita",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
});

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pacifico",
});

export const metadata: Metadata = {
  title: "Azesa Chocolates — Made in India",
  description:
    "Handcrafted chocolates and cookies from Katihar, Bihar. No palm oil, no artificial colours. Made with real ingredients.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lilitaOne.variable} ${dmSans.variable} ${pacifico.variable}`}>
      <body className="font-sans antialiased">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}