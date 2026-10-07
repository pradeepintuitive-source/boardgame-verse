import { COLOR_GROUPS, SPACES, getCity } from "../data/catalog";
import { usePhysicalStore } from "../store/physicalStore";
import { playerHex } from "./ui";

export function BoardScreen() {
  const game = usePhysicalStore((state) => state.game);
  if (!game) return null;
  return (
    <div className="flex flex-col gap-3">
      <h2 className="display text-3xl uppercase">Board</h2>
      <p className="text-sm text-white/60">A reference for the physical board. Tokens on the table still move by hand.</p>
      <div className="grid grid-cols-10 gap-px overflow-auto rounded-2xl bg-white/10 p-px">
        {SPACES.map((space) => {
          const city = space.propertyId ? getCity(space.propertyId) : undefined;
          const color = city ? COLOR_GROUPS[city.colorGroup].hex : space.type === "UTILITY" ? "#1c1c1c" : "#12352a";
          const ownership = space.propertyId ? game.ownership[space.propertyId] : undefined;
          const owner = game.players.find((player) => player.id === ownership?.ownerId);
          const here = game.players.filter((player) => player.position === space.position && player.status === "active");
          const { row, col } = gridCell(space.position);
          return (
            <div
              key={space.id}
              style={{ gridRow: row, gridColumn: col, background: color }}
              className="flex min-h-16 min-w-14 flex-col justify-between p-1 text-[9px] leading-tight text-white"
            >
              <span className="font-semibold uppercase">{shortName(space.name)}</span>
              <span>
                {ownership?.hotel ? "H" : ownership?.houses ? `${ownership.houses}h` : ""}
                {ownership?.mortgaged ? " M" : ""}
              </span>
              <span className="flex gap-0.5">
                {owner ? <i className="h-2 w-2 rounded-full" style={{ background: playerHex(owner.color) }} /> : null}
                {here.map((player) => (
                  <i key={player.id} className="h-2 w-2 rounded-full ring-1 ring-white" style={{ background: playerHex(player.color) }} />
                ))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function shortName(name: string): string {
  return name.length > 10 ? name.slice(0, 9) + "…" : name;
}

function gridCell(position: number): { row: number; col: number } {
  if (position <= 9) return { row: 10, col: position + 1 };
  if (position <= 18) return { row: 10 - (position - 9), col: 10 };
  if (position <= 27) return { row: 1, col: 10 - (position - 18) };
  return { row: 1 + (position - 27), col: 1 };
}
