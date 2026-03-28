import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { getSetting } from '@/lib/db';

export async function generateMetadata(): Promise<Metadata> {
  const [title, description, keywords, ogImage] = await Promise.all([
    getSetting('seo_title'),
    getSetting('seo_description'),
    getSetting('seo_keywords'),
    getSetting('seo_og_image'),
  ]);

  return {
    title: title ?? 'Roofs Canada — Trusted Roofing Experts',
    description: description ?? 'Professional roofing services for homes and businesses across Canada.',
    keywords: keywords ?? undefined,
    openGraph: ogImage ? { images: [ogImage] } : undefined,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [gtagId, fbPixelId] = await Promise.all([
    getSetting('gtag_id'),
    getSetting('fb_pixel_id'),
  ]);

  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        {gtagId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gtagId}`} strategy="afterInteractive" />
            <Script id="gtag-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gtagId}');
            `}</Script>
          </>
        )}
        {/* Facebook Pixel */}
        {fbPixelId && (
          <Script id="fb-pixel" strategy="afterInteractive">{`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
            document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${fbPixelId}');
            fbq('track', 'PageView');
          `}</Script>
        )}
      </head>
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
