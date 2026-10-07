import { createFileRoute } from "@tanstack/react-router";
import { BoardScreen } from "../physical/components/BoardScreen";

export const Route = createFileRoute("/physical/$gameId/board")({
  component: BoardScreen,
});
