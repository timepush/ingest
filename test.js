import http from "k6/http";
import { check } from "k6";

export let options = {
  scenarios: {
    steady_ramp: {
      executor: "ramping-arrival-rate",
      startRate: 0,
      timeUnit: "1s",
      stages: [
        { target: 500, duration: "2m" }, // ramp to 500 req/s in 2 min
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
  },
};

export default function () {
  const url = "http://localhost:8080/ingest/raw";
  const payload = JSON.stringify({
    utcdatetime: new Date().toISOString(),
    value: Math.random() * 100,
    status: 1,
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
}
