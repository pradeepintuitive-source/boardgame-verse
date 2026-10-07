import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "../physical/components/Dashboard";

export const Route = createFileRoute("/physical/$gameId/")({
  component: Dashboard,
});
