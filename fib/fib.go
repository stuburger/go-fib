package fib

var fib []int

func init() {
	// Initialize the cache with initial values 0 and 1.
	fib = append(fib, 0, 1)
}

// Fibonacci calculates the nth Fibonacci number using dynamic programming.
// It returns the Fibonacci number at position n.
func Fibonacci(n int) int {
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
