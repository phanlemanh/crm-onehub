import type { EnrichmentStatus } from "@crm/db/enums";
import type { StatusTone } from "@crm/ui/components/status-indicator";
import type { Locale } from "@crm/ui/lib/locale";
import { crmMessages } from "@/lib/messages/crm";

type EnrichmentPresentation = Record<
	EnrichmentStatus,
	{
		khoa: keyof ReturnType<typeof crmMessages>["enrichment"];
		tone: StatusTone;
		busy?: boolean;
	}
>;

const PRESENTATION: EnrichmentPresentation = {
	PENDING: { khoa: "pending", tone: "neutral" },
	RUNNING: { khoa: "running", tone: "info", busy: true },
	COMPLETE: { khoa: "complete", tone: "success" },
	FAILED: { khoa: "failed", tone: "error" },
	SKIPPED: { khoa: "skipped", tone: "neutral" },
};

const QUEUED = {
	khoa: "queued",
	tone: "neutral" as StatusTone,
	busy: false,
} as const;

export const ENRICHMENT_POLL_MS = 3_000;

export const ENRICHMENT_IDLE_POLL_MS = 30_000;

export function enrichmentFacetOptions(locale: Locale) {
	const m = crmMessages(locale).enrichment;
	return (Object.keys(PRESENTATION) as EnrichmentStatus[]).map((value) => ({
		value,
		label: m[PRESENTATION[value].khoa],
	}));
}

export function enrichmentPresentation(
	status: EnrichmentStatus,
	queued: boolean,
	locale: Locale,
) {
	const { khoa, ...con } =
		status === "PENDING" && queued ? QUEUED : PRESENTATION[status];
	return { ...con, label: crmMessages(locale).enrichment[khoa] };
}

export function isEnriching(status: EnrichmentStatus, queued = false): boolean {
	return status === "RUNNING" || (status === "PENDING" && queued);
}
