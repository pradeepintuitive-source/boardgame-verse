import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "cyan" | "pink";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-white text-neutral-950 hover:bg-accent-cyan hover:shadow-[var(--shadow-neon-cyan)]",
  ghost: "border border-white/15 bg-white/5 text-white hover:border-white/40 hover:bg-white/10",
  cyan: "bg-accent-cyan/12 border border-accent-cyan/35 text-accent-cyan hover:bg-accent-cyan hover:text-neutral-950 hover:shadow-[var(--shadow-neon-cyan)]",
  pink: "bg-accent-pink/12 border border-accent-pink/35 text-accent-pink hover:bg-accent-pink hover:text-white hover:shadow-[var(--shadow-neon-pink)]",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-[12px]",
  md: "px-5 py-2.5 text-[13px]",
  lg: "px-7 py-3.5 text-sm",
};

export const NeonButton = forwardRef<HTMLButtonElement, Props>(function NeonButton(
  { variant = "primary", size = "md", className = "", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`rounded-full font-semibold tracking-wide transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
});
