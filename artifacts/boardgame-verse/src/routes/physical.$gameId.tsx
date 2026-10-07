import { Outlet, createFileRoute } from "@tanstack/react-router";
import { GameChrome } from "../physical/components/GameChrome";

export const Route = createFileRoute("/physical/$gameId")({
  component: function PhysicalGameLayout() {
    return (
      <GameChrome>
        <Outlet />
      </GameChrome>
    );
  },
});
