import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ファイブクイズ - 5人で挑む文字当てクイズ",
    short_name: "ファイブクイズ",
    description:
      "5人協力型クイズゲーム。5人のプレイヤーがそれぞれ1文字ずつ担当し、チームで5文字の回答を完成させよう！",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#C4291E",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "/og-image.png",
        sizes: "1296x637",
        type: "image/png",
        form_factor: "wide",
      },
      {
        src: "/og-image.png",
        sizes: "1296x637",
        type: "image/png",
      },
    ],
  };
}
