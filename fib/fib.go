package fib

// Fibonacci calculates the nth Fibonacci number using dynamic programming.
// It returns the Fibonacci number at position n.
func Fibonacci(n int) int {
	if n <= 1 {
		return n
	}

	fib := make([]int, n+1)
	fib[0], fib[1] = 0, 1

	for i := 2; i <= n; i++ {
		fib[i] = fib[i-1] + fib[i-2]
	}

	return fib[n]
}
