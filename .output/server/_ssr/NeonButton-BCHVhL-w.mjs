import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
const variants = {
  primary: "bg-white text-black hover:bg-accent-cyan hover:shadow-[0_0_30px_rgba(0,242,255,0.5)]",
  ghost: "border border-white/20 text-white hover:border-white/60",
  cyan: "bg-accent-cyan/15 border border-accent-cyan/40 text-accent-cyan hover:bg-accent-cyan hover:text-black hover:shadow-[var(--shadow-neon-cyan)]",
  pink: "bg-accent-pink/15 border border-accent-pink/40 text-accent-pink hover:bg-accent-pink hover:text-white hover:shadow-[var(--shadow-neon-pink)]"
};
const sizes = {
  sm: "px-4 py-2 text-[11px]",
  md: "px-6 py-3 text-[12px]",
  lg: "px-8 py-4 text-[13px]"
};
const NeonButton = reactExports.forwardRef(function NeonButton2({ variant = "primary", size = "md", className = "", ...props }, ref) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "button",
    {
      ref,
      className: `font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`,
      ...props
    }
  );
});
export {
  NeonButton as N
};
