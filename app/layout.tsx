import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets:['latin'], weight:'500'})


export const metadata: Metadata = {
  title: "Next E-commerce APP",
  description: "NEXT JS E-COMMERCE APP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
