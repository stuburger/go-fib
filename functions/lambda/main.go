package main

import (
	"context"
	"encoding/json"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"stuburger.com/fib/db"
	"stuburger.com/fib/fib"
)

func Handler(request events.APIGatewayV2HTTPRequest) (events.APIGatewayProxyResponse, error) {
	path := request.RequestContext.HTTP.Path // Get the incoming path from the request
	ctx := context.TODO()

	if path == "/current" {
		val, err := db.GetCurrentCounterValue(ctx)
		if err != nil {
			return serverError(err), nil
		}

		return ok(fib.Fibonacci(val)), nil
	}

	if path == "/next" {
		val, err := db.IncrementCounter(ctx, 1)
		if err != nil {
			return serverError(err), nil
		}

		return ok(fib.Fibonacci(val)), nil
	}

	if path == "/previous" {
		val, err := db.IncrementCounter(ctx, -1)
		if err != nil {
			return serverError(err), nil
		}

		return ok(fib.Fibonacci(val)), nil
	}

	if path == "/reset" {
		val, err := db.ResetCounter(ctx)
		if err != nil {
			return serverError(err), nil
		}

		return ok(fib.Fibonacci(val)), nil
	}

	// Return a response
	return notFound(), nil
}

type Response struct {
	Value int `json:"value"`
}

func ok(value int) events.APIGatewayProxyResponse {
	ret := &Response{
		Value: value,
	}

	body, _ := json.Marshal(ret)

	return events.APIGatewayProxyResponse{
		Body:       string(body),
		StatusCode: 200,
	}
}

func serverError(err error) events.APIGatewayProxyResponse {
	return events.APIGatewayProxyResponse{
		Body:       err.Error(),
		StatusCode: 500,
	}
}

func notFound() events.APIGatewayProxyResponse {
	return events.APIGatewayProxyResponse{
		Body:       string("bad request"),
		StatusCode: 404,
	}
}

func main() {
	lambda.Start(Handler)
}
