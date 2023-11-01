import { StackContext, StaticSite, use } from "sst/constructs";
import { ApiGateway } from "./api-gateway";
import { Ecs } from "./ecs";

export function Website({ stack }: StackContext) {
  const { api } = use(ApiGateway);
  const { service } = use(Ecs);

  const site = new StaticSite(stack, "ReactSite", {
    path: "packages/website",
    buildCommand: "pnpm run build",
    buildOutput: "build",
    environment: {
      REACT_APP_SERVICE_URL: service.url!,
      REACT_APP_API_URL: api.url,
    },
  });

  stack.addOutputs({
    WebsiteUrl: site.url,
  });

  return { site };
}
