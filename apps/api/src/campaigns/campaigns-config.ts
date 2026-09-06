import type { ListingFieldKey } from "../listings/listings-config";

export const CAMPAIGNS = {
	name: { min: 1, max: 120 },
	script: { max: 2000 },
	members: { pageSize: 50, maxPageSize: 200, scanPageSize: 100, scanCap: 5000 },
	note: { max: 500 },
} as const;

export const ANSWERED_OUTCOMES = ["ANSWERED", "MEETING"] as const;

export const OUTCOME_LABELS = {
	NO_ANSWER: "Không nghe",
	ANSWERED: "Trả lời",
	MEETING: "Hẹn gặp",
	DECLINED: "Từ chối",
	WRONG_NUMBER: "Sai số",
} as const;

export const FIELD_FILTER_PREFIX = "field:";

export const MEMBER_FIELDS = {
	tier: "san_luong",
	listingsNew30d: "tin_moi_30_ngay",
	districts: "dia_ban",
} as const satisfies Record<string, ListingFieldKey>;
