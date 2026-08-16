import { Router } from "express";
import meetingsRouter from "./meetings.js";

const v1Router = Router();
const routes = new Map([["/meetings", meetingsRouter]]);
routes.forEach((router, path) => {
  v1Router.use(path, router);
});

export default v1Router;
