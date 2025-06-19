// components/CartDrawer.tsx
import React, { useState } from 'react';
import { useCart, CartItem } from '../context/CartContext';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

const CartDrawer: React.FC = () => {
  const { items, totalCount, totalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const handleCheckout = () => {
    if (!session) {
      router.push('/login');
      return;
    }
    if (userRole !== 'buyer') {
      // Only buyers can checkout
      alert('Only buyers can access the checkout.');
      return;
    }
    router.push('/checkout');
  };

  return (
    <>
      {/* Cart Icon/Button */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed',
          top: 20,
          right: 20,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '1.5rem',
          color: '#fff',
        }}
      >
        🛒 ({totalCount})
      </button>

      {/* Drawer */}
      {open && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            width: 320,
            height: '100%',
            backgroundColor: '#fff',
            color: '#000',
            padding: 20,
            boxShadow: '-2px 0 8px rgba(0,0,0,0.2)',
            overflowY: 'auto',
            zIndex: 1000,
          }}
        >
          <h2>Your Cart</h2>
          {items.length === 0 ? (
            <p>Cart is empty</p>
          ) : (
            items.map((item: CartItem) => (
              <div key={item.id} style={{ marginBottom: 16, borderBottom: '1px solid #ddd', paddingBottom: 8 }}>
                <h4>{item.name}</h4>
                <p>${(item.price * item.quantity).toFixed(2)}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number"
                    value={item.quantity}
                    min={1}
                    style={{ width: 50 }}
                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10))}
                  />
                  <button onClick={() => removeItem(item.id)} style={{ cursor: 'pointer' }}>
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}

          <hr />

          <p><strong>Total:</strong> ${totalPrice.toFixed(2)}</p>

          {items.length > 0 && (
            <>
              <button
                onClick={handleCheckout}
                style={{ padding: '10px 16px', marginTop: 8, width: '100%', cursor: 'pointer' }}
              >
                Checkout
              </button>
              <button
                onClick={() => clearCart()}
                style={{ padding: '6px 12px', marginTop: 8, width: '100%', cursor: 'pointer', background: '#f5f5f5' }}
              >
                Clear Cart
              </button>
            </>
          )}

          <button
            onClick={() => setOpen(false)}
            style={{ marginTop: 16, background: 'none', border: 'none', cursor: 'pointer' }}
          >
            Close
          </button>
        </div>
      )}
    </>
  );
};

export default CartDrawer;