import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { currentTree, treeSlug } from "@crm/db/measure-database";
import { capNhatPhien } from "@crm/db/okr-cuoc-soan";
import { z } from "zod";
import { TRO_LY_OKR_SOAN } from "../agent/lib/config";
import { docSoNguoiGo } from "../agent/lib/so-nguoi-go";
import { donDep, moXuong } from "./support/gieo";
import { gieoCanhGoi } from "./support/gieo-goi";
import {
	APP,
	EVE_CHAY_DUOC,
	giuKhoaEve,
	KHOI_DONG,
	khoiDongEve,
	type MayEve,
	moiTruongModelTacGia,
	traKhoaEve,
} from "./support/khoi-dong";
import { type AppGia, chepAppGia, KICH_BAN } from "./support/mo-hinh-gia";
import { clientCua } from "./support/phien-cua";
import { BI_MAT_THU } from "./support/the-cua";

let may: MayEve;
let mayCu: MayEve | null = null;
const GOC_KHO = join(APP, "..", "..");
const GOC_AGENT_CU = join(APP, "..", "agent");
const CAY_KHAC = "cay-khac";
const CHAY_AGENT_CU =
	existsSync(join(GOC_AGENT_CU, "agent", "agent.ts")) &&
	process.env.SOKR_KHONG_CHAY_AGENT_CU !== "1";

if (!CHAY_AGENT_CU) {
	console.warn(
		"bo qua ca chay canh apps/agent: thieu apps/agent/agent/agent.ts hoac SOKR_KHONG_CHAY_AGENT_CU=1",
	);
}

const GOC_CAN = CHAY_AGENT_CU ? [APP, GOC_AGENT_CU] : [APP];

beforeAll(
	async () => {
		if (!EVE_CHAY_DUOC) return;
		await giuKhoaEve(GOC_CAN);
		may = await khoiDongEve();
		if (CHAY_AGENT_CU) mayCu = await khoiDongEve({ goc: GOC_AGENT_CU });
	},
	KHOI_DONG.khoa.choMs + GOC_CAN.length * KHOI_DONG.choMs,
);

afterAll(async () => {
	if (!EVE_CHAY_DUOC) return;
	try {
		await may?.dung();
		await mayCu?.dung();
	} finally {
		traKhoaEve(GOC_CAN);
	}
});

describe.skipIf(!EVE_CHAY_DUOC)("app-rieng", () => {
	test("khởi động trên cổng tự do, không dùng 2100, có .eve riêng", async () => {
		expect(may.cong).not.toBe(2100);
		expect(existsSync(join(APP, ".eve"))).toBe(true);
	});

	test("GET /health trả dấu mốc cây của chính cây này (sai cây → mã 2)", async () => {
		const r = await fetch(`${may.url}/health`);
		expect(r.status).toBe(200);
		const than = (await r.json()) as { cay?: string | null };
		const cayNay = treeSlug(currentTree(GOC_KHO));
		if (than.cay !== cayNay) {
			console.error(`sai cay: may tra ${than.cay}, cay nay la ${cayNay}`);
			process.exitCode = 2;
			throw new Error("sai cay");
		}
	});

	test.skipIf(!CHAY_AGENT_CU)(
		"chạy cạnh apps/agent: hai tiến trình, hai cổng, /eve/v1/health cả hai xanh",
		async () => {
			if (!mayCu) throw new Error("apps/agent khong khoi dong");
			expect(mayCu.cong).not.toBe(may.cong);
			const [a, b] = await Promise.all([
				fetch(`${may.url}/eve/v1/health`),
				fetch(`${mayCu.url}/eve/v1/health`),
			]);
			expect([a.status, b.status]).toEqual([200, 200]);
			const cu = await fetch(`${mayCu.url}/health`);
			expect(cu.status).toBe(404);
		},
		KHOI_DONG.baiHaiMay.tranMs,
	);

	test("máy dò còn sống: eve của «cây khác» trả dấu mốc khác cây này (một gốc app chỉ một eve dev, nên dừng máy chính trước)", async () => {
		await may.dung();
		const khac = await khoiDongEve({ env: { PHIEN_DO_TEN_CAY: CAY_KHAC } });
		try {
			const than = (await fetch(`${khac.url}/health`).then((r) =>
				r.json(),
			)) as {
				cay?: string | null;
			};
			expect(than.cay).toBe(treeSlug(CAY_KHAC));
			expect(than.cay).not.toBe(treeSlug(currentTree(GOC_KHO)));
		} finally {
			await khac.dung();
		}
	}, 180_000);
});

const goiCongCu = z.object({
	actions: z.array(
		z.object({
			kind: z.string(),
			callId: z.string(),
			toolName: z.string().optional(),
		}),
	),
});

describe.skipIf(!EVE_CHAY_DUOC)("app-rieng: bốn lượt", () => {
	let mayGia: MayEve | null = null;
	let appGia: AppGia | null = null;
	let canh: Awaited<ReturnType<typeof gieoCanhGoi>>;
	let sessionId = "";

	beforeAll(async () => {
		await moXuong();
		canh = await gieoCanhGoi({ vaiNguoiMo: "member" });
		appGia = chepAppGia();
		mayGia = await khoiDongEve({
			goc: appGia.goc,
			env: {
				[TRO_LY_OKR_SOAN.env.biMat]: BI_MAT_THU,
				...moiTruongModelTacGia({
					TEST_DATABASE_URL: process.env.TEST_DATABASE_URL,
					TEST_RUN_ID: process.env.TEST_RUN_ID,
				}),
			},
		});
	}, 300_000);

	afterAll(async () => {
		await mayGia?.dung();
		appGia?.don();
		if (sessionId) {
			await db.aiChiPhi.deleteMany({ where: { sessionId } });
			await db.agentEvent.deleteMany({ where: { sessionId } });
		}
		await donDep();
	});

	test("mở đầu → trả lời → đưa bản nháp → sửa: lịch sử giữ, ZDR + thinkingLevel low trên mọi lời gọi, tập tool đúng, sổ chi phí đủ bước, sổ sự kiện có số người gõ", async () => {
		if (!mayGia || !appGia) throw new Error("may gia khong khoi dong");
		const cua = clientCua({
			url: mayGia.url,
			secret: BI_MAT_THU,
			userId: canh.nguoiMo.id,
			cuocSoanId: canh.cuocSoanId,
		});
		const phien = cua.session();
		const suKien: { type: string; data?: unknown }[] = [];
		for (const m of [
			KICH_BAN.moDau,
			KICH_BAN.traLoi,
			KICH_BAN.duaNhap,
			KICH_BAN.sua,
		]) {
			const kq = await (await phien.send(m)).result();
			expect(kq.status, `luot «${m}» that bai`).toBe("waiting");
			sessionId = kq.sessionId;
			await capNhatPhien(db, canh.cuocSoanId, sessionId);
			suKien.push(...kq.events);
			if (m === KICH_BAN.sua)
				expect(kq.message ?? "").toContain(KICH_BAN.tenMucTieu3);
		}

		const buoc = suKien.filter((e) => e.type === "step.completed");
		expect(buoc.length).toBeGreaterThanOrEqual(4);
		const dau = appGia.docDau();
		expect(dau.length).toBeGreaterThanOrEqual(buoc.length);
		for (const d of dau) {
			if (d?.zeroDataRetention !== true) throw new Error("loi goi khong zdr");
			expect(d.thinkingLevel).toBe("low");
		}

		const info = await cua.info();
		expect(info.tools.available.map((t) => t.name).sort()).toEqual(
			[...TRO_LY_OKR_SOAN.congCu.song].sort(),
		);
		const goi = new Map(
			suKien
				.filter((e) => e.type === "actions.requested")
				.flatMap((e) => goiCongCu.parse(e.data).actions)
				.map((a) => [a.callId, a.toolName ?? a.kind]),
		);
		expect([...goi.values()]).toEqual(["nop_ban_nhap"]);

		const so = await db.aiChiPhi.findMany({ where: { sessionId } });
		expect(so.length).toBe(buoc.length);
		expect([...new Set(so.map((s) => s.tinhNang))]).toEqual([
			TRO_LY_OKR_SOAN.tinhNang,
		]);
		expect(
			so.every((s) => s.taskId === canh.cuocSoanId && s.phienCha === null),
		).toBe(true);

		const suKienSo = await db.agentEvent.findMany({
			where: { sessionId },
			select: { type: true, contactId: true, conversationId: true },
		});
		expect(suKienSo.filter((e) => e.type === "step.completed").length).toBe(
			buoc.length,
		);
		expect(
			suKienSo.every((e) => e.contactId === null && e.conversationId === null),
		).toBe(true);
		expect(
			suKienSo.some((e) =>
				e.type.endsWith(TRO_LY_OKR_SOAN.suKien.duoiChiTruyen),
			),
		).toBe(false);
		expect([...(await docSoNguoiGo([sessionId]))]).toContain(
			KICH_BAN.soNguoiGo,
		);

		const dong = await db.okrDeXuat.count({
			where: {
				cuocSoanId: canh.cuocSoanId,
				trangThai: "cho",
				taskId: sessionId,
			},
		});
		expect(dong).toBeGreaterThan(0);
	}, 240_000);
});
