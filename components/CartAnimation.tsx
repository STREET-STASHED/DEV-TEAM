import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CartAnimationProps {
  isVisible: boolean;
  onAnimationComplete?: () => void;
}

const CartAnimation: React.FC<CartAnimationProps> = ({
  isVisible,
  onAnimationComplete,
}) => {
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        onAnimationComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onAnimationComplete]);

  return (
    <AnimatePresence>
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: -20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2"
        >
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="text-xl"
          >
            ✓
          </motion.div>
          <span className="font-medium">Added to Cart!</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartAnimation;
