// @ts-nocheck
import React from "react";
import { motion } from "framer-motion";

export default function ScrollAnimate({ 
  children, 
  className = "", 
  animation = "fade-up", 
  delay = 0 
}) {
  const getVariants = () => {
    switch (animation) {
      case "fade-up":
        return { initial: { opacity: 0, y: 24, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 } };
      case "fade-down":
        return { initial: { opacity: 0, y: -24, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 } };
      case "fade-left":
        return { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 } };
      case "fade-right":
        return { initial: { opacity: 0, x: -24 }, animate: { opacity: 1, x: 0 } };
      default:
        return { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 } };
    }
  };

  const { initial, animate } = getVariants();

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once: false, amount: 0.15 }}
      transition={{ 
        duration: 0.5, 
        ease: [0.16, 1, 0.3, 1], 
        delay: delay / 1000 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
