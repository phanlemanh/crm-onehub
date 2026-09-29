import type {
	AlignmentTreeOutput,
	MucTieuOutput,
	NutCanChinh,
} from "./okr.contracts";

export function dungCayCanChinh(
	mts: MucTieuOutput[],
	gioiHan: ReadonlySet<string> = new Set(),
): AlignmentTreeOutput {
	const coMat = new Set(
		mts.flatMap((m) => [m.id, ...m.keyResults.map((k) => k.id)]),
	);
	const gopVao = new Map<string, MucTieuOutput[]>();
	for (const m of mts)
		for (const a of m.alignments) {
			const dich = a.targetKeyResultId ?? a.targetObjectiveId;
			gopVao.set(dich, [...(gopVao.get(dich) ?? []), m]);
		}
	const daHien = new Set<string>();
	const nutMt = (m: MucTieuOutput): NutCanChinh => {
		const lapLai = daHien.has(m.id);
		daHien.add(m.id);
		return {
			id: m.id,
			loai: "muc-tieu",
			objectiveId: m.id,
			unitName: m.unitName,
			title: m.title,
			progress: m.progress,
			status: m.status,
			kind: m.kind,
			gop: m.alignments.length,
			lapLai,
			children: lapLai
				? []
				: [
						...m.keyResults.map(
							(k): NutCanChinh => ({
								id: k.id,
								loai: "kr",
								objectiveId: m.id,
								unitName: m.unitName,
								title: k.title,
								progress: k.progress,
								status: m.status,
								kind: m.kind,
								gop: 0,
								lapLai: false,
								children: (gopVao.get(k.id) ?? []).map(nutMt),
							}),
						),
						...(gopVao.get(m.id) ?? []).map(nutMt),
					],
		};
	};
	const coDich = (m: MucTieuOutput) =>
		m.alignments.some((a) =>
			coMat.has(a.targetKeyResultId ?? a.targetObjectiveId),
		);
	const roots = mts.filter((m) => m.level === "onehub").map(nutMt);
	const chuaCanChinh = mts
		.filter((m) => m.level !== "onehub" && !coDich(m) && !gioiHan.has(m.id))
		.map(nutMt);
	return { roots, chuaCanChinh };
}
