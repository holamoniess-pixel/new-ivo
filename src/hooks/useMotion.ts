import { useRef, useCallback } from "react";
import { useMotionValue, useSpring, MotionValue } from "framer-motion";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

export interface TiltOptions {
  maxRotateX?: number;
  maxRotateY?: number;
  maxGlow?: number;
  springStiffness?: number;
  springDamping?: number;
  perspective?: number;
}

export interface TiltResult {
  containerRef: React.RefObject<HTMLDivElement | null>;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  glowX: MotionValue<number>;
  glowY: MotionValue<number>;
  isHovered: MotionValue<number>;
  tiltProps: React.HTMLAttributes<HTMLDivElement>;
}

export function useTilt(options: TiltOptions = {}): TiltResult {
  const {
    maxRotateX = 8,
    maxRotateY = 8,
    maxGlow = 30,
    springStiffness = 120,
    springDamping = 25,
    perspective = 1200,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);
  const prefersReducedMotion = useReducedMotion();

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);

  const springX = useSpring(rotateX, { stiffness: springStiffness, damping: springDamping });
  const springY = useSpring(rotateY, { stiffness: springStiffness, damping: springDamping });
  const springGlowX = useSpring(glowX, { stiffness: 100, damping: 25 });
  const springGlowY = useSpring(glowY, { stiffness: 100, damping: 25 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const dx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const dy = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      rotateX.set(-dy * maxRotateX);
      rotateY.set(dx * maxRotateY);
      glowX.set(((e.clientX - rect.left) / rect.width) * maxGlow);
      glowY.set(((e.clientY - rect.top) / rect.height) * maxGlow);
    },
    [rotateX, rotateY, glowX, glowY, maxRotateX, maxRotateY, maxGlow, prefersReducedMotion]
  );

  const handleMouseEnter = useCallback(() => {
    if (prefersReducedMotion) return;
    isHovered.set(1);
  }, [isHovered, prefersReducedMotion]);

  const handleMouseLeave = useCallback(() => {
    if (prefersReducedMotion) return;
    rotateX.set(0);
    rotateY.set(0);
    glowX.set(50);
    glowY.set(50);
    isHovered.set(0);
  }, [rotateX, rotateY, glowX, glowY, isHovered, prefersReducedMotion]);

  const tiltProps: React.HTMLAttributes<HTMLDivElement> = {
    ref,
    onMouseMove: handleMouseMove,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  };

  return {
    containerRef: ref,
    rotateX: springX,
    rotateY: springY,
    glowX: springGlowX,
    glowY: springGlowY,
    isHovered,
    tiltProps,
  };
}

export interface MagneticOptions {
  strength?: number;
}

export interface MagneticResult {
  ref: React.RefObject<HTMLDivElement | null>;
  x: MotionValue<number>;
  y: MotionValue<number>;
  magneticProps: React.HTMLAttributes<HTMLDivElement>;
}

export function useMagnetic(options: MagneticOptions = {}) {
  const strength = options.strength ?? 0.25;

  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 120, damping: 20 });
  const springY = useSpring(y, { stiffness: 120, damping: 20 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReducedMotion || !ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      x.set(dx);
      y.set(dy);
    },
    [x, y, strength, prefersReducedMotion]
  );

  const handleMouseLeave = useCallback(() => {
    if (prefersReducedMotion) return;
    x.set(0);
    y.set(0);
  }, [x, y, prefersReducedMotion]);

  return {
    ref,
    x: springX,
    y: springY,
    magneticProps: {
      ref,
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
    },
  };
}

export { useReducedMotion } from "./use-reduced-motion";
