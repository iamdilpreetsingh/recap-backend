import express, { json } from "express";
import { Server } from "http";
import helmet from "helmet";
import pool from "#/lib/db.js";
import routes from "#/routes/index.js";
import { cors } from "#/middlewares/index.js";

function getRequestListener() {
  const application = express();
  application.use(helmet());
  application.use(cors);
  application.use(json());

  application.get("/health", (request, response) =>
    response.status(200).json({ ok: true }),
  );

  routes.forEach((router, path) => {
    application.use(path, router);
  });

  return application;
}

export default async function bootstrap(port, host) {
  const requestListener = getRequestListener();
  const serverOptions = {};
  const server = new Server(serverOptions, requestListener);

  await pool
    .query("SELECT 1")
    .then(() => console.info("Postgres connection successful"))
    .catch((err) => console.error("Postgres connection error:", err));

  server.listen(port, host, () => {
    console.info(server.address());
  });
}
