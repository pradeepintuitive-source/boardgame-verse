import { createFileRoute } from "@tanstack/react-router";
import { SetupScreen } from "../physical/components/SetupScreen";

export const Route = createFileRoute("/physical/setup")({
  component: SetupScreen,
});
