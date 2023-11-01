package fib

import "fmt"

var fib []uint64

func init() {
	// Initialize the cache with initial values 0 and 1.
	fib = append(fib, 0, 1)
	// pre cache the first 50 fibonacci numbers
	Fibonacci(50)
}

func CacheReady() bool {
	count := len(fib)
	fmt.Printf("Cache count %d\n", count)
	return count >= 50
}

// Fibonacci calculates the nth Fibonacci number using dynamic programming.
// It returns the Fibonacci number at position n.
func Fibonacci(n int) uint64 {
	// If the cache is already computed, return the value from the cache.
	if n < len(fib) {
		return fib[n]
	}

	// Compute Fibonacci numbers and store them in the cache.
	for i := len(fib); i <= n; i++ {
		fib = append(fib, fib[i-1]+fib[i-2])
	}

	return fib[n]
}
