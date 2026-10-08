import type { CarbonIcon } from "@crm/ui/components/icon";
import type { Locale } from "@crm/ui/lib/locale";
import {
	type KaraBanGhiMessages,
	karaBanGhiMessages,
} from "@/lib/messages/kara-ban-ghi";

export type AgentRecordKind = "contact" | "company" | "deal";

export type AgentRecord = { kind: AgentRecordKind; id: string };

type RecordWiring = {
	header: string;
	field: "contactId" | "companyId" | "dealId";
};

export type AgentRecordHeader = Record<string, string>;

export type AgentRecordFilter = {
	contactId?: string;
	companyId?: string;
	dealId?: string;
};

export type RecordCopy = KaraBanGhiMessages["tab"]["theoLoai"][AgentRecordKind];

const WIRING = {
	contact: { header: "x-crm-contact", field: "contactId" },
	company: { header: "x-crm-company", field: "companyId" },
	deal: { header: "x-crm-deal", field: "dealId" },
} satisfies Record<AgentRecordKind, RecordWiring>;

export function recordCopy(kind: AgentRecordKind, locale: Locale): RecordCopy {
	return karaBanGhiMessages(locale).tab.theoLoai[kind];
}

export function recordHeader(record: AgentRecord): AgentRecordHeader {
	return { [WIRING[record.kind].header]: record.id };
}

export function recordFilter(record: AgentRecord): AgentRecordFilter {
	return { [WIRING[record.kind].field]: record.id };
}

export type { CarbonIcon };
