import "@crm/env/load";

import { DEFAULT_AGENT_MODEL } from "@crm/db/settings";
import { onTelemetryProblem, syncVersion } from "@crm/telemetry";
import { defineAgent, defineDynamic } from "eve";
import { logCapabilities } from "./lib/capabilities";
import { SESSION_LIMITS } from "./lib/dispatch-config";
import { modelChoPhienGoc } from "./lib/model";

void logCapabilities();

onTelemetryProblem((message) => console.debug(`[telemetry] ${message}`));

void syncVersion();

export default defineAgent({
	model: defineDynamic({
		fallback: DEFAULT_AGENT_MODEL.id,
		events: {
			"session.started": (_event, ctx) => modelChoPhienGoc(ctx),
		},
	}),
	limits: SESSION_LIMITS.root,
});
