import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { COOKIE_REMEMBER_ME_KEY } from "@/lib/constants";
import { QueryProvider } from "@/providers/query-provider";
import type { Metadata } from "next";
import { Inter, Noto_Sans, Roboto, Vazirmatn } from "next/font/google";
import type React from "react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-noto-sans",
});

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Yaralex Studio",
  description: "Yaralex Studio",
  generator: "Radnive",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const fonts = { inter, notoSans, vazirmatn, roboto };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fonts.inter.variable} ${fonts.notoSans.variable} ${fonts.vazirmatn.variable} ${fonts.roboto.variable}`}
    >
      <head>
        {/* If the user does not want their information to be remembered, all cookies will be deleted! */}
        <script>
          {`
            window.addEventListener("beforeunload", () => {
              const rememberMe = document.cookie
                .split("; ")
                .find((row) => row.startsWith("${COOKIE_REMEMBER_ME_KEY}="))
                ?.split("=")[1];

              if (rememberMe !== "true") {
                document.cookie.split(";").forEach((cookie) => {
                  document.cookie =
                    cookie.split("=")[0] +
                    "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                });
              }
            });
          `}
        </script>
      </head>

      <body>
        <QueryProvider>
          <AuthProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
              storageKey="yaralex-theme"
            >
              {children}
              <Toaster />
            </ThemeProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
