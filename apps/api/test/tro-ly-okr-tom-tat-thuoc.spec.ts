import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import type { GoiTomTat, NguonGoi } from "@crm/db/okr-tom-tat";
import { MINUTE_MS } from "@crm/db/okr-tro-ly-danh-muc";
import { SETTINGS_ID } from "@crm/db/settings";
import { parseNhacPayload } from "@crm/validation/nhac-ke-hoach";
import { parseNoiDungTomTat } from "@crm/validation/okr-tom-tat";
import type { CauTomTat } from "@crm/validation/okr-tro-ly";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { z } from "zod";
import {
	chayNhac,
	chuDeNhac,
	LOAI_VIEC_NHAC,
	lenLichNhac,
} from "../../agent/agent/lib/nhac-ke-hoach";
import { zaloGia } from "../../agent/test/support/zalo-gia";
import { OKR_MAU } from "../scripts/okr-mau/cau-hinh";
import { OkrXemService } from "../src/okr/okr-xem.service";
import {
	batDauMau,
	CHO_DB,
	datDongHo,
	dungUngDung,
	ghiCauHinh,
	gieoChiPhi,
	goi,
	ketThucMau,
	nguoi,
	ok,
} from "./tro-ly-okr-san";
import {
	cauLanh,
	cookieCua,
	donTomTat,
	ghiBan,
	goiQua,
	KY,
	motNguonMoiKr,
	pb,
	phongCoNguon,
	QUAN_TRI,
	SAU,
	TUAN,
	thanhVienCua,
	truongCua,
	vietSo,
} from "./tro-ly-okr-tom-tat-san";

const RANG = join(
	import.meta.dir,
	"../../../_acceptance/tro-ly-okr-tom-tat/rang",
);
const THANG = "2026-11";
const luc = (vn: string) => new Date(`${vn}+07:00`);
const SANG = luc("2026-11-13T08:31:00");
const MO_CUNG_NGAY = luc("2026-11-13T09:00:00");
const MO_HOM_SAU = luc("2026-11-14T09:00:00");
const PHAN_HOI_LUC = luc("2026-11-13T10:00:00");
const TAT_LUC = luc("2026-11-13T11:00:00");
const THANG_TRUOC = luc("2026-10-31T23:00:00");
const NAC = ["bat", "an"] as const;
const DANG = [
	"gia-tri",
	"truoc",
	"chenh-lech",
	"khoi-diem",
	"dich",
	"tien-do",
	"ngay",
] as const;
const SO_LA = "Chỉ số của phòng đạt mức 987654.";
const SO_LA_DOC = "987654";

type Nac = (typeof NAC)[number];
const giaTriThuoc = z.union([
	z.number(),
	z.string(),
	z.null(),
	z.record(z.string(), z.number()),
]);
const hangThuoc = z.record(z.string(), giaTriThuoc);
type Hang = z.infer<typeof hangThuoc>;
type Phong = { ma: string; goi: GoiTomTat; truong: string };

const KY_VONG = {
	"cau-bi-bo": {
		bat: {
			tuan: TUAN,
			so_ban: 3,
			can_xem: 1,
			tong_cau: 14,
			cau_bo: 3,
			ty_le_bo: 0.2143,
			theo_ma: { "nguon-ngoai-goi": 1, "so-lech": 1, "trung-cau": 1 },
		},
		an: {
			tuan: TUAN,
			so_ban: 1,
			can_xem: 0,
			tong_cau: 4,
			cau_bo: 1,
			ty_le_bo: 0.25,
			theo_ma: { "so-lech": 1 },
		},
	},
	"so-lech-lot": {
		bat: { cau: 11, lech: 0 },
		an: { cau: 3, lech: 0 },
	},
	"mo-sau-nhac": {
		bat: { nhan_dong: 2, mo_trong_ngay: 1, ty_le_mo: 0.5 },
		an: { nhan_dong: 0, mo_trong_ngay: 0, ty_le_mo: null },
	},
	"huu-ich": {
		bat: { phan_hoi: 3, huu_ich: 2, khong_huu_ich: 1, ty_le_huu_ich: 0.6667 },
		an: { phan_hoi: 0, huu_ich: 0, khong_huu_ich: 0, ty_le_huu_ich: null },
	},
	"tat-dong": {
		bat: { truong_phong: 3, da_tat: 1, ty_le_tat: 0.3333 },
		an: { truong_phong: 1, da_tat: 1, ty_le_tat: 1 },
	},
	"chi-phi-tom-tat": {
		bat: {
			tien_usd: 0.006,
			tom_tat_usd: 0.004,
			chuyen_tiep_usd: 0.002,
			so_ban: 3,
			usd_moi_ban: 0.002,
		},
		an: {
			tien_usd: 0.004,
			tom_tat_usd: 0.003,
			chuyen_tiep_usd: 0.001,
			so_ban: 1,
			usd_moi_ban: 0.004,
		},
	},
} satisfies Record<string, Record<Nac, Hang>>;

const DOC_SO: [string, (number[] | string)[]][] = [
	["1,5", [[1.5]]],
	["1.500", [[1500, 1.5]]],
	["12%", [[12]]],
	["3 triệu", [[3_000_000]]],
	["2 nghìn và 4 tỷ", [[2000], [4_000_000_000]]],
	["mười hai", [[12]]],
	["1.5", [[1.5]]],
	["1,200", [[1.2, 1200]]],
	["1,200,000", [[1_200_000]]],
	["3k", [[3000]]],
	["12.5%", [[12.5]]],
	["ngày 23/11", ["23/11"]],
	["1.2.3", [[]]],
	["3 triệu 500 nghìn", [[3_500_000]]],
];

let app: NestExpressApplication;
let P: { p1: Phong; p2: Phong; p3: Phong; p4: Phong };
const ban = { p1: "", p2: "", p3: "", p4: "" };
const viec = { p1: "", p3: "" };
let nguonP4 = "";

function lamTron(so: number): number {
	return Math.round(so * 10_000) / 10_000;
}

function nguonDu(goi: GoiTomTat): NguonGoi | null {
	for (const n of goi.nguon) {
		const kr = goi.krs.find((k) => k.id === n.keyResultId);
		if (!kr || n.truoc === null || n.chenhLech === null || n.tienDo === null)
			continue;
		const so = [
			n.giaTri,
			n.truoc,
			Math.abs(n.chenhLech),
			kr.khoiDiem,
			kr.dich,
			n.tienDo,
		].map(lamTron);
		if (new Set(so).size === so.length && n.chenhLech !== 0) return n;
	}
	return null;
}

function cauMoiDang(goi: GoiTomTat, n: NguonGoi): CauTomTat[] {
	const kr = goi.krs.find((k) => k.id === n.keyResultId);
	if (!kr || n.truoc === null || n.chenhLech === null || n.tienDo === null)
		throw new Error(`nguon ${n.id} thieu so`);
	const van = {
		"gia-tri": `Lần cập nhật ghi mức ${vietSo(n.giaTri)}.`,
		truoc: `Lần trước ghi mức ${vietSo(n.truoc)}.`,
		"chenh-lech": `Chênh lệch so với lần trước là ${vietSo(Math.abs(n.chenhLech))}.`,
		"khoi-diem": `Khởi điểm của kết quả là ${vietSo(kr.khoiDiem)}.`,
		dich: `Đích của kết quả là ${vietSo(kr.dich)}.`,
		"tien-do": `Tiến độ theo lần cập nhật là ${n.tienDo}%.`,
		ngay: `Lần cập nhật được ghi ngày ${n.ngay}.`,
	} satisfies Record<(typeof DANG)[number], string>;
	return DANG.map((d) => ({ vanBan: van[d], nguon: [n.id] }));
}

function chonPhong(ds: { ma: string; goi: GoiTomTat }[]) {
	const p1 = ds.find((p) => nguonDu(p.goi));
	if (!p1) throw new Error("bo mau khong co nguon du bay dang so khac nhau");
	const conLai = ds.filter((p) => p.ma !== p1.ma);
	const chon: Phong[] = [{ ...p1, truong: truongCua(p1.ma) }];
	for (const p of conLai) {
		if (chon.length === 4) break;
		const truong = truongCua(p.ma);
		if (chon.some((c) => c.truong === truong)) continue;
		chon.push({ ...p, truong });
	}
	const [a, b, c, d] = chon;
	if (!a || !b || !c || !d)
		throw new Error(`bo mau thieu phong co truong rieng: ${chon.length}`);
	return { p1: a, p2: b, p3: c, p4: d };
}

const nguonDau = (p: Phong) => {
	const n = motNguonMoiKr(p.goi)[0];
	if (!n) throw new Error(`phong ${p.ma} khong co nguon`);
	return n.id;
};

async function dungBan() {
	const n1 = nguonDu(P.p1.goi);
	if (!n1) throw new Error("p1 mat nguon du");
	const s1 = n1.id;
	const s2 = nguonDau(P.p2);
	const s3 = nguonDau(P.p3);
	nguonP4 = nguonDau(P.p4);
	const g1 = await ghiBan({
		ma: "thuoc-p1",
		departmentId: pb(P.p1.ma),
		nac: "bat",
		cau: [...cauMoiDang(P.p1.goi, n1), { vanBan: SO_LA, nguon: [s1] }],
	});
	const g2 = await ghiBan({
		ma: "thuoc-p2",
		departmentId: pb(P.p2.ma),
		nac: "bat",
		cau: [
			cauLanh(0, s2),
			cauLanh(1, s2),
			{ vanBan: cauLanh(2, s2).vanBan, nguon: ["khong-co-lan-nay"] },
			cauLanh(0, s2),
		],
	});
	const g3 = await ghiBan({
		ma: "thuoc-p3",
		departmentId: pb(P.p3.ma),
		nac: "an",
		cau: [
			cauLanh(0, s3),
			cauLanh(1, s3),
			cauLanh(2, s3),
			{ vanBan: SO_LA, nguon: [s3] },
		],
	});
	const g4 = await ghiBan({
		ma: "thuoc-p4",
		departmentId: pb(P.p4.ma),
		nac: "bat",
		cau: [cauLanh(0, nguonP4), cauLanh(1, nguonP4)],
	});
	const gieo = [g1, g2, g3, g4].map((g) => `${g.trangThai}:${g.soCauBo}`);
	if (gieo.join(",") !== "hien:1,can-xem:2,hien:1,hien:0") {
		const bo = await db.okrTomTat.findMany({
			where: { id: { in: [g1.id, g2.id, g3.id, g4.id] } },
			select: { cau: true },
		});
		throw new Error(
			`ban gieo lech: ${gieo.join(",")} — ${bo.map((b) => JSON.stringify(parseNoiDungTomTat(b.cau).bo)).join(" | ")}`,
		);
	}
	ban.p1 = g1.id;
	ban.p2 = g2.id;
	ban.p3 = g3.id;
	ban.p4 = g4.id;
	const task = await db.okrTomTat.findMany({
		where: { id: { in: [g1.id, g3.id] } },
		select: { id: true, taskId: true },
	});
	viec.p1 = task.find((t) => t.id === g1.id)?.taskId ?? "";
	viec.p3 = task.find((t) => t.id === g3.id)?.taskId ?? "";
}

async function gieoChiPhiBan() {
	const gieo = [
		["p1-tt", viec.p1, "0.004", "okr.tom-tat"],
		["p1-ct", viec.p1, "0.002", "okr.chuyen-tiep"],
		["p3-tt", viec.p3, "0.003", "okr.tom-tat"],
		["p3-ct", viec.p3, "0.001", "okr.chuyen-tiep"],
		["de-xuat", null, "0.05", "okr.de-xuat"],
		["ct-khong-viec", null, "0.02", "okr.chuyen-tiep"],
	] as const;
	datDongHo(SAU(30 * MINUTE_MS));
	for (const [id, taskId, usd, tinhNang] of gieo)
		await gieoChiPhi({ id, taskId, usd, tinhNang });
	datDongHo(THANG_TRUOC);
	await gieoChiPhi({
		id: "p1-thang-truoc",
		taskId: viec.p1,
		usd: "0.3",
		tinhNang: "okr.tom-tat",
	});
}

const zaloCua = (ma: string) => `Z-thuoc-${ma}`;
const TOKEN_ZALO_GIA = "1:thuoc";

async function batBot(ten: string | null) {
	await db.appSetting.upsert({
		where: { id: SETTINGS_ID },
		create: { id: SETTINGS_ID, zaloBotName: ten },
		update: { zaloBotName: ten },
	});
}

async function voiTokenGia<T>(chay: () => Promise<T>): Promise<T> {
	const cu = process.env.ZALO_BOT_TOKEN;
	process.env.ZALO_BOT_TOKEN = TOKEN_ZALO_GIA;
	try {
		return await chay();
	} finally {
		if (cu === undefined) delete process.env.ZALO_BOT_TOKEN;
		else process.env.ZALO_BOT_TOKEN = cu;
	}
}

async function guiNhac() {
	datDongHo(SANG);
	await batBot("Bot đo thước");
	for (const p of [P.p1, P.p4])
		await db.zaloLink.create({
			data: {
				crmUserId: nguoi(p.truong),
				zaloUserId: zaloCua(p.ma),
				zaloDisplayName: `Zalo ${p.ma}`,
			},
		});
	await lenLichNhac(SANG);
	const z = zaloGia();
	for (const p of [P.p1, P.p4]) {
		const hang = await db.agentTask.findFirst({
			where: {
				kind: LOAI_VIEC_NHAC,
				subject: chuDeNhac(nguoi(p.truong), SANG),
			},
			select: { id: true },
		});
		if (!hang) throw new Error(`khong co tin nhac cho truong ${p.ma}`);
		await voiTokenGia(() => chayNhac(hang, { zaloFetcher: z.fetcher }));
		const sau = await db.agentTask.findUniqueOrThrow({
			where: { id: hang.id },
			select: { payload: true },
		});
		const coDong = (parseNhacPayload(sau.payload).daGui ?? []).some(
			(m) => m.loai === "okr-tom-tat" && m.departmentId === pb(p.ma),
		);
		if (!coDong) throw new Error(`tin nhac cua truong ${p.ma} khong co dong`);
	}
}

async function moBang(ma: string, maPhong: string, luc: Date) {
	datDongHo(luc);
	const kq = await app.get(OkrXemService).moHopTuan(nguoi(ma), {
		cycleId: KY,
		unit: { loai: "pb", id: pb(maPhong) },
	});
	if (!kq.ghi) throw new Error(`moHopTuan ${ma} ${maPhong} khong ghi vet`);
}

async function phanHoi(ma: string, tomTatId: string, huuIch: boolean) {
	ok(
		await goiQua(
			app,
			"phanHoi",
			"trpc",
			{ tomTatId, huuIch },
			await cookieCua(ma),
		),
		`phan hoi ${ma}`,
	);
}

async function tatDong(ma: string) {
	ok(
		await goi(
			app,
			"zalo.luuDongTroLyOkr",
			"mutation",
			{ bat: false },
			await cookieCua(ma),
		),
		`tat dong ${ma}`,
	);
}

async function chaySql(ten: string): Promise<Hang[]> {
	const sql = readFileSync(join(RANG, ten), "utf8");
	return db.$transaction(async (tx) => {
		await tx.$executeRaw`SELECT set_config('okr.thang', ${THANG}, true)`;
		return z.array(hangThuoc).parse(await tx.$queryRawUnsafe(sql));
	});
}

type SoLech = {
	ma: number | null;
	dem: Record<Nac, { cau: number; lech: number }>;
	dong: { ban: string; cau: number; so: string }[];
	ra: string;
};

function chaySoLech(them: string[] = []): SoLech {
	const url = process.env.TEST_DATABASE_URL;
	if (!url) throw new Error("thieu TEST_DATABASE_URL cho so-lech-lot");
	const r = spawnSync("bun", [join(RANG, "so-lech-lot.mjs"), ...them], {
		encoding: "utf8",
		env: { ...process.env, DATABASE_URL: url },
	});
	const ra = `${r.stdout}${r.stderr}`;
	const dem = { bat: { cau: -1, lech: -1 }, an: { cau: -1, lech: -1 } };
	for (const m of ra.matchAll(
		/^so-lech-lot: (bat|an) (\d+) lech \/ (\d+) cau$/gm,
	))
		dem[m[1] as Nac] = { lech: Number(m[2]), cau: Number(m[3]) };
	const dong = [...ra.matchAll(/^([^|\s]+)\|(\d+)\|(.+)$/gm)].map((m) => ({
		ban: m[1] ?? "",
		cau: Number(m[2]),
		so: m[3] ?? "",
	}));
	return { ma: r.status, dem, dong, ra };
}

function docSoQuaThuoc(chu: string): unknown {
	const r = spawnSync("bun", [join(RANG, "so-lech-lot.mjs"), "--doc", chu], {
		encoding: "utf8",
	});
	return JSON.parse(r.stdout);
}

async function doSau(): Promise<Record<string, Record<Nac, Hang>>> {
	const ra: Record<string, Record<Nac, Hang>> = {};
	for (const ten of [
		"cau-bi-bo",
		"mo-sau-nhac",
		"huu-ich",
		"tat-dong",
		"chi-phi-tom-tat",
	]) {
		const hang = await chaySql(`${ten}.sql`);
		const theoNac = (nac: Nac) =>
			hang.find(
				(h) => h.nac === nac && (ten !== "cau-bi-bo" || h.tuan === TUAN),
			) ?? {};
		ra[ten] = { bat: theoNac("bat"), an: theoNac("an") };
	}
	const sl = chaySoLech();
	ra["so-lech-lot"] = { bat: sl.dem.bat, an: sl.dem.an };
	return ra;
}

function soVoiKyVong(doDuoc: Record<string, Record<Nac, Hang>>) {
	const bang: string[] = [];
	const lech: string[] = [];
	for (const [ten, theoNac] of Object.entries(KY_VONG))
		for (const nac of NAC) {
			let sai = false;
			for (const [truong, ky] of Object.entries(theoNac[nac])) {
				const thay = doDuoc[ten]?.[nac]?.[truong];
				const dung = Bun.deepEquals(thay, ky);
				if (!dung) sai = true;
				bang.push(
					`${ten} | ${nac} | ${truong} | ${JSON.stringify(ky)} | ${JSON.stringify(thay)}${dung ? "" : "  <-- lech"}`,
				);
			}
			if (sai) lech.push(`thuoc lech: ${ten} ${nac}`);
		}
	return { bang, lech };
}

beforeAll(async () => {
	await batDauMau();
	await donTomTat();
	app = await dungUngDung();
	P = chonPhong(await phongCoNguon(1));
	datDongHo(new Date(SAU(0).getTime() - 10 * MINUTE_MS));
	await ghiCauHinh(app, await cookieCua(QUAN_TRI), {
		aiOn: true,
		aiTomTatPhamVi: "danh-sach",
		aiTomTatDonVi: [pb(P.p1.ma), pb(P.p2.ma), pb(P.p4.ma)],
		aiTomTatAnPhamVi: "danh-sach",
		aiTomTatAnDonVi: [pb(P.p3.ma)],
	});
	datDongHo(SAU(MINUTE_MS));
	await dungBan();
	await gieoChiPhiBan();
	await guiNhac();
	await moBang(P.p1.truong, P.p1.ma, MO_CUNG_NGAY);
	await moBang(P.p4.truong, P.p4.ma, MO_HOM_SAU);
	datDongHo(PHAN_HOI_LUC);
	const [tv1, tv2] = thanhVienCua(P.p1.ma);
	if (!tv1 || !tv2) throw new Error(`phong ${P.p1.ma} thieu thanh vien`);
	await phanHoi(tv1, ban.p1, true);
	await phanHoi(P.p1.truong, ban.p1, true);
	await phanHoi(P.p1.truong, ban.p1, false);
	await phanHoi(tv2, ban.p1, true);
	datDongHo(TAT_LUC);
	await tatDong(P.p4.truong);
	await tatDong(P.p3.truong);
	await tatDong(tv1);
}, CHO_DB);

afterAll(async () => {
	await db.agentTask.deleteMany({ where: { kind: LOAI_VIEC_NHAC } });
	await db.zaloLink.deleteMany({
		where: { crmUserId: { startsWith: OKR_MAU.tienTo } },
	});
	await batBot(null);
	await donTomTat();
	await ketThucMau(app);
}, CHO_DB);

describe("thuoc", () => {
	test("so-lech-lot: khong nhap bo kiem okr-kiem-tom-tat hay okr-kiem-de-xuat", () => {
		const tep = join(RANG, "so-lech-lot.mjs");
		const nhap = (duong: string) =>
			[
				...readFileSync(duong, "utf8").matchAll(
					/^import[\s\S]*?from\s+"([^"]+)";/gm,
				),
			].map((m) => m[1] ?? "");
		const truc = nhap(tep);
		const gian = truc
			.filter((d) => d.startsWith("."))
			.flatMap((d) => nhap(join(RANG, d)));
		console.log(`so-lech-lot nhap: ${[...truc, ...gian].join(", ")}`);
		expect(truc.length).toBeGreaterThan(0);
		expect(
			[...truc, ...gian].filter((d) => /okr-kiem-(tom-tat|de-xuat)/.test(d)),
		).toEqual([]);
	});

	test("so-lech-lot: bo doc so rieng doc du cac dang so", () => {
		const sai = DOC_SO.flatMap(([chu, ky]) => {
			const thay = docSoQuaThuoc(chu);
			return JSON.stringify(thay) === JSON.stringify(ky)
				? []
				: [
						`doc so lech: «${chu}» ky vong ${JSON.stringify(ky)}, doc ${JSON.stringify(thay)}`,
					];
		});
		console.log(
			`doc so: ${DOC_SO.length - sai.length}/${DOC_SO.length} dang dung`,
		);
		expect(sai).toEqual([]);
	});

	test(
		"sau thuoc in dung so da biet, tach nac bat va an",
		async () => {
			const noiDung = parseNoiDungTomTat(
				(
					await db.okrTomTat.findUniqueOrThrow({
						where: { id: ban.p1 },
						select: { cau: true },
					})
				).cau,
			);
			expect(noiDung.cau.map((c) => c.vanBan)).toHaveLength(DANG.length);
			const sl = chaySoLech();
			const lechGia = sl.dong
				.filter((d) => d.ban === ban.p1)
				.map((d) => `lech gia: ${DANG[d.cau] ?? d.cau}`);
			expect(lechGia).toEqual([]);
			const { bang, lech } = soVoiKyVong(await doSau());
			console.log(
				["thuoc | nac | truong | ky vong | do duoc", ...bang].join("\n"),
			);
			expect(lech).toEqual([]);
			expect(sl.ma).toBe(0);
		},
		CHO_DB,
	);

	test(
		"so-lech-lot: cau so lech gieo thang vao cau bi bao dung ban va cau",
		async () => {
			const hang = await db.okrTomTat.findUniqueOrThrow({
				where: { id: ban.p4 },
				select: { cau: true },
			});
			const noiDung = parseNoiDungTomTat(hang.cau);
			await db.okrTomTat.update({
				where: { id: ban.p4 },
				data: {
					cau: {
						...noiDung,
						cau: [...noiDung.cau, { vanBan: SO_LA, nguon: [nguonP4] }],
					},
				},
			});
			const sl = chaySoLech();
			console.log(sl.ra.trim());
			expect(sl.ma).toBe(1);
			expect(sl.dong).toEqual([
				{ ban: ban.p4, cau: noiDung.cau.length, so: SO_LA_DOC },
			]);
			expect(sl.dem.bat.lech).toBe(1);
			expect(sl.dem.an.lech).toBe(0);
		},
		CHO_DB,
	);
});
