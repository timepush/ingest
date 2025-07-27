import http from "k6/http";
import { check } from "k6";
import { Trend } from "k6/metrics";

// Custom metrics for Server-Timing segments
export let redisGetTrend = new Trend("server_timing_redis_get", true);
export let redisSetTrend = new Trend("server_timing_redis_set", true);
export let postgresTrend = new Trend("server_timing_postgres", true);

export let options = {
  scenarios: {
    steady_ramp: {
      executor: "ramping-arrival-rate",
      startRate: 0,
      timeUnit: "1s",
      stages: [
        { target: 500, duration: "2m" }, // ramp to 500 req/s in 2m
        { target: 1000, duration: "3m" }, // ramp to 1 000 req/s in 3 min
        { target: 1000, duration: "5m" }, // hold
        { target: 0, duration: "2m" }, // ramp-down
      ],
      preAllocatedVUs: 1500,
      maxVUs: 4000,
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"], // <1% errors
    http_req_duration: ["p(95)<500"], // 95% of calls <500 ms
    // you can also add thresholds for your server_timing metrics if desired:
    server_timing_redis_get: ["p(95)<50"],
    server_timing_redis_set: ["p(95)<50"],
    server_timing_postgres: ["p(95)<50"],
  },
};

export default function () {
  const url = "http://localhost/ingest/raw";
  const payload = JSON.stringify({
    timestamp: new Date().toISOString(),
    value: Math.random() * 100,
    is_valid: true,
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer my-client-secret",
      "X-Client-ID": "my-client-id",
    },
  };

  let res = http.post(url, payload, params);
  check(res, { "status is 200": (r) => r.status === 200 });

  let hdr = res.headers["Server-Timing"];
  if (hdr && hdr.length) {
    hdr
      .split(",")
      .map((part) => part.trim())
      .forEach((segment) => {
        let [name, ...attrs] = segment.split(";");
        let durAttr = attrs.find((a) => a.startsWith("dur="));
        if (!durAttr) return;
        let dur = parseFloat(durAttr.split("=")[1]);
        if (name === "redis_get") {
          redisGetTrend.add(dur);
        } else if (name === "redis_set") {
          redisSetTrend.add(dur);
        } else if (name === "postgres") {
          postgresTrend.add(dur);
        }
      });
  }
}
