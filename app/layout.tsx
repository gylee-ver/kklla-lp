import type { Metadata } from "next";
import { headers } from "next/headers";
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

export async function generateMetadata(): Promise<Metadata> {
  const h = await headers();
  const forwardedHost = h.get("x-forwarded-host") || h.get("host") || undefined;
  const forwardedProto = h.get("x-forwarded-proto") || "https";
  const envSite = process.env.NEXT_PUBLIC_SITE_URL;
  const base = envSite || (forwardedHost ? `${forwardedProto}://${forwardedHost}` : "https://kklla-lp.vercel.app");

  const ogImage = `${base}/OpenGraph.png`;

  return {
    metadataBase: new URL(base),
    title: {
      default: "KKLLA 와디즈 펀딩 사전 예약",
      template: "%s | KKLLA",
    },
    description: "KKLLA X 와디즈 펀딩 사전 예약 사이트",
    icons: {
      icon: "/favicon-1.ico",
    },
    openGraph: {
      title: "KKLLA 와디즈 펀딩 사전 예약",
      description: "KKLLA X 와디즈 펀딩 사전 예약 사이트",
      url: "/",
      siteName: "KKLLA",
      images: [
        {
          url: ogImage,
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
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
    },
    alternates: {
      canonical: "/",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics 4 */}
        <Script
          id="ga4-src"
          src="https://www.googletagmanager.com/gtag/js?id=G-CQHNMQ7B9F"
          strategy="afterInteractive"
        />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-CQHNMQ7B9F');
          `}
        </Script>
        {/* Tally UTM passthrough (robust: initial apply + observer + click-capture) */}
        <Script id="tally-utm" strategy="afterInteractive">
          {`(function(){
            var BASE='https://tally.so/r/nPxdbx';
            var KEYS=['utm_source','utm_medium','utm_campaign','utm_content','utm_term','campaign_id','adset_id','ad_id','placement','site_source_name','usp','target'];
            function buildFinalUrl(){
              var qs=new URLSearchParams(location.search||'');
              var stored={}; try{stored=JSON.parse(sessionStorage.getItem('utm_params')||'{}')}catch(e){}
              var out=new URLSearchParams();
              KEYS.forEach(function(k){
                var v = qs.get(k);
                if(!v && stored) v = stored[k];
                if(v!=null && v!=='') out.set(k, v);
              });
              var s=out.toString();
              return BASE + (s?('?'+s):'');
            }
            function applyAll(){
              var url = buildFinalUrl();
              document.querySelectorAll('a[data-tally-cta]').forEach(function(a){ a.href = url; });
            }
            // initial
            applyAll();
            // observer for dynamically added anchors
            try{
              var obs=new MutationObserver(function(muts){
                var need=false;
                for(var i=0;i<muts.length;i++){
                  var m=muts[i];
                  if(m.addedNodes && m.addedNodes.length){ need=true; break; }
                }
                if(need) applyAll();
              });
              obs.observe(document.documentElement||document, {childList:true, subtree:true});
            }catch(e){}
            // click/pointerdown capture: last-moment correction
            function retarget(e){
              try{
                var t = e.target;
                if(!t) return;
                var a = t.closest ? t.closest('a[data-tally-cta]') : null;
                if(!a) return;
                a.href = buildFinalUrl();
              }catch(_){}
            }
            document.addEventListener('pointerdown', retarget, true);
            document.addEventListener('click', retarget, true);
          })();`}
        </Script>
        {/* Keep full querystring pass-through for designated links */}
        <Script id="keep-utm" strategy="afterInteractive">
          {`(function(){
            var search=location.search; if(!search) return;
            var lpParams=new URLSearchParams(search);
            document.querySelectorAll('a[data-keep-utm="true"]:not([data-tally-cta])').forEach(function(a){
              try{
                var url=new URL(a.href, location.origin);
                lpParams.forEach(function(v,k){ url.searchParams.set(k,v); });
                a.href=url.toString();
              }catch(e){}
            });
          })();`}
        </Script>
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
