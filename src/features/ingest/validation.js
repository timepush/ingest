import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const schema = z.object({
  // sensorid: z.string().min(1),
  utcdatetime: z.string().datetime(),
  value: z.number(),
  status: z.number().int().optional(),
});

const validation = zValidator("json", schema, (result, c) => {
  if (!result.success) {
    throw result.error; // Make sure error is thrown so errorHandler can catch it
  }
});

export default validation;
