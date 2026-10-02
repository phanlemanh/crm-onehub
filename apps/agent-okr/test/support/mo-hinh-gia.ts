import {
	cpSync,
	existsSync,
	mkdirSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { join } from "node:path";
import type { DauOnehub } from "@crm/ai-okr";
import { z } from "zod";
import { APP } from "./khoi-dong";

export const KICH_BAN = {
	moDau: "Bắt đầu soạn OKR quý này cho phòng.",
	traLoi:
		"Ưu tiên giữ chân đối tác lớn; ràng buộc: không thêm người, tối đa 37 đại lý.",
	soNguoiGo: "37",
	duaNhap: "Đưa bản nháp.",
	sua: "Bỏ mục tiêu 2.",
	tenMucTieu3: "Đối tác miền Bắc gắn bó lâu dài",
} as const;

const TEP_DAU = "dau-loi-goi.ndjson";
const TEP_HE_THONG = "he-thong-loi-goi.ndjson";

function agentGia(duongDau: string, duongHeThong: string): string {
	return `import "@crm/env/load";
import { appendFileSync } from "node:fs";
import { bocModelZdr } from "@crm/ai-okr";
import { wrapLanguageModel } from "ai";
import { defineAgent } from "eve";
import { mockModel } from "eve/evals";
import { TRO_LY_OKR_SOAN } from "./lib/config";
const K = ${JSON.stringify(KICH_BAN)};
const DAU = ${JSON.stringify(duongDau)};
const HE_THONG = ${JSON.stringify(duongHeThong)};
const NHAP = { mucTieu: [
	{ khoa: "m1", ten: K.tenMucTieu3, viSaoLucNay: "Mùa Tết", loai: "cam-ket", viSao: "Kỳ trước trượt gia hạn", kr: [
		{ khoa: "k11", ten: "Tỷ lệ đối tác gia hạn hợp đồng", kieu: "tang-toi", donVi: "%", viSao: "đo kết quả" },
		{ khoa: "k12", ten: "Số khiếu nại giao hàng", kieu: "giam-xuong", donVi: "vụ", viSao: "đối trọng" } ] },
	{ khoa: "m2", ten: "Kênh đại lý miền Trung có mặt", viSaoLucNay: "", loai: "tham-vong", viSao: "vì", kr: [
		{ khoa: "k21", ten: "Số đại lý mới ký", kieu: "tang-toi", donVi: "đại lý", viSao: "đo" },
		{ khoa: "k22", ten: "Tỷ lệ đại lý hoạt động", kieu: "giu-tren", donVi: "%", viSao: "đối trọng" } ] } ] };
const ghi = (dau) => appendFileSync(DAU, JSON.stringify(dau ?? null) + "\\n");
const ghiDau = (model) => wrapLanguageModel({ model, middleware: {
	wrapGenerate: async ({ doGenerate }) => { const kq = await doGenerate(); ghi(kq.providerMetadata?.onehub); return kq; },
	wrapStream: async ({ doStream }) => {
		const kq = await doStream();
		return { ...kq, stream: kq.stream.pipeThrough(new TransformStream({ transform(phan, dk) { if (phan.type === "finish") ghi(phan.providerMetadata?.onehub); dk.enqueue(phan); } })) };
	},
} });
const traLoi = ({ lastUserMessage, userMessages, toolResults }) => {
	if (lastUserMessage === K.sua) {
		const nho = userMessages.includes(K.duaNhap) && toolResults.some((r) => r.name === "nop_ban_nhap" && !r.isError);
		return "Lượt trước bạn đã đưa bản nháp có «" + (nho ? K.tenMucTieu3 : "?") + "». Bỏ mục tiêu 2.";
	}
	if (lastUserMessage === K.duaNhap)
		return toolResults.length > 0 ? "Đã ghi bản nháp: " + JSON.stringify(toolResults.at(-1)?.output) : { toolCalls: [{ name: "nop_ban_nhap", input: NHAP }] };
	return "Kỳ trước phòng đạt 82 %. Hai câu hỏi:\\n1. Ưu tiên gì?\\n- gợi ý: Giữ chân · Mở rộng";
};
const ghiHeThong = (yc) => {
	appendFileSync(HE_THONG, JSON.stringify(yc.messages.filter((m) => m.role === "system").map((m) => m.text).join("\\n\\n")) + "\\n");
	return traLoi(yc);
};
export default defineAgent({
	model: ghiDau(bocModelZdr(mockModel(ghiHeThong), { tags: TRO_LY_OKR_SOAN.tags, tranRaMoiLoiGoi: TRO_LY_OKR_SOAN.tranRaMoiLoiGoi })),
	modelContextWindowTokens: TRO_LY_OKR_SOAN.cuaSoNguCanh,
	limits: TRO_LY_OKR_SOAN.limits,
});
`;
}

export type AppGia = {
	goc: string;
	docDau: () => (DauOnehub | null)[];
	docHeThong: () => string[];
	don: () => void;
};

function docDong(duong: string): unknown[] {
	return existsSync(duong)
		? readFileSync(duong, "utf8")
				.split("\n")
				.filter((d) => d.trim() !== "")
				.map((d) => JSON.parse(d))
		: [];
}

const dauLoiGoi = z
	.object({
		zeroDataRetention: z.boolean(),
		thinkingLevel: z.string().nullable(),
	})
	.nullable();

export function chepAppGia(v: { them?: Record<string, string> } = {}): AppGia {
	const goc = join(APP, "test", ".chay", crypto.randomUUID());
	const duongDau = join(goc, TEP_DAU);
	const duongHeThong = join(goc, TEP_HE_THONG);
	mkdirSync(goc, { recursive: true });
	for (const phan of ["agent", "package.json", "tsconfig.json"])
		cpSync(join(APP, phan), join(goc, phan), { recursive: true });
	writeFileSync(
		join(goc, "agent", "agent.ts"),
		agentGia(duongDau, duongHeThong),
	);
	for (const [duong, than] of Object.entries(v.them ?? {}))
		writeFileSync(join(goc, duong), than);
	return {
		goc,
		docDau: () => docDong(duongDau).map((d) => dauLoiGoi.parse(d)),
		docHeThong: () => docDong(duongHeThong).map((d) => z.string().parse(d)),
		don: () => rmSync(goc, { recursive: true, force: true }),
	};
}
