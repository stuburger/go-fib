import { expect, test, beforeEach, afterAll } from "vitest";
import fetch from "node-fetch";

const BASE_URL = process.env["SST_Api_url_api"];

if (!BASE_URL) {
  throw new Error("API URL not present in environment");
}

async function reset(): Promise<number> {
  const response = await fetch(`${BASE_URL}/reset`, { method: "GET" });
  const { value } = (await response.json()) as { value: number };

  return value;
}

async function previous(): Promise<number> {
  const response = await fetch(`${BASE_URL}/previous`, { method: "GET" });
  const { value } = (await response.json()) as { value: number };

  return value;
}

async function current(): Promise<number> {
  const response = await fetch(`${BASE_URL}/current`, { method: "GET" });
  const { value } = (await response.json()) as { value: number };

  return value;
}

async function next(): Promise<number> {
  const response = await fetch(`${BASE_URL}/next`, { method: "GET" });
  const { value } = (await response.json()) as { value: number };

  return value;
}

beforeEach(async () => {
  await reset();
}, 20000);

afterAll(async () => {
  await reset();
}, 20000);

const sample = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];

test("calling the /current endpoint returns the current fibonacci number", async () => {
  const value = await current();
  expect(value).toEqual(0);
});

test(
  "calling the /next endpoint returns the next fibonacci number",
  async () => {
    for (let i = 1; i < sample.length; i += 1) {
      const value = await next();
      expect(value).toEqual(sample[i]);
    }
  },
  { timeout: 20000 }
);

test.only(
  "concurrent calls to next",
  async () => {
    let promises: Promise<number>[] = [current()];

    for (let i = 1; i < 1000; i += 1) {
      const value = next();
      promises.push(value);
    }
    const sequence = await Promise.all(promises);
    console.log(sequence);
    expect(sequence.sort((a, b) => a - b)).toEqual(sample);
  },
  { timeout: 20000 }
);

test.skip("calling the /previous endpoint returns the previous fibonacci number", async () => {
  const value = await next();
  expect(value).toEqual(0);
});
