import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Header } from "@/components/Header";
import { cn } from "@/lib/utils";
import { fontSans } from "@/lib/fonts";
import "./globals.css";
import { ClientLayout } from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "TechShop",
  description: "Your AI-powered tech shopping assistant"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased touch-manipulation",
        fontSans.variable
      )}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClientLayout>
            <div className="relative flex min-h-screen flex-col">
              <Header className="fixed top-0 w-full z-40" />
              <div className="flex-1 mt-14">
                {children}
              </div>
            </div>
          </ClientLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
