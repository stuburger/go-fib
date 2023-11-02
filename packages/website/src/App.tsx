import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import viteLogo from "/vite.svg";
import "./App.css";

// const BACKENDS = {
//   LAMBDA: "https://zapo3saqka.execute-api.us-east-1.amazonaws.com",
//   CONTAINER: "https://d2nvbyjmsq1wkx.cloudfront.net",
// };

const BACKENDS = {
  LAMBDA: import.meta.env.VITE_APP_API_URL,
  CONTAINER: import.meta.env.VITE_APP_SERVICE_URL,
};

console.log(BACKENDS);

function createFetcher(baseUrl: string) {
  async function current(): Promise<number> {
    return fetch(`${baseUrl}/current`)
      .then((res) => res.json())
      .then(({ value }) => value);
  }

  async function next(): Promise<number> {
    return fetch(`${baseUrl}/next`, { method: "POST" })
      .then((res) => res.json())
      .then(({ value }) => value);
  }

  async function previous(): Promise<number> {
    return fetch(`${baseUrl}/previous`, { method: "POST" })
      .then((res) => res.json())
      .then(({ value }) => value);
  }

  async function reset(): Promise<number> {
    return fetch(`${baseUrl}/reset`, { method: "POST" })
      .then((res) => res.json())
      .then(({ value }) => value);
  }

  return { current, next, previous, reset };
}

const APIS = {
  LAMBDA: createFetcher(BACKENDS.LAMBDA),
  CONTAINER: createFetcher(BACKENDS.CONTAINER),
};

function App() {
  const queryClient = useQueryClient();

  const [backend, setBackend] = useState<keyof typeof BACKENDS>("LAMBDA");

  const { data: count } = useQuery({
    queryKey: ["count"],
    queryFn: () => {
      console.log(`Getting current value from ${backend} backend`);
      return APIS[backend].current();
    },
  });

  const inc = useMutation({
    mutationFn: () => {
      return APIS[backend].next();
    },
    onSuccess: (value) => {
      queryClient.setQueryData(["count"], () => value);
    },
  });

  const dec = useMutation({
    mutationFn: () => {
      return APIS[backend].previous();
    },
    onSuccess: (value) => {
      queryClient.setQueryData(["count"], value);
    },
  });

  const reset = useMutation({
    mutationFn: () => {
      return APIS[backend].reset();
    },
    onSuccess: (value) => {
      queryClient.setQueryData(["count"], value);
    },
  });

  return (
    <>
      <div>
        <a href="#" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="#" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <h1>Pex Fibonacci Fullstack Challenge</h1>
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Lambda backend</span>
            <input
              type="radio"
              name="radio-10"
              className="radio checked:bg-red-500"
              onChange={() => setBackend("LAMBDA")}
              checked={backend === "LAMBDA"}
            />
          </label>
        </div>
        <div className="form-control">
          <label className="label cursor-pointer">
            <span className="label-text">Server backend</span>
            <input
              type="radio"
              name="radio-10"
              className="radio checked:bg-blue-500"
              onChange={() => setBackend("CONTAINER")}
              checked={backend === "CONTAINER"}
            />
          </label>
        </div>
      </div>
      <div className="card">
        <button onClick={() => dec.mutate()}>Previous</button>
        <button onClick={() => inc.mutate()}>Next</button>
        <button onClick={() => reset.mutate()}>Reset</button>
      </div>
      <p className="read-the-docs">{count}</p>
    </>
  );
}

export default App;
