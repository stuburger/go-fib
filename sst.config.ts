import { SSTConfig } from "sst";
import { Api } from "sst/constructs";

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
      const api = new Api(stack, "api", {
        routes: {
          "GET /current": "functions/lambda/current/main.go",
          "GET /next": "functions/lambda/next/main.go",
          "GET /previous": "functions/lambda/previous/main.go",
        },
      });

      stack.addOutputs({
        ApiEndpoint: api.url,
      });
    });
  },
} satisfies SSTConfig;
