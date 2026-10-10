import { setSystemTime } from "bun:test";
import type { ObjectiveOutput } from "../../api/src/okr/okr.contracts";
import {
	DetailSheet,
	MT_ID,
	nhip,
	ObjectiveSheet,
	qs,
	qsa,
} from "./khung-gop-y-dung-cho";

export type NoiGop = ObjectiveOutput["alignments"][number];

export const MOC_GIO = "2026-10-01T15:56:00.000Z";

export const vungKara = () => qs("[data-vung-kara]");

export const trangThaiKara = () =>
	vungKara()
		?.querySelector("[data-kara-state]")
		?.getAttribute("data-kara-state") ?? null;

export function demTiaSang(vung: ParentNode): number {
	return (
		qsa("[data-slot=kara-mark]", vung).length +
		qsa("[data-slot=proposed-change] > [data-slot=item-media]", vung).length
	);
}

export const KHUNG = () => (
	<DetailSheet onOpenChange={() => {}} open>
		<ObjectiveSheet objectiveId={MT_ID} />
	</DetailSheet>
);

export async function choLau(
	xong: () => boolean,
	moTa: string,
	ms = 6000,
): Promise<void> {
	const het = performance.now() + ms;
	while (performance.now() < het) {
		if (xong()) return;
		await nhip(1);
		await new Promise((r) => setTimeout(r, 40));
	}
	throw new Error(`khong toi: ${moTa}`);
}

export function lienKet(id: string, targetKeyResultId: string | null): NoiGop {
	return {
		alignmentId: id,
		targetObjectiveId: "mt-goc",
		targetKeyResultId,
		unitName: "OneHub",
		objectiveTitle: "Mục tiêu OneHub",
		keyResultTitle:
			targetKeyResultId === null ? null : `KR ${targetKeyResultId}`,
		lyDo: null,
		canCu: null,
		lyDoTuKara: false,
		mucTin: "chua-co-ly-do",
	};
}

export function datDongHo(ms: number): void {
	setSystemTime(new Date(ms));
}
