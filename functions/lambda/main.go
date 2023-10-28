package main

import (
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func Handler(request events.APIGatewayV2HTTPRequest) (events.APIGatewayProxyResponse, error) {
	path := request.RequestContext.HTTP.Path // Get the incoming path from the request

	if path == "/current" {
		fmt.Println("'/current'")
	} else if path == "/next" {
		fmt.Println("'/next'")
	} else if path == "/previous" {
		fmt.Println("'/previous'")
	} else {
		fmt.Println("Oops!")
	}

	// Return a response
	return events.APIGatewayProxyResponse{
		Body:       "Hello, World! Your request was received at " + request.RequestContext.Time + ".",
		StatusCode: 200,
	}, nil
}

func main() {
	lambda.Start(Handler)
}
