import app from "./app";
import { logger } from "./lib/logger";
import { gameBackend } from "./game-backend";
import type { Socket } from "node:net";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
server.on("upgrade", (req, socket, head) => {
  if (req.url?.startsWith("/ws/")) {
    gameBackend.upgrade(req, socket as Socket, head);
  } else {
    socket.destroy();
  }
});
