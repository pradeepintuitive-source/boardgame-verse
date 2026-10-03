import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

type Variant = "primary" | "ghost" | "gold" | "ruby" | "danger" | "cyan" | "pink";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-[#d4a843] text-[#0d0d12] font-bold hover:bg-[#e8c05a] hover:shadow-[0_0_24px_rgba(212,168,67,0.5)] active:bg-[#c09030]",
  gold: "bg-[#d4a843]/15 border border-[#d4a843]/50 text-[#d4a843] hover:bg-[#d4a843] hover:text-[#0d0d12] hover:shadow-[0_0_24px_rgba(212,168,67,0.45)]",
  ruby: "bg-[#8b2335]/15 border border-[#8b2335]/50 text-[#e05060] hover:bg-[#8b2335] hover:text-white hover:shadow-[0_0_24px_rgba(139,35,53,0.45)]",
  danger:
    "border border-[#8b2335]/60 text-[#e05060] hover:bg-[#8b2335] hover:text-white hover:shadow-[0_0_24px_rgba(139,35,53,0.45)] active:bg-[#6e1c29]",
  ghost:
    "border border-white/25 text-white/80 hover:border-[#d4a843]/60 hover:text-[#d4a843] transition-colors",
  // Backwards-compat aliases
  cyan: "bg-[#d4a843]/15 border border-[#d4a843]/50 text-[#d4a843] hover:bg-[#d4a843] hover:text-[#0d0d12] hover:shadow-[0_0_24px_rgba(212,168,67,0.45)]",
  pink: "bg-[#8b2335]/15 border border-[#8b2335]/50 text-[#e05060] hover:bg-[#8b2335] hover:text-white hover:shadow-[0_0_24px_rgba(139,35,53,0.45)]",
};

/** Minimum 44px touch targets (WCAG 2.5.5) */
const sizes: Record<Size, string> = {
  sm: "min-h-[44px] px-4 py-2.5 text-[11px]",
  md: "min-h-[44px] px-6 py-3 text-[12px]",
  lg: "min-h-[48px] px-8 py-4 text-[13px]",
};

export const NeonButton = forwardRef<HTMLButtonElement, Props>(function NeonButton(
  {
    variant = "primary",
    size = "md",
    loading = false,
    icon,
    className = "",
    children,
    disabled,
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center gap-2",
        "rounded-sm font-bold uppercase tracking-widest",
        "transition-all duration-200 cursor-pointer",
        "disabled:opacity-40 disabled:cursor-not-allowed",
        "focus-visible:outline-2 focus-visible:outline-[#d4a843] focus-visible:outline-offset-2",
        variants[variant],
        sizes[size],
        className,
      ].join(" ")}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
});
