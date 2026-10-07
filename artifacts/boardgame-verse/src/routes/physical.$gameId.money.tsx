import { createFileRoute } from "@tanstack/react-router";
import { MoneyScreen } from "../physical/components/MoneyScreen";

export const Route = createFileRoute("/physical/$gameId/money")({
  component: MoneyScreen,
});
