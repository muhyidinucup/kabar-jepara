import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kabar Jepara",
  description: "Portal informasi publik Jepara dan sekitarnya",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* ✅ Organization Schema - Global (Muncul di SEMUA halaman) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'NewsMediaOrganization',
              name: 'Kabar Jepara',
              url: 'https://kabarjepara.web.id',
              logo: 'https://kabarjepara.web.id/logo.png',
              description:
                'Portal berita lokal terpercaya yang menyajikan informasi terkini seputar Kabupaten Jepara dan sekitarnya.',
              foundingDate: '2026',
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Jl. Raya Jepara No. 1',
                addressLocality: 'Jepara',
                addressRegion: 'Jawa Tengah',
                postalCode: '59411',
                addressCountry: 'ID',
              },
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+62-812-3456-7890',
                email: 'redaksi@kabarjepara.web.id',
                contactType: 'customer service',
                areaServed: 'ID',
                availableLanguage: 'Indonesian',
              },
              sameAs: [],
            }),
          }}
        />

        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}