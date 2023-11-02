import { SSTConfig } from "sst";
import { Storage } from "./stacks/storage";
import { ApiGateway } from "./stacks/api-gateway";
import { Website } from "./stacks/website";
import { Ecs } from "./stacks/ecs";

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
      app.stack(Storage); // Storage must be used first
      app.stack(ApiGateway); // Depends on Storage stack
      app.stack(Ecs); // Depends on Storage stack
      app.stack(Website); // Deploy last - depends on all of the above
    });
  },
} satisfies SSTConfig;
