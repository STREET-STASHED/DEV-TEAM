import AddToCartButton from "./AddToCartButton";
import type { CartItem } from "@/context/CartContext";

interface ProductCardProps {
  item: CartItem;
}

export default function ProductCard({ item }: ProductCardProps) {
  return (
    <div className="flex flex-col bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-transform hover:-translate-y-1">
      <img
        src={item.image_url || "/fallback.jpg"}
        alt={item.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4 flex flex-col justify-between flex-1">
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          {item.name}
        </h2>
        <span className="text-xs text-white bg-black px-2 py-1 rounded w-fit mb-2 uppercase">
          {item.delivery_tier}
        </span>
        <p className="text-sm text-gray-600 mb-4">${item.price}</p>
        <AddToCartButton item={item} />
      </div>
    </div>
  );
}
