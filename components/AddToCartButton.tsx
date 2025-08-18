import { useCart } from "@/context/CartContext";
import { useState } from "react";
import "@/styles/animations.css";

type Item = {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category?: string;
  delivery_tier?: string;
};

export default function AddToCartButton({ item }: { item: Item }) {
  const { addItem, setIsOpen } = useCart();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAdd = () => {
    addItem({
      ...item,
      quantity: 1,
      category: item.category ?? "general",
      delivery_tier: item.delivery_tier ?? "standard",
    });
    setIsOpen(true);
    console.log("Cart drawer should now be open");
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <button
      onClick={handleAdd}
      className={`bg-black text-white px-4 py-2 rounded mt-2 transition-transform ${
        isAnimating ? "animate-pop" : ""
      }`}
    >
      Add to Cart
    </button>
  );
}
