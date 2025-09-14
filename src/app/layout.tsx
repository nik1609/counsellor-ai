import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { TRPCProvider } from "@/components/providers/trpc-provider";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ['latin'],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Career Genie AI",
  description: "Get personalized career guidance and advice from our AI counselor",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <TRPCProvider>
              {children}
              <Toaster/>
            </TRPCProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
