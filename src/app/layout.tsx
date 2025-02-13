import { Inter } from 'next/font/google'
import { Providers } from './providers.client'
import { ColorMode } from './theme/ColorMode.client'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Spiralizer',
  description: 'Create mesmerizing spiral patterns with interactive controls',
  icons: {
    icon: [
      {
        url: 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌀</text></svg>',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  },
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
      <body className={inter.className} style={{ backgroundColor: '#1A202C' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
