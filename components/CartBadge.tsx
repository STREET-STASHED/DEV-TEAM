import React from "react";
import { motion } from "framer-motion";

interface CartBadgeProps {
  count: number;
  isVisible: boolean;
}

const CartBadge: React.FC<CartBadgeProps> = ({ count, isVisible }) => {
  if (count === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: isVisible ? 1.2 : 1 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 15,
        duration: 0.3,
      }}
      className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg"
    >
      {count > 99 ? "99+" : count}
    </motion.div>
  );
};

export default CartBadge;
