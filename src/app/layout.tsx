import { Inter } from 'next/font/google'
import { Providers } from './providers.client'
import { ColorMode } from './theme/ColorMode.client'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Next.js with Chakra UI',
  description: 'A modern Next.js app with Chakra UI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <ColorMode />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
