import http from "k6/http";
import { check, group, sleep } from "k6";

const BASE_URL = "http://localhost:5000";
const COURSE_ID = "696f08a035185b69600db6da";

export const options = {
  scenarios: {
    gradual_load: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "25s", target: 100 },
        { duration: "25s", target: 300 },
        { duration: "25s", target: 500 },
        { duration: "25s", target: 800 },
        { duration: "25s", target: 1000 },
        { duration: "25s", target: 1200 },
        { duration: "25s", target: 0 },
      ],
      gracefulRampDown: "25s",
    },
  },

  thresholds: {
    http_req_duration: ["p(95)<3000"],
    http_req_failed: ["rate<0.05"],
  },
};

export function setup() {
  const loginRes = http.post(
    `${BASE_URL}/api/students/login`,
    JSON.stringify({
      email: "teja04606@gmail.com",
      password: "Teja@123",
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  check(loginRes, {
    "Login successful": (r) => r.status === 200,
  });

  const token = loginRes.json("accessToken");

  if (!token) {
    throw new Error("Login failed. No token received.");
  }

  return { token };
}

export default function (data) {
  const authHeaders = {
    headers: {
      Authorization: `Bearer ${data.token}`,
    },
  };

  group("Dashboard APIs", () => {
    let profile = http.get(`${BASE_URL}/api/profile`, authHeaders);
    check(profile, { "Profile status 200": (r) => r.status === 200 });

    sleep(0.5);

    let enrollments = http.get(`${BASE_URL}/api/enroll/my`, authHeaders);
    check(enrollments, { "Enrollments status 200": (r) => r.status === 200 });

    sleep(0.5);

    let progress = http.get(
      `${BASE_URL}/api/progress/${COURSE_ID}`,
      authHeaders,
    );
    check(progress, { "Progress status 200": (r) => r.status === 200 });

    sleep(0.5);

    let lessons = http.get(
      `${BASE_URL}/api/lesson/course/${COURSE_ID}`,
      authHeaders,
    );
    check(lessons, { "Lessons status 200": (r) => r.status === 200 });

    sleep(0.5);

    let ratings = http.get(`${BASE_URL}/api/rating/my`, authHeaders);
    check(ratings, { "Ratings status 200": (r) => r.status === 200 });
  });

  sleep(1);
}
