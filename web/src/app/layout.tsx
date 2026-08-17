import type { Metadata, Viewport } from "next";
import { Playfair_Display, Lora, Inter } from "next/font/google";
import { MotionRoot } from "@/components/motion";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vowfolk",
  description: "Plan it. Make it. Celebrate it. Vowfolk is for couples who make the day their own.",
  applicationName: "Vowfolk",
  appleWebApp: {
    capable: true,
    title: "Vowfolk",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#faf7f2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${lora.variable} ${inter.variable}`}>
      <script
        dangerouslySetInnerHTML={{
          __html: `try{var t=document.cookie.match(/wedding_os_theme=([^;]+)/);if(t)document.documentElement.dataset.theme=t[1];var g=document.cookie.match(/wedding_os_glass=([^;]+)/);if(g)document.documentElement.dataset.glass=g[1];var d=document.cookie.match(/wedding_os_density=([^;]+)/);if(d)document.documentElement.dataset.density=d[1];var y=document.cookie.match(/wedding_os_type=([^;]+)/);if(y)document.documentElement.dataset.type=y[1];var m=document.cookie.match(/wedding_os_motion=([^;]+)/);if(m)document.documentElement.dataset.motion=m[1]}catch(e){}`,
        }}
      />
      <body className="min-h-screen bg-paper font-sans text-ink antialiased">
        <MotionRoot>{children}</MotionRoot>
      </body>
    </html>
  );
}
