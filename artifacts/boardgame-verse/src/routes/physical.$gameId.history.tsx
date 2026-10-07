import { createFileRoute } from "@tanstack/react-router";
import { HistoryScreen } from "../physical/components/HistoryScreen";

export const Route = createFileRoute("/physical/$gameId/history")({
  component: HistoryScreen,
});
