import { cookies } from "next/headers";

import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

import "./globals.css";

const DEFAULT_THEME = "dark";
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
  })();
`;

export const metadata = {
  title: {
    default: "Musk-IT | Custom ERP, CRM & Automation Software",
    template: "%s | Musk-IT",
  },
  description:
    "We build custom ERP, automation systems, dashboards, CRM workflows, and web or mobile apps tailored to real business operations.",
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
      </body>
    </html>
  );
}
