import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { capNhatPhien } from "@crm/db/okr-cuoc-soan";
import {
	BAN_NHAP_LOI,
	type BanNhap,
	banNhap,
	type KrNhap,
	type MucTieuNhap,
} from "@crm/validation/okr-cuoc-soan";
import { khoaModel } from "@crm/validation/okr-kiem-de-xuat";
import { dongSoanTuHang } from "@crm/validation/okr-tro-ly";
import { generateText, stepCountIs, tool } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import { z } from "zod";
import type { KetQuaNop } from "../agent/lib/nop-ban-nhap";
import type { NguCanhPhien } from "../agent/lib/phien";
import nopBanNhap from "../agent/tools/nop_ban_nhap";
import { donDep, moXuong, TIEN_TO } from "./support/gieo";
import { gieoCanhGoi } from "./support/gieo-goi";

type CongCu = {
	inputSchema: unknown;
	execute: (input: BanNhap, ctx: NguCanhPhien) => Promise<KetQuaNop>;
};
const congCu = nopBanNhap as unknown as CongCu;

type KetQua = Awaited<ReturnType<MockLanguageModelV4["doGenerate"]>>;
type ThamSo = Parameters<MockLanguageModelV4["doGenerate"]>[0];

const TRAN_CA_MS = 60_000;
const DAU_LOI = "Error message: ";

const issueTraVe = z.array(
	z.object({
		path: z.array(z.union([z.string(), z.number()])),
		message: z.string(),
	}),
);

const nguCanh = (
	sessionId: string,
	userId: string,
	cuocSoanId: string,
): NguCanhPhien => ({
	session: {
		id: sessionId,
		auth: {
			initiator: {
				authenticator: "crm-okr-cua",
				principalId: userId,
				principalType: "user",
				attributes: { purpose: "okr-soan", cuocSoanId, vai: "member" },
			},
			current: null,
		},
	},
});

function traLoi(noiDung: KetQua["content"]): KetQua {
	return {
		content: noiDung,
		finishReason: { unified: "stop", raw: undefined },
		usage: {
			inputTokens: {
				total: 1,
				noCache: 1,
				cacheRead: undefined,
				cacheWrite: undefined,
			},
			outputTokens: { total: 1, text: 1, reasoning: undefined },
		},
		warnings: [],
	};
}

const goiNop = (id: string, ban: BanNhap): KetQua => ({
	...traLoi([
		{
			type: "tool-call",
			toolCallId: id,
			toolName: "nop_ban_nhap",
			input: JSON.stringify(ban),
		},
	]),
	finishReason: { unified: "tool-calls", raw: undefined },
});

const kr = (khoa: string, ten: string): KrNhap => ({
	khoa,
	ten,
	kieu: "tang-toi",
	donVi: "%",
	viSao: "Đo kết quả của mục tiêu",
});

const mucTieu = (khoa: string, ten: string, cacKr: KrNhap[]): MucTieuNhap => ({
	khoa,
	ten,
	viSaoLucNay: "Mùa Tết đối tác cân nhắc đổi nhà vận chuyển",
	loai: "cam-ket",
	viSao: "Kỳ trước trượt gia hạn",
	kr: cacKr,
});

const krBac = [
	kr("k11", "Tỷ lệ đối tác gia hạn hợp đồng"),
	kr("k12", "Số đối tác miền Bắc ký mới"),
];
const krTrung = [
	kr("k21", "Số đại lý mới ký ở miền Trung"),
	kr("k22", "Tỷ lệ đại lý miền Trung hoạt động"),
];

function ketQuaCongCu(vao: ThamSo) {
	const cuoi = vao.prompt.at(-1);
	if (cuoi?.role !== "tool") return null;
	const phan = cuoi.content[0];
	return phan?.type === "tool-result" ? phan.output : null;
}

function issueCua(ra: ReturnType<typeof ketQuaCongCu>) {
	if (ra?.type !== "error-text")
		throw new Error(`cong cu khong tra error-text: ${JSON.stringify(ra)}`);
	const tach = ra.value.indexOf(DAU_LOI);
	if (tach < 0) throw new Error(`error-text thieu "${DAU_LOI}": ${ra.value}`);
	return issueTraVe.parse(JSON.parse(ra.value.slice(tach + DAU_LOI.length)));
}

const demDong = (cuocSoanId: string) =>
	db.okrDeXuat.count({ where: { cuocSoanId } });

async function dungCanh() {
	const canh = await gieoCanhGoi({ vaiNguoiMo: "member" });
	const phien = `${TIEN_TO}phien-${canh.cuocSoanId}`;
	await capNhatPhien(db, canh.cuocSoanId, phien);
	await db.okrCuocSoan.update({
		where: { id: canh.cuocSoanId },
		data: { soLuot: { increment: 1 } },
	});
	return {
		cuocSoanId: canh.cuocSoanId,
		ctx: nguCanh(phien, canh.nguoiMo.id, canh.cuocSoanId),
	};
}

async function chayLuot(sai: BanNhap, dung: BanNhap) {
	const { cuocSoanId, ctx } = await dungCanh();
	const truocLuot = await demDong(cuocSoanId);
	const ketQuaNop: KetQuaNop[] = [];
	let soLan = 0;
	const buoc: {
		soLan: number;
		soDong: number;
		ra: ReturnType<typeof ketQuaCongCu>;
	}[] = [];
	const model = new MockLanguageModelV4({
		doGenerate: async (vao) => {
			buoc.push({
				soLan,
				soDong: await demDong(cuocSoanId),
				ra: ketQuaCongCu(vao),
			});
			if (buoc.length === 1) return goiNop("c1", sai);
			if (buoc.length === 2) return goiNop("c2", dung);
			return traLoi([{ type: "text", text: "Đã ghi bản nháp." }]);
		},
	});
	await generateText({
		model,
		prompt: "Đưa bản nháp.",
		stopWhen: stepCountIs(4),
		tools: {
			nop_ban_nhap: tool({
				inputSchema: banNhap,
				execute: async (input) => {
					soLan += 1;
					const kq = await congCu.execute(input, ctx);
					ketQuaNop.push(kq);
					return kq;
				},
			}),
		},
	});
	const sauBuoc1 = buoc[1];
	if (!sauBuoc1) throw new Error("model khong toi buoc hai");
	const cuoc = await db.okrCuocSoan.findUniqueOrThrow({
		where: { id: cuocSoanId },
		select: { lanNopMoiNhat: true },
	});
	const dong = await db.okrDeXuat.findMany({
		where: { cuocSoanId, inputHash: cuoc.lanNopMoiNhat ?? "" },
		select: {
			loai: true,
			cuocSoanId: true,
			sau: true,
			lyDo: true,
			noiDung: true,
		},
	});
	return {
		truocLuot,
		sauBuoc1,
		soLan,
		ketQuaNop,
		khoaModel: dong.map((h) => khoaModel(dongSoanTuHang(h))),
	};
}

beforeAll(moXuong, TRAN_CA_MS);
afterAll(donDep);

describe("nop-ban-nhap-khoa", () => {
	test("cong-cu-dung-banNhap: inputSchema của nop_ban_nhap là chính schema banNhap", () => {
		expect(congCu.inputSchema).toBe(banNhap);
	});

	test(
		"trung-khoa-muc-tieu: hai Mục tiêu cùng khoá bị từ chối trước khi ghi, agent nộp lại được",
		async () => {
			const ra = await chayLuot(
				{
					mucTieu: [
						mucTieu("m1", "Đối tác miền Bắc gắn bó lâu dài", krBac),
						mucTieu("m1", "Kênh đại lý miền Trung có mặt", krTrung),
					],
				},
				{
					mucTieu: [
						mucTieu("m1", "Đối tác miền Bắc gắn bó lâu dài", krBac),
						mucTieu("m2", "Kênh đại lý miền Trung có mặt", krTrung),
					],
				},
			);
			expect(ra.sauBuoc1.soLan, "execute chay o buoc mot").toBe(0);
			expect(ra.sauBuoc1.soDong).toBe(ra.truocLuot);
			expect(issueCua(ra.sauBuoc1.ra)).toEqual([
				{
					path: ["mucTieu", 1, "khoa"],
					message: `${BAN_NHAP_LOI.mucTieuTrungKhoa}: m1`,
				},
			]);
			expect(ra.soLan).toBe(1);
			expect(ra.ketQuaNop.map((k) => k.ketQua)).toEqual(["da-ghi"]);
			expect(ra.khoaModel.length).toBeGreaterThan(0);
			expect(new Set(ra.khoaModel).size).toBe(ra.khoaModel.length);
			expect(ra.khoaModel).toEqual(
				expect.arrayContaining(["muc-tieu-moi:m1", "muc-tieu-moi:m2"]),
			);
		},
		TRAN_CA_MS,
	);

	test(
		"trung-khoa-kr: hai KR cùng khoá dưới một Mục tiêu bị từ chối trước khi ghi, agent nộp lại được",
		async () => {
			const ra = await chayLuot(
				{
					mucTieu: [
						mucTieu("m1", "Đối tác miền Bắc gắn bó lâu dài", [
							kr("k1", "Tỷ lệ đối tác gia hạn hợp đồng"),
							kr("k1", "Số đối tác miền Bắc ký mới"),
						]),
						mucTieu("m2", "Kênh đại lý miền Trung có mặt", krTrung),
					],
				},
				{
					mucTieu: [
						mucTieu("m1", "Đối tác miền Bắc gắn bó lâu dài", [
							kr("k1", "Tỷ lệ đối tác gia hạn hợp đồng"),
							kr("k2", "Số đối tác miền Bắc ký mới"),
						]),
						mucTieu("m2", "Kênh đại lý miền Trung có mặt", krTrung),
					],
				},
			);
			expect(ra.sauBuoc1.soLan, "execute chay o buoc mot").toBe(0);
			expect(ra.sauBuoc1.soDong).toBe(ra.truocLuot);
			expect(issueCua(ra.sauBuoc1.ra)).toEqual([
				{
					path: ["mucTieu", 0, "kr", 1, "khoa"],
					message: `${BAN_NHAP_LOI.krTrungKhoa}: k1`,
				},
			]);
			expect(ra.soLan).toBe(1);
			expect(ra.ketQuaNop.map((k) => k.ketQua)).toEqual(["da-ghi"]);
			expect(new Set(ra.khoaModel).size).toBe(ra.khoaModel.length);
			expect(ra.khoaModel).toEqual(
				expect.arrayContaining(["kr-moi:m1:k1", "kr-moi:m1:k2"]),
			);
		},
		TRAN_CA_MS,
	);
});
