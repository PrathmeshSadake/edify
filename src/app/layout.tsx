import { Inter } from "next/font/google";

import "./globals.css";
import Providers from "@/components/providers";
import { APIStatus } from "@/components/api-status";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <APIStatus />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
