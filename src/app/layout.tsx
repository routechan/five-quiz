import type { Metadata } from "next";
import { Dela_Gothic_One, M_PLUS_Rounded_1c } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const delaGothicOne = Dela_Gothic_One({
  weight: "400",
  variable: "--font-quiz-title",
  subsets: ["latin"],
  display: "swap",
});

const mPlusRounded = M_PLUS_Rounded_1c({
  weight: ["400", "700", "800"],
  variable: "--font-quiz-sans",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "ファイブクイズ - 5人で挑む文字当てクイズ",
  description:
    "5人協力型クイズゲーム。5人のプレイヤーがそれぞれ1文字ずつ担当し、チームで5文字の回答を完成させよう！",
  openGraph: {
    title: "ファイブクイズ - 5人で挑む文字当てクイズ",
    description:
      "5人協力型クイズゲーム。5人のプレイヤーがそれぞれ1文字ずつ担当し、チームで5文字の回答を完成させよう！",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ファイブクイズ - 5人で挑む文字当てクイズ",
    description:
      "5人協力型クイズゲーム。5人のプレイヤーがそれぞれ1文字ずつ担当し、チームで5文字の回答を完成させよう！",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  verification: {
    google: "nEFo63YEVe1GYrOBvf8dxJbKQlveYIkk07spWe7n390",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`,
          }}
        />
      </head>
      <body
        className={`${delaGothicOne.variable} ${mPlusRounded.variable} antialiased bg-white`}
        style={{
          fontFamily:
            "var(--font-quiz-sans), 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', sans-serif",
        }}
      >
        {children}
        <GoogleAnalytics gaId="G-5D22VTL7QW" />
      </body>
    </html>
  );
}
