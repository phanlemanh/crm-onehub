export const TASK_KINDS = [
	"brand",
	"portrait",
	"meeting-prep",
	"identify",
	"profile",
	"recheck",
	"company-profile",
	"workspace-profile",
	"field-backfill",
	"slack-people-match",
	"slack-channel-join",
	"agent-event",
	"nhac-ke-hoach",
	"okr-doc-sheet",
	"soan-tu-nguon",
	"okr-de-xuat",
	"okr-tom-tat-tuan",
	"okr-kiem-san-sang",
	"okr-tom-tat-xep",
	"ai-doi-soat",
	"hoi-kho",
] as const;

export type TaskKind = (typeof TASK_KINDS)[number];

export const DIRECT_KINDS = [
	"brand",
	"portrait",
	"slack-people-match",
	"slack-channel-join",
	"agent-event",
	"nhac-ke-hoach",
	"okr-doc-sheet",
	"soan-tu-nguon",
	"okr-kiem-san-sang",
	"okr-tom-tat-xep",
	"ai-doi-soat",
] as const;

export type DirectKind = (typeof DIRECT_KINDS)[number];

export function isDirectKind(kind: string): kind is DirectKind {
	return (DIRECT_KINDS as readonly string[]).includes(kind);
}

export const HOI_KHO_KINDS = ["hoi-kho"] as const;

export const KHONG_VAO_LAN_NGHIEN_CUU = [
	...DIRECT_KINDS,
	...HOI_KHO_KINDS,
] as const;

export const CONTACT_STATUS_KINDS = ["identify", "profile", "recheck"] as const;

export const COMPANY_STATUS_KINDS = ["brand"] as const;

export function ownsContactStatus(kind: string): boolean {
	return (CONTACT_STATUS_KINDS as readonly string[]).includes(kind);
}

export function ownsCompanyStatus(kind: string): boolean {
	return (COMPANY_STATUS_KINDS as readonly string[]).includes(kind);
}

export const MAX_ATTEMPTS = 3;

export const RETIRED_OUTCOME = `Gave up after ${MAX_ATTEMPTS} attempts: the session never reported back.`;

export const PRIORITY = {
	brand: 900,
	portrait: 800,
	workspace: 500,
	requested: 300,
	meeting: 200,
	identify: 100,
	sweep: 50,
	companyProfile: 40,
	fieldBackfill: 20,
	recheck: 0,
	slackPeople: 150,
	slackJoin: 950,
	event: 700,
	nhac: 60,
	okrSheet: 400,
	soanTuNguon: 300,
	okrBam: 600,
	okrNen: 90,
	okrKiem: 940,
	aiDoiSoat: 45,
	hoiKho: 960,
} as const;

export const LOAI_VIEC_OKR = [
	"okr-de-xuat",
	"okr-tom-tat-tuan",
	"okr-kiem-san-sang",
	"okr-tom-tat-xep",
] as const;

export const LOAI_VIEC_TRO_LY_OKR = [
	"okr-de-xuat",
	"okr-tom-tat-tuan",
] as const;

const SECOND_MS = 1_000;
const MINUTE_MS = 60 * SECOND_MS;

export const LOAI_VIEC_TOM_TAT_TUAN =
	"okr-tom-tat-tuan" satisfies (typeof LOAI_VIEC_TRO_LY_OKR)[number];

export const VIEC_OKR = {
	soLanThu: 1,
	leaseMs: 30 * SECOND_MS,
	leaseTomTatMs: 3 * MINUTE_MS,
} as const;

export function laViecTroLyOkr(kind: string): boolean {
	return (LOAI_VIEC_TRO_LY_OKR as readonly string[]).includes(kind);
}

export function soLanThuToiDa(kind: string): number {
	return (LOAI_VIEC_OKR as readonly string[]).includes(kind)
		? VIEC_OKR.soLanThu
		: MAX_ATTEMPTS;
}
