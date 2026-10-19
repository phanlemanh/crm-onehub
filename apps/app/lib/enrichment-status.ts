import type { EnrichmentStatus } from "@crm/db/enums";
import type { Locale } from "@crm/ui/lib/locale";
import { type NghiaTrangThai, toneTheoNghia } from "@crm/ui/lib/status-tone";
import { crmMessages } from "@/lib/messages/crm";

export const NGHIA_LAM_GIAU = {
	PENDING: "dangChay",
	RUNNING: "dangChay",
	COMPLETE: "xong",
	FAILED: "hong",
	SKIPPED: "ketThuc",
	QUEUED: "dangChay",
} as const satisfies Record<EnrichmentStatus | "QUEUED", NghiaTrangThai>;

type EnrichmentPresentation = Record<
	EnrichmentStatus,
	{
		khoa: keyof ReturnType<typeof crmMessages>["enrichment"];
		busy?: boolean;
	}
>;

const PRESENTATION: EnrichmentPresentation = {
	PENDING: { khoa: "pending" },
	RUNNING: { khoa: "running", busy: true },
	COMPLETE: { khoa: "complete" },
	FAILED: { khoa: "failed" },
	SKIPPED: { khoa: "skipped" },
};

const QUEUED = { khoa: "queued", busy: false } as const;

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
	const hang = status === "PENDING" && queued;
	const { khoa, ...con } = hang ? QUEUED : PRESENTATION[status];
	const nghia = NGHIA_LAM_GIAU[hang ? "QUEUED" : status];
	return {
		...con,
		tone: toneTheoNghia(nghia),
		label: crmMessages(locale).enrichment[khoa],
	};
}

export function isEnriching(status: EnrichmentStatus, queued = false): boolean {
	return status === "RUNNING" || (status === "PENDING" && queued);
}
