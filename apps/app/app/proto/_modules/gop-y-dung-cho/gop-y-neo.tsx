"use client";

import {
	ProposedChange,
	type ProposedChangeAction,
	type ProposedChangeDecided,
} from "@crm/ui/components/proposed-change";
import { useState } from "react";
import { GOP_Y, type GopYMau } from "./du-lieu";

export type Ket = "nhan" | "bo-qua";

export type QuyetMau = {
	ket: Ket;
	giaTri?: string;
};

const GUI_MS = 700;

export function useQuyetMau(dau: Readonly<Record<string, QuyetMau>>) {
	const [quyet, setQuyet] = useState<Readonly<Record<string, QuyetMau>>>(dau);
	const [dangGui, setDangGui] = useState<string | null>(null);
	const [dangSua, setDangSua] = useState<{ id: string; giaTri: string } | null>(
		null,
	);
	const gui = (id: string, q: QuyetMau | null) => {
		setDangGui(id);
		setDangSua(null);
		window.setTimeout(() => {
			setQuyet((cu) => {
				const { [id]: _bo, ...conLai } = cu;
				return q ? { ...conLai, [id]: q } : conLai;
			});
			setDangGui(null);
		}, GUI_MS);
	};
	const conCho = GOP_Y.filter((g) => quyet[g.id] === undefined).length;
	const tenSau = (krId: string): string | null => {
		const g = GOP_Y.find((x) => x.loai === "viet-lai" && x.krId === krId);
		if (g?.loai !== "viet-lai") return null;
		const q = quyet[g.id];
		if (q?.ket !== "nhan") return null;
		return q.giaTri ?? g.sau;
	};
	return {
		quyet,
		dangGui,
		dangSua,
		setDangSua,
		gui,
		conCho,
		tenSau,
	};
}

export type QuyetCua = ReturnType<typeof useQuyetMau>;

function chuBienNhan(g: GopYMau, q: QuyetMau): string {
	if (q.ket === "nhan") return "Đã đổi tên KR theo Kara";
	if (g.loai === "viet-lai") return `Đã bỏ qua tên Kara đề xuất: «${g.sau}»`;
	return `Đã bỏ qua câu hỏi của Kara: ${g.tomTat}`;
}

function daQuyet(
	g: GopYMau,
	q: QuyetMau | undefined,
	hoanTac: () => void,
): ProposedChangeDecided | undefined {
	if (!q) return undefined;
	return {
		decision: q.ket === "nhan" ? "accepted" : "skipped",
		text: chuBienNhan(g, q),
		onUndo: q.ket === "nhan" ? hoanTac : undefined,
	};
}

export function GopYNeo({
	g,
	qc,
	moKr,
}: {
	g: GopYMau;
	qc: QuyetCua;
	moKr: (den: "kr-moi" | "sua-kr") => void;
}) {
	const q = qc.quyet[g.id];
	const khoaKhac = qc.dangGui !== null && qc.dangGui !== g.id;
	const decided = daQuyet(g, q, () => qc.gui(g.id, null));
	const khoa = (ds: ProposedChangeAction[]): ProposedChangeAction[] =>
		ds.map((a) => ({ ...a, disabled: khoaKhac || a.disabled }));
	const boQua: ProposedChangeAction = {
		id: "bo-qua",
		label: "Bỏ qua",
		tone: "quiet",
		onClick: () => qc.gui(g.id, { ket: "bo-qua" }),
	};

	if (g.loai === "hoi") {
		return (
			<ProposedChange
				actions={khoa([
					{
						id: g.loiDiDen,
						label: g.loiDi,
						tone: "secondary",
						onClick: () => moKr(g.loiDiDen),
					},
					boQua,
				])}
				data-gop-y={g.id}
				decided={decided}
				kind="question"
				pending={qc.dangGui === g.id}
				value={g.cau}
			/>
		);
	}

	const sua = qc.dangSua?.id === g.id ? qc.dangSua : null;
	return (
		<ProposedChange
			actions={khoa(
				sua
					? [
							{
								id: "doi-ten",
								label: "Đổi tên KR",
								tone: "primary",
								disabled: sua.giaTri.trim() === "",
								onClick: () =>
									qc.gui(g.id, { ket: "nhan", giaTri: sua.giaTri.trim() }),
							},
							{
								id: "huy",
								label: "Huỷ",
								tone: "quiet",
								onClick: () => qc.setDangSua(null),
							},
						]
					: [
							{
								id: "doi-ten",
								label: "Đổi tên KR",
								tone: "primary",
								onClick: () => qc.gui(g.id, { ket: "nhan" }),
							},
							{
								id: "sua",
								label: "Sửa",
								tone: "secondary",
								onClick: () => qc.setDangSua({ id: g.id, giaTri: g.sau }),
							},
							boQua,
						],
			)}
			before={g.truoc}
			data-gop-y={g.id}
			decided={decided}
			editing={
				sua
					? {
							value: sua.giaTri,
							onChange: (giaTri) => qc.setDangSua({ id: g.id, giaTri }),
							onCancel: () => qc.setDangSua(null),
						}
					: undefined
			}
			kind="rewrite"
			pending={qc.dangGui === g.id}
			rationale={g.lyDo}
			value={g.sau}
		/>
	);
}
