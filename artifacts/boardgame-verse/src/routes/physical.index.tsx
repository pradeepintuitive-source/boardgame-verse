import { createFileRoute } from "@tanstack/react-router";
import { HubScreen } from "../physical/components/HubScreen";

export const Route = createFileRoute("/physical/")({
  component: HubScreen,
});
