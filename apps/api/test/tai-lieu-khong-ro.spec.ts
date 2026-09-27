import { beforeAll, describe, expect, test } from "bun:test";
import { LOAI_TRANG, type LoaiTrang } from "@crm/validation/tai-lieu";
import {
	AI,
	type Ai,
	deXuat,
	dungSan,
	duyetQuaDb,
	hoi,
	ok,
	type TraLoi,
	taoTrang,
	traLaiQuaDb,
} from "./tai-lieu-san";

dungSan();

const TRANG_THAI = ["S1", "S2", "S3", "S4", "S5"] as const;
type TrangThai = (typeof TRANG_THAI)[number];

const LOAI_CUA = {
	S1: "quy-dinh",
	S2: "chinh-sach",
	S3: "quy-trinh",
	S4: "bieu-mau",
	S5: "quy-dinh",
} satisfies Record<TrangThai, LoaiTrang>;

const MOI_NGUOI = AI;
const NGUOI_DUYET_VA_TAO = ["tao", "chu", "owner", "admin"] as const;

const THAY_TRANG = {
	S1: NGUOI_DUYET_VA_TAO,
	S2: NGUOI_DUYET_VA_TAO,
	S3: MOI_NGUOI,
	S4: MOI_NGUOI,
	S5: MOI_NGUOI,
} satisfies Record<TrangThai, readonly Ai[]>;

type Dong = { slug: string };
type DanhSach = {
	rows: Dong[];
	total: number;
	facetCounts: Record<LoaiTrang, number>;
};

const slugCua = {} as Record<TrangThai, string>;
const nenCua = {} as Record<Ai, DanhSach>;

function in1(dong: string): void {
	process.stdout.write(`khong-ro: ${dong}\n`);
}

async function toanBo(ai: Ai): Promise<DanhSach> {
	const dau = ok<DanhSach>(
		await hoi("taiLieu.list", { page: 1 }, ai),
		`list ${ai}`,
	);
	const rows = [...dau.rows];
	for (let page = 2; rows.length < dau.total; page += 1) {
		const tiep = ok<DanhSach>(
			await hoi("taiLieu.list", { page }, ai),
			`list ${ai} trang ${page}`,
		);
		if (tiep.rows.length === 0) break;
		rows.push(...tiep.rows);
	}
	return { ...dau, rows };
}

async function gieo(trangThai: TrangThai): Promise<string> {
	const ten = `Không rò ${trangThai} ${Date.now().toString(36)}`;
	const { slug, deXuatId } = await taoTrang(
		ten,
		`Nội dung ${trangThai}.`,
		"tao",
		"chu",
		LOAI_CUA[trangThai],
	);
	const tao = (await hoi("taiLieu.get", { slug }, "tao")).status;
	expect(`${trangThai} tao thay trang vua tao: ${tao}`).toBe(
		`${trangThai} tao thay trang vua tao: 200`,
	);
	if (trangThai === "S2") await traLaiQuaDb(deXuatId, "chu");
	if (trangThai === "S1" || trangThai === "S2") return slug;
	await duyetQuaDb(deXuatId, "chu");
	if (trangThai === "S3") return slug;
	const moi = await deXuat(slug, `Nội dung ${trangThai} sửa.`, "tao");
	if (trangThai === "S5") await traLaiQuaDb(moi, "chu");
	return slug;
}

beforeAll(async () => {
	for (const ai of AI) nenCua[ai] = await toanBo(ai);
	for (const s of TRANG_THAI) slugCua[s] = await gieo(s);
});

function thay(bang: Record<TrangThai, readonly Ai[]>, ai: Ai, s: TrangThai) {
	return (bang[s] as readonly Ai[]).includes(ai);
}

function cungKhongCo(g: TraLoi, khongCo: TraLoi): boolean {
	return g.status === khongCo.status && g.loi === khongCo.loi;
}

describe("khong-ro", () => {
	test("khong-ro: list va get theo ma tran sau nguoi x nam trang thai", async () => {
		const khongCo = await hoi("taiLieu.get", { slug: "khong-co-that" }, "tao");
		expect(khongCo.status).toBe(404);
		const sai: string[] = [];
		for (const ai of AI) {
			const ds = await toanBo(ai);
			const nen = nenCua[ai];
			let tangTong = 0;
			const tangLoai = {
				"quy-dinh": 0,
				"chinh-sach": 0,
				"quy-trinh": 0,
				"bieu-mau": 0,
			} satisfies Record<LoaiTrang, number>;
			for (const s of TRANG_THAI) {
				const mong = thay(THAY_TRANG, ai, s);
				if (mong) {
					tangTong += 1;
					tangLoai[LOAI_CUA[s]] += 1;
				}
				const trongDs = ds.rows.some((r) => r.slug === slugCua[s]);
				in1(`${ai} x ${s} x list -> ${trongDs ? "thay" : "khong"}`);
				if (trongDs !== mong)
					sai.push(`${mong ? "thieu" : "ro"} trang: ${ai} x ${s} (list)`);
				const g = await hoi("taiLieu.get", { slug: slugCua[s] }, ai);
				in1(`${ai} x ${s} x get -> ${g.status}`);
				if (mong && g.status !== 200)
					sai.push(`thieu trang: ${ai} x ${s} (get ${g.status})`);
				if (!mong && !cungKhongCo(g, khongCo))
					sai.push(`ro trang: ${ai} x ${s} (get ${g.status} ${g.loi})`);
			}
			if (ds.total !== nen.total + tangTong)
				sai.push(`total ${ai}: ${ds.total} != ${nen.total} + ${tangTong}`);
			for (const loai of LOAI_TRANG) {
				const mong = nen.facetCounts[loai] + tangLoai[loai];
				if (ds.facetCounts[loai] !== mong)
					sai.push(`facet ${ai} ${loai}: ${ds.facetCounts[loai]} != ${mong}`);
			}
		}
		expect(sai).toEqual([]);
	});

	test("khong-ro: ban dang dung doc duoc voi moi nguoi, du lieu khong lo noi dung de xuat", async () => {
		for (const ai of AI) {
			for (const s of ["S3", "S4", "S5"] as const) {
				const g = ok<{ noiDung: string | null }>(
					await hoi("taiLieu.get", { slug: slugCua[s] }, ai),
					`${ai} ${s}`,
				);
				expect(`${ai} x ${s}: ${g.noiDung}`).toBe(
					`${ai} x ${s}: Nội dung ${s}.`,
				);
			}
		}
	});
});
