package main

import (
	"context"
	"fmt"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

var client *dynamodb.Client

func init() {
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		fmt.Println("Error loading AWS configuration:", err)
		return
	}

	client = dynamodb.NewFromConfig(cfg)
}

func seedDb(ctx context.Context) error {
	tableName := os.Getenv("COUNTER_TABLE_NAME")

	input := &dynamodb.PutItemInput{
		TableName: &tableName,
		Item: map[string]types.AttributeValue{
			"counter": &types.AttributeValueMemberS{Value: "current"},
			"value":   &types.AttributeValueMemberN{Value: "0"},
		},
	}

	_, err := client.PutItem(ctx, input)

	if err != nil {
		return err
	}

	return nil
}

func Handler() {
	ctx := context.TODO()

	err := seedDb(ctx)

	if err != nil {
		panic(err)
	}

	println("Database seeded!")
}

func main() {
	lambda.Start(Handler)
}
