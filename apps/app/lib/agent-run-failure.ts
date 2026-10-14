import type { TroChuyenMessages } from "@/lib/messages/agent-builder-tro-chuyen";
import { traBangChu } from "@/lib/tra-bang-chu";

export function runFailureReason(
	t: TroChuyenMessages,
	code: string | null | undefined,
	message: string | null | undefined,
): string {
	const known = code ? traBangChu(t.lyDoHong, code) : undefined;
	if (known) return known;
	if (message?.trim()) return message.trim();
	return t.lyDoHongChung;
}
