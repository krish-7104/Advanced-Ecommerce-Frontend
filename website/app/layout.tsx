import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import ReduxProvider from "@/redux/provider";
import Header from "@/components/navbar";
import { AuthInitializer } from "@/components/auth-initializer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ecommercely | Premium Shopping Experience",
  description:
    "Discover premium products with a modern shopping experience. Quality meets design.",
  keywords: [
    "ecommerce",
    "shopping",
    "premium products",
    "electronics",
    "fashion",
    "home decor",
  ],
  authors: [{ name: "Ecommercely" }],
  openGraph: {
    title: "Ecommercely | Premium Shopping Experience",
    description: "Discover premium products with a modern shopping experience.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-white`}>
        <ReduxProvider>
          <AuthInitializer />
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster position="bottom-right" richColors />
        </ReduxProvider>
      </body>
    </html>
  );
}
