import "./globals.css";
import { Space_Grotesk, Inter } from "next/font/google";
import { PostHogProvider } from "@/components/PostHogProvider";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className={`h-full ${display.variable} ${body.variable}`}>
      <body className="h-full bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 antialiased font-body">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
