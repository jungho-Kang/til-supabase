import { Roboto } from "next/font/google";
import "./globals.css";
// shadcn/ui
import { Toaster } from "@/components/ui/sonner";
import ReactQueryProvider from "@/providers/ReactQueryProvider";
// SEO
import type { Metadata } from "next";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Todo",
  description: "Todo Supabase",
  openGraph: {
    title: "Todo",
    description: "Todo Supabase",
    images: [{ url: "/thumnail.png" }],
  },
  other: {
    "naver-site-verification": "75d0ebd7ba50c42db041df212eec136177627ba6",
    "google-site-verification": "LLO8aYdx-tfUeFtCRV9IcnB1fwdyU_oxUv6mXXSBiUc",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${roboto.variable}  antialiased`}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
        <Toaster />
      </body>
    </html>
  );
}
