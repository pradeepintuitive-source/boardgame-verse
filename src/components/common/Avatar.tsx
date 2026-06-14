import { initials } from "../../utils/ids";

export function Avatar({
  name,
  color,
  size = 32,
  ring = false,
}: {
  name: string;
  color: string;
  size?: number;
  ring?: boolean;
}) {
  return (
    <div
      className={`shrink-0 grid place-items-center rounded-full font-bold ${ring ? "ring-2 ring-offset-2 ring-offset-background" : ""}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${color}, ${color}80)`,
        color: "#050507",
        fontSize: size * 0.34,
        boxShadow: ring ? `0 0 12px ${color}80` : undefined,
      }}
      aria-label={name}
    >
      {initials(name)}
    </div>
  );
}