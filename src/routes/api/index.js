import { Router } from "express";
import v1Router from "./v1/index.js";

const apiRouter = Router();
const routes = new Map([["/v1", v1Router]]);
routes.forEach((router, path) => {
  apiRouter.use(path, router);
});

export default apiRouter;
