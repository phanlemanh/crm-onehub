import type { AgentDefinitionStatus } from "@crm/db/enums";
import type { StatusTone } from "@crm/ui/components/status-indicator";
import { type NghiaTrangThai, toneTheoNghia } from "@crm/ui/lib/status-tone";
import type { TacNhanMessages } from "@/lib/messages/agent-builder-tac-nhan";

export const NGHIA_TRANG_THAI_TAC_NHAN = {
	LIVE: "xong",
	PAUSED: "cho",
	ARCHIVED: "nhap",
	DRAFT: "nhap",
	DEPLOYING: "dangChay",
	DELETED: "nhap",
} as const satisfies Record<AgentDefinitionStatus, NghiaTrangThai>;

export function trangThaiTacNhan(
	t: TacNhanMessages,
	status: AgentDefinitionStatus,
): { label: string; tone: StatusTone } {
	return {
		label: t.trangThai[status],
		tone: toneTheoNghia(NGHIA_TRANG_THAI_TAC_NHAN[status]),
	};
}
