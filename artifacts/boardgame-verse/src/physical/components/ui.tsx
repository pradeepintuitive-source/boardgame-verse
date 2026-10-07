import type { ReactNode } from "react";
import { formatInr } from "../money";
import { PLAYER_COLOR_OPTIONS } from "../data/catalog";

export function inr(amount: number): string {
  return formatInr(amount);
}

export function playerHex(color: string): string {
  return PLAYER_COLOR_OPTIONS.find((option) => option.id === color)?.hex ?? "#94a3b8";
}

export function ago(timestamp: number): string {
  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function BigButton({
  children,
  onClick,
  tone = "gold",
  disabled,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: "gold" | "green" | "ghost" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
}) {
  const tones = {
    gold: "bg-[#e6b325] text-[#1a1404]",
    green: "bg-[#1f8a4c] text-white",
    ghost: "bg-white/5 text-[#f6f1e6] border border-white/15",
    danger: "bg-[#8f2d2d] text-white",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`min-h-12 w-full rounded-2xl px-4 py-3 text-base font-semibold disabled:opacity-40 ${tones[tone]}`}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-white/10 bg-[#10241c]/90 p-4 ${className}`}>{children}</section>;
}

export function Sheet({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <>
      <button type="button" className="sheet-backdrop" aria-label="Close" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/20" />
        <h2 className="display mb-3 text-2xl uppercase">{title}</h2>
        {children}
      </div>
    </>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.16em] text-white/50">{children}</label>;
}
