import { DM_Sans, Syne } from "next/font/google";
import { cookies } from "next/headers";

import BookCallWidget from "@/components/BookCallWidget";
import ConsentBanner from "@/components/ConsentBanner";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import Navbar from "@/components/Navbar";
import ScrollReveal from "@/components/ScrollReveal";
import TechBackground from "@/components/TechBackground";
import WhatsAppButton from "@/components/WhatsAppButton";
import {
  DEFAULT_DESCRIPTION,
  OG_IMAGE,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_URL,
  localBusinessJsonLd,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo.mjs";

import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const DEFAULT_THEME = "light";
const THEME_COOKIE = "muskit-theme";

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
    default: `${SITE_NAME} | B2B Custom Software & IT Solutions Provider`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "technology",
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: `${SITE_NAME} | B2B Custom Software & IT Solutions Provider`,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_IN",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | B2B Custom Software & IT Solutions Provider`,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
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
    <html
      lang="en"
      data-theme={initialTheme}
      className={`${dmSans.variable} ${syne.variable}`}
      suppressHydrationWarning
    >
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <a className="skip-link" href="#main-content">
          Skip to main content
        </a>
        <TechBackground />
        <div className="app-shell">
          <Navbar />
          <main id="main-content" tabIndex={-1}>{children}</main>
          <Footer />
        </div>
        <ScrollReveal />
        <BookCallWidget />
        <WhatsAppButton />
        <JsonLd data={[organizationJsonLd(), websiteJsonLd(), localBusinessJsonLd()]} />
        <ConsentBanner />
      </body>
    </html>
  );
}
