import type { HTMLAttributes, ReactNode } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  withScanlines?: boolean;
}

export function GlassPanel({ children, withScanlines, className = "", ...rest }: Props) {
  return (
    <div
      className={`relative glass-panel border border-white/10 overflow-hidden ${className}`}
      {...rest}
    >
      {children}
      {withScanlines && (
        <div className="pointer-events-none absolute inset-0 scanlines opacity-15" />
      )}
    </div>
  );
}