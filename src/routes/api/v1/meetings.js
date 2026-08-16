import { Router } from "express";

import { meetingController } from "#/controllers/index.js";
import { authenticate } from "#/middlewares/index.js";

const meetingsRouter = Router();

meetingsRouter.use(authenticate);

meetingsRouter
  .route("/")
  .post(meetingController.createMeeting)
  .get(meetingController.listMeetings);

meetingsRouter.route("/:id").get(meetingController.getMeeting);
meetingsRouter.route("/:id/ask").post(meetingController.askQuestion);
meetingsRouter
  .route("/:id/regenerate-summary")
  .post(meetingController.regenerateSummary);

export default meetingsRouter;
