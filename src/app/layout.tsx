import "./globals.css";
import { PostHogProvider } from "@/components/PostHogProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="h-full">
      <body className="h-full bg-gray-50 text-gray-900 antialiased">
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  );
}
