import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import SupabaseProvider from '@/components/providers/supabase-provider'
import { Navbar } from '@/components/navbar'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Text Behind Image',
  description: 'Add text behind your images with ease',
  metadataBase: new URL('https://text-behind-image.vercel.app'),
  openGraph: {
    title: 'Text Behind Image',
    description: 'Add beautiful text effects to your images',
    url: 'https://text-behind-image.vercel.app',
    siteName: 'Text Behind Image',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Text Behind Image',
    description: 'Add beautiful text effects to your images',
  },
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SupabaseProvider session={null}>
            <Navbar />
            <Toaster position="top-center" />
            {children}
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
