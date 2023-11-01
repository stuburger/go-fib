import { SSTConfig } from "sst";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { Api, Script, Table, Function, Service } from "sst/constructs";

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

      const service = new Service(stack, "FibonacciService", {
        path: ".",
        port: 8080,
        architecture: "arm64",
        bind: [table],
        environment: {
          COUNTER_TABLE_NAME: table.tableName,
        },
        scaling: {
          maxContainers: 5,
          minContainers: 5,
        },
        cdk: {
          applicationLoadBalancerTargetGroup: {
            healthCheck: {
              path: "/health",
            },
          },
          container: {
            healthCheck: {
              command: [
                "CMD-SHELL",
                "curl -f http://localhost:8080/health || exit 1",
              ],
              interval: Duration.seconds(30),
              retries: 1,
              startPeriod: Duration.seconds(30),
              timeout: Duration.seconds(30),
            },
          },
        },
      });

      stack.addOutputs({
        ServerlessApiEndpoint: api.url,
        ContainerApiEndpoint: service.url,
      });
    });
  },
} satisfies SSTConfig;
