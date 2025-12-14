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
  size,
  minScale,
  maxScale,
  duration,
}: {
  style: React.CSSProperties;
  initialOpacity: number;
  baseColor: string;
  alpha: number;
  size: number;
  minScale: number;
  maxScale: number;
  duration: number;
}) => {
  const rgbaColor = hexToRgb(baseColor, alpha);

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    borderRadius: "50%",
    background: rgbaColor,
    boxShadow: `0 0 30px 15px ${rgbaColor}`,
  };

  const radius = size / 4;

  return (
    <motion.div
      style={{ ...baseStyle, ...style, opacity: initialOpacity }}
      animate={{
        x: [radius, 0, -radius, 0, radius],
        y: [0, radius, 0, -radius, 0],
        scale: [1, maxScale, 1, minScale, 1],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
};

type BokehProps = {
  count?: number;
  baseColor?: string;
  alpha?: number;
  size?: [number, number];
  blur?: [number, number];
  scale?: [number, number];
  duration?: [number, number];
  opacity?: [number, number];
};

const Bokeh = ({
  count = 60,
  baseColor = "#ffffff",
  alpha = 0.25,
  size: [minSize, maxSize] = [50, 150],
  blur: [minBlur, maxBlur] = [5, 15],
  scale: [minScale, maxScale] = [0.8, 1.5],
  duration: [minDuration, maxDuration] = [20, 30],
  opacity: [minOpacity, maxOpacity] = [0.2, 0.7],
}: BokehProps) => {
  const circles = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => {
      const sizeRange = maxSize - minSize;
      const blurRange = maxBlur - minBlur;
      const opacityRange = maxOpacity - minOpacity;
      const durationRange = maxDuration - minDuration;

      const size = Math.random() * sizeRange + minSize;
      const blur = Math.random() * blurRange + minBlur;
      const initialOpacity = Math.random() * opacityRange + minOpacity;
      const duration = Math.random() * durationRange + minDuration;

      const style: React.CSSProperties = {
        width: `${size}px`,
        height: `${size}px`,
        left: `${Math.random() * 120 - 10}%`,
        top: `${Math.random() * 120 - 10}%`,
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
          size={size}
          minScale={minScale}
          maxScale={maxScale}
          duration={duration}
        />
      );
    });
  }, [
    count,
    baseColor,
    alpha,
    minSize,
    maxSize,
    minBlur,
    maxBlur,
    minScale,
    maxScale,
    minDuration,
    maxDuration,
    minOpacity,
    maxOpacity,
  ]);

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
