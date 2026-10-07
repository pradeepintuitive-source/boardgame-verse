import { createFileRoute } from "@tanstack/react-router";
import { PropertiesScreen } from "../physical/components/PropertiesScreen";

export const Route = createFileRoute("/physical/$gameId/properties")({
  component: PropertiesScreen,
});
