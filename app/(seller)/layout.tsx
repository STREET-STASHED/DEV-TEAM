import { Metadata } from 'next'
import { SellerHeader } from './SellerHeader'

export const metadata: Metadata = {
  title: {
    template: '%s | Seller Dashboard | StreetStashed',
    default: 'Seller Dashboard | StreetStashed',
  },
  description: 'Manage your products and orders on StreetStashed',
}

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <SellerHeader />
      <main className="pt-16">
        {children}
      </main>
    </div>
  )
}
