import type { Locale } from "@crm/ui/lib/locale";
import { inputLabel, type LabelInput } from "@/lib/agent-tool-display";
import type { TranscriptItem } from "@/lib/agent-transcript";
import type { KaraBanGhiMessages } from "@/lib/messages/kara-ban-ghi";

type DidItem = Extract<TranscriptItem, { kind: "did" }>;

export function stepLabel(
	item: Pick<DidItem, "tool" | "label">,
	t: KaraBanGhiMessages,
	locale: Locale,
): string {
	const viec = new Map(Object.entries(t.tab.buoc)).get(item.tool);
	if (!viec) return locale === "vi" ? t.tab.buocKhac : item.label;
	const tach = item.label.indexOf(" — ");
	return tach === -1 || locale === "vi"
		? viec
		: `${viec}${item.label.slice(tach)}`;
}

export function builderStepLabel(
	item: LabelInput,
	t: KaraBanGhiMessages,
): string {
	return (
		inputLabel(item) ??
		new Map(Object.entries(t.tab.buoc)).get(item.tool) ??
		item.label
	);
}
