import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	test,
} from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { db } from "@crm/db";
import audit from "../agent/hooks/audit";
import { ZALO } from "../agent/lib/zalo-config";
import { traLoiVe } from "../agent/lib/zalo-tra-loi";
import { phienAudit, type XuLyAudit } from "./support/eve-kieu";
import { boThanhVien, donHoi, gieoVai } from "./support/hoi-gieo";
import { hoiTacTu, moPhienGia } from "./support/hoi-nguong-gieo";
import { donDep, moXuong } from "./support/nhac-gieo";
import { TOKEN } from "./support/tra-loi-gieo";
import { zaloGia } from "./support/zalo-gia";

const SCRIPT = resolve(
	import.meta.dir,
	"../../../_acceptance/hoi-crm-qua-zalo/rang/nguong.ts",
);
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
	const xuLy = audit.events["*"] as unknown as XuLyAudit;
	await xuLy(
		{
			type: "step.completed",
			data: { usage: { inputTokens: vao, outputTokens: ra, costUsd: null } },
			meta: { id: `hczn-ev-${sessionId}`, at: luc.toISOString() },
		},
		phienAudit(sessionId, ZALO.hoi.purpose),
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
		hoiTacTu(
			tx,
			{ messageId: `hczn-${Date.now()}-${so}`, chatId: chat, text: "hỏi" },
			userId,
			luc,
		),
	);
	if (ket.loai !== "hoi") throw new Error(`khong mo phien: ${ket.text}`);
	const sessionId = `hczn-ses-${so}`;
	await moPhienGia(ket.yeuCau, sessionId);
	if (chon.token)
		await gieoBuoc(sessionId, new Date(luc.getTime() + 500), ...chon.token);
	const zalo = zaloGia(chon.guiHong ? { send: 500 } : {});
	await traLoiVe({ hoiId: ket.yeuCau.hoiId, sessionId }, "Trả lời.", {
		fetcher: zalo.fetcher,
		token: TOKEN,
		now: () => new Date(luc.getTime() + treGiay * GIAY_MS),
	});
	return ket.yeuCau.hoiId;
}

async function hoiThat(userId: string, chat: string, luc: Date) {
	so += 1;
	return db.$transaction((tx) =>
		hoiTacTu(
			tx,
			{ messageId: `hczn-${Date.now()}-${so}`, chatId: chat, text: "hỏi" },
			userId,
			luc,
		),
	);
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
		await db.$transaction((tx) =>
			hoiTacTu(
				tx,
				{ messageId: `hczn-b-${Date.now()}`, chatId: "ZB", text: "hỏi" },
				B.id,
				vn("08:30"),
			),
		);
		const F = await gieoVai("Phuc", "member");
		for (let phut = 0; phut < ZALO.hoi.tran.ngay; phut += 1) {
			await hoiVaTra(F.id, "ZF", vn(`13:${String(phut).padStart(2, "0")}`), 3);
		}
		const tran = await hoiThat(F.id, "ZF", vn("13:30"));
		expect(tran.loai, "tu-choi-tran-ngay 1").not.toBe("hoi");
		await hoiVaTra(A.id, "ZA", vn("10:00", "2026-10-14"), 1);
		const moA = await hoiThat(A.id, "ZA", vn("12:00"));
		if (moA.loai !== "hoi") throw new Error("A khong mo duoc cau 12:00");
		const ban = await hoiThat(A.id, "ZA", vn("12:01"));
		expect(
			ban.loai,
			"dang-ban sinh tu cau thu hai khi cau truoc chua xong",
		).not.toBe("hoi");
		await moPhienGia(moA.yeuCau, "hczn-ses-a12");
		await traLoiVe(
			{ hoiId: moA.yeuCau.hoiId, sessionId: "hczn-ses-a12" },
			"Trả lời.",
			{
				fetcher: zaloGia().fetcher,
				token: TOKEN,
				now: () => new Date(vn("12:00").getTime() + 2 * GIAY_MS),
			},
		);
		const ketQua = await db.zaloHoi.groupBy({
			by: ["ketQua"],
			where: {
				crmUserId: { in: [A.id, F.id] },
				ketQua: { in: ["dang-ban", "tu-choi-tran-ngay"] },
			},
			_count: true,
		});
		expect(
			Object.fromEntries(ketQua.map((k) => [k.ketQua, k._count])),
			"hai hang sinh tu hoiTacTu that",
		).toEqual({ "dang-ban": 1, "tu-choi-tran-ngay": 1 });
		const nguon = [
			readFileSync(import.meta.path, "utf8"),
			readFileSync(
				resolve(import.meta.dir, "support/hoi-nguong-gieo.ts"),
				"utf8",
			),
		].join("\n");
		expect(nguon, "khong chen tay hang zaloHoi").not.toContain(
			["zaloHoi", "create("].join("."),
		);

		const dong = await chayScript("2026-10-15", "2026-10-15");
		expect(dong).toEqual([
			"so_cau: 29",
			"so_nguoi: 4",
			"ti_le_tra_loi: 26/29",
			"gui_hong: 1",
			"do_tre_p50_s: 3",
			"do_tre_p95_s: 4.7",
			"tu_choi: vai=1 tran-ngay=1",
			"nguoi_khong_quyen: 1",
			"token_vao: 300",
			"token_ra: 60",
		]);

		await db.zaloHoi.delete({ where: { id: cuaE } });
		const sau = await chayScript("2026-10-15", "2026-10-15");
		expect(sau).toContain("nguoi_khong_quyen: 0");
		expect(sau).toContain("ti_le_tra_loi: 25/28");
		expect(sau).toContain("so_nguoi: 3");
	});
});
