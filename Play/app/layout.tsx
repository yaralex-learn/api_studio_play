import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/auth-context";
import { COOKIE_REMEMBER_ME_KEY } from "@/lib/constants";
import { QueryProvider } from "@/providers/query-provider";
import type { Metadata } from "next";
import { Bagel_Fat_One, Inter } from "next/font/google";
import type React from "react";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Load the Bagel Fat One font with proper subsets
const bagelFatOne = Bagel_Fat_One({
  weight: ["400"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bagel-fat-one",
});

export const metadata: Metadata = {
  title: "Yaralex Play",
  description: "Learn languages the fun way",
  generator: "v0.dev",
  icons: {
    icon: [
      { url: "/images/logo.png", sizes: "32x32", type: "image/png" },
      { url: "/images/logo.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/images/logo.png",
    shortcut: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const fonts = { inter, bagelFatOne };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${fonts.inter.variable} ${fonts.bagelFatOne.variable}`}
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
