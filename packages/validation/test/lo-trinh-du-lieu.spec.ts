import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { docDuLieu } from "../../../apps/app/lib/lo-trinh/doc-du-lieu.js";
import {
	KHOA_LO_TRINH_DU_LIEU,
	loTrinhDuLieu,
	phanTichLoTrinh,
} from "../src/lo-trinh-du-lieu";

const hang = {
	ma: "LT1",
	cau_giao: "«x»",
	hang: "T2",
	nhom: "crm-chung",
	dung_tren: [],
	trang_thai: "Chưa mở",
	nhom_trang_thai: "chua-bat-dau",
	ho_so: null,
	theo_loi: false,
	co: [],
	bat_khi: "",
	vi_sao: "",
};
const goc = {
	khuon: "lo-trinh-du-lieu",
	phien_ban: 1,
	nguon: ["a.json"],
	ngoai_lo_trinh: [],
	lo_trinh: [
		{
			tep: "a.json",
			ten: "OKR",
			loi: null,
			hang_ke: null,
			can_sua: [],
			tien_do: { tong: 1, da_giao: 0, dang_lam: 0, chua_bat_dau: 1, khac: 0 },
			hang: [hang],
			moc: [],
			da_bac: [],
		},
	],
};

describe("lo-trinh-du-lieu", () => {
	test("doc khoi dung khuon", () => {
		expect(phanTichLoTrinh(goc)).toEqual({
			ok: true,
			duLieu: loTrinhDuLieu.parse(goc),
		});
	});
	test("sai kieu tra duong khoa", () => {
		const hong = { ...goc, lo_trinh: [{ ...goc.lo_trinh[0], hang: "x" }] };
		const kq = phanTichLoTrinh(hong);
		expect(kq.ok).toBe(false);
		if (!kq.ok) expect(kq.duongKhoa).toBe("lo_trinh.0.hang");
	});
	test("khoa la bi bo, khong vo", () => {
		const kq = phanTichLoTrinh({ ...goc, la: 1 });
		expect(kq.ok).toBe(true);
	});
	test("bang khoa du muoi bon cap cua ban 2 co gio may", () => {
		expect(Object.keys(KHOA_LO_TRINH_DU_LIEU).sort()).toEqual([
			"can_sua",
			"chu_kho",
			"da_bac",
			"du_kien",
			"gio_may",
			"gio_may_moc",
			"goc",
			"hang",
			"hang_ke",
			"lo_trinh",
			"moc",
			"moi_nguoi",
			"tien_do",
			"tom_tat",
		]);
	});
	test("hang thieu tom_tat doc thanh null", () => {
		const kq = phanTichLoTrinh(goc);
		expect(kq.ok).toBe(true);
		if (kq.ok)
			for (const lo of kq.duLieu.lo_trinh)
				for (const h of lo.hang) expect(h.tom_tat).toBeNull();
	});
});

const CAP = [
	"goc",
	"lo_trinh",
	"hang_ke",
	"can_sua",
	"tien_do",
	"hang",
	"moc",
	"da_bac",
	"tom_tat",
	"moi_nguoi",
	"chu_kho",
	"gio_may",
	"gio_may_moc",
	"du_kien",
] as const;
type Cap = (typeof CAP)[number];
type BangKhoa = Record<Cap, readonly string[]>;

const GOC_KHO = join(import.meta.dir, "..", "..", "..");
const HTML_THAT = readFileSync(join(GOC_KHO, "LO-TRINH.html"), "utf8");
const json = z.record(z.string(), z.json());
type Json = z.infer<typeof json>;
const danhSach = z.array(json);
const boc = (khoi: Json) =>
	`<script type="application/json" id="lo-trinh-du-lieu">${JSON.stringify(khoi)}</script>`;
const con = (o: Json, k: string): Json => json.parse(o[k]);
const dau = (o: Json, k: string): Json => {
	const x = danhSach.parse(o[k])[0];
	if (!x) throw new Error(`mang ${k} rong`);
	return x;
};

function khoaBoDoc(): BangKhoa {
	const g = json.parse(
		docDuLieu(
			boc({
				khuon: "lo-trinh-du-lieu",
				phien_ban: 2,
				lo_trinh: [
					{
						hang_ke: {},
						can_sua: [{}],
						tien_do: {},
						hang: [{ tom_tat: { moi_nguoi: {}, chu_kho: {} }, gio_may: {} }],
						moc: [{ gio_may: {}, du_kien: {} }],
						da_bac: [{}],
					},
				],
			}),
		).duLieu,
	);
	const lo = dau(g, "lo_trinh");
	const h = dau(lo, "hang");
	const m = dau(lo, "moc");
	const tt = con(h, "tom_tat");
	return {
		goc: Object.keys(g),
		lo_trinh: Object.keys(lo),
		hang_ke: Object.keys(con(lo, "hang_ke")),
		can_sua: Object.keys(dau(lo, "can_sua")),
		tien_do: Object.keys(con(lo, "tien_do")),
		hang: Object.keys(h),
		moc: Object.keys(m),
		da_bac: Object.keys(dau(lo, "da_bac")),
		tom_tat: Object.keys(tt),
		moi_nguoi: Object.keys(con(tt, "moi_nguoi")),
		chu_kho: Object.keys(con(tt, "chu_kho")),
		gio_may: Object.keys(con(h, "gio_may")),
		gio_may_moc: Object.keys(con(m, "gio_may")),
		du_kien: Object.keys(con(m, "du_kien")),
	};
}

function kiemBangKhoa(bang: BangKhoa): number {
	const doc = khoaBoDoc();
	let so = 0;
	for (const cap of CAP) {
		const a = [...doc[cap]].sort();
		const b = [...bang[cap]].sort();
		const lech = [
			...a.filter((x) => !b.includes(x)),
			...b.filter((x) => !a.includes(x)),
		];
		if (lech.length)
			throw new Error(`cap ${cap} lech bo doc: ${lech.join(", ")}`);
		so++;
	}
	return so;
}

const khoiTho = z.object({
	lo_trinh: z.array(
		z.looseObject({
			hang: z.array(
				z.looseObject({ ma: z.string(), gio_may: z.json().optional() }),
			),
			moc: z.array(
				z.looseObject({
					ten: z.string(),
					gio_may: z.json().optional(),
					du_kien: z.json().optional(),
					qua_tai: z.json().optional(),
				}),
			),
		}),
	),
});
type KhoiTho = z.infer<typeof khoiTho>;
const giaTri = z.json().optional();
type GiaTri = z.infer<typeof giaTri>;
const giong = (a: GiaTri, b: GiaTri) =>
	JSON.stringify(a ?? null) === JSON.stringify(b ?? null);

function khoiThat(): Json {
	return json.parse(docDuLieu(HTML_THAT).duLieu);
}

function kiemGiuKhoa(phan: typeof phanTichLoTrinh, khoi: Json): void {
	const tho: KhoiTho = khoiTho.parse(khoi);
	const kq = phan(khoi);
	if (!kq.ok) throw new Error(`khoi that lech khuon: ${kq.duongKhoa}`);
	kq.duLieu.lo_trinh.forEach((lo, i) => {
		const lt = tho.lo_trinh[i];
		lt?.hang.forEach((h, j) => {
			if (!giong(lo.hang[j]?.gio_may, h.gio_may))
				throw new Error(`gio may cua viec mat khi qua khuon: ${h.ma}`);
		});
		lt?.moc.forEach((m, j) => {
			const x = lo.moc[j];
			for (const khoa of ["gio_may", "du_kien", "qua_tai"] as const)
				if (!giong(x?.[khoa], m[khoa]))
					throw new Error(`${khoa} cua moc mat khi qua khuon: ${m.ten}`);
		});
	});
}

describe("gio-may", () => {
	test("gio-may: bang khoa cua khuon bang bang khoa cua bo doc o ca 14 cap", () => {
		expect(CAP.length).toBe(14);
		expect(Object.keys(KHOA_LO_TRINH_DU_LIEU).length).toBe(14);
		expect(kiemBangKhoa(KHOA_LO_TRINH_DU_LIEU)).toBe(14);
	});
	test("gio-may: pha-thu — khuon bo du_kien khoi moc thi do", () => {
		const hong = {
			...KHOA_LO_TRINH_DU_LIEU,
			moc: KHOA_LO_TRINH_DU_LIEU.moc.filter((k) => k !== "du_kien"),
		};
		expect(() => kiemBangKhoa(hong)).toThrow("cap moc lech bo doc: du_kien");
	});
	test("gio-may: khoi that qua khuon giu nguyen bon khoa", () => {
		const khoi = khoiThat();
		const coNgay = khoiTho
			.parse(khoi)
			.lo_trinh.some((lo) => lo.moc.some((m) => m.du_kien != null));
		expect(coNgay).toBe(true);
		expect(() => kiemGiuKhoa(phanTichLoTrinh, khoi)).not.toThrow();
	});
	test("gio-may: pha-thu — khuon lot gio may cua viec thi do", () => {
		const khoi = khoiThat();
		const hong: typeof phanTichLoTrinh = (gt) => {
			const kq = phanTichLoTrinh(gt);
			if (!kq.ok) return kq;
			for (const lo of kq.duLieu.lo_trinh)
				for (const h of lo.hang) h.gio_may = null;
			return kq;
		};
		const ma = khoiTho.parse(khoi).lo_trinh[0]?.hang[0]?.ma;
		expect(() => kiemGiuKhoa(hong, khoi)).toThrow(
			`gio may cua viec mat khi qua khuon: ${ma}`,
		);
	});
	test("gio-may: khoi khong mang bon khoa doc ra null o moi phan tu", () => {
		const tho = khoiTho.parse(khoiThat());
		for (const lo of tho.lo_trinh) {
			for (const h of lo.hang) delete h.gio_may;
			for (const m of lo.moc) {
				delete m.gio_may;
				delete m.du_kien;
				delete m.qua_tai;
			}
		}
		const kq = phanTichLoTrinh({ ...khoiThat(), lo_trinh: tho.lo_trinh });
		expect(kq.ok).toBe(true);
		if (!kq.ok) return;
		for (const lo of kq.duLieu.lo_trinh) {
			for (const h of lo.hang) expect(h.gio_may).toBeNull();
			for (const m of lo.moc) {
				expect(m.gio_may).toBeNull();
				expect(m.du_kien).toBeNull();
				expect(m.qua_tai).toBeNull();
				expect(m.hoanTatHopLe).toBeNull();
			}
		}
	});
});
