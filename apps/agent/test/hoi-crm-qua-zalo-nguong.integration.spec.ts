import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { resolve } from "node:path";
import { db } from "@crm/db";
import audit from "../agent/hooks/audit";
import { hoiTacTu, moPhienGia } from "./support/hoi-nguong-gieo";
import { traLoiVe } from "../agent/lib/zalo-tra-loi";
import { ZALO } from "../agent/lib/zalo-config";
import { boThanhVien, donHoi, gieoVai } from "./support/hoi-gieo";
import { donDep, moXuong } from "./support/nhac-gieo";
import { TOKEN } from "./support/tra-loi-gieo";
import { zaloGia } from "./support/zalo-gia";

const SCRIPT = resolve(import.meta.dir, "../../../_acceptance/hoi-crm-qua-zalo/rang/nguong.ts");
const GIAY_MS = 1_000;
let so = 0;

function vn(gio: string, ngay = "2026-10-15"): Date {
	return new Date(`${ngay}T${gio}:00+07:00`);
}

async function chayScript(tu: string, den: string): Promise<string[]> {
	const p = Bun.spawn(["bun", SCRIPT, "--tu", tu, "--den", den], {
		env: process.env,
		stdout: "pipe",
		stderr: "pipe",
	});
	const [ra, ma] = await Promise.all([new Response(p.stdout).text(), p.exited]);
	expect(ma, `script thoat 0: ${await new Response(p.stderr).text()}`).toBe(0);
	return ra.trim().split("\n");
}

async function gieoBuoc(sessionId: string, luc: Date, vao: number, ra: number) {
	const xuLy = audit.events["*"] as unknown as (e: unknown, c: unknown) => Promise<void>;
	await xuLy(
		{ type: "step.completed", data: { usage: { inputTokens: vao, outputTokens: ra, costUsd: null } }, meta: { id: `hczn-ev-${sessionId}`, at: luc.toISOString() } },
		{ session: { id: sessionId, auth: { current: { attributes: { purpose: ZALO.hoi.purpose } }, initiator: null } } },
	);
}

async function hoiVaTra(
	userId: string,
	chat: string,
	luc: Date,
	treGiay: number,
	chon: { guiHong?: boolean; token?: [number, number] } = {},
): Promise<string> {
	so += 1;
	const ket = await db.$transaction((tx) =>
		hoiTacTu(tx, { messageId: `hczn-${Date.now()}-${so}`, chatId: chat, text: "hỏi" }, userId, luc),
	);
	if (ket.loai !== "hoi") throw new Error(`khong mo phien: ${ket.text}`);
	const sessionId = `hczn-ses-${so}`;
	await moPhienGia(ket.yeuCau, sessionId);
	if (chon.token) await gieoBuoc(sessionId, new Date(luc.getTime() + 500), ...chon.token);
	const zalo = zaloGia(chon.guiHong ? { send: 500 } : {});
	await traLoiVe({ hoiId: ket.yeuCau.hoiId, sessionId }, "Trả lời.", {
		fetcher: zalo.fetcher,
		token: TOKEN,
		now: () => new Date(luc.getTime() + treGiay * GIAY_MS),
	});
	return ket.yeuCau.hoiId;
}

beforeAll(moXuong);

beforeEach(async () => {
	await donHoi();
	await db.agentEvent.deleteMany({ where: { id: { startsWith: "hczn-ev-" } } });
});

afterAll(async () => {
	await donHoi();
	await db.agentEvent.deleteMany({ where: { id: { startsWith: "hczn-ev-" } } });
	await donDep();
});

describe("nguong", () => {
	test("nguong: in dung muoi dong, nguoi mat quyen va gui hong tinh rieng", async () => {
		const A = await gieoVai("An", "member");
		const D = await gieoVai("Dung", "member");
		const B = await gieoVai("Binh", "okr");
		const E = await gieoVai("Em", "member");

		await hoiVaTra(A.id, "ZA", vn("08:00"), 1, { token: [100, 20] });
		await hoiVaTra(A.id, "ZA", vn("09:00"), 2, { token: [200, 40] });
		await hoiVaTra(D.id, "ZD", vn("08:00"), 3);
		await hoiVaTra(D.id, "ZD", vn("09:00"), 40);
		await hoiVaTra(D.id, "ZD", vn("10:00"), 5, { guiHong: true });
		const cuaE = await hoiVaTra(E.id, "ZE", vn("08:00"), 4);
		await boThanhVien(E.id);
		await db.$transaction((tx) => hoiTacTu(tx, { messageId: `hczn-b-${Date.now()}`, chatId: "ZB", text: "hỏi" }, B.id, vn("08:30")));
		await db.zaloHoi.create({
			data: { messageId: `hczn-tran-${Date.now()}`, crmUserId: A.id, zaloChatId: "ZA", hoiLuc: vn("11:00"), ketQua: "tu-choi-tran-ngay" },
		});
		await hoiVaTra(A.id, "ZA", vn("10:00", "2026-10-14"), 1);
		await db.zaloHoi.create({
			data: { messageId: `hczn-ban-${Date.now()}`, crmUserId: A.id, zaloChatId: "ZA", hoiLuc: vn("12:00"), ketQua: "dang-ban" },
		});

		const dong = await chayScript("2026-10-15", "2026-10-15");
		expect(dong).toEqual([
			"so_cau: 8",
			"so_nguoi: 3",
			"ti_le_tra_loi: 5/8",
			"gui_hong: 1",
			"do_tre_p50_s: 3.5",
			"do_tre_p95_s: 31.3",
			"tu_choi: vai=1 tran-ngay=1",
			"nguoi_khong_quyen: 1",
			"token_vao: 300",
			"token_ra: 60",
		]);

		await db.zaloHoi.delete({ where: { id: cuaE } });
		const sau = await chayScript("2026-10-15", "2026-10-15");
		expect(sau).toContain("nguoi_khong_quyen: 0");
		expect(sau).toContain("ti_le_tra_loi: 4/7");
		expect(sau).toContain("so_nguoi: 2");
	});
});
