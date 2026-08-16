import { meetingValidator } from "#/validators/index.js";
import { meetingService } from "#/services/index.js";

export default {
  createMeeting: async (request, response) => {
    try {
      const validatedData = await meetingValidator.create.validateAsync(
        request.body,
        { convert: true },
      );

      await meetingService.createMeeting({
        ...validatedData,
        endedAt: validatedData.endedAt ?? null,
        userId: request.user.uid,
      });

      return response.status(200).json({ ok: true });
    } catch (err) {
      console.error(err);
      return response
        .status(err.status || 400)
        .json({ error: err.message || "Missing required meeting fields" });
    }
  },

  listMeetings: async (request, response) => {
    try {
      const meetings = await meetingService.listMeetings(request.user.uid);
      return response.status(200).json({ meetings });
    } catch (err) {
      console.error(err);
      return response.status(500).json({ error: "Failed to list meetings" });
    }
  },

  getMeeting: async (request, response) => {
    try {
      const meeting = await meetingService.getMeeting(
        request.params.id,
        request.user.uid,
      );
      return response.status(200).json({ meeting });
    } catch (err) {
      return response
        .status(err.status || 500)
        .json({ error: err.message || "Failed to load meeting" });
    }
  },

  askQuestion: async (request, response) => {
    try {
      const { question } = await meetingValidator.ask.validateAsync(
        request.body,
        { convert: true },
      );

      const answer = await meetingService.askQuestion(
        request.params.id,
        request.user.uid,
        question,
      );

      return response.status(200).json({ answer });
    } catch (err) {
      console.error("[Recap] Ask failed:", err);
      return response
        .status(err.status || 502)
        .json({ error: err.message || "Failed to answer question" });
    }
  },

  regenerateSummary: async (request, response) => {
    try {
      const summary = await meetingService.regenerateSummary(
        request.params.id,
        request.user.uid,
      );
      return response.status(200).json({ ok: true, summary });
    } catch (err) {
      console.error("[Recap] Summary regeneration failed:", err);
      return response
        .status(err.status || 502)
        .json({ error: err.message || "Summary generation failed" });
    }
  },
};
