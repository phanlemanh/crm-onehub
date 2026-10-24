import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	spyOn,
	test,
} from "bun:test";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { db } from "@crm/db";
import { luuCaiDatThongBao } from "@crm/db/cai-dat-thong-bao";
import { ngayVN } from "@crm/db/onboarding-nhac";
import { SETTINGS_ID } from "@crm/db/settings";
import { parseNhacPayload } from "@crm/validation/nhac-ke-hoach";
import {
	khoaThongBao,
	macDinhDayRa,
	noiDungThongBao,
	THONG_BAO,
} from "@crm/validation/thong-bao";
import { chayNhac, lenLichNhac } from "../agent/lib/nhac-ke-hoach";
import { dayThongBaoSuKien } from "../agent/lib/thong-bao-day";
import { coMat, doiChieu } from "../agent/lib/thong-bao-doi-chieu";
import { MUC_MAU_TAC_NHAN } from "./support/muc-mau-tac-nhan";
import {
	donDep,
	gieoKeHoach,
	gieoNguoi,
	khopSlack,
	moXuong,
	noiSlack,
	slackGia,
	TIEN_TO,
} from "./support/nhac-gieo";
import {
	HAN_XA,
	HOM_QUA,
	lucVN,
	ngayCach,
	PHUT_SAU,
} from "./support/nhac-gui-gieo";
import { zaloGia } from "./support/zalo-gia";

const GOC_KHO = resolve(import.meta.dir, "../../..");
const NGAY = ["2026-10-10", "2026-10-11", "2026-10-12"] as const;
const APP_URL = "https://crm.test";

type Nguoi = { id: string };

async function nguoiCoBuocTre(ten: string, goc: Date): Promise<Nguoi> {
	const nguoi = await gieoNguoi(ten);
	const O = await gieoNguoi(`${ten} cam trich`);
	await gieoKeHoach({
		camTrich: O.id,
		batDau: ngayCach(goc, -HAN_XA),
		imTu: ngayCach(goc, HOM_QUA),
		buoc: [{ nhan: `${ten} tre`, giao: nguoi.id, han: ngayCach(goc, HOM_QUA) }],
	});
	return nguoi;
}

async function luotNgay(
	ngay: string,
	nguoi: Nguoi[],
	hong?: string,
): Promise<void> {
	const goc = lucVN(ngay, PHUT_SAU);
	setSystemTime(goc);
	await lenLichNhac(goc);
	const s = slackGia();
	for (const n of nguoi) {
		const hang = await db.agentTask.findFirstOrThrow({
			where: { subject: `user:${n.id}:${ngay}` },
			select: { id: true },
		});
		const deps =
			n.id === hong
				? {
						fetcher: s.fetcher,
						appUrl: APP_URL,
						ghiThongBao: async () => {
							throw new Error("ghi gia hong");
						},
					}
				: { fetcher: s.fetcher, appUrl: APP_URL };
		await chayNhac(hang, deps);
	}
}

function lenh(...thamSo: string[]) {
	return spawnSync(
		"bun",
		["apps/agent/scripts/thong-bao-doi-chieu.ts", ...thamSo],
		{
			cwd: GOC_KHO,
			encoding: "utf8",
			env: { ...process.env, DOI_CHIEU_DATABASE_URL: process.env.DATABASE_URL },
		},
	);
}

let A: Nguoi;
let B: Nguoi;
let K1: Nguoi;
let K2: Nguoi;

beforeAll(async () => {
	await db.thongBao.deleteMany({
		where: { nguoiNhanId: { startsWith: TIEN_TO } },
	});
	await donDep();
	await moXuong();
	const goc = lucVN(NGAY[0], PHUT_SAU);
	A = await nguoiCoBuocTre("An", goc);
	B = await nguoiCoBuocTre("Binh", goc);
	K1 = await nguoiCoBuocTre("Kha", goc);
	K2 = await nguoiCoBuocTre("Khanh", goc);
	for (const n of [A, B]) {
		await noiSlack(n.id);
		await khopSlack(n.id, `U-${n.id}`);
	}
	const tat = spyOn(console, "error").mockImplementation(() => {});
	for (const ngay of NGAY) await luotNgay(ngay, [A, B, K1, K2]);
	tat.mockRestore();
	await db.thongBao.updateMany({
		where: { nguoiNhanId: K1.id },
		data: { moLuc: lucVN(NGAY[2], PHUT_SAU) },
	});
	setSystemTime();
}, 120_000);

afterAll(async () => {
	setSystemTime();
	await db.thongBao.deleteMany({
		where: { nguoiNhanId: { startsWith: TIEN_TO } },
	});
	await donDep();
});

async function demDocLap(ngay: string) {
	const luot = await db.agentTask.findMany({
		where: { subject: { endsWith: `:${ngay}` }, kind: "nhac-ke-hoach" },
		select: { payload: true, outcome: true },
	});
	return {
		nguoiCoLuot: luot.length,
		coKenh: luot.filter((l) => l.outcome?.startsWith("da-gui")).length,
		khongKenh: luot.filter((l) =>
			["khong-khop", "khong-slack"].includes(l.outcome ?? ""),
		).length,
		mucDaTinh: luot.reduce(
			(n, l) => n + (parseNhacPayload(l.payload).mucTinh?.khoa.length ?? 0),
			0,
		),
	};
}

describe("htb-doi-chieu", () => {
	test("htb-doi-chieu: 4 — kho sach, moi so khop dem doc lap, khong muc mat, ma 0", async () => {
		const kq = await doiChieu(db, { tu: NGAY[0], den: NGAY[2] });
		expect(kq.ngay.map((d) => d.ngay)).toEqual([...NGAY]);
		for (const d of kq.ngay) {
			const doc = await demDocLap(d.ngay);
			expect(d.nguoiCoLuot).toBe(doc.nguoiCoLuot);
			expect(d.coKenh).toBe(doc.coKenh);
			expect(d.khongKenh).toBe(doc.khongKenh);
			expect(d.mucDaTinh).toBe(doc.mucDaTinh);
			expect(d.mucCoThongBao).toBe(d.mucDaTinh);
			expect(d.mucMat).toEqual([]);
		}
		expect(kq.nguoiCoThongBao).toBe(4);
		expect(kq.nguoiDaBamMo).toBe(1);
		const r = lenh("--tu", NGAY[0], "--den", NGAY[2]);
		expect(r.status, r.stderr).toBe(0);
		expect(r.stdout).toContain("da bam mo it nhat mot 1");
	});

	test("htb-doi-chieu: 8 — doc bang thong bao mot lan, khong lap theo luot", async () => {
		let goi = 0;
		const dem = new Proxy(db, {
			get(dich, ten, nhan) {
				if (ten !== "thongBao") return Reflect.get(dich, ten, nhan);
				return new Proxy(dich.thongBao, {
					get(bang, khoa, nhanBang) {
						if (khoa === "findMany") goi += 1;
						return Reflect.get(bang, khoa, nhanBang);
					},
				});
			},
		});
		await doiChieu(dem, { tu: NGAY[0], den: NGAY[2] });
		expect(goi, "doi chieu doc bang thong bao theo tung luot").toBe(1);
	});

	test("htb-doi-chieu: 5 — thieu co thi ma 2 goi ten co", () => {
		const r = lenh("--tu", NGAY[0]);
		expect(r.status).toBe(2);
		expect(r.stderr).toContain("--den");
	});

	test("htb-doi-chieu: 6 — ghi thong bao hong cho nguoi khong kenh thi lenh goi ten muc mat", async () => {
		const ngay = "2026-10-13";
		const tat = spyOn(console, "error").mockImplementation(() => {});
		await luotNgay(ngay, [A, B, K1, K2], K2.id);
		tat.mockRestore();
		setSystemTime();
		const kq = await doiChieu(db, { tu: ngay, den: ngay });
		const hangK2 = await db.agentTask.findFirstOrThrow({
			where: { subject: `user:${K2.id}:${ngay}` },
			select: { payload: true },
		});
		const khoaK2 = parseNhacPayload(hangK2.payload).mucTinh?.khoa ?? [];
		expect(khoaK2.length).toBeGreaterThan(0);
		expect(
			kq.ngay[0]?.mucMat
				.filter((m) => m.userId === K2.id)
				.map((m) => m.khoa)
				.sort(),
			"doi chieu tu so voi chinh no",
		).toEqual([...khoaK2].sort());
		expect(coMat(kq)).toBe(true);
		const r = lenh("--tu", ngay, "--den", ngay);
		expect(r.status).toBe(1);
		expect(r.stdout).toContain(khoaK2[0] as string);
	});

	test("htb-doi-chieu: 7 — luot chet truoc khi ghi danh sach thi ca luot tinh la mat", async () => {
		const ngay = "2026-10-14";
		const goc = lucVN(ngay, PHUT_SAU);
		setSystemTime(goc);
		await lenLichNhac(goc);
		setSystemTime();
		const kq = await doiChieu(db, { tu: ngay, den: ngay });
		expect(
			kq.ngay[0]?.luotThieuDanhSach.length,
			"luot chet khong tinh vao muc mat",
		).toBe(4);
		expect(coMat(kq)).toBe(true);
	});

	test("htb-doi-chieu: 3 — xoa tay mot thong bao thi lenh goi dung khoa", async () => {
		const mot = await db.thongBao.findFirstOrThrow({
			where: { nguoiNhanId: A.id },
		});
		await db.thongBao.delete({ where: { id: mot.id } });
		const kq = await doiChieu(db, { tu: NGAY[0], den: NGAY[2] });
		const mat = kq.ngay.flatMap((d) => d.mucMat);
		expect(mat.length).toBeGreaterThan(0);
		expect(mat.every((m) => m.userId === A.id && m.khoa === mot.khoa)).toBe(
			true,
		);
		const r = lenh("--tu", NGAY[0], "--den", NGAY[2]);
		expect(r.status).toBe(1);
		expect(r.stdout).toContain(mot.khoa);
	});
});

describe("tbk-doi-chieu", () => {
	const NGAY_KENH = ["2026-10-20", "2026-10-21"] as const;
	const TOKEN = "1:abc";

	async function voiToken<T>(chay: () => Promise<T>): Promise<T> {
		const cu = process.env.ZALO_BOT_TOKEN;
		process.env.ZALO_BOT_TOKEN = TOKEN;
		try {
			return await chay();
		} finally {
			if (cu === undefined) delete process.env.ZALO_BOT_TOKEN;
			else process.env.ZALO_BOT_TOKEN = cu;
		}
	}

	async function luotKenh(ngay: string, nguoi: Nguoi[]): Promise<void> {
		const goc = lucVN(ngay, PHUT_SAU);
		setSystemTime(goc);
		await lenLichNhac(goc);
		const s = slackGia();
		const z = zaloGia();
		for (const n of nguoi) {
			const hang = await db.agentTask.findFirstOrThrow({
				where: { subject: `user:${n.id}:${ngay}` },
			});
			await voiToken(() =>
				chayNhac(hang, {
					fetcher: s.fetcher,
					zaloFetcher: z.fetcher,
					appUrl: APP_URL,
				}),
			);
		}
	}

	async function suKien(n: Nguoi, luc: Date): Promise<void> {
		const noiDung = noiDungThongBao.parse({
			...MUC_MAU_TAC_NHAN["tac-nhan-xong"],
			luotId: `${n.id}-${luc.getTime()}`,
		});
		await db.thongBao.create({
			data: {
				nguoiNhanId: n.id,
				nguon: THONG_BAO.nguon.tacNhan,
				khoa: khoaThongBao(noiDung, luc),
				noiDung,
				duongDan: `/chat/${noiDung.loai === "tac-nhan-xong" ? noiDung.conversationId : ""}`,
				ngayDau: ngayVN(luc),
				thayNgay: ngayVN(luc),
				taoLuc: luc,
			},
		});
		const z = zaloGia();
		await voiToken(() =>
			dayThongBaoSuKien({
				now: new Date(luc.getTime() + 60_000),
				zaloFetcher: z.fetcher,
				fetcher: slackGia().fetcher,
				appUrl: APP_URL,
			}),
		);
	}

	let Z: Nguoi;
	let S: Nguoi;

	async function demKenh(ngay: string) {
		const luot = await db.agentTask.findMany({
			where: {
				kind: "nhac-ke-hoach",
				subject: { in: [Z, S].map((n) => `user:${n.id}:${ngay}`) },
			},
			select: { payload: true },
		});
		const theo = (k: "zalo" | "slack") =>
			luot
				.map((l) => parseNhacPayload(l.payload))
				.filter((p) => p.kenh === k)
				.reduce((n, p) => n + (p.daGuiKhoa?.length ?? 0), 0);
		const daDay = await db.thongBao.findMany({
			where: { dayKenh: { not: null }, dayLoi: null, dayLuc: { not: null } },
			select: { dayLuc: true },
		});
		return {
			quaZalo: theo("zalo"),
			quaSlack: theo("slack"),
			suKien: daDay.filter((h) => h.dayLuc && ngayVN(h.dayLuc) === ngay).length,
		};
	}

	beforeAll(async () => {
		const goc = lucVN(NGAY_KENH[0], PHUT_SAU);
		Z = await nguoiCoBuocTre("Zung", goc);
		S = await nguoiCoBuocTre("Son", goc);
		await db.appSetting.upsert({
			where: { id: SETTINGS_ID },
			create: { id: SETTINGS_ID, zaloBotName: "Bot" },
			update: { zaloBotName: "Bot" },
		});
		await db.zaloLink.create({
			data: { crmUserId: Z.id, zaloUserId: "ZZ", zaloDisplayName: "ZZ" },
		});
		await noiSlack(S.id);
		await khopSlack(S.id, `U-${S.id}`);
		setSystemTime(new Date(goc.getTime() - 60 * 60_000));
		await luuCaiDatThongBao(db, Z.id, "tac-nhan-xong", true, macDinhDayRa);
		await luotKenh(NGAY_KENH[0], [Z, S]);
		await suKien(Z, lucVN(NGAY_KENH[0], PHUT_SAU + 5));
		await luotKenh(NGAY_KENH[1], [Z, S]);
		await suKien(Z, lucVN(NGAY_KENH[1], PHUT_SAU + 5));
		setSystemTime();
	}, 120_000);

	afterAll(async () => {
		await db.zaloLink.deleteMany({ where: { crmUserId: Z.id } });
		await db.caiDatThongBao.deleteMany({ where: { userId: Z.id } });
		await db.appSetting.updateMany({
			where: { id: SETTINGS_ID },
			data: { zaloBotName: null },
		});
	});

	test("tbk-doi-chieu: moi so kenh ngoai khop dem doc lap, khong lech", async () => {
		const kq = await doiChieu(db, { tu: NGAY_KENH[0], den: NGAY_KENH[1] });
		expect(kq.ngay.map((d) => d.ngay)).toEqual([...NGAY_KENH]);
		for (const d of kq.ngay) {
			const doc = await demKenh(d.ngay);
			console.log(
				`tbk-doi-chieu ${d.ngay}: zalo ${d.quaZalo} slack ${d.quaSlack} su kien ${d.suKienDaDay}`,
			);
			expect(doc.quaZalo).toBeGreaterThan(0);
			expect(doc.quaSlack).toBeGreaterThan(0);
			expect(d.quaZalo).toBe(doc.quaZalo);
			expect(d.quaSlack).toBe(doc.quaSlack);
			expect(d.suKienDaDay, "thieu so su kien da day").toBe(doc.suKien);
			expect(d.suKienDaDay).toBe(1);
			expect(d.kenhCoThongBao).toBe(doc.quaZalo + doc.quaSlack);
			expect(d.kenhLech).toEqual([]);
		}
		const khac = await db.caiDatThongBao.groupBy({ by: ["userId"] });
		expect(kq.nguoiKhacMacDinh).toBe(khac.length);
		expect(kq.nguoiKhacMacDinh).toBeGreaterThan(0);
	});

	test("tbk-doi-chieu: xoa mot thong bao da gui qua Zalo thi lenh goi ten khoa, ma 1", async () => {
		const hang = await db.agentTask.findFirstOrThrow({
			where: { subject: `user:${Z.id}:${NGAY_KENH[1]}` },
			select: { payload: true },
		});
		const khoa = parseNhacPayload(hang.payload).daGuiKhoa?.[0];
		if (!khoa) throw new Error("Z khong co muc da gui");
		await db.thongBao.deleteMany({ where: { nguoiNhanId: Z.id, khoa } });
		const kq = await doiChieu(db, { tu: NGAY_KENH[0], den: NGAY_KENH[1] });
		const lech = kq.ngay.flatMap((d) => d.kenhLech);
		expect(
			lech.some((m) => m.userId === Z.id && m.khoa === khoa),
			"doi chieu khong goi ten muc da gui ma mat",
		).toBe(true);
		const r = lenh("--tu", NGAY_KENH[0], "--den", NGAY_KENH[1]);
		expect(r.status).toBe(1);
		expect(r.stdout).toContain(khoa);
	});
});
