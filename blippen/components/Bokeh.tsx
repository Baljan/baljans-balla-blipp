import React, { useMemo } from "react";
import { motion } from "framer-motion";

const hexToRgb = (hex: string, a: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

const BokehCircle = ({
  style,
  initialOpacity,
  baseColor,
  alpha,
}: {
  style: React.CSSProperties;
  initialOpacity: number;
  baseColor: string;
  alpha: number;
}) => {
  const rgbaColor = hexToRgb(baseColor, alpha);

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    borderRadius: "50%",
    background: rgbaColor,
    boxShadow: `0 0 30px 15px ${rgbaColor}`,
  };

  const randomX1 = (Math.random() - 0.5) * 450;
  const randomX2 = (Math.random() - 0.5) * 450;
  const randomY1 = (Math.random() - 0.5) * 450;
  const randomY2 = (Math.random() - 0.5) * 450;

  const randomScale1 = Math.random() * 0.5 + 0.75;
  const randomScale2 = Math.random() * 0.5 + 0.75;

  return (
    <motion.div
      style={{ ...baseStyle, ...style, opacity: initialOpacity }}
      animate={{
        x: [0, randomX1, randomX2, 0],
        y: [0, randomY1, randomY2, 0],
        scale: [1, randomScale1, randomScale2, 1],
      }}
      transition={{
        duration: Math.random() * 15 + 20,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

const Bokeh = ({ count = 60, baseColor = "#ffffff", alpha = 0.2 }) => {
  const circles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const size = Math.random() * 90 + 60;
      const blur = Math.random() * 15 + 5;
      const initialOpacity = Math.random() * 0.5 + 0.2;
      const style: React.CSSProperties = {
        width: `${size}px`,
        height: `${size}px`,
        left: `${Math.random() * 120 - 10}%`, // Allow outside the frame
        top: `${Math.random() * 120 - 10}%`, // Allow outside the frame
        transform: `translate(-50%, -50%)`,
        filter: `blur(${blur}px)`,
      };
      return (
        <BokehCircle
          key={i}
          style={style}
          initialOpacity={initialOpacity}
          baseColor={baseColor}
          alpha={alpha}
        />
      );
    });
  }, [count, baseColor, alpha]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "hidden",
        zIndex: 0,
      }}
    >
      {circles}
    </div>
  );
};

export default Bokeh;
