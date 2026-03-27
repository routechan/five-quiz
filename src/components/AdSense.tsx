"use client";

import Script from "next/script";

export default function AdSense() {
  return (
    <Script
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1738406462514632"
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  );
}
