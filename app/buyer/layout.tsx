import { Metadata } from 'next'
import { BuyerHeader } from './BuyerHeader'

export const metadata: Metadata = {
  title: {
    template: '%s | Buyer Dashboard | StreetStashed',
    default: 'Buyer Dashboard | StreetStashed',
  },
  description: 'Shop for unique streetwear from local stylists',
}

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-ink-black">
      <BuyerHeader />
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
}
