import Joi from "joi";

export default {
  create: Joi.object({
    id: Joi.string().required(),
    title: Joi.string().required(),
    startedAt: Joi.number().required(),
    endedAt: Joi.number().allow(null),
    captions: Joi.array().items(Joi.object().unknown(true)).required(),
  }),
  ask: Joi.object({
    question: Joi.string().required(),
  }),
};
