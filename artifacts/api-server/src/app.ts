import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { gameBackend } from "./game-backend";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
// Proxy before body parsing so upstream receives the original JSON request.
app.use((req, res, next) => {
  if (req.path === "/ws" || req.path.startsWith("/ws/") ||
      (req.path.startsWith("/api/") && req.path !== "/api/healthz")) {
    gameBackend(req, res, next);
  } else {
    next();
  }
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

export default app;
