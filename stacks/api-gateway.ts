import { StackContext, Function, use, Api } from "sst/constructs";
import { Storage } from "./storage";

export function ApiGateway({ stack, app }: StackContext) {
  const { table } = use(Storage);

  const handler = new Function(stack, "Function", {
    handler: "functions/lambda/main.go",
    bind: [table],
    architecture: "arm_64",
    environment: {
      COUNTER_TABLE_NAME: table.tableName,
    },
  });

  const api = new Api(stack, "api", {
    routes: {
      // use a single handler matches all routes, i.e. /current, /previous and /next
      "GET /{proxy+}": handler,
    },
  });

  stack.addOutputs({
    ApiGatewayUrl: api.url,
  });

  return { api };
}
