import { z } from "zod";
import { zValidator } from "@hono/zod-validator";

const schema = z.object({
  // sensorid: z.string().min(1),
  utcdatetime: z.string().datetime(),
  value: z.number(),
  status: z.number().int().optional(),
});

const validation = zValidator("json", schema);

export default validation;
