import { spaceAt } from "../data/catalog";
import { BANK_ID, declareBankrupt, netWorthOf, retirePlayer } from "../engine/engine";
import { usePhysicalStore } from "../store/physicalStore";
import { BigButton, Card, inr, playerHex } from "./ui";

export function PlayersScreen() {
  const game = usePhysicalStore((state) => state.game);
  const apply = usePhysicalStore((state) => state.apply);
  const error = usePhysicalStore((state) => state.error);
  if (!game) return null;
  return (
    <div className="flex flex-col gap-3">
      <h2 className="display text-3xl uppercase">Players</h2>
      {error ? <p className="text-sm text-[#ffb4b4]">{error}</p> : null}
      {game.players.map((player) => {
        const worth = netWorthOf(game, player.id);
        return (
          <Card key={player.id}>
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-full" style={{ background: playerHex(player.color) }} />
              <div>
                <h3 className="text-2xl font-semibold uppercase">{player.name}</h3>
                <p className="text-xs uppercase tracking-wider text-white/45">{player.status}</p>
              </div>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <Stat label="Cash" value={inr(worth.cash)} />
              <Stat label="Position" value={spaceAt(player.position).name} />
              <Stat label="Properties" value={String(worth.propertyCount)} />
              <Stat label="Houses" value={String(worth.houses)} />
              <Stat label="Hotels" value={String(worth.hotels)} />
              <Stat label="Mortgage" value={inr(worth.mortgageDebt)} />
              <Stat label="Assets" value={inr(worth.assetValue)} />
              <Stat label="Net worth" value={inr(worth.netWorth)} />
            </dl>
            {player.inPrison ? <p className="mt-2 text-sm">In Jail · {player.prisonTurns} failed release rolls</p> : null}
            {player.status === "active" ? (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <BigButton
                  tone="danger"
                  onClick={() => {
                    if (window.confirm(`${player.name} will leave the game. Remaining cash goes to the bank and sites return to the bank.`)) {
                      void apply(declareBankrupt(game, player.id, BANK_ID));
                    }
                  }}
                >
                  Bankrupt
                </BigButton>
                <BigButton
                  tone="ghost"
                  onClick={() => {
                    if (window.confirm(`${player.name} retires and their sites return to the bank.`)) {
                      void apply(retirePlayer(game, player.id));
                    }
                  }}
                >
                  Retire
                </BigButton>
              </div>
            ) : null}
          </Card>
        );
      })}
      <p className="text-xs leading-relaxed text-white/45">
        Bankruptcy is not fully printed on the photographed page. Remaining cash goes to the bank, sites return unmortgaged, and the player is out. The last active player wins.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-white/45">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
