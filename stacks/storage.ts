import { RemovalPolicy } from "aws-cdk-lib";
import { Script, StackContext, Table, Function } from "sst/constructs";

export function Storage({ stack, app }: StackContext) {
  const table = new Table(stack, "Table", {
    // For this exercise the database will only a single counter field.
    // See db/counter.go for more information
    fields: { counter: "string" },
    primaryIndex: { partitionKey: "counter" },
    cdk: {
      table: {
        // Don't worry about keeping this table around for this toy api
        removalPolicy: RemovalPolicy.DESTROY,
      },
    },
  });

  // Use a lambda function to seed the database with initial counter value
  const seedFn = new Function(stack, "ScriptFn", {
    enableLiveDev: false,
    handler: "functions/script/seed.go",
    bind: [table],
    environment: {
      COUNTER_TABLE_NAME: table.tableName,
    },
  });

  new Script(stack, "Script", {
    onCreate: seedFn,
  });

  stack.addOutputs({
    TableName: table.tableName,
  });

  return { table };
}
