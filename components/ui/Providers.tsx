"use client";
import { MotionConfig } from "motion/react";

export function Providers({ children }: { children: React.ReactNode }) {
  // reducedMotion="user" respects the visitor's OS reduced-motion setting.
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
