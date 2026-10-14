import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	setSystemTime,
	spyOn,
	test,
} from "bun:test";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { db } from "@crm/db";
import { DAY_MS, THU_TU_NHAC, viecCanNhac } from "@crm/db/onboarding-nhac";
import { SETTINGS_ID } from "@crm/db/settings";
import { parseNhacPayload } from "@crm/validation/nhac-ke-hoach";
import {
	khoaThongBao,
	parseNoiDungThongBao,
	THONG_BAO,
} from "@crm/validation/thong-bao";
import {
	chayNhac,
	duongMo,
	duongTrongApp,
	lenLichNhac,
} from "../agent/lib/nhac-ke-hoach";
import { donThongBaoDinhKy } from "../agent/lib/thong-bao-don";
import { ghiThongBao } from "../agent/lib/thong-bao-ghi";
import { dungTin } from "../agent/lib/tin-nhac";
import { ZALO } from "../agent/lib/zalo-config";
import { type BanChup, CHUP, chupTin } from "./support/chup-tin-nhac";
import { MUC_MAU } from "./support/muc-mau";
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
	hangCua,
	lucVN,
	NGAY_NHAC,
	ngayCach,
	PHUT_SAU,
} from "./support/nhac-gui-gieo";
import { zaloGia } from "./support/zalo-gia";

const TOKEN = "1:abc";
const APP_URL = "https://crm.test";
const GOC_KHO = resolve(import.meta.dir, "../../..");
const TEP_CHUP = join(import.meta.dir, "fixtures/tin-nhac-truoc-tb1.json");
const MOC_TRUOC_VONG = "762acca38";

const DIA_CHI_XUONG = /https:\/\/crm\.test\/[^/?\s>|]+/g;

function boTenXuong(ban: BanChup): BanChup {
	const thay = (chu: string) =>
		chu.replace(DIA_CHI_XUONG, "https://crm.test/{xuong}");
	return Object.fromEntries(
		Object.entries(ban).map(([loai, b]) => [
			loai,
			{
				zalo: thay(b.zalo),
				slack: thay(b.slack),
				duong: b.duong === null ? null : thay(b.duong),
			},
		]),
	);
}

function voiToken<T>(chay: () => Promise<T>): Promise<T> {
	const cu = process.env.ZALO_BOT_TOKEN;
	process.env.ZALO_BOT_TOKEN = TOKEN;
	return chay().finally(() => {
		if (cu === undefined) delete process.env.ZALO_BOT_TOKEN;
		else process.env.ZALO_BOT_TOKEN = cu;
	});
}

async function batBot(): Promise<void> {
	await db.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID, zaloBotName: "Bot OneHub" },
		update: { zaloBotName: "Bot OneHub" },
	});
}

async function donThem(): Promise<void> {
	await db.thongBao.deleteMany({
		where: { nguoiNhanId: { startsWith: TIEN_TO } },
	});
	await db.zaloLink.deleteMany({
		where: { crmUserId: { startsWith: TIEN_TO } },
	});
	await db.account.deleteMany({ where: { providerId: "slack" } });
	await db.appSetting.updateMany({
		where: { id: SETTINGS_ID },
		data: { zaloBotName: null },
	});
}

async function nguoiCoBuocTre(ten: string, goc: Date) {
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

async function khoaKyVong(userId: string, now: Date): Promise<string[]> {
	const ds =
		(await viecCanNhac(db, { now, userId, cuaSo: "buoi-sang" })).get(userId) ??
		[];
	return ds.map((v) => khoaThongBao(v, now)).sort();
}

async function khoaDaGhi(userId: string): Promise<string[]> {
	const hang = await db.thongBao.findMany({
		where: { nguoiNhanId: userId },
		select: { khoa: true },
	});
	return hang.map((h) => h.khoa).sort();
}

beforeEach(async () => {
	await donDep();
	await donThem();
	await moXuong();
});

afterEach(() => {
	setSystemTime();
});

afterAll(async () => {
	await donThem();
	await donDep();
});

describe("htb-ghi", () => {
	test("htb-ghi: ba nguoi Zalo, Slack, khong kenh — moi muc thanh mot thong bao, luot ghi muc da tinh", async () => {
		const goc = lucVN(NGAY_NHAC, PHUT_SAU);
		const Z = await nguoiCoBuocTre("Zung", goc);
		const S = await nguoiCoBuocTre("Son", goc);
		const K = await nguoiCoBuocTre("Kha", goc);
		await batBot();
		await db.zaloLink.create({
			data: { crmUserId: Z.id, zaloUserId: "ZZ", zaloDisplayName: "Zalo ZZ" },
		});
		await noiSlack(S.id);
		await khopSlack(S.id, "U-HTB-S");
		setSystemTime(goc);
		await lenLichNhac(goc);
		const z = zaloGia();
		const s = slackGia();
		const ketQua: Record<string, string> = {};
		for (const [nhan, nguoi] of [
			["Z", Z],
			["S", S],
			["K", K],
		] as const) {
			ketQua[nhan] = await voiToken(async () =>
				chayNhac(await hangCua(nguoi.id), {
					fetcher: s.fetcher,
					zaloFetcher: z.fetcher,
					appUrl: APP_URL,
				}),
			);
		}
		for (const [nhan, nguoi] of [
			["Z", Z],
			["S", S],
			["K", K],
		] as const) {
			const kyVong = await khoaKyVong(nguoi.id, goc);
			expect(kyVong.length, `${nhan} khong co muc nao de do`).toBeGreaterThan(
				0,
			);
			expect(
				await khoaDaGhi(nguoi.id),
				nhan === "K" ? "nguoi khong kenh khong co thong bao" : `${nhan}-1`,
			).toEqual(kyVong);
			const hang = await db.thongBao.findMany({
				where: { nguoiNhanId: nguoi.id },
			});
			for (const h of hang) {
				expect(h.nguoiNhanId).toBe(nguoi.id);
				expect(parseNoiDungThongBao(h.noiDung).loai).toBeTruthy();
				expect(h.duongDan.length).toBeGreaterThan(0);
			}
			const payload = parseNhacPayload((await hangCua(nguoi.id)).payload);
			expect(
				[...(payload.mucTinh?.khoa ?? [])].sort(),
				"luot nhac khong ghi ma muc da tinh",
			).toEqual(kyVong);
		}
		expect(ketQua.Z).toBe("da-gui");
		expect(ketQua.S).toBe("da-gui");
		expect(["khong-khop", "khong-slack"]).toContain(ketQua.K ?? "");
	});

	test("htb-ghi: ghi thong bao hong — danh sach muc da tinh van con", async () => {
		const goc = lucVN(NGAY_NHAC, PHUT_SAU);
		const K = await nguoiCoBuocTre("Kha", goc);
		setSystemTime(goc);
		await lenLichNhac(goc);
		const tat = spyOn(console, "error").mockImplementation(() => {});
		await chayNhac(await hangCua(K.id), {
			appUrl: APP_URL,
			ghiThongBao: async () => {
				throw new Error("ghi gia hong");
			},
		});
		tat.mockRestore();
		const payload = parseNhacPayload((await hangCua(K.id)).payload);
		expect(
			[...(payload.mucTinh?.khoa ?? [])].sort(),
			"danh sach muc da tinh mat khi ghi thong bao hong",
		).toEqual(await khoaKyVong(K.id, goc));
		expect(payload.thongBaoLoi).toContain("ghi gia hong");
	});
});

describe("htb-gop", () => {
	const SANG = ["2026-10-12", "2026-10-13", "2026-10-14", "2026-10-15"].map(
		(ngay) => lucVN(ngay, PHUT_SAU),
	);
	const M = MUC_MAU["viec-qua-han"];

	async function sang(userId: string, i: number, viec = [M]) {
		const now = SANG[i] as Date;
		await ghiThongBao(db, userId, viec, duongTrongApp, now);
	}

	async function soThongBao(userId: string): Promise<number> {
		return db.thongBao.count({ where: { nguoiNhanId: userId } });
	}

	test("htb-gop: a-d — lien tuc thi khong moi, vang roi quay lai thi moi", async () => {
		const A = await gieoNguoi("Gop");
		await sang(A.id, 0);
		expect(await soThongBao(A.id), "a").toBe(1);
		await sang(A.id, 1);
		expect(await soThongBao(A.id), "muc lap sinh thong bao moi moi sang").toBe(
			1,
		);
		const dong = await db.thongBao.findFirstOrThrow({
			where: { nguoiNhanId: A.id },
		});
		expect(dong.thayNgay).toBe("2026-10-13");
		await sang(A.id, 3);
		expect(await soThongBao(A.id), "d").toBe(2);
		const moi = await db.thongBao.findFirstOrThrow({
			where: { nguoiNhanId: A.id },
			orderBy: { taoLuc: "desc" },
		});
		expect(moi.ngayDau).toBe("2026-10-15");
	});

	test("htb-gop: c — da doc van khong bao lai khi con lien tuc", async () => {
		const A = await gieoNguoi("Doc");
		await sang(A.id, 0);
		await db.thongBao.updateMany({
			where: { nguoiNhanId: A.id },
			data: { docLuc: SANG[0] as Date },
		});
		await sang(A.id, 1);
		expect(await soThongBao(A.id), "muc da doc bi bao lai").toBe(1);
	});

	test("htb-gop: e — chay lai trong ngay va hai loi goi dong thoi khong nhan doi", async () => {
		const A = await gieoNguoi("Lai");
		await sang(A.id, 0);
		await sang(A.id, 0);
		expect(await soThongBao(A.id)).toBe(1);
		const B = await gieoNguoi("DongThoi");
		await Promise.allSettled([sang(B.id, 0), sang(B.id, 0)]);
		expect(await soThongBao(B.id), "chay lai nhan doi thong bao").toBe(1);
	});

	test("htb-gop: f — moi loai hai sang lien tiep van mot thong bao", async () => {
		expect(Object.keys(MUC_MAU).length).toBe(THU_TU_NHAC.length);
		console.log(`htb-gop f: so loai ${THU_TU_NHAC.length}`);
		for (const loai of THU_TU_NHAC) {
			const A = await gieoNguoi(`Loai ${loai}`);
			await sang(A.id, 0, [MUC_MAU[loai]]);
			await sang(A.id, 1, [MUC_MAU[loai]]);
			expect(await soThongBao(A.id), `loai ${loai}`).toBe(1);
		}
	});

	test("htb-gop: g — muc gop doi so thi giu mot thong bao, noi dung moi", async () => {
		const A = await gieoNguoi("TaiLieu");
		await sang(A.id, 0, [{ loai: "tai-lieu-cho-duyet", so: 3 }]);
		await sang(A.id, 1, [{ loai: "tai-lieu-cho-duyet", so: 5 }]);
		expect(
			await soThongBao(A.id),
			"muc gop sinh thong bao moi khi so doi",
		).toBe(1);
		const dong = await db.thongBao.findFirstOrThrow({
			where: { nguoiNhanId: A.id },
		});
		expect(
			parseNoiDungThongBao(dong.noiDung),
			"thong bao gop giu so cu",
		).toEqual({ loai: "tai-lieu-cho-duyet", so: 5 });
		const B = await gieoNguoi("CapNhat");
		const capNhat = MUC_MAU["okr-cap-nhat"];
		await sang(B.id, 0, [{ ...capNhat, krIds: ["k1"], soKr: 1 }]);
		await sang(B.id, 1, [{ ...capNhat, krIds: ["k1", "k2"], soKr: 2 }]);
		expect(await soThongBao(B.id)).toBe(1);
		const dongB = await db.thongBao.findFirstOrThrow({
			where: { nguoiNhanId: B.id },
		});
		expect(parseNoiDungThongBao(dongB.noiDung)).toMatchObject({
			krIds: ["k1", "k2"],
		});
	});
});

describe("htb-kenh", () => {
	test("htb-kenh: 1 — bo kiem nhac cu khong bot assert nao", () => {
		for (const tep of [
			"apps/agent/test/nhac-qua-zalo.integration.spec.ts",
			"apps/agent/test/nhac-viec.integration.spec.ts",
		]) {
			const dem = (chu: string) => (chu.match(/expect\(/g) ?? []).length;
			const truoc = dem(
				execFileSync(
					"git",
					["-C", GOC_KHO, "show", `${MOC_TRUOC_VONG}:${tep}`],
					{
						encoding: "utf8",
					},
				),
			);
			const nay = dem(readFileSync(join(GOC_KHO, tep), "utf8"));
			console.log(`htb-kenh 1: ${tep} truoc ${truoc} nay ${nay}`);
			expect(nay, `bo kiem cu bi bot assert: ${tep}`).toBeGreaterThanOrEqual(
				truoc,
			);
		}
	});

	test("htb-kenh: 2 — tin Zalo va Slack moi loai trung tung byte ban chup truoc vong", async () => {
		const banChup = boTenXuong(
			JSON.parse(readFileSync(TEP_CHUP, "utf8")) as BanChup,
		);
		const hienTai = boTenXuong(
			await chupTin(dungTin, await duongMo(CHUP.appUrl), {
				tranKyTu: ZALO.tranKyTu,
				goiY: ZALO.loi.goiY,
			}),
		);
		console.log(`htb-kenh 2: so loai ${Object.keys(hienTai).length}`);
		expect(Object.keys(hienTai).length).toBe(THU_TU_NHAC.length);
		for (const loai of THU_TU_NHAC) {
			expect(hienTai[loai], `tin Zalo doi so voi truoc vong: ${loai}`).toEqual(
				banChup[loai],
			);
		}
	});

	test("htb-kenh: 2 — ban chup duoc commit truoc moi commit sua tep nhac", () => {
		const git = (...thamSo: string[]) =>
			execFileSync("git", ["-C", GOC_KHO, ...thamSo], {
				encoding: "utf8",
			}).trim();
		const themChup = git(
			"log",
			"--diff-filter=A",
			"--format=%H",
			"--",
			"apps/agent/test/fixtures/tin-nhac-truoc-tb1.json",
		)
			.split("\n")
			.filter(Boolean)
			.at(-1);
		expect(themChup, "tep chup chua commit").toBeTruthy();
		const suaNhac = git(
			"log",
			"--format=%H",
			`${MOC_TRUOC_VONG}..HEAD`,
			"--",
			"apps/agent/agent/lib/nhac-ke-hoach.ts",
		)
			.split("\n")
			.filter(Boolean);
		for (const c of suaNhac) {
			expect(
				() => git("merge-base", "--is-ancestor", themChup as string, c),
				`tep chup khong dung truoc commit sua tep nhac ${c}`,
			).not.toThrow();
		}
	});

	test("htb-kenh: 3 — ghi thong bao hong thi tin van gui", async () => {
		const goc = lucVN(NGAY_NHAC, PHUT_SAU);
		const S = await nguoiCoBuocTre("Son", goc);
		await noiSlack(S.id);
		await khopSlack(S.id, "U-HTB-S");
		setSystemTime(goc);
		await lenLichNhac(goc);
		const s = slackGia();
		const tat = spyOn(console, "error").mockImplementation(() => {});
		const ket = await chayNhac(await hangCua(S.id), {
			fetcher: s.fetcher,
			appUrl: APP_URL,
			ghiThongBao: async () => {
				throw new Error("ghi gia hong");
			},
		});
		const goiLoi = tat.mock.calls.length;
		tat.mockRestore();
		expect(ket, "ghi thong bao hong chan tin Zalo").toBe("da-gui");
		expect(s.goi.filter((g) => g.url.endsWith("chat.postMessage")).length).toBe(
			1,
		);
		const payload = parseNhacPayload((await hangCua(S.id)).payload);
		expect(payload.thongBaoLoi).toContain("ghi gia hong");
		expect(goiLoi).toBeGreaterThan(0);
	});

	test("htb-kenh: 4 — gui Zalo hong thi thong bao con, thu lai khong nhan doi", async () => {
		const goc = lucVN(NGAY_NHAC, PHUT_SAU);
		const Z = await nguoiCoBuocTre("Zung", goc);
		await batBot();
		await db.zaloLink.create({
			data: { crmUserId: Z.id, zaloUserId: "ZZ", zaloDisplayName: "Zalo ZZ" },
		});
		setSystemTime(goc);
		await lenLichNhac(goc);
		const hong = zaloGia({ send: 500 });
		const loi = await voiToken(async () =>
			chayNhac(await hangCua(Z.id), {
				zaloFetcher: hong.fetcher,
				appUrl: APP_URL,
			}).then(
				() => "khong nem",
				(e: Error) => e.message,
			),
		);
		expect(loi).not.toBe("khong nem");
		const sau1 = await khoaDaGhi(Z.id);
		expect(sau1.length).toBeGreaterThan(0);
		const lanHai = zaloGia();
		await voiToken(async () =>
			chayNhac(await hangCua(Z.id), {
				zaloFetcher: lanHai.fetcher,
				appUrl: APP_URL,
			}),
		);
		expect(await khoaDaGhi(Z.id)).toEqual(sau1);
	});
});

describe("htb-don", () => {
	test("htb-don: nhip moi phut don dung thong bao qua han giu", async () => {
		const now = new Date("2026-10-14T03:00:00Z");
		const A = await gieoNguoi("Don");
		const GIO_MS = DAY_MS / 24;
		const tuoi = [
			(THONG_BAO.giuNgay + 1) * DAY_MS,
			THONG_BAO.giuNgay * DAY_MS - GIO_MS,
			(THONG_BAO.giuNgay - 1) * DAY_MS,
		];
		const id: string[] = [];
		for (const [i, t] of tuoi.entries()) {
			const h = await db.thongBao.create({
				data: {
					nguoiNhanId: A.id,
					nguon: THONG_BAO.nguon.nhacBuoiSang,
					khoa: `viec-qua-han:don-${i}`,
					noiDung: { ...MUC_MAU["viec-qua-han"], viecId: `don-${i}` },
					duongDan: "/viec",
					taoLuc: new Date(now.getTime() - t),
					ngayDau: `2026-01-0${i + 1}`,
					thayNgay: `2026-01-0${i + 1}`,
				},
			});
			id.push(h.id);
		}
		const chuaDocTruoc = await db.thongBao.count({
			where: { nguoiNhanId: A.id, docLuc: null },
		});
		const da = await donThongBaoDinhKy(now);
		const con = (
			await db.thongBao.findMany({
				where: { nguoiNhanId: A.id },
				select: { id: true },
			})
		)
			.map((h) => h.id)
			.sort();
		expect(con, "don ca thong bao chua qua han giu").toEqual(
			id.slice(1).sort(),
		);
		expect(da).toBeGreaterThanOrEqual(1);
		expect(
			await db.thongBao.count({ where: { nguoiNhanId: A.id, docLuc: null } }),
		).toBe(chuaDocTruoc - 1);
	});

	test("htb-don: nhip moi phut goi buoc don", () => {
		const nguon = readFileSync(
			join(GOC_KHO, "apps/agent/agent/schedules/dispatch.ts"),
			"utf8",
		);
		const ma = new Bun.Transpiler({ loader: "ts" }).transformSync(nguon);
		const dau = ma.indexOf("Promise.all([");
		const cuoi = ma.indexOf("(async", dau);
		const khoi = dau >= 0 && cuoi > dau ? ma.slice(dau, cuoi) : "";
		expect(
			/donThongBaoDinhKy\(\)/.test(khoi),
			"luot don khong don thong bao",
		).toBe(true);
	});
});
