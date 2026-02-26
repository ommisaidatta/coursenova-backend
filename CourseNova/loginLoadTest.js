import http from "k6/http";
import { check, group } from "k6";

export let options = {
  vus: 100,
  duration: "1m",
  thresholds: {
    http_req_duration: ["p(95)<2000"],
  },
};

export function setup() {
  let loginRes = http.post(
    "http://localhost:5000/api/students/login",
    JSON.stringify({
      email: "teja04606@gmail.com",
      password: "Teja@123",
    }),
    {
      headers: { "Content-Type": "application/json" },
    },
  );

  check(loginRes, {
    "login successful": (r) => r.status === 200,
  });

  const token = loginRes.json("accessToken");

  if (!token) {
    throw new Error("Login failed. No token received.");
  }

  return { token }; // shared with VUs
}
export default function (data) {
  const authHeaders = {
    headers: {
      Authorization: `Bearer ${data.token}`,
    },
  };
  // 🔥 IMPORTANT: Use real courseId from your DB
  let courseId = "696f08a035185b69600db6da";

  group("Dashboard APIs", function () {
    let profile = http.get("http://localhost:5000/api/profile", authHeaders);
    check(profile, { "profile status 200": (r) => r.status === 200 });

    let enrollments = http.get(
      "http://localhost:5000/api/enroll/my",
      authHeaders,
    );
    check(enrollments, { "enrollments status 200": (r) => r.status === 200 });

    let progress = http.get(
      `http://localhost:5000/api/progress/${courseId}`,
      authHeaders,
    );
    check(progress, { "progress status 200": (r) => r.status === 200 });

    let lessons = http.get(
      `http://localhost:5000/api/lesson/course/${courseId}`,
    );
    check(lessons, { "lessons status 200": (r) => r.status === 200 });

    let ratings = http.get("http://localhost:5000/api/rating/my", authHeaders);
    check(ratings, { "ratings status 200": (r) => r.status === 200 });
  });
}
