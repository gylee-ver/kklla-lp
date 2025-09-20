import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AnalyticsProvider from "./providers/AnalyticsProvider";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 도메인 자동 감지: NEXT_PUBLIC_SITE_URL > VERCEL_URL > localhost
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "KKLLA 와디즈 펀딩 사전 예약",
    template: "%s | KKLLA",
  },
  description: "KKLLA X 와디즈 펀딩 사전 예약 사이트",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "KKLLA 와디즈 펀딩 사전 예약",
    description: "KKLLA X 와디즈 펀딩 사전 예약 사이트",
    url: "/",
    siteName: "KKLLA",
    images: [
      {
        url: "/kakao.png",
        width: 1200,
        height: 630,
        alt: "KKLLA 와디즈 펀딩 사전 예약",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KKLLA 와디즈 펀딩 사전 예약",
    description: "KKLLA X 와디즈 펀딩 사전 예약 사이트",
    images: ["/kakao.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Tag Manager: place as high as possible in <head> */}
        <Script id="gtm-head" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-5GLTPVGC');`}
        </Script>
        {/* Hotjar Tracking Code */}
        <Script id="hotjar" strategy="afterInteractive">
          {`(function(h,o,t,j,a,r){
              h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
              h._hjSettings={hjid:6524760,hjsv:6};
              a=o.getElementsByTagName('head')[0];
              r=o.createElement('script');r.async=1;
              r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
              a.appendChild(r);
          })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-5GLTPVGC"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <AnalyticsProvider>{children}</AnalyticsProvider>
      </body>
    </html>
  );
}
