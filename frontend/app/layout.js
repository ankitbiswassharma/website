import { cookies } from "next/headers";
import Script from "next/script";

import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo.mjs";

import "./globals.css";

const DEFAULT_THEME = "light";
const THEME_COOKIE = "muskit-theme";
const GOOGLE_ANALYTICS_ID = "G-3KS2YBFJ87";
const GOOGLE_ADSENSE_CLIENT_ID = "ca-pub-6253460497373924";

const themeScript = `
  (function() {
    try {
      const cookieMatch = document.cookie.match(/(?:^|; )muskit-theme=([^;]+)/);
      const cookieTheme = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
      const storedTheme = localStorage.getItem('muskit-theme');
      const theme = storedTheme || cookieTheme || '${DEFAULT_THEME}';
      document.documentElement.dataset.theme = theme;
      localStorage.setItem('muskit-theme', theme);
      document.cookie = 'muskit-theme=' + encodeURIComponent(theme) + '; path=/; max-age=31536000; SameSite=Lax';
    } catch (error) {
      document.documentElement.dataset.theme = '${DEFAULT_THEME}';
    }
    try {
      var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!reduced) document.documentElement.classList.add('js-reveal');
    } catch (e) {}
  })();
`;

export const metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} | B2B Custom Software & Workflow Automation`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: `${SITE_NAME} | B2B Custom Software & Workflow Automation`,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: `${SITE_NAME} | B2B Custom Software & Workflow Automation`,
    description: DEFAULT_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.ico",
  },
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const initialTheme = cookieStore.get(THEME_COOKIE)?.value === "dark" ? "dark" : DEFAULT_THEME;

  return (
    <html lang="en" data-theme={initialTheme} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <div className="app-shell">
          <Navbar />
          <main>{children}</main>
          <Footer />
        </div>
        <ScrollReveal />
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_ID}`}
          strategy="afterInteractive"
        />
        <Script
          async
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADSENSE_CLIENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GOOGLE_ANALYTICS_ID}');
          `}
        </Script>
      </body>
    </html>
  );
}
