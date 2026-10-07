import { createFileRoute } from "@tanstack/react-router";
import { PlayersScreen } from "../physical/components/PlayersScreen";

export const Route = createFileRoute("/physical/$gameId/players")({
  component: PlayersScreen,
});
