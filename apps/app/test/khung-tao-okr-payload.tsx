import type { ComponentType } from "react";
import { z } from "zod";
import {
	createKrInput,
	createObjectiveInput,
	updateKrInput,
	updateObjectiveInput,
} from "../../api/src/okr/okr.contracts";
import {
	bam,
	cho,
	datMacDinh,
	dongHet,
	go,
	goiCua,
	HAI,
	hopKr,
	hopMucTieu,
	KR_1,
	MT,
	mo,
	nut,
} from "./khung-gop-y";

const { okrMessages } = await import("@/lib/messages/okr");
const h = okrMessages("vi").hopThoai;

export const THU_TUC_GUI = [
	"okr.createObjective",
	"okr.updateObjective",
	"okr.createKeyResult",
	"okr.updateKeyResult",
] as const;

export type ThuTucGui = (typeof THU_TUC_GUI)[number];

export const SCHEMA_GUI = {
	"okr.createObjective": createObjectiveInput.strict(),
	"okr.updateObjective": updateObjectiveInput.strict(),
	"okr.createKeyResult": createKrInput.strict(),
	"okr.updateKeyResult": updateKrInput.strict(),
} as const;

export const bonPayloadSchema = z.object(SCHEMA_GUI);

export type BonPayload = z.infer<typeof bonPayloadSchema>;

type HaiHop = {
	HopThoaiMucTieu: ComponentType<{
		yeuCau:
			| {
					loai: "tao";
					cycleId: string;
					don: { loai: "goc" };
					tenDon: string;
			  }
			| { loai: "sua"; mucTieu: typeof MT };
		dong: () => void;
	}>;
	HopThoaiKr: ComponentType<{
		objectiveId: string;
		mucTieu: typeof MT;
		kr: typeof KR_1 | null;
		chuMacDinh: string;
		suaDuocCot: boolean;
		dong: () => void;
	}>;
};

const TEN_MOI = "Không thoả thuận nào của miền Bắc bị mất dấu";
const VI_SAO = "Đầu quý 1 là mùa ký lại hợp đồng năm.";
const TEN_KR_MOI = "Khách mới hẹn gặp sau cuộc gọi đầu";
const TEN_KR_SUA = "Gọi 60 cuộc mỗi tuần";

const oTen = (hop: HTMLElement | null) =>
	hop?.querySelector<HTMLInputElement>('input[id$="-ten"]') ?? null;

function motLan<T extends ThuTucGui>(thuTuc: T): BonPayload[T] {
	const goi = goiCua(thuTuc);
	if (goi.length !== 1)
		throw new Error(
			`payload lech: ${thuTuc.split(".")[1]} (${goi.length} lan goi)`,
		);
	const kq = SCHEMA_GUI[thuTuc].safeParse(goi[0]?.dauVao);
	if (!kq.success)
		throw new Error(
			`payload lech: ${thuTuc.split(".")[1]} khong dung schema: ${kq.error.message}`,
		);
	return kq.data as BonPayload[T];
}

export async function bonPayload(hai: HaiHop): Promise<BonPayload> {
	const { HopThoaiMucTieu, HopThoaiKr } = hai;

	datMacDinh([]);
	await mo(
		<HopThoaiMucTieu
			yeuCau={{
				loai: "tao",
				cycleId: MT.cycleId,
				don: { loai: "goc" },
				tenDon: "OneHub",
			}}
			dong={() => {}}
		/>,
	);
	await cho(() => hopMucTieu() !== null, "tao muc tieu mo");
	await go(oTen(hopMucTieu()), TEN_MOI);
	await go(
		hopMucTieu()?.querySelector('textarea[id$="-vi-sao"]') ?? null,
		VI_SAO,
	);
	await bam(nut(h.taoMucTieu));
	const taoMt = motLan("okr.createObjective");
	await dongHet();

	datMacDinh([]);
	await mo(
		<HopThoaiMucTieu yeuCau={{ loai: "sua", mucTieu: MT }} dong={() => {}} />,
	);
	await cho(() => hopMucTieu() !== null, "sua muc tieu mo");
	await go(oTen(hopMucTieu()), TEN_MOI);
	await bam(nut(h.luu));
	const suaMt = motLan("okr.updateObjective");
	await dongHet();

	datMacDinh([]);
	await mo(
		<HopThoaiKr
			objectiveId={MT.id}
			mucTieu={MT}
			kr={null}
			chuMacDinh={HAI.id}
			suaDuocCot
			dong={() => {}}
		/>,
	);
	await cho(() => hopKr() !== null, "them kr mo");
	await go(oTen(hopKr()), TEN_KR_MOI);
	await go(
		hopKr()?.querySelector<HTMLInputElement>("[data-o-dich]") ?? null,
		"20",
	);
	await bam(nut(h.themKr));
	const themKr = motLan("okr.createKeyResult");
	await dongHet();

	datMacDinh([]);
	await mo(
		<HopThoaiKr
			objectiveId={MT.id}
			mucTieu={MT}
			kr={KR_1}
			chuMacDinh={HAI.id}
			suaDuocCot
			dong={() => {}}
		/>,
	);
	await cho(() => hopKr() !== null, "sua kr mo");
	await go(oTen(hopKr()), TEN_KR_SUA);
	await bam(nut(h.luu));
	const suaKr = motLan("okr.updateKeyResult");
	await dongHet();

	return {
		"okr.createObjective": taoMt,
		"okr.updateObjective": suaMt,
		"okr.createKeyResult": themKr,
		"okr.updateKeyResult": suaKr,
	};
}
