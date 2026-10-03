import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { krTheoKara, type VetTen } from "@crm/validation/okr-theo-kara";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { idMau } from "../scripts/okr-mau/nap";
import { OkrXemService } from "../src/okr/okr-xem.service";
import {
	batDauMau,
	CHO_DB,
	dongMau,
	dungUngDung,
	ghiCauHinh,
	gieoDong,
	goi,
	ketThucMau,
	kr,
	mt,
	NAC_CAU_HINH,
	ok,
	phienMau,
	tienDongHo,
} from "./tro-ly-okr-san";

const M1 = mt("q4-kd-bac-1");
const M1K1 = kr("q4-kd-bac-1-k1");
const M1K2 = kr("q4-kd-bac-1-k2");
const M1K3 = kr("q4-kd-bac-1-k3");
const M2 = mt("q4-kd-nam-1");
const M2K1 = kr("q4-kd-nam-1-k1");
const PB_BAC = idMau("pb", "kd-bac");
const PB_NAM = idMau("pb", "kd-nam");
const BP_KD = idMau("bp", "kinh-doanh");

const NGUOI = {
	truong: "nguyen-thi-lan",
	"phu-trach-kr2": "hoang-yen-nhi",
	"chi-doc": "bui-quang-huy",
	"truong-nam": "ly-thanh-tam",
	"truong-bo-phan": "tran-quoc-bao",
	"quan-tri": "le-hai-dang",
} as const;
type Nguoi = keyof typeof NGUOI;

const LOC_RONG = { phuTrach: [], loai: [], trangThai: [], tuTin: [], gopY: [] };

type Dong = { id: string; soGopYCho: number };
type DanhSach = {
	rows: Dong[];
	total: number;
	facetCounts: { gopY: { value: string; count: number }[] };
};

let app: NestExpressApplication;
let cycleId = "";
const cookie: Record<Nguoi, string> = {
	truong: "",
	"phu-trach-kr2": "",
	"chi-doc": "",
	"truong-nam": "",
	"truong-bo-phan": "",
	"quan-tri": "",
};
const id = { tenMt: "", tenK1: "", tenK2: "", viSao: "", canChinh: "" };
const id2 = { ten: "", tenK1: "", hoi: "" };

const DON_VI: Record<Nguoi, { loai: "pb" | "bp"; id: string }> = {
	truong: { loai: "pb", id: PB_BAC },
	"phu-trach-kr2": { loai: "pb", id: PB_BAC },
	"chi-doc": { loai: "pb", id: PB_BAC },
	"truong-nam": { loai: "pb", id: PB_NAM },
	"truong-bo-phan": { loai: "bp", id: BP_KD },
	"quan-tri": { loai: "bp", id: BP_KD },
};

async function danhSach(ai: Nguoi, gopY: "cho"[] = []): Promise<DanhSach> {
	return ok<DanhSach>(
		await goi(
			app,
			"okr.danhSach",
			"query",
			{ cycleId, unit: DON_VI[ai], loc: { ...LOC_RONG, gopY } } as never,
			cookie[ai],
		),
		`danhSach ${ai}`,
	);
}

async function soCua(ai: Nguoi, mucTieu: string): Promise<number | null> {
	const ds = await danhSach(ai);
	return ds.rows.find((r) => r.id === mucTieu)?.soGopYCho ?? null;
}

async function soTrongMine(ai: Nguoi, mucTieu: string): Promise<number | null> {
	const mine = ok<{ objectives: Dong[] }>(
		await goi(app, "okr.mine", "query", { cycleId }, cookie[ai]),
		`mine ${ai}`,
	);
	return mine.objectives.find((r) => r.id === mucTieu)?.soGopYCho ?? null;
}

function quyet(
	deXuatId: string,
	cach: "nhan" | "sua" | "bac" | "bo-qua",
	ai: Nguoi,
	giaTri?: string,
) {
	tienDongHo();
	return goi(
		app,
		"okr.troLyQuyet",
		"mutation",
		{ deXuatId, cach, giaTri },
		cookie[ai],
	);
}

async function clone(
	goc: string,
	doi: Partial<{
		nac: string;
		trangThai: string;
		cuocSoanId: string | null;
		truoc: string | null;
		keyResultId: string | null;
		createdAt: Date;
		quyetLuc: Date | null;
	}>,
): Promise<string> {
	const h = await db.okrDeXuat.findUniqueOrThrow({ where: { id: goc } });
	const { id: _bo, ...conLai } = h;
	const moi = await db.okrDeXuat.create({
		data: {
			...conLai,
			dich: conLai.dich ?? undefined,
			noiDung: conLai.noiDung ?? undefined,
			...doi,
		},
	});
	return moi.id;
}

beforeAll(async () => {
	await batDauMau();
	app = await dungUngDung();
	for (const k of Object.keys(NGUOI) as Nguoi[])
		cookie[k] = await phienMau(NGUOI[k]);
	await ghiCauHinh(app, cookie["quan-tri"], NAC_CAU_HINH.bat);
	const m1 = await db.okrObjective.findUniqueOrThrow({
		where: { id: M1 },
		select: {
			cycleId: true,
			title: true,
			whyNow: true,
			keyResults: { select: { id: true, title: true } },
		},
	});
	cycleId = m1.cycleId;
	const ten = (krId: string) =>
		m1.keyResults.find((k) => k.id === krId)?.title ?? "";
	[id.tenMt, id.tenK1, id.tenK2, id.viSao, id.canChinh] = (await gieoDong(
		M1,
		null,
		[
			dongMau({
				loai: "viet-lai",
				objectiveId: M1,
				truong: "title",
				truoc: m1.title,
				sau: "Bán lẻ miền Bắc lớn đều qua từng tháng",
			}),
			dongMau({
				loai: "viet-lai",
				objectiveId: M1,
				keyResultId: M1K1,
				truong: "kr.title",
				truoc: ten(M1K1),
				sau: `${ten(M1K1)} trong quý`,
			}),
			dongMau({
				loai: "viet-lai",
				objectiveId: M1,
				keyResultId: M1K2,
				truong: "kr.title",
				truoc: ten(M1K2),
				sau: `${ten(M1K2)}, rõ từng tuần`,
			}),
			dongMau({
				loai: "viet-lai",
				objectiveId: M1,
				truong: "whyNow",
				truoc: m1.whyNow,
				sau: `${m1.whyNow} Đây là mùa đối tác cần kho nhất.`,
			}),
			dongMau({
				loai: "can-chinh",
				objectiveId: M1,
				targetObjectiveId: mt("n2"),
				lyDo: "Mục tiêu này góp vào giao đúng hẹn.",
			}),
		],
	)) as [string, string, string, string, string];
	ok(await quyet(id.viSao, "nhan", "truong"), "nhan vi sao");
	ok(await quyet(id.canChinh, "bac", "truong"), "bac can chinh");
	await clone(id.tenMt, { nac: "an" });
	await clone(id.tenMt, { cuocSoanId: `${M1}-cuoc` });
	await clone(id.tenK1, { truoc: "Tên KR đã cũ" });
	const m2 = await db.okrObjective.findUniqueOrThrow({
		where: { id: M2 },
		select: { title: true, keyResults: { select: { id: true, title: true } } },
	});
	const ten2 = m2.keyResults.find((k) => k.id === M2K1)?.title ?? "";
	[id2.ten, id2.tenK1, id2.hoi] = (await gieoDong(M2, null, [
		dongMau({
			loai: "viet-lai",
			objectiveId: M2,
			truong: "title",
			truoc: m2.title,
			sau: "Hàng lạnh phía Nam lớn đều",
		}),
		dongMau({
			loai: "viet-lai",
			objectiveId: M2,
			keyResultId: M2K1,
			truong: "kr.title",
			truoc: ten2,
			sau: `${ten2} trong quý`,
		}),
		dongMau({
			loai: "hoi",
			objectiveId: M2,
			maVanDe: "khong-do-duoc",
			lyDo: "Câu hỏi giúp làm rõ cách đo.",
		}),
	])) as [string, string, string];
}, CHO_DB);

afterAll(async () => {
	await ketThucMau(app);
}, CHO_DB);

describe("dem-chip", () => {
	const BANG_BAT: readonly [Nguoi, string, number][] = [
		["truong", M1, 3],
		["phu-trach-kr2", M1, 1],
		["chi-doc", M1, 0],
		["truong-nam", M2, 3],
	];
	const BANG_DANH_SACH: readonly [Nguoi, string, number][] = [
		["truong", M1, 3],
		["phu-trach-kr2", M1, 1],
		["chi-doc", M1, 0],
		["truong-nam", M2, 0],
	];

	test(
		"nấc bật toàn công ty: soGopYCho đúng bảng viết trước ở danhSach và mine",
		async () => {
			const thay: string[] = [];
			for (const [ai, mucTieu, ky] of BANG_BAT) {
				thay.push(`${ai}/${mucTieu}=${await soCua(ai, mucTieu)}`);
				expect(`${ai}/${mucTieu}=${await soCua(ai, mucTieu)}`).toBe(
					`${ai}/${mucTieu}=${ky}`,
				);
			}
			expect(await soTrongMine("truong", M1)).toBe(3);
			expect(await soTrongMine("phu-trach-kr2", M1)).toBe(1);
			console.log(`dem-chip bat: ${thay.length} o: ${thay.join(", ")}`);
		},
		CHO_DB,
	);

	test(
		"chỉ bật cho Kinh doanh miền Bắc: Mục tiêu miền Nam về 0",
		async () => {
			await ghiCauHinh(app, cookie["quan-tri"], {
				...NAC_CAU_HINH.bat,
				aiDeXuatPhamVi: "danh-sach",
				aiDeXuatDonVi: [PB_BAC],
				aiDeXuatAnPhamVi: "toan-cong-ty",
			});
			for (const [ai, mucTieu, ky] of BANG_DANH_SACH)
				expect(`${ai}/${mucTieu}=${await soCua(ai, mucTieu)}`).toBe(
					`${ai}/${mucTieu}=${ky}`,
				);
			await ghiCauHinh(app, cookie["quan-tri"], NAC_CAU_HINH.bat);
		},
		CHO_DB,
	);

	test(
		"một lần danhSach đọc okrDeXuat đúng một lần dù trang có ≥ 3 Mục tiêu",
		async () => {
			const svc = app.get(OkrXemService) as unknown as { db: typeof db };
			const goc = svc.db;
			let lan = 0;
			const DEM = new Set(["findMany", "findFirst", "groupBy", "count"]);
			const deXuat = new Proxy(goc.okrDeXuat, {
				get(dich, khoa, nhan) {
					const v = Reflect.get(dich, khoa, nhan);
					if (
						typeof khoa === "string" &&
						DEM.has(khoa) &&
						typeof v === "function"
					)
						return (...vao: unknown[]) => {
							lan += 1;
							return v.apply(dich, vao);
						};
					return v;
				},
			});
			svc.db = new Proxy(goc, {
				get(dich, khoa, nhan) {
					if (khoa === "okrDeXuat") return deXuat;
					return Reflect.get(dich, khoa, nhan);
				},
			});
			try {
				const ds = await danhSach("truong-bo-phan");
				expect(ds.rows.length).toBeGreaterThanOrEqual(3);
				expect(`lan doc okrDeXuat=${lan}`).toBe("lan doc okrDeXuat=1");
			} finally {
				svc.db = goc;
			}
		},
		CHO_DB,
	);

	test(
		"Mục tiêu đã bỏ đếm 0",
		async () => {
			await db.okrObjective.update({
				where: { id: M2 },
				data: { status: "da-bo" },
			});
			try {
				expect(await soCua("truong-nam", M2)).toBe(0);
			} finally {
				await db.okrObjective.update({
					where: { id: M2 },
					data: { status: "cong-bo" },
				});
			}
		},
		CHO_DB,
	);
});

describe("loc-gop-y", () => {
	test(
		"lọc Có góp ý chờ: đúng hai Mục tiêu, total và mặt lọc khớp",
		async () => {
			const tat = await danhSach("truong-bo-phan");
			const loc = await danhSach("truong-bo-phan", ["cho"]);
			expect(tat.total).toBeGreaterThan(2);
			expect(new Set(loc.rows.map((r) => r.id))).toEqual(new Set([M1, M2]));
			const loi = loc.total === 2 ? "ok" : `total sai: ${loc.total} != 2`;
			expect(loi).toBe("ok");
			expect(loc.facetCounts.gopY).toEqual([{ value: "cho", count: 2 }]);
			expect(tat.facetCounts.gopY).toEqual([{ value: "cho", count: 2 }]);
			console.log(`loc-gop-y: khong loc ${tat.total}, co loc ${loc.total}`);
		},
		CHO_DB,
	);

	test(
		"lọc trên đơn vị không có góp ý chờ trả rỗng",
		async () => {
			const rong = ok<DanhSach>(
				await goi(
					app,
					"okr.danhSach",
					"query",
					{
						cycleId,
						unit: { loai: "pb", id: idMau("pb", "marketing") },
						loc: { ...LOC_RONG, gopY: ["cho"] },
					} as never,
					cookie["quan-tri"],
				),
				"danhSach marketing",
			);
			expect(rong.rows).toEqual([]);
			expect(rong.total).toBe(0);
		},
		CHO_DB,
	);
});

describe("dong-bo", () => {
	test(
		"đổi tay tên KR làm dòng viết lại hết hiệu lực: chip đếm 2 trước và sau troLyDanhSach",
		async () => {
			expect(await soCua("truong-nam", M2)).toBe(3);
			tienDongHo();
			ok(
				await goi(
					app,
					"okr.updateKeyResult",
					"mutation",
					{ id: M2K1, title: "Đối tác hàng lạnh mới, đổi tay" },
					cookie["truong-nam"],
				),
				"doi tay ten kr",
			);
			const truoc = await soCua("truong-nam", M2);
			ok(
				await goi(
					app,
					"okr.troLyDanhSach",
					"query",
					{ objectiveId: M2 },
					cookie["truong-nam"],
				),
				"troLyDanhSach",
			);
			const h = await db.okrDeXuat.findUniqueOrThrow({
				where: { id: id2.tenK1 },
				select: { trangThai: true },
			});
			const sau = await soCua("truong-nam", M2);
			expect(h.trangThai).toBe("het-han");
			expect(`truoc=${truoc} sau=${sau}`).toBe("truoc=2 sau=2");
		},
		CHO_DB,
	);
});

describe("theo-kara", () => {
	const vet = async (): Promise<VetTen[]> =>
		ok<{ trail: VetTen[] }>(
			await goi(app, "okr.objective", "query", { id: M1 }, cookie.truong),
			"objective",
		).trail;

	test(
		"nhận đổi tên KR2 → dấu theo Kara; sửa tay sau đó → mất dấu; sửa rồi nhận ghi đúng chữ",
		async () => {
			ok(await quyet(id.tenK2, "nhan", "truong"), "nhan ten k2");
			expect(krTheoKara(await vet()).has(M1K2)).toBe(true);
			ok(
				await quyet(id.tenK1, "sua", "truong", "Hợp đồng bán lẻ, tự sửa"),
				"sua k1",
			);
			const k1 = await db.okrKeyResult.findUniqueOrThrow({
				where: { id: M1K1 },
				select: { title: true },
			});
			expect(k1.title).toBe("Hợp đồng bán lẻ, tự sửa");
			tienDongHo();
			ok(
				await goi(
					app,
					"okr.updateKeyResult",
					"mutation",
					{ id: M1K2, title: "Số cuộc hẹn, người sửa tay" },
					cookie.truong,
				),
				"sua tay k2",
			);
			const loi = krTheoKara(await vet()).has(M1K2)
				? "dau theo kara con sau khi sua tay: KR2"
				: "ok";
			expect(loi).toBe("ok");
		},
		CHO_DB,
	);
});

describe("bo-qua", () => {
	test(
		"Bỏ qua viết lại gửi bac, câu hỏi gửi bo-qua; chip giảm 2",
		async () => {
			const truoc = await soCua("truong-nam", M2);
			ok(await quyet(id2.ten, "bac", "truong-nam"), "bac ten m2");
			ok(await quyet(id2.hoi, "bo-qua", "truong-nam"), "bo qua hoi m2");
			const hai = await db.okrDeXuat.findMany({
				where: { id: { in: [id2.ten, id2.hoi] } },
				select: { id: true, trangThai: true, quyetLuc: true },
			});
			expect(Object.fromEntries(hai.map((h) => [h.id, h.trangThai]))).toEqual({
				[id2.ten]: "bac",
				[id2.hoi]: "bo-qua",
			});
			expect(hai.every((h) => h.quyetLuc !== null)).toBe(true);
			expect((truoc ?? 0) - ((await soCua("truong-nam", M2)) ?? 0)).toBe(2);
			const sai = await quyet(id.tenMt, "bo-qua", "truong");
			const loi = sai.status === 200 ? "cach khong hop loai: viet-lai" : "ok";
			expect(loi).toBe("ok");
		},
		CHO_DB,
	);

	test(
		"hai truy vấn đường đo của design doc chạy nguyên văn",
		async () => {
			const doc = readFileSync(
				join(
					import.meta.dir,
					"../../../docs/superpowers/specs/2026-10-03-gop-y-dung-cho-design.md",
				),
				"utf8",
			);
			const khoi = [...doc.matchAll(/```sql\n([\s\S]*?)```/g)].flatMap((m) =>
				(m[1] ?? "")
					.split(/;\s*(?:\n|$)/)
					.map((cau) => cau.trim())
					.filter((cau) => /\bSELECT\b/i.test(cau)),
			);
			const veHai = khoi.find((k) => k.includes("cap_muc_tieu")) ?? "";
			const moc = khoi.find((k) => k.includes("Mốc (vế CHẾT)")) ?? "";
			expect(veHai.length > 0 && moc.length > 0).toBe(true);
			const goc = id2.hoi;
			const t = (s: string) => new Date(s);
			await clone(goc, {
				keyResultId: M1K3,
				trangThai: "bac",
				createdAt: t("2030-01-10T00:00:00Z"),
				quyetLuc: t("2030-02-05T00:00:00Z"),
			});
			await clone(goc, {
				keyResultId: null,
				trangThai: "bo-qua",
				createdAt: t("2030-01-12T00:00:00Z"),
				quyetLuc: t("2030-01-20T00:00:00Z"),
			});
			await clone(goc, {
				keyResultId: null,
				trangThai: "cho",
				createdAt: t("2030-01-14T00:00:00Z"),
				quyetLuc: null,
			});
			const chay = (sql: string, ngay: string) =>
				db.$queryRawUnsafe<Record<string, unknown>[]>(
					sql.replaceAll(":ngay_len", `'${ngay}'::timestamptz`),
				);
			const tiLe = await chay(veHai, "2030-01-01T00:00:00Z");
			const theoNhom = Object.fromEntries(
				tiLe.map((r) => [String(r.cap_muc_tieu), Number(Object.values(r)[1])]),
			);
			expect(theoNhom).toEqual({ true: 1, false: 1 });
			const mocRa = await chay(moc, "2030-02-01T00:00:00Z");
			expect(Number(Object.values(mocRa[0] ?? {})[0])).toBeCloseTo(2 / 3, 5);
		},
		CHO_DB,
	);
});
