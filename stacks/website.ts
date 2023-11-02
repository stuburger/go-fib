import { StackContext, StaticSite, use } from "sst/constructs";
import { ApiGateway } from "./api-gateway";
import { Ecs } from "./ecs";

export function Website({ stack, app }: StackContext) {
  const { api } = use(ApiGateway);
  const { service } = use(Ecs);

  const site = new StaticSite(stack, "ReactSite", {
    path: "packages/website",
    buildCommand: "pnpm run build",
    buildOutput: "dist",
    customDomain:
      app.stage === "stu"
        ? {
            domainName: "pex.stuburger.com",
            hostedZone: "stuburger.com",
          }
        : undefined,
    environment: {
      VITE_APP_SERVICE_URL: service.url!,
      VITE_APP_API_URL: api.url,
    },
  });

  stack.addOutputs({
    WebsiteUrl: site.url,
    CustomDomain: site.customDomainUrl,
  });

  return { site };
}
