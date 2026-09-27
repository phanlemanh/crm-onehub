import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { type ViecNhac, viecCanNhac } from "@crm/db/onboarding-nhac";
import { type MucNhac, parseNhacPayload } from "@crm/validation/nhac-ke-hoach";
import { chayNhac, lenLichNhac } from "../agent/lib/nhac-ke-hoach";
import { TIEU_DE } from "../agent/lib/tin-nhac";
import { gieoKeHoach, gieoNguoi, moXuong, slackGia } from "./support/nhac-gieo";
import {
	batBot,
	binhLuan,
	donOkr,
	gieoChuKy,
	gieoKr,
	gieoMucTieu,
	guiCapNhat,
	noiZalo,
	tatBot,
	theoDoi,
	vet,
	voiToken,
} from "./support/okr-gieo";
import { zaloGia } from "./support/zalo-gia";

const CHO_CA_MS = 60_000;

const APP_URL = "https://crm.test";

const NGAY = {
	truoc: "2026-10-12",
	D: "2026-10-13",
	sau: "2026-10-14",
	sau2: "2026-10-15",
};

const NGAY_MS = 24 * 60 * 60 * 1000;

function vn(ngay: string, gio: string): Date {
	return new Date(`${ngay}T${gio}+07:00`);
}

const SU_KIEN = ["okr-nhac-ten", "okr-duoc-giao", "okr-theo-doi"] as const;

type SuKien = (typeof SU_KIEN)[number];

async function hangNgay(userId: string, ngay: string) {
	return db.agentTask.findMany({
		where: { kind: "nhac-ke-hoach", subject: `user:${userId}:${ngay}` },
	});
}

async function nhacSang(userId: string, now: Date): Promise<ViecNhac[]> {
	return (
		(await viecCanNhac(db, { now, userId, cuaSo: "buoi-sang" })).get(userId) ??
		[]
	);
}

async function nhacTrucTiep(userId: string, now: Date): Promise<ViecNhac[]> {
	return (
		(await viecCanNhac(db, { now, userId, cuaSo: "truc-tiep" })).get(userId) ??
		[]
	);
}

async function gui(userId: string, ngay: string, luc: Date) {
	const hang = await hangNgay(userId, ngay);
	const z = zaloGia();
	const s = slackGia();
	for (const h of hang) {
		setSystemTime(luc);
		await voiToken(() =>
			chayNhac(h, {
				fetcher: s.fetcher,
				zaloFetcher: z.fetcher,
				appUrl: APP_URL,
			}),
		);
	}
	const sau = await hangNgay(userId, ngay);
	return {
		tin: z.goi.map((g) => g.body.text),
		daGui: sau.flatMap((h) => parseNhacPayload(h.payload).daGui ?? []),
		muc: sau.flatMap((h) => parseNhacPayload(h.payload).muc),
	};
}

async function nhip(luc: Date) {
	setSystemTime(luc);
	await lenLichNhac(luc);
}

type Gieo = {
	X: string;
	Y: string;
	O: string;
	K2: string;
	binhLuanId: string;
	ma: Record<SuKien, MucNhac>;
};

async function gieoSuKien(luc: Date): Promise<Gieo> {
	const chay = await gieoChuKy("dang-chay", 1);
	const X = await gieoNguoi("Xuan");
	const Y = await gieoNguoi("Yen");
	await noiZalo(X.id, "ZX");
	await batBot();
	const O = await gieoMucTieu({
		cycleId: chay,
		chu: Y.id,
		congBo: new Date(luc.getTime() - 20 * NGAY_MS),
	});
	const K1 = await gieoKr({
		objectiveId: O,
		chu: Y.id,
		khoa: new Date(luc.getTime() - 20 * NGAY_MS),
		viTri: 0,
	});
	await theoDoi(O, X.id, new Date(luc.getTime() - 3 * NGAY_MS));
	const K2 = await gieoKr({ objectiveId: O, chu: X.id, khoa: luc, viTri: 1 });
	await vet({
		action: "sua-kr",
		nguoiLam: Y.id,
		objectiveId: O,
		keyResultId: K2,
		truoc: { ownerUserId: Y.id },
		sau: { ownerUserId: X.id },
		luc,
	});
	const binhLuanId = await binhLuan({
		objectiveId: O,
		tacGia: Y.id,
		nhacTen: [X.id],
		luc,
	});
	await guiCapNhat(K1, Y.id, luc);
	return {
		X: X.id,
		Y: Y.id,
		O,
		K2,
		binhLuanId,
		ma: {
			"okr-nhac-ten": { loai: "okr-nhac-ten", commentId: binhLuanId },
			"okr-duoc-giao": {
				loai: "okr-duoc-giao",
				objectiveId: O,
				keyResultId: K2,
			},
			"okr-theo-doi": { loai: "okr-theo-doi", objectiveId: O },
		},
	};
}

function dongDuoi(text: string, tieuDe: string): string[] {
	const dong = text.split("\n");
	const dau = dong.indexOf(tieuDe);
	if (dau < 0) return [];
	const sau = dong.slice(dau + 1);
	const het = sau.indexOf("");
	return het < 0 ? sau : sau.slice(0, het);
}

beforeEach(async () => {
	await donOkr();
	await moXuong();
});

afterEach(() => {
	setSystemTime();
});

afterAll(async () => {
	await donOkr();
	await tatBot();
});

describe("giua-ngay", () => {
	test(
		"giua-ngay: ma tran 3 su kien x 3 nhip trong ngay D — khong hang, khong muc; doi chung truc-tiep thay ca ba",
		async () => {
			const g = await gieoSuKien(vn(NGAY.D, "14:00:00"));
			const bang: Record<string, string> = {};
			const mong: Record<string, string> = {};
			for (const gio of ["14:01:00", "17:00:00", "23:59:00"]) {
				const luc = vn(NGAY.D, gio);
				await nhip(luc);
				const soHang = (await hangNgay(g.X, NGAY.D)).length;
				const viec = await nhacSang(g.X, luc);
				for (const loai of SU_KIEN) {
					const co = viec.some((v) => v.loai === loai);
					bang[`${loai} luc ${gio}`] = JSON.stringify({ soHang, co });
					mong[`${loai} luc ${gio}`] = JSON.stringify({ soHang: 0, co: false });
				}
			}
			const lech = Object.keys(mong).filter(
				(k) => JSON.stringify(bang[k]) !== JSON.stringify(mong[k]),
			);
			if (lech.length > 0) throw new Error(`tin-giua-ngay: ${lech.join(", ")}`);
			const truc = await nhacTrucTiep(g.X, vn(NGAY.D, "14:01:00"));
			expect(SU_KIEN.map((l) => truc.some((v) => v.loai === l))).toEqual([
				true,
				true,
				true,
			]);
		},
		CHO_CA_MS,
	);
});

describe("sang-sau", () => {
	test(
		"sang-sau: nhip 14:01 D, 08:31 D+1, 08:31 D+2 — muc su kien dung mot tin sang D+1, dung ma, duoi dung tieu de; D+2 vang",
		async () => {
			const g = await gieoSuKien(vn(NGAY.D, "14:00:00"));
			await nhip(vn(NGAY.D, "14:01:00"));
			const d = await gui(g.X, NGAY.D, vn(NGAY.D, "14:02:00"));
			await nhip(vn(NGAY.sau, "08:31:00"));
			const hangSau = await hangNgay(g.X, NGAY.sau);
			const d1 = await gui(g.X, NGAY.sau, vn(NGAY.sau, "08:32:00"));
			await nhip(vn(NGAY.sau2, "08:31:00"));
			const d2 = await gui(g.X, NGAY.sau2, vn(NGAY.sau2, "08:32:00"));
			const tinSau = d1.tin[0] ?? "";
			const bang: Record<string, string> = {};
			const mong: Record<string, string> = {};
			for (const loai of SU_KIEN) {
				const cungMa = (m: MucNhac) =>
					JSON.stringify(m) === JSON.stringify(g.ma[loai]);
				bang[`${loai}`] = JSON.stringify({
					hangSau: hangSau.length,
					mucSau: d1.muc.filter(cungMa).length,
					dongDuoiTieuDe: dongDuoi(tinSau, TIEU_DE[loai]).length,
					tinCoMuc: [...d.daGui, ...d1.daGui, ...d2.daGui].filter(cungMa)
						.length,
					vangSau2: d2.muc.filter(cungMa).length === 0,
				});
				mong[`${loai}`] = JSON.stringify({
					hangSau: 1,
					mucSau: 1,
					dongDuoiTieuDe: 1,
					tinCoMuc: 1,
					vangSau2: true,
				});
			}
			const lech = Object.keys(mong).filter(
				(k) => JSON.stringify(bang[k]) !== JSON.stringify(mong[k]),
			);
			if (lech.length > 0) {
				throw new Error(
					`gui-lai-sang-sau: ${lech.join(", ")} ${JSON.stringify(bang)}`,
				);
			}
			expect(bang).toEqual(mong);
		},
		CHO_CA_MS,
	);
});

describe("da-co-tin", () => {
	test(
		"da-co-tin: X da nhan tin sang D; nhac ten 14:00 D khong sinh tin thu hai; co mot lan o tin D+1; vang D+2",
		async () => {
			const chay = await gieoChuKy("dang-chay", 1);
			const X = await gieoNguoi("Xuan");
			const Y = await gieoNguoi("Yen");
			await noiZalo(X.id, "ZX");
			await batBot();
			const D = vn(NGAY.D, "08:31:00");
			const O = await gieoMucTieu({
				cycleId: chay,
				chu: X.id,
				congBo: new Date(D.getTime() - 15 * NGAY_MS),
			});
			await gieoKr({
				objectiveId: O,
				chu: X.id,
				khoa: new Date(D.getTime() - 15 * NGAY_MS),
			});
			await nhip(D);
			const sangD = await gui(X.id, NGAY.D, vn(NGAY.D, "08:32:00"));
			const c = await binhLuan({
				objectiveId: O,
				tacGia: Y.id,
				nhacTen: [X.id],
				luc: vn(NGAY.D, "14:00:00"),
			});
			for (const gio of ["14:01:00", "17:00:00"]) await nhip(vn(NGAY.D, gio));
			const hangD = await hangNgay(X.id, NGAY.D);
			await nhip(vn(NGAY.sau, "08:31:00"));
			const d1 = await gui(X.id, NGAY.sau, vn(NGAY.sau, "08:32:00"));
			await nhip(vn(NGAY.sau2, "08:31:00"));
			const d2 = await gui(X.id, NGAY.sau2, vn(NGAY.sau2, "08:32:00"));
			const laMuc = (m: MucNhac) =>
				m.loai === "okr-nhac-ten" && "commentId" in m && m.commentId === c;
			const ket = {
				tinSangD: sangD.tin.length,
				hangD: hangD.length,
				dongNhacTenD1: (d1.tin[0] ?? "")
					.split("\n")
					.filter((d) => d.includes("Yen nhắc tên bạn")).length,
				coD2: d2.muc.some(laMuc),
			};
			if (ket.coD2) {
				throw new Error(`mot-lan: nhac-ten co mat o ${NGAY.sau2}`);
			}
			expect(ket).toEqual({
				tinSangD: 1,
				hangD: 1,
				dongNhacTenD1: 1,
				coD2: false,
			});
		},
		CHO_CA_MS,
	);
});

describe("moc-bien", () => {
	test(
		"moc-bien: ma tran 4 gio su kien x 3 tin sang — moi su kien dung mot tin",
		async () => {
			const chay = await gieoChuKy("dang-chay", 1);
			const X = await gieoNguoi("Xuan");
			const Y = await gieoNguoi("Yen");
			const O = await gieoMucTieu({
				cycleId: chay,
				chu: Y.id,
				congBo: vn(NGAY.truoc, "00:00:00"),
			});
			const suKien: [string, Date][] = [
				["08:29 D-1", vn(NGAY.truoc, "08:29:00")],
				["07:00 D", vn(NGAY.D, "07:00:00")],
				["08:30:00.000 D", vn(NGAY.D, "08:30:00.000")],
				["08:30:00.001 D", vn(NGAY.D, "08:30:00.001")],
			];
			const ma: Record<string, string> = {};
			for (const [ten, luc] of suKien) {
				ma[ten] = await binhLuan({
					objectiveId: O,
					tacGia: Y.id,
					nhacTen: [X.id],
					luc,
				});
			}
			const tin: [string, Date][] = [
				["D-1", vn(NGAY.truoc, "08:31:00")],
				["D", vn(NGAY.D, "08:31:00")],
				["D+1", vn(NGAY.sau, "08:31:00")],
			];
			const bang: Record<string, boolean[]> = {};
			for (const [ten] of suKien) bang[ten] = [];
			for (const [, now] of tin) {
				const viec = await nhacSang(X.id, now);
				for (const [ten] of suKien) {
					bang[ten]?.push(
						viec.some(
							(v) => v.loai === "okr-nhac-ten" && v.commentId === ma[ten],
						),
					);
				}
			}
			const mong = {
				"08:29 D-1": [true, false, false],
				"07:00 D": [false, true, false],
				"08:30:00.000 D": [false, true, false],
				"08:30:00.001 D": [false, false, true],
			};
			for (const [ten, dong] of Object.entries(mong)) {
				if (JSON.stringify(bang[ten]) !== JSON.stringify(dong)) {
					const o = (bang[ten] ?? []).flatMap((c, i) =>
						c ? [tin[i]?.[0] ?? ""] : [],
					);
					throw new Error(
						`moc-bien: ${ten} o tin ${o.join(",") || "khong tin nao"}`,
					);
				}
			}
			expect(bang).toEqual(mong);
		},
		CHO_CA_MS,
	);
});

describe("gui-muon", () => {
	test(
		"gui-muon: hang tao 08:31 D gui luc 10:00 D chi mang su kien truoc moc; su kien 09:00 D sang tin D+1",
		async () => {
			const chay = await gieoChuKy("dang-chay", 1);
			const X = await gieoNguoi("Xuan");
			const Y = await gieoNguoi("Yen");
			await noiZalo(X.id, "ZX");
			await batBot();
			const O = await gieoMucTieu({
				cycleId: chay,
				chu: Y.id,
				congBo: vn(NGAY.truoc, "00:00:00"),
			});
			const N1 = await binhLuan({
				objectiveId: O,
				tacGia: Y.id,
				nhacTen: [X.id],
				luc: vn(NGAY.D, "07:00:00"),
			});
			await nhip(vn(NGAY.D, "08:31:00"));
			const N2 = await binhLuan({
				objectiveId: O,
				tacGia: Y.id,
				nhacTen: [X.id],
				luc: vn(NGAY.D, "09:00:00"),
			});
			const d = await gui(X.id, NGAY.D, vn(NGAY.D, "10:00:00"));
			await nhip(vn(NGAY.sau, "08:31:00"));
			const d1 = await gui(X.id, NGAY.sau, vn(NGAY.sau, "08:32:00"));
			const binhLuanCua = (ds: MucNhac[]) =>
				ds.flatMap((m) => ("commentId" in m ? [m.commentId] : []));
			const ket = { D: binhLuanCua(d.daGui), "D+1": binhLuanCua(d1.daGui) };
			if (ket.D.includes(N2)) throw new Error("gui-muon: them su kien sau moc");
			expect(ket).toEqual({ D: [N1], "D+1": [N2] });
		},
		CHO_CA_MS,
	);
});

describe("cau-chao-gui", () => {
	test(
		"cau-chao-gui: ma tran 3 o [gio tao hang, gio gui] qua chayNhac duoi TZ=UTC",
		async () => {
			const chay = await gieoChuKy("dang-chay", 1);
			const W = await gieoNguoi("Wan");
			const V = await gieoNguoi("Van");
			await noiZalo(W.id, "ZW");
			await noiZalo(V.id, "ZV");
			await batBot();
			const truoc20 = new Date(vn(NGAY.D, "08:31:00").getTime() - 20 * NGAY_MS);
			const O = await gieoMucTieu({
				cycleId: chay,
				chu: V.id,
				congBo: truoc20,
			});
			await gieoKr({ objectiveId: O, chu: V.id, khoa: truoc20 });
			const dongDau = (tin: string[]) => tin.map((t) => t.split("\n")[0] ?? "");

			await nhip(vn(NGAY.D, "08:31:00"));
			const b = await gui(V.id, NGAY.D, vn(NGAY.D, "14:02:00"));
			await gieoKeHoach({
				camTrich: W.id,
				batDau: vn(NGAY.D, "13:00:00"),
				buoc: [
					{ nhan: "Gui bao gia", giao: W.id, han: vn(NGAY.sau, "09:00:00") },
				],
			});
			await nhip(vn(NGAY.D, "14:01:00"));
			const a = await gui(W.id, NGAY.D, vn(NGAY.D, "14:02:00"));
			await nhip(vn(NGAY.sau, "08:31:00"));
			const c = await gui(V.id, NGAY.sau, vn(NGAY.sau, "10:00:00"));

			const bang = {
				"a 14:01 -> 14:02": dongDau(a.tin),
				"b 08:31 -> 14:02": dongDau(b.tin),
				"c 08:31 -> 10:00": dongDau(c.tin),
			};
			const mong = {
				"a 14:01 -> 14:02": "hôm nay",
				"b 08:31 -> 14:02": "hôm nay",
				"c 08:31 -> 10:00": "sáng nay",
			};
			for (const [o, buoi] of Object.entries(mong)) {
				const dong = bang[o as keyof typeof bang];
				const khac = buoi === "hôm nay" ? "sáng nay" : "hôm nay";
				if (
					dong.length !== 1 ||
					!dong[0]?.includes(buoi) ||
					dong[0]?.includes(khac)
				) {
					throw new Error(`cau-chao-gui: ${o} — ${JSON.stringify(dong)}`);
				}
			}
			expect(Object.values(bang).map((d) => d.length)).toEqual([1, 1, 1]);
		},
		CHO_CA_MS,
	);
});
