package main

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"stuburger.com/fib/db"
	"stuburger.com/fib/fib"
)

func main() {
	http.HandleFunc("/current", func(w http.ResponseWriter, r *http.Request) {
		ctx := context.TODO()

		counterValue, err := db.GetCurrentCounterValue(ctx)

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, "Error retrieving current counter value: %v", err)
			return
		}

		response := struct {
			Value uint64 `json:"value"`
		}{
			Value: fib.Fibonacci(counterValue),
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)

		err = json.NewEncoder(w).Encode(response)

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, "Error encoding JSON response: %v", err)
		}
	})

	http.HandleFunc("/next", func(w http.ResponseWriter, r *http.Request) {
		counterValue, err := db.IncrementCounter(r.Context(), 1)

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, "Error retrieving current counter value: %v", err)
			return
		}

		response := struct {
			Value uint64 `json:"value"`
		}{
			Value: fib.Fibonacci(counterValue),
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)

		err = json.NewEncoder(w).Encode(response)

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, "Error encoding JSON response: %v", err)
		}
	})

	http.HandleFunc("/previous", func(w http.ResponseWriter, r *http.Request) {
		counterValue, err := db.GetCurrentCounterValue(r.Context())

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, "Error retrieving current counter value: %v", err)
			return
		}

		response := struct {
			Value uint64 `json:"value"`
		}{
			Value: fib.Fibonacci(counterValue),
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)

		err = json.NewEncoder(w).Encode(response)

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, "Error encoding JSON response: %v", err)
		}
	})

	http.HandleFunc("/reset", func(w http.ResponseWriter, r *http.Request) {
		counterValue, err := db.ResetCounter(r.Context())

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, "Error encoding JSON response: %v", err)
		}

		response := struct {
			Value uint64 `json:"value"`
		}{
			Value: fib.Fibonacci(counterValue),
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)

		err = json.NewEncoder(w).Encode(response)

		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Fprintf(w, "Error encoding JSON response: %v", err)
		}
	})

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		if !fib.CacheReady() {
			w.WriteHeader(http.StatusServiceUnavailable)
			fmt.Fprintf(w, "Loading cache...")
			return
		}

		fmt.Fprintf(w, "Health check passed")
	})

	fmt.Println("Server listening on :8080...")
	http.ListenAndServe(":8080", nil)
}
