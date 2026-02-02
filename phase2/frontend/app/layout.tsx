import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers"; // ✅ Import Providers

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TaskFlow App",
  description: "Manage your tasks efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* suppressHydrationWarning zaroori hai dark mode flicker rokne k liye */}
      <body className={`${inter.className} bg-background text-foreground antialiased`}>
        {/* ✅ Poori app ko Providers k andar wrap karein */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}