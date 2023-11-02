import { expect, test, beforeAll, afterAll, describe } from "vitest";
import { Service } from "sst/node/service";
import fetch from "node-fetch";

const BASE_URL = (Service as any).FibonacciService.url;

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

beforeAll(async () => {
  await reset();
});

afterAll(async () => {
  await reset();
});

const sequence = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144];

test("calling the /current endpoint returns the current fibonacci number", async () => {
  const value = await current();
  expect(value).toEqual(0);
});

describe("next and previous", () => {
  test(
    "calling the /next endpoint returns the next fibonacci number",
    async () => {
      // start at the second number in the sequence since we're starting with an call to /next
      for (let i = 1; i < sequence.length; i += 1) {
        const value = await next();
        expect(value).toEqual(sequence[i]);
      }
    },
    { timeout: 20000 }
  );

  test(
    "calling the /previous endpoint returns the previous fibonacci number",
    async () => {
      // start at the second to last number in the sequence since we're starting with a call to /previous
      for (let i = sequence.length - 2; i >= 1; i -= 1) {
        const value = await previous();
        expect(value).toEqual(sequence[i]);
      }
    },
    { timeout: 20000 }
  );
});
