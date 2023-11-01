import http from "k6/http";
import { check } from "k6";

export let options = {
  stages: [
    { duration: "30s", target: 1000 }, // Ramp up to 1000 requests per second in 30 seconds
  ],
};

export default function () {
  let response = http.get("https://d3v4249g5ag2st.cloudfront.net/current"); // Send a GET request to the specified endpoint
  check(response, {
    "status is 200": (r) => r.status === 200, // Check if the response status is 200 OK
  });
}
