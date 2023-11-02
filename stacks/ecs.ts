import { SSTConfig } from "sst";
import { Duration } from "aws-cdk-lib";
import { StaticSite, Service, use, StackContext } from "sst/constructs";
import { Storage } from "./storage";

export function Ecs({ stack }: StackContext) {
  const { table } = use(Storage);

  const service = new Service(stack, "FibonacciService", {
    path: ".",
    port: 8080,
    architecture: "arm64",
    bind: [table],
    dev: {
      // url: "http://localhost:8080",
      deploy: true,
    },
    environment: {
      COUNTER_TABLE_NAME: table.tableName,
    },
    scaling: {
      maxContainers: 1, // increase these numbers if you want higher throughput
      minContainers: 1,
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
    serviceUrl: service.url,
  });

  return { service };
}
