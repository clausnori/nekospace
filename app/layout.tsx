import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AudioProvider } from "@/components/audio-provider"
import { AuthProvider } from "@/components/auth-provider"
import MusicPlayerWrapper from "@/components/music-player-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NekoSpaces - Discover Your Next Favorite Track",
  description: "Stream millions of songs, discover new artists, and create your perfect playlist on NekoSpaces",
  keywords: "music, streaming, playlist, artists, songs, albums, electronic, synthwave, ambient",
  authors: [{ name: "NekoSpaces Team" }],
  openGraph: {
    title: "NekoSpaces - Discover Your Next Favorite Track",
    description: "Stream millions of songs, discover new artists, and create your perfect playlist",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "NekoSpaces - Discover Your Next Favorite Track",
    description: "Stream millions of songs, discover new artists, and create your perfect playlist",
  },
  robots: {
    index: true,
    follow: true,
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <AudioProvider>
            {children}
            <MusicPlayerWrapper />
          </AudioProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
