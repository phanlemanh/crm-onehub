import "@crm/env/load";

import { onTelemetryProblem, syncVersion } from "@crm/telemetry";
import { defineAgent } from "eve";
import { logCapabilities } from "./lib/capabilities";
import { SESSION_LIMITS } from "./lib/dispatch-config";
import { MODEL_GOC } from "./lib/model";

void logCapabilities();

onTelemetryProblem((message) => console.debug(`[telemetry] ${message}`));

void syncVersion();

export default defineAgent({
	model: MODEL_GOC,
	limits: SESSION_LIMITS.root,
});
