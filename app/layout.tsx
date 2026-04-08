import type { Metadata } from 'next'
import './globals.css'
import { getPublicSettings } from '@/lib/settings'
import MaintenanceWarning from '@/components/MaintenanceWarning'
import { ThemeProvider } from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'UniLife - Your Campus, Simplified',
  description: 'The all-in-one campus companion for university students',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getPublicSettings()

  return (
    <html lang="en" className="antialiased" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-background">
        <ThemeProvider>
          <MaintenanceWarning 
            message={settings.maintenance_message}
            startTime={settings.maintenance_start_time}
            endTime={settings.maintenance_end_time}
          />
          <div className="noise-overlay" />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}