import { OK, INTERNAL_SERVER_ERROR } from "@/lib/http-status-codes";
import env from "@/env";

const onError = (err, c) => {
  const currentStatus = "status" in err ? err.status : c.newResponse(null).status;
  const statusCode = currentStatus !== OK ? currentStatus : INTERNAL_SERVER_ERROR;

  const curr_env = c.env?.NODE_ENV || env.NODE_ENV;
  return c.json(
    {
      message: err.message,
      stack: curr_env === "production" ? undefined : err.stack,
    },
    statusCode
  );
};

export default onError;
