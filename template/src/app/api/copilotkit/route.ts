/**
 * CopilotKit Runtime API Route
 *
 * Glue between CopilotKit frontend and our PiAgUiAgent (AbstractAgent).
 * The runtime exposes /info + single-route endpoints CopilotKit expects.
 */

// Force Node.js runtime (Pi SDK needs node:fs, node:os, node:path etc.)
export const runtime = "nodejs";
export const maxDuration = 120; // Allow long-running agent responses

import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
  EmptyAdapter,
} from "@copilotkit/runtime";
import {
  PiAgUiAgent,
  loggingMiddleware,
  metricsMiddleware,
  getFilterToolsConfig,
  createFilterToolsMiddleware,
} from "@samy-clivolt/pi-ag-ui";

// Singleton agent — reused across requests
const piAgent = new PiAgUiAgent();

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- runtime middleware signatures differ between CopilotKit and AG-UI client versions
const applyMiddlewares = (...mws: any[]) => mws.forEach((mw) => piAgent.use(mw as any));

// Attach middleware based on env config
const filterConfig = getFilterToolsConfig();
if (filterConfig) {
  applyMiddlewares(createFilterToolsMiddleware(filterConfig));
  console.log("[AG-UI] FilterToolsMiddleware enabled:", filterConfig);
}

if (process.env.DEBUG_AGUI_EVENTS === "true") {
  applyMiddlewares(loggingMiddleware);
  console.log("[AG-UI] LoggingMiddleware enabled");
}

if (process.env.DEBUG_AGUI_METRICS === "true") {
  applyMiddlewares(metricsMiddleware);
  console.log("[AG-UI] MetricsMiddleware enabled");
}

const copilotRuntime = new CopilotRuntime({
  agents: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- @ag-ui/client and runtime package versions expose incompatible nominal types
    "pi-agent": piAgent as any,
  },
});

export const POST = async (req: Request) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime: copilotRuntime,
    serviceAdapter: new EmptyAdapter(),
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
