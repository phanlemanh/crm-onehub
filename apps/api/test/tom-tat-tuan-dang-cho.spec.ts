import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import {
	choBanDauTomTat,
	gioXepCua,
	lanXepTomTatHomNay,
	lanXepTomTatKe,
	thuCapNhatCuaNgayXep,
} from "@crm/db/okr-tom-tat";
import { NGAY_MS, TRO_LY_OKR_TRAN } from "@crm/db/okr-tro-ly-danh-muc";
import type { OkrProgramSua } from "@crm/validation/okr-chuong-trinh";
import {
	type TroLyTomTatOutput,
	troLyTomTatOutput,
} from "@crm/validation/okr-tom-tat";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { chayXepTomTat } from "../../agent/agent/lib/okr/lich-tom-tat";
import { completeTask } from "../../agent/agent/lib/tasks";
import {
	batDauMau,
	CHO_DB,
	datDongHo,
	dungUngDung,
	ghiCauHinh,
	goi,
	ketThucMau,
	ok,
} from "./tro-ly-okr-san";
import {
	cauLanh,
	cookieCua,
	donTomTat,
	ghiBan,
	goiCua,
	KY,
	KY_KHAC,
	LUC,
	maCua,
	motNguonMoiKr,
	PHONG_UNG_VIEN,
	pb,
	phongCoNguon,
	QUAN_TRI,
	truongCua,
} from "./tro-ly-okr-tom-tat-san";

const VI_TRI = ["05:59-ngay-xep", "06:00-ngay-xep", "06:01-ngay-xep", "12:00-ngay-cap-nhat"] as const;

const MA_TRAN: readonly {
	thu: number;
	now: Record<(typeof VI_TRI)[number], string>;
	luc: Record<(typeof VI_TRI)[number], string>;
}[] = [
	{
		thu: 1,
		now: {
			"05:59-ngay-xep": "2026-10-19T22:59:00.000Z",
			"06:00-ngay-xep": "2026-10-19T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-19T23:01:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-19T05:00:00.000Z",
		},
		luc: {
			"05:59-ngay-xep": "2026-10-19T23:00:00.000Z",
			"06:00-ngay-xep": "2026-10-26T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-26T23:00:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-19T23:00:00.000Z",
		},
	},
	{
		thu: 2,
		now: {
			"05:59-ngay-xep": "2026-10-20T22:59:00.000Z",
			"06:00-ngay-xep": "2026-10-20T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-20T23:01:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-20T05:00:00.000Z",
		},
		luc: {
			"05:59-ngay-xep": "2026-10-20T23:00:00.000Z",
			"06:00-ngay-xep": "2026-10-27T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-27T23:00:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-20T23:00:00.000Z",
		},
	},
	{
		thu: 3,
		now: {
			"05:59-ngay-xep": "2026-10-21T22:59:00.000Z",
			"06:00-ngay-xep": "2026-10-21T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-21T23:01:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-21T05:00:00.000Z",
		},
		luc: {
			"05:59-ngay-xep": "2026-10-21T23:00:00.000Z",
			"06:00-ngay-xep": "2026-10-28T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-28T23:00:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-21T23:00:00.000Z",
		},
	},
	{
		thu: 4,
		now: {
			"05:59-ngay-xep": "2026-10-22T22:59:00.000Z",
			"06:00-ngay-xep": "2026-10-22T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-22T23:01:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-22T05:00:00.000Z",
		},
		luc: {
			"05:59-ngay-xep": "2026-10-22T23:00:00.000Z",
			"06:00-ngay-xep": "2026-10-29T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-29T23:00:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-22T23:00:00.000Z",
		},
	},
	{
		thu: 5,
		now: {
			"05:59-ngay-xep": "2026-10-23T22:59:00.000Z",
			"06:00-ngay-xep": "2026-10-23T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-23T23:01:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-23T05:00:00.000Z",
		},
		luc: {
			"05:59-ngay-xep": "2026-10-23T23:00:00.000Z",
			"06:00-ngay-xep": "2026-10-30T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-30T23:00:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-23T23:00:00.000Z",
		},
	},
	{
		thu: 6,
		now: {
			"05:59-ngay-xep": "2026-10-24T22:59:00.000Z",
			"06:00-ngay-xep": "2026-10-24T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-24T23:01:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-24T05:00:00.000Z",
		},
		luc: {
			"05:59-ngay-xep": "2026-10-24T23:00:00.000Z",
			"06:00-ngay-xep": "2026-10-31T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-31T23:00:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-24T23:00:00.000Z",
		},
	},
	{
		thu: 7,
		now: {
			"05:59-ngay-xep": "2026-10-25T22:59:00.000Z",
			"06:00-ngay-xep": "2026-10-25T23:00:00.000Z",
			"06:01-ngay-xep": "2026-10-25T23:01:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-25T05:00:00.000Z",
		},
		luc: {
			"05:59-ngay-xep": "2026-10-25T23:00:00.000Z",
			"06:00-ngay-xep": "2026-11-01T23:00:00.000Z",
			"06:01-ngay-xep": "2026-11-01T23:00:00.000Z",
			"12:00-ngay-cap-nhat": "2026-10-25T23:00:00.000Z",
		},
	},
];

const NGAY_XEP_THEO_THU: readonly { ngayXep: string; thu: number }[] = [
	{ ngayXep: "2026-10-20T03:00:00.000Z", thu: 1 },
	{ ngayXep: "2026-10-21T03:00:00.000Z", thu: 2 },
	{ ngayXep: "2026-10-22T03:00:00.000Z", thu: 3 },
	{ ngayXep: "2026-10-23T03:00:00.000Z", thu: 4 },
	{ ngayXep: "2026-10-24T03:00:00.000Z", thu: 5 },
	{ ngayXep: "2026-10-25T03:00:00.000Z", thu: 6 },
	{ ngayXep: "2026-10-26T03:00:00.000Z", thu: 7 },
];

describe("ttdc-luat-gio", () => {
	test("ttdc-luat-gio: TZ dat tu ngoai co ap", () => {
		const tz = process.env.TZ;
		if (!tz) throw new Error("ttdc-luat-gio: TZ khong ap (chua dat TZ)");
		const MOC = [Date.UTC(2026, 0, 15, 12), Date.UTC(2026, 6, 15, 12)];
		const dang = (timeZone?: string) =>
			MOC.map((t) =>
				new Intl.DateTimeFormat("en-GB", { timeZone, dateStyle: "short", timeStyle: "short" }).format(t),
			).join("|");
		expect(dang() === dang(tz) ? "ap" : "ttdc-luat-gio: TZ khong ap").toBe("ap");
	});

	test("ttdc-luat-gio: ma tran 7 thu x 4 vi tri viet truoc", () => {
		const lech: string[] = [];
		let soAssert = 0;
		for (const dong of MA_TRAN)
			for (const vt of VI_TRI) {
				soAssert += 1;
				const thuc = lanXepTomTatKe(new Date(dong.now[vt]), dong.thu).toISOString();
				if (thuc !== dong.luc[vt])
					lech.push(`ttdc-luat-gio: lech o ${dong.thu}/${vt} (${thuc}, can ${dong.luc[vt]})`);
			}
		console.log(`ttdc-luat-gio: ${soAssert} o`);
		expect(soAssert).toBe(28);
		expect(lech).toEqual([]);
	});

	test("ttdc-luat-gio: thu cap nhat cua ngay xep la thu cua hom truoc", () => {
		const lech = NGAY_XEP_THEO_THU.flatMap((o) =>
			thuCapNhatCuaNgayXep(new Date(o.ngayXep)) === o.thu
				? []
				: [`ttdc-luat-gio: thu cap nhat lech o ${o.ngayXep}`],
		);
		expect(lech).toEqual([]);
		expect(gioXepCua(new Date("2026-10-20T03:00:00.000Z")).toISOString()).toBe(
			"2026-10-19T23:00:00.000Z",
		);
	});

	test("ttdc-luat-gio: lan xep hom nay chi o ngay xep cua chu ky va sau gio xep", () => {
		expect({
			dungNgay: lanXepTomTatHomNay(new Date("2026-10-19T23:05:00.000Z"), 1)?.toISOString() ?? null,
			truocGio: lanXepTomTatHomNay(new Date("2026-10-19T22:59:00.000Z"), 1),
			khacNgay: lanXepTomTatHomNay(new Date("2026-10-20T23:05:00.000Z"), 1),
		}).toEqual({
			dungNgay: "2026-10-19T23:00:00.000Z",
			truocGio: null,
			khacNgay: null,
		});
	});

	test("ttdc-luat-gio: tac tu dung chung luat gio xep", () => {
		const nguon = readFileSync(
			join(import.meta.dir, "../../agent/agent/lib/okr/lich-tom-tat.ts"),
			"utf8",
		);
		expect({
			khaiRieng: /function gioXepCua\b/.test(nguon),
			importChung: /import\s*\{[^}]*\bgioXepCua\b[^}]*\}\s*from\s*"@crm\/db\/okr-tom-tat"/.test(nguon),
		}).toEqual({ khaiRieng: false, importChung: true });
	});
});

const GHI_CAU_HINH_LUC = new Date("2026-11-02T00:00:00.000Z");

let app: NestExpressApplication;
let phong = "";
let phongKhac = "";
let nguonId = "";
let krNguon = { id: "", giaTri: 0 };

const cauHinhBat = (thay: Partial<OkrProgramSua> = {}): OkrProgramSua => ({
	aiOn: true,
	aiTomTatPhamVi: "danh-sach",
	aiTomTatDonVi: [pb(phong)],
	aiTomTatAnPhamVi: "tat",
	aiTomTatAnDonVi: [],
	aiTranThangUsd: TRO_LY_OKR_TRAN.tranThangMacDinhUsd,
	...thay,
});

async function datCauHinh(sua: OkrProgramSua): Promise<void> {
	datDongHo(GHI_CAU_HINH_LUC);
	await ghiCauHinh(app, await cookieCua(QUAN_TRI), sua);
	datDongHo(LUC);
}

async function doc(
	v: { cycleId?: string; departmentId?: string } = {},
): Promise<TroLyTomTatOutput> {
	return troLyTomTatOutput.parse(
		ok(
			await goi(
				app,
				"okr.troLyTomTat",
				"query",
				{ cycleId: v.cycleId ?? KY, departmentId: v.departmentId ?? pb(phong) },
				await cookieCua(truongCua(phong)),
			),
			"doc tom tat",
		),
	);
}

async function lamSach(): Promise<void> {
	await donTomTat();
	await db.okrTomTat.deleteMany({ where: { departmentId: pb(phong) } });
	await db.agentTask.deleteMany({
		where: { kind: "okr-kiem-san-sang", subject: { startsWith: "ttdc-" } },
	});
	await db.okrCycle.update({ where: { id: KY }, data: { updateWeekday: 1 } });
	datDongHo(LUC);
}

async function taoViecXep(dueAt: Date, xong: boolean): Promise<{ id: string; dueAt: Date }> {
	return db.agentTask.create({
		data: {
			kind: "okr-tom-tat-xep",
			reason: "okr-tom-tat-xep",
			subject: `okr-tom-tat-xep:ttdc-${dueAt.toISOString()}`,
			budget: 0,
			dueAt,
			createdAt: dueAt,
			finishedAt: xong ? dueAt : null,
			outcome: xong ? "da-xep:0" : null,
		},
		select: { id: true, dueAt: true },
	});
}

async function soViecCuaPhong(luc: Date): Promise<number> {
	const viec = await db.agentTask.findMany({
		where: { kind: "okr-tom-tat-tuan", createdAt: luc },
		select: { payload: true },
	});
	return viec.filter((v) => {
		const p = v.payload as { departmentId?: unknown; nac?: unknown } | null;
		return p?.departmentId === pb(phong) && p.nac === "bat";
	}).length;
}

async function chayXepLuc(luc: Date): Promise<number> {
	datDongHo(luc);
	const viec = await taoViecXep(luc, false);
	await chayXepTomTat(viec, luc);
	return soViecCuaPhong(luc);
}

describe("ttdc-csdl", () => {
	beforeAll(async () => {
		await batDauMau();
		await donTomTat();
		app = await dungUngDung();
		const co = await phongCoNguon(1);
		const dau = co[0];
		if (!dau) throw new Error("bo mau khong co phong co cap nhat");
		phong = dau.ma;
		const nguon = motNguonMoiKr(dau.goi)[0];
		if (!nguon) throw new Error(`phong ${phong} khong co nguon`);
		nguonId = nguon.id;
		krNguon = { id: nguon.keyResultId, giaTri: nguon.giaTri };
		phongKhac = PHONG_UNG_VIEN.find((m) => m !== phong) ?? "";
	}, CHO_DB);

	afterAll(async () => {
		await donTomTat();
		await ketThucMau(app);
	}, CHO_DB);

	test(
		"ttdc-api-cho: phong bat chua co ban thay gio ban dau tien",
		async () => {
			await lamSach();
			await datCauHinh(cauHinhBat());
			datDongHo(new Date("2026-11-12T09:00:00.000Z"));
			const sauGioXep = await doc();
			datDongHo(new Date("2026-11-09T22:00:00.000Z"));
			const truocGioXep = await doc();
			expect({
				sauGioXep: sauGioXep.choBan ?? "ttdc-api-cho: thieu choBan o phong bat chua co ban",
				truocGioXep: truocGioXep.choBan ?? "ttdc-api-cho: thieu choBan o phong bat chua co ban",
				banCu: [sauGioXep.ban, sauGioXep.dangSoan, sauGioXep.chuaCapNhat],
			}).toEqual({
				sauGioXep: { kieu: "toi-luc", luc: "2026-11-16T23:00:00.000Z" },
				truocGioXep: { kieu: "toi-luc", luc: "2026-11-09T23:00:00.000Z" },
				banCu: [null, false, false],
			});
		},
		CHO_DB,
	);

	test(
		"ttdc-dang-xep: dang xep chi khi hom nay la ngay xep va luot xep chua dong",
		async () => {
			await lamSach();
			await datCauHinh(cauHinhBat());
			const ra: Record<string, unknown> = {};
			datDongHo(new Date("2026-11-09T23:05:00.000Z"));
			const viec = await taoViecXep(new Date("2026-11-09T23:00:00.000Z"), false);
			const a = (await doc()).choBan;
			ra.a = a?.kieu === "dang-xep" ? a : `ttdc-dang-xep: (a) ra ${a?.kieu ?? "khong co"}, can dang-xep`;
			await db.agentTask.update({
				where: { id: viec.id },
				data: { finishedAt: new Date("2026-11-09T23:01:00.000Z"), outcome: "da-xep:0" },
			});
			ra.b = (await doc()).choBan;
			await db.agentTask.delete({ where: { id: viec.id } });
			ra.c = (await doc()).choBan;
			datDongHo(new Date("2026-11-10T23:05:00.000Z"));
			await taoViecXep(new Date("2026-11-10T23:00:00.000Z"), false);
			const d = (await doc()).choBan;
			ra.d = d?.kieu === "dang-xep" ? "ttdc-dang-xep: (d) ra dang-xep o ngay khong khop" : d;
			const tuanSau = { kieu: "toi-luc", luc: "2026-11-16T23:00:00.000Z" };
			expect(ra).toEqual({ a: { kieu: "dang-xep" }, b: tuanSau, c: tuanSau, d: tuanSau });
		},
		CHO_DB,
	);

	test(
		"ttdc-tam-dung: het tran thang va chua co khoa thi tam dung, sang thang sau thi neu gio",
		async () => {
			await lamSach();
			await datCauHinh(cauHinhBat({ aiTranThangUsd: 0 }));
			const a = (await doc()).choBan;
			const b = await choBanDauTomTat(db, {
				cycleId: KY,
				departmentId: pb(phong),
				now: new Date("2026-11-30T05:00:00.000Z"),
			});
			await datCauHinh(cauHinhBat());
			const kiem = await db.agentTask.create({
				data: {
					kind: "okr-kiem-san-sang",
					reason: "okr-kiem-san-sang",
					subject: "ttdc-kiem",
					dueAt: new Date(),
				},
				select: { id: true },
			});
			await completeTask(kiem.id, "chua-co-khoa-mo-hinh");
			const c = (await doc()).choBan;
			expect({
				a: a?.kieu === "tam-dung" ? a : `ttdc-tam-dung: (a) ra ${a?.kieu ?? "khong co"} khi het tran`,
				b,
				c,
			}).toEqual({
				a: { kieu: "tam-dung", lyDo: "het-tran-thang", moLai: "2026-12-01" },
				b: { kieu: "toi-luc", luc: "2026-11-30T23:00:00.000Z" },
				c: { kieu: "tam-dung", lyDo: "chua-co-khoa-mo-hinh", moLai: null },
			});
		},
		CHO_DB,
	);

	test(
		"ttdc-khong-doi: cac trang thai cu khong co choBan",
		async () => {
			const lech: string[] = [];
			let soO = 0;
			const kiemO = (ten: string, kq: TroLyTomTatOutput, baKhoa: boolean) => {
				soO += 1;
				if (Object.keys(kq).includes("choBan")) lech.push(`ttdc-khong-doi: o ${ten} co choBan`);
				if (baKhoa && JSON.stringify(kq) !== JSON.stringify({ ban: null, dangSoan: false, chuaCapNhat: false }))
					lech.push(`ttdc-khong-doi: o ${ten} lech ba khoa ${JSON.stringify(kq)}`);
			};
			const nacKhac: [string, OkrProgramSua][] = [
				["nac-tat", { aiOn: false }],
				["viec-tat", cauHinhBat({ aiTomTatPhamVi: "tat", aiTomTatDonVi: [] })],
				["don-vi-chua-bat", cauHinhBat({ aiTomTatDonVi: [pb(phongKhac)] })],
				["che-do-an", cauHinhBat({ aiTomTatPhamVi: "tat", aiTomTatDonVi: [], aiTomTatAnPhamVi: "danh-sach", aiTomTatAnDonVi: [pb(phong)] })],
			];
			for (const [ten, sua] of nacKhac) {
				await lamSach();
				await datCauHinh(sua);
				kiemO(ten, await doc(), true);
			}
			const banBat = async (ma: string, nac: "an" | "bat" = "bat") =>
				ghiBan({ ma, departmentId: pb(phong), nac, cau: [cauLanh(0, nguonId)] });
			await lamSach();
			await datCauHinh(cauHinhBat());
			await banBat("ttdc-hien");
			kiemO("ban-dang-hien", await doc(), false);
			await lamSach();
			await datCauHinh(cauHinhBat());
			await banBat("ttdc-giu");
			await db.okrTomTat.updateMany({ where: { departmentId: pb(phong) }, data: { trangThai: "can-xem" } });
			kiemO("ban-bi-giu", await doc(), false);
			await lamSach();
			await datCauHinh(cauHinhBat());
			datDongHo(new Date(LUC.getTime() - 9 * NGAY_MS));
			await banBat("ttdc-cu");
			datDongHo(LUC);
			kiemO("ban-qua-8-ngay", await doc(), false);
			await lamSach();
			await datCauHinh(cauHinhBat());
			soO += 1;
			const khacPha = await choBanDauTomTat(db, { cycleId: KY_KHAC, departmentId: pb(phong), now: LUC });
			if (khacPha !== null) lech.push("ttdc-khong-doi: o chu-ky-khac-pha co choBan");
			datDongHo(new Date("2026-12-28T05:00:00.000Z"));
			kiemO("chua-cap-nhat", await doc(), false);
			console.log(`ttdc-khong-doi: ${soO} o`);
			await lamSach();
			await datCauHinh(cauHinhBat());
			const doiChung = await doc();
			await banBat("ttdc-an", "an");
			const tungAn = await doc();
			expect({
				soO,
				lech,
				doiChung: doiChung.choBan?.kieu ?? "khong co",
				tungAn: tungAn.choBan?.kieu ?? "khong co",
				cungKyChay: (await choBanDauTomTat(db, { cycleId: KY, departmentId: pb(phong), now: LUC }))?.kieu ?? "khong co",
			}).toEqual({ soO: 9, lech: [], doiChung: "toi-luc", tungAn: "toi-luc", cungKyChay: "toi-luc" });
		},
		CHO_DB,
	);

	test(
		"ttdc-mot-luat: luot xep that cua tac tu o gio da bao xep viec cho phong",
		async () => {
			const lech: string[] = [];
			let soO = 0;
			const DOC_THEO_THU: Record<number, string> = {
				1: "2026-11-09T05:00:00.000Z",
				4: "2026-11-12T05:00:00.000Z",
				7: "2026-11-15T05:00:00.000Z",
			};
			for (const thu of [1, 4, 7]) {
				await lamSach();
				await db.okrCycle.update({ where: { id: KY }, data: { updateWeekday: thu } });
				await datCauHinh(cauHinhBat());
				const docLuc = new Date(DOC_THEO_THU[thu] ?? "");
				const cho = await choBanDauTomTat(db, { cycleId: KY, departmentId: pb(phong), now: docLuc });
				if (cho?.kieu !== "toi-luc") {
					lech.push(`ttdc-mot-luat: thu ${thu} khong co toi-luc`);
					continue;
				}
				const luc = new Date(cho.luc);
				soO += 1;
				if ((await chayXepLuc(luc)) !== 1)
					lech.push(`ttdc-mot-luat: luot xep tai luc da bao khong xep viec (thu ${thu})`);
				await donTomTat();
				soO += 1;
				if ((await chayXepLuc(new Date(luc.getTime() - NGAY_MS))) !== 0)
					lech.push(`ttdc-mot-luat: luot xep truoc luc mot ngay van xep viec (thu ${thu})`);
			}
			await lamSach();
			await datCauHinh(cauHinhBat());
			datDongHo(new Date("2026-11-18T03:00:00.000Z"));
			const cho = await choBanDauTomTat(db, { cycleId: KY, departmentId: pb(phong), now: new Date() });
			const luc = new Date(cho?.kieu === "toi-luc" ? cho.luc : 0);
			if (luc.toISOString() !== "2026-11-23T23:00:00.000Z")
				lech.push(`ttdc-mot-luat: tuan sau ra ${luc.toISOString()}`);
			soO += 1;
			if ((await chayXepLuc(luc)) !== 0)
				lech.push("ttdc-mot-luat: khong cap nhat moi van xep viec");
			await donTomTat();
			datDongHo(new Date("2026-11-23T03:00:00.000Z"));
			const kr = await db.okrKeyResult.findUniqueOrThrow({
				where: { id: krNguon.id },
				select: { ownerUserId: true },
			});
			const chu = await cookieCua(kr.ownerUserId ? maCua(kr.ownerUserId) : truongCua(phong));
			const phien = ok<{ sessionId: string }>(
				await goi(app, "okr.moCapNhat", "mutation", { entry: "tab" }, chu),
				"mo cap nhat",
			);
			ok(
				await goi(
					app,
					"okr.guiCapNhat",
					"mutation",
					{
						sessionId: phien.sessionId,
						items: [{ keyResultId: krNguon.id, value: krNguon.giaTri, confidence: "vua", note: "ttdc" }],
					},
					chu,
				),
				"gui cap nhat thu Hai",
			);
			soO += 1;
			if ((await chayXepLuc(luc)) !== 1)
				lech.push("ttdc-mot-luat: co cap nhat thu Hai ma khong xep viec");
			console.log(`ttdc-mot-luat: ${soO} o`);
			expect({ soO, lech }).toEqual({ soO: 8, lech: [] });
		},
		CHO_DB,
	);
});
