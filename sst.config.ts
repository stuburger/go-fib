import { SSTConfig } from "sst";
import { RemovalPolicy } from "aws-cdk-lib";
import { Api, Script, Table, Function } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "rest-api-go",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.setDefaultFunctionProps({
      runtime: "go",
    });

    app.stack(function Stack({ stack }) {
      const table = new Table(stack, "Table", {
        fields: {
          counter: "string",
        },
        primaryIndex: { partitionKey: "counter" },
        cdk: {
          table: {
            // Don't worry about keeping this table around for this toy api
            removalPolicy: RemovalPolicy.DESTROY,
          },
        },
      });

      const handler = new Function(stack, "Function", {
        handler: "functions/lambda/main.go",
        bind: [table],
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

      new Script(stack, "Script", {
        onCreate: new Function(stack, "ScriptFn", {
          enableLiveDev: false,
          handler: "functions/script/seed.go",
          bind: [table],
          environment: {
            COUNTER_TABLE_NAME: table.tableName,
          },
        }),
      });

      stack.addOutputs({
        ApiEndpoint: api.url,
      });
    });
  },
} satisfies SSTConfig;
