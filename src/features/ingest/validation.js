import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { HTTPException } from "hono/http-exception";

const schema = z.object({
  timestamp: z.iso.datetime({ message: "Must be a valid ISO 8601 timestamp ending with Z to indicate UTC" }),
  value: z.number(),
  is_valid: z.boolean(),
});

const validation = zValidator("json", schema, (result, c) => {
  if (!result.success) {
    const { formErrors, fieldErrors } = result.error.flatten();
    const message =
      // 1) any top‐level form error?
      formErrors[0] ??
      // 2) otherwise take the first field error
      Object.values(fieldErrors).find((arr) => arr.length)?.[0] ??
      // 3) or fallback
      "Validation failed. Could not parse the error message";
    throw new HTTPException(400, { message });
  }
});

export default validation;
