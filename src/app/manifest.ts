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
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
