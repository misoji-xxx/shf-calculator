import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ShapeHero Factory Calculator',
  description: 'ShapeHero Factory生産計算ツール',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+JP:wght@500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}