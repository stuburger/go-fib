import http from "k6/http";
import { check } from "k6";

export let options = {
  stages: [
    { duration: "30s", target: 1000 }, // Ramp up to 1000 requests per second in 30 seconds
  ],
};

export default function () {
  let response = http.post(__ENV.SST_Service_url_FibonacciService + "/next"); // Send a POST request to the specified endpoint
  check(response, {
    "status is 200": (r) => r.status === 200, // Check if the response status is 200 OK
  });
}
