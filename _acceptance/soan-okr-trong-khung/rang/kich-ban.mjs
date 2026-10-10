import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const GIAY_MS = 1000;

export const CHAM_MS = 8 * GIAY_MS;

export const LENH = {
	nop1: "Đưa bản nháp.",
	nop2: "Sửa bản nháp theo góp ý.",
	chamNop1: "Đưa bản nháp, chậm.",
	chamNop2: "Sửa bản nháp, chậm.",
	tiep: "Tiếp tục.",
};

export const TRA_LOI = {
	moDau: "Kỳ trước phòng đạt 82 %. Ưu tiên quý này là gì?\n- gợi ý: Giữ chân · Mở rộng",
	daNop: "Đã ghi bản nháp.",
	khac: "Đã ghi nhận.",
};

const kr = (khoa, ten, kieu, donVi) => ({
	khoa,
	ten,
	kieu,
	donVi,
	viSao: "Đo được bằng số liệu của phòng.",
});

export const TEN = {
	m1: "Giữ chân đối tác lớn",
	m1Sua: "Đối tác lớn gắn bó lâu dài",
	m2: "Mở kênh đại lý miền Trung",
	k11: "Tỷ lệ đối tác gia hạn hợp đồng",
	k12: "Số khiếu nại giao hàng",
	k13: "Số đối tác được khảo sát",
	k21: "Số đại lý mới ký",
	k22: "Tăng số đại lý gắn bó",
	k23: "Số đơn qua đại lý",
};

const K = {
	k11: kr("k11", TEN.k11, "tang-toi", "%"),
	k12: kr("k12", TEN.k12, "giam-xuong", "vụ"),
	k13: kr("k13", TEN.k13, "tang-toi", "đối tác"),
	k21: kr("k21", TEN.k21, "tang-toi", "đại lý"),
	k22: kr("k22", TEN.k22, "giu-tren", "%"),
	k23: kr("k23", TEN.k23, "tang-toi", "đơn"),
};

const mt = (khoa, ten, loai, dsKr) => ({
	khoa,
	ten,
	viSaoLucNay: "Quý này là mùa gia hạn.",
	loai,
	viSao: "Kỳ trước trượt gia hạn với đối tác lớn.",
	kr: dsKr,
});

export const NOP_1 = {
	mucTieu: [
		mt("m1", TEN.m1, "cam-ket", [K.k11, K.k12, K.k13]),
		mt("m2", TEN.m2, "tham-vong", [K.k21, K.k22]),
	],
};

export const NOP_2 = {
	mucTieu: [
		mt("m1", TEN.m1Sua, "cam-ket", [K.k11, K.k12, K.k22]),
		mt("m2", TEN.m2, "tham-vong", [K.k21, K.k23]),
	],
};

export const DEM = {
	nop1: { mucTieu: 2, kr: 5 },
	nop2: { mucTieu: 2, kr: 5 },
};

export const TEP = { vao: "vao-mo-hinh.ndjson", giu: "giu-mo-hinh" };

export function agentGiaNguon(thuMuc) {
	const vao = join(thuMuc, TEP.vao);
	const giu = join(thuMuc, TEP.giu);
	return `import "@crm/env/load";
import { appendFileSync, existsSync } from "node:fs";
import { bocModelZdr } from "@crm/ai-okr";
import { wrapLanguageModel } from "ai";
import { defineAgent } from "eve";
import { mockModel } from "eve/evals";
import { TRO_LY_OKR_SOAN } from "./lib/config";
const LENH = ${JSON.stringify(LENH)};
const TRA_LOI = ${JSON.stringify(TRA_LOI)};
const NOP_1 = ${JSON.stringify(NOP_1)};
const NOP_2 = ${JSON.stringify(NOP_2)};
const CHAM_MS = ${CHAM_MS};
const VAO = ${JSON.stringify(vao)};
const GIU = ${JSON.stringify(giu)};
const cho = (ms) => new Promise((xong) => setTimeout(xong, ms));
const nopTheo = (chu) =>
	chu.endsWith(LENH.nop2) || chu.endsWith(LENH.chamNop2) ? NOP_2 : chu.endsWith(LENH.nop1) || chu.endsWith(LENH.chamNop1) ? NOP_1 : null;
const cham = (chu) => chu.endsWith(LENH.chamNop1) || chu.endsWith(LENH.chamNop2);
const traLoi = async ({ lastUserMessage, messages }) => {
	const chu = lastUserMessage ?? "";
	const sauCongCu = messages.at(-1)?.role === "tool";
	if (!sauCongCu) appendFileSync(VAO, JSON.stringify({ luc: Date.now(), nguoi: chu }) + "\\n");
	for (let i = 0; existsSync(GIU) && i < 1200; i += 1) await cho(250);
	if (sauCongCu) return TRA_LOI.daNop;
	if (cham(chu)) await cho(CHAM_MS);
	const nop = nopTheo(chu);
	if (nop) return { toolCalls: [{ name: "nop_ban_nhap", input: nop }] };
	return messages.filter((m) => m.role === "user").length <= 1 ? TRA_LOI.moDau : TRA_LOI.khac;
};
const theoHuy = (viec, tin) =>
	!tin
		? viec
		: new Promise((xong, hong) => {
				if (tin.aborted) return hong(tin.reason ?? new Error("aborted"));
				tin.addEventListener("abort", () => hong(tin.reason ?? new Error("aborted")), { once: true });
				viec.then(xong, hong);
			});
const ngheHuy = (model) =>
	wrapLanguageModel({
		model,
		middleware: {
			wrapGenerate: async ({ doGenerate, params }) => theoHuy(doGenerate(), params.abortSignal),
			wrapStream: async ({ doStream, params }) => theoHuy(doStream(), params.abortSignal),
		},
	});
export default defineAgent({
	model: bocModelZdr(ngheHuy(mockModel(traLoi)), { tags: TRO_LY_OKR_SOAN.tags, tranRaMoiLoiGoi: TRO_LY_OKR_SOAN.tranRaMoiLoiGoi }),
	modelContextWindowTokens: TRO_LY_OKR_SOAN.cuaSoNguCanh,
	limits: TRO_LY_OKR_SOAN.limits,
});
`;
}

export function docVao(thuMuc) {
	const tep = join(thuMuc, TEP.vao);
	if (!existsSync(tep)) return [];
	return readFileSync(tep, "utf8")
		.split("\n")
		.filter((d) => d.trim() !== "")
		.map((d) => JSON.parse(d).nguoi);
}
