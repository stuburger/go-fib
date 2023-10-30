package db

import (
	"context"
	"fmt"
	"os"
	"strconv"

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

func GetCurrentCounterValue(ctx context.Context) (int, error) {
	tableName := os.Getenv("COUNTER_TABLE_NAME")
	input := &dynamodb.GetItemInput{
		TableName: &tableName,
		Key: map[string]types.AttributeValue{
			"counter": &types.AttributeValueMemberS{
				Value: "current",
			},
		},
	}

	result, err := client.GetItem(ctx, input)
	if err != nil {
		fmt.Println("There was an error: %w", err)
		return 0, err
	}

	if result.Item == nil {
		fmt.Println("There was an error: %w", err)
		return 0, fmt.Errorf("Counter not found in DynamoDB")
	}

	counterValue, err := strconv.Atoi(result.Item["value"].(*types.AttributeValueMemberN).Value)
	if err != nil {
		return 0, err
	}

	return counterValue, nil
}

func IncrementCounter(ctx context.Context, amount int) (int, error) {
	tableName := os.Getenv("COUNTER_TABLE_NAME")
	key := map[string]types.AttributeValue{
		"counter": &types.AttributeValueMemberS{
			Value: "current",
		},
	}
	updateExpression := "SET #value = #value + :incr"
	expressionAttributeNames := map[string]string{
		"#value": "value",
	}
	expressionAttributeValues := map[string]types.AttributeValue{
		":incr": &types.AttributeValueMemberN{
			Value: strconv.Itoa(amount),
		},
	}

	input := &dynamodb.UpdateItemInput{
		TableName:                 &tableName,
		Key:                       key,
		UpdateExpression:          &updateExpression,
		ExpressionAttributeNames:  expressionAttributeNames,
		ExpressionAttributeValues: expressionAttributeValues,
		ReturnValues:              types.ReturnValueUpdatedNew,
	}

	result, err := client.UpdateItem(ctx, input)
	if err != nil {
		fmt.Println("Error updating counter:", err)
		return 0, err
	}

	updatedValue, err := strconv.Atoi(result.Attributes["value"].(*types.AttributeValueMemberN).Value)
	if err != nil {
		fmt.Println("Error converting counter value to integer:", err)
		return 0, err
	}

	return updatedValue, nil
}

func ResetCounter(ctx context.Context) (int, error) {
	tableName := os.Getenv("COUNTER_TABLE_NAME")
	key := map[string]types.AttributeValue{
		"counter": &types.AttributeValueMemberS{
			Value: "current",
		},
	}
	updateExpression := "SET #value = :resetValue"
	expressionAttributeNames := map[string]string{
		"#value": "value",
	}
	expressionAttributeValues := map[string]types.AttributeValue{
		":resetValue": &types.AttributeValueMemberN{
			Value: "0",
		},
	}

	input := &dynamodb.UpdateItemInput{
		TableName:                 &tableName,
		Key:                       key,
		UpdateExpression:          &updateExpression,
		ExpressionAttributeNames:  expressionAttributeNames,
		ExpressionAttributeValues: expressionAttributeValues,
		ReturnValues:              types.ReturnValueUpdatedNew,
	}

	result, err := client.UpdateItem(ctx, input)
	if err != nil {
		fmt.Println("Error resetting counter:", err)
		return 0, err
	}

	resetValue, err := strconv.Atoi(result.Attributes["value"].(*types.AttributeValueMemberN).Value)
	if err != nil {
		fmt.Println("Error converting counter value to integer:", err)
		return 0, err
	}

	return resetValue, nil
}
