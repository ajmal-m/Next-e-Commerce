import type { Metadata } from "next";
import { Inter } from "next/font/google";
import '@/assets/styles/globals.css';
import {APP_NAME, APP_DESCRIPTION, APP_URL} from '@/lib/constants/index'

const inter = Inter({ subsets:['latin'], weight:'500'})


export const metadata: Metadata = {
  title: {
    template:`%s | Prostate`,
    default:APP_NAME
  },
  description: APP_DESCRIPTION,
  metadataBase:new URL(APP_URL)
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
