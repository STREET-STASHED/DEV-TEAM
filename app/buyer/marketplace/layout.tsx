import type { ReactNode } from "react";

export default function MarketplaceLayout({
  children,
  cart,
  filters,
  modal,
}: {
  children: ReactNode;
  cart: ReactNode;
  filters: ReactNode;
  modal: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Página principal / subrutas (product/[id]) */}
      {children}

      {/* Side UI persistente */}
      {cart}
      {filters}
      {modal}
    </div>
  );
}

