import { useMemo, useState } from "react";
import { CITIES, COLOR_GROUPS, UTILITIES, getCity, getUtility } from "../data/catalog";
import { buildHotel, buildHouse, calculateRent, mortgageProperty, releaseCost, tradeProperties, unmortgageProperty } from "../engine/engine";
import { usePhysicalStore } from "../store/physicalStore";
import { BigButton, Card, inr } from "./ui";

type Filter = "all" | "owned" | "unowned" | "mortgaged" | "developed";

export function PropertiesScreen() {
  const game = usePhysicalStore((state) => state.game);
  const apply = usePhysicalStore((state) => state.apply);
  const error = usePhysicalStore((state) => state.error);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [tradeFrom, setTradeFrom] = useState("");
  const [tradeTo, setTradeTo] = useState("");
  const [tradeCash, setTradeCash] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  if (!game) return null;
  const dice = (game.lastDice?.die1 ?? 0) + (game.lastDice?.die2 ?? 0) || 7;
  const deeds = useMemo(() => [...CITIES, ...UTILITIES], []);
  const visible = deeds.filter((deed) => {
    const ownership = game.ownership[deed.id];
    if (!ownership) return false;
    if (query && !deed.name.toLowerCase().includes(query.toLowerCase())) return false;
    if (filter === "owned") return Boolean(ownership.ownerId);
    if (filter === "unowned") return !ownership.ownerId;
    if (filter === "mortgaged") return ownership.mortgaged;
    if (filter === "developed") return ownership.houses > 0 || ownership.hotel;
    return true;
  });

  return (
    <div className="flex flex-col gap-3">
      <h2 className="display text-3xl uppercase">Properties</h2>
      <input
        value={query}
        placeholder="Search Mumbai"
        onChange={(event) => setQuery(event.target.value)}
        className="min-h-12 rounded-2xl border border-white/10 bg-black/30 px-3"
      />
      <div className="flex gap-2 overflow-auto">
        {(["all", "owned", "unowned", "mortgaged", "developed"] as Filter[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setFilter(item)}
            className={`min-h-10 shrink-0 rounded-full px-3 text-sm capitalize ${filter === item ? "bg-[#e6b325] text-[#1a1404]" : "bg-white/10"}`}
          >
            {item}
          </button>
        ))}
      </div>
      {error ? <p className="text-sm text-[#ffb4b4]">{error}</p> : null}
      {visible.map((deed) => {
        const ownership = game.ownership[deed.id];
        if (!ownership) return null;
        const owner = game.players.find((player) => player.id === ownership.ownerId);
        const city = getCity(deed.id);
        const utility = getUtility(deed.id);
        const color = city ? COLOR_GROUPS[city.colorGroup].hex : "#111";
        const rent = ownership.ownerId ? calculateRent(game, deed.id, dice) : null;
        return (
          <Card key={deed.id} className="overflow-hidden p-0">
            <div className="h-2" style={{ background: color }} />
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold uppercase">{deed.name}</h3>
                  <p className="text-[#e6b325]">{inr(deed.purchasePrice)}</p>
                </div>
                <p className="text-sm text-white/60">{owner?.name ?? "Unowned"}</p>
              </div>
              <p className="mt-2 text-sm text-white/70">
                Houses {ownership.houses} · Hotel {ownership.hotel ? "Yes" : "No"} · Mortgage {ownership.mortgaged ? "Yes" : "No"}
              </p>
              {rent && !rent.exempt ? <p className="text-sm">Rent now {inr(rent.amount)}</p> : null}
              {utility?.note ? <p className="mt-1 text-xs text-[#f3dd8a]">{utility.note}</p> : null}
              {owner ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {city ? (
                    <>
                      <BigButton tone="ghost" onClick={() => setPendingAction(`house:${deed.id}`)}>
                        House {inr(city.houseCost)}
                      </BigButton>
                      <BigButton tone="ghost" onClick={() => setPendingAction(`hotel:${deed.id}`)}>
                        Hotel {inr(city.hotelCost)}
                      </BigButton>
                    </>
                  ) : null}
                  <BigButton tone="ghost" onClick={() => setPendingAction(`mortgage:${deed.id}`)}>
                    Mortgage {inr(deed.mortgageValue)}
                  </BigButton>
                  <BigButton tone="ghost" onClick={() => setPendingAction(`release:${deed.id}`)}>
                    Release {inr(releaseCost(game, deed.id))}
                  </BigButton>
                  {pendingAction?.endsWith(`:${deed.id}`) ? (
                    <div className="col-span-2 grid grid-cols-2 gap-2">
                      <BigButton tone="ghost" onClick={() => setPendingAction(null)}>
                        Cancel
                      </BigButton>
                      <BigButton
                        onClick={() => {
                          const action = pendingAction.split(":")[0];
                          const run =
                            action === "house"
                              ? buildHouse(game, owner.id, deed.id)
                              : action === "hotel"
                                ? buildHotel(game, owner.id, deed.id)
                                : action === "mortgage"
                                  ? mortgageProperty(game, owner.id, deed.id)
                                  : unmortgageProperty(game, owner.id, deed.id);
                          void apply(run);
                          setPendingAction(null);
                        }}
                      >
                        Confirm
                      </BigButton>
                    </div>
                  ) : null}
                  <button
                    type="button"
                    className="col-span-2 text-left text-sm text-white/60"
                    onClick={() => setSelected((current) => (current.includes(deed.id) ? current.filter((id) => id !== deed.id) : [...current, deed.id]))}
                  >
                    {selected.includes(deed.id) ? "Selected for trade" : "Select for trade"}
                  </button>
                </div>
              ) : null}
            </div>
          </Card>
        );
      })}
      <Card>
        <h3 className="mb-2 text-lg font-semibold">Trade</h3>
        <select value={tradeFrom} onChange={(event) => setTradeFrom(event.target.value)} className="mb-2 min-h-12 w-full rounded-2xl bg-black/30 px-3">
          <option value="">From player</option>
          {game.players.filter((player) => player.status === "active").map((player) => (
            <option key={player.id} value={player.id}>{player.name}</option>
          ))}
        </select>
        <select value={tradeTo} onChange={(event) => setTradeTo(event.target.value)} className="mb-2 min-h-12 w-full rounded-2xl bg-black/30 px-3">
          <option value="">To player</option>
          {game.players.filter((player) => player.status === "active").map((player) => (
            <option key={player.id} value={player.id}>{player.name}</option>
          ))}
        </select>
        <input
          inputMode="numeric"
          value={tradeCash}
          placeholder="Cash with the trade"
          onChange={(event) => setTradeCash(event.target.value.replace(/[^\d]/g, "").slice(0, 8))}
          className="mb-2 min-h-12 w-full rounded-2xl border border-white/10 bg-black/30 px-3"
        />
        <p className="mb-2 text-xs text-white/50">{selected.length} sites selected</p>
        <BigButton
          onClick={() => {
            void apply(tradeProperties(game, tradeFrom, tradeTo, selected, Number(tradeCash || 0))).then(() => setSelected([]));
          }}
        >
          Confirm trade
        </BigButton>
      </Card>
    </div>
  );
}
