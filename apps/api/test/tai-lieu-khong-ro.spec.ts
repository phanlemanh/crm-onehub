import { beforeAll, describe, expect, test } from "bun:test";
import { LOAI_TRANG, type LoaiTrang } from "@crm/validation/tai-lieu";
import {
	AI,
	type Ai,
	deXuat,
	dungSan,
	duyet,
	hoi,
	ok,
	TAI_LIEU_SAN,
	type TraLoi,
	taoTrang,
	traLai,
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

const THAY_DE_XUAT = {
	S1: NGUOI_DUYET_VA_TAO,
	S2: NGUOI_DUYET_VA_TAO,
	S3: [],
	S4: NGUOI_DUYET_VA_TAO,
	S5: NGUOI_DUYET_VA_TAO,
} satisfies Record<TrangThai, readonly Ai[]>;

const DUYET_DUOC = ["chu", "owner", "admin"] as const;
const CO_BAN_CHO = ["S1", "S4"] as const;
const BI_TRA_LAI = ["S2", "S5"] as const;

type HangCho = { rows: { id: string }[]; choToiDuyet: number };
type DeXuatDoc = { noiDung: string; lyDo: string | null; trangThai: string };

type Dong = { slug: string };
type DanhSach = {
	rows: Dong[];
	total: number;
	facetCounts: Record<LoaiTrang, number>;
};

const slugCua = {} as Record<TrangThai, string>;
const nenCua = {} as Record<Ai, DanhSach>;
const deXuatCua = {} as Record<TrangThai, { id: string; noiDung: string }>;
const daDuyetS3 = { id: "" };
const nenCho = {} as Record<Ai, number>;

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
	const noiDungDau = `Nội dung ${trangThai}.`;
	const noiDungSua = `Nội dung ${trangThai} sửa.`;
	const ten = `Không rò ${trangThai} ${Date.now().toString(36)}`;
	const { slug, deXuatId } = await taoTrang(
		ten,
		noiDungDau,
		"tao",
		"chu",
		LOAI_CUA[trangThai],
	);
	const tao = (await hoi("taiLieu.get", { slug }, "tao")).status;
	expect(`${trangThai} tao thay trang vua tao: ${tao}`).toBe(
		`${trangThai} tao thay trang vua tao: 200`,
	);
	if (trangThai === "S2") await traLai(deXuatId, "chu");
	if (trangThai === "S1" || trangThai === "S2") {
		deXuatCua[trangThai] = { id: deXuatId, noiDung: noiDungDau };
		return slug;
	}
	await duyet(deXuatId, "chu");
	if (trangThai === "S3") {
		daDuyetS3.id = deXuatId;
		return slug;
	}
	const moi = await deXuat(slug, noiDungSua, "tao");
	if (trangThai === "S5") await traLai(moi, "chu");
	deXuatCua[trangThai] = { id: moi, noiDung: noiDungSua };
	return slug;
}

beforeAll(async () => {
	for (const ai of AI) nenCua[ai] = await toanBo(ai);
	for (const ai of AI)
		nenCho[ai] = ok<HangCho>(
			await hoi("taiLieu.proposals", undefined, ai),
			`proposals ${ai}`,
		).choToiDuyet;
	for (const s of TRANG_THAI) slugCua[s] = await gieo(s);
}, TAI_LIEU_SAN.hookMs);

function thay(bang: Record<TrangThai, readonly Ai[]>, ai: Ai, s: TrangThai) {
	return (bang[s] as readonly Ai[]).includes(ai);
}

function cungKhongCo(g: TraLoi, khongCo: TraLoi): boolean {
	return g.status === khongCo.status && g.loi === khongCo.loi;
}

async function kiemDeXuat(
	ai: Ai,
	s: TrangThai,
	idTrongHang: ReadonlySet<string>,
	khongCo: TraLoi,
): Promise<string[]> {
	const sai: string[] = [];
	const dx = deXuatCua[s];
	const mong = thay(THAY_DE_XUAT, ai, s);
	const trongHang = idTrongHang.has(dx.id);
	in1(`${ai} x ${s} x proposals -> ${trongHang ? "thay" : "khong"}`);
	if (trongHang !== mong)
		sai.push(`${mong ? "thieu" : "ro"} de xuat: ${ai} x ${s} (proposals)`);
	const p = await hoi("taiLieu.proposal", { id: dx.id }, ai);
	in1(`${ai} x ${s} x proposal -> ${p.status}`);
	if (mong) {
		const doc = p.status === 200 ? (p.data as DeXuatDoc) : null;
		if (doc?.noiDung !== dx.noiDung)
			sai.push(`thieu de xuat: ${ai} x ${s} (proposal ${p.status})`);
		const coLyDo = (BI_TRA_LAI as readonly string[]).includes(s);
		if (coLyDo && !doc?.lyDo) sai.push(`thieu ly do: ${ai} x ${s}`);
	} else if (!cungKhongCo(p, khongCo)) {
		sai.push(`ro de xuat: ${ai} x ${s} (proposal ${p.status} ${p.loi})`);
	}
	if (!thay(THAY_TRANG, ai, s)) return sai;
	const g = ok<{ coBanCho: boolean }>(
		await hoi("taiLieu.get", { slug: slugCua[s] }, ai),
		`get ${ai} ${s}`,
	);
	const mongCho = mong && (CO_BAN_CHO as readonly string[]).includes(s);
	in1(`${ai} x ${s} x coBanCho -> ${g.coBanCho}`);
	if (g.coBanCho !== mongCho)
		sai.push(`${mongCho ? "thieu" : "ro"} de xuat: ${ai} x ${s} (coBanCho)`);
	return sai;
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
				"chien-luoc": 0,
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

	test("khong-ro: proposals, proposal va coBanCho theo ma tran sau nguoi x nam trang thai", async () => {
		const khongCo = await hoi(
			"taiLieu.proposal",
			{ id: "khong-co-that" },
			"tao",
		);
		expect(khongCo.status).toBe(404);
		const sai: string[] = [];
		for (const ai of AI) {
			const hang = ok<HangCho>(
				await hoi("taiLieu.proposals", undefined, ai),
				`proposals ${ai}`,
			);
			const idTrongHang = new Set(hang.rows.map((r) => r.id));
			if (idTrongHang.has(daDuyetS3.id))
				sai.push(`ro de xuat: ${ai} x S3 (ban da duyet con trong hang)`);
			in1(
				`${ai} x S3 x proposals -> ${idTrongHang.has(daDuyetS3.id) ? "co" : "rong"}`,
			);
			for (const s of TRANG_THAI) {
				if (s === "S3") continue;
				sai.push(...(await kiemDeXuat(ai, s, idTrongHang, khongCo)));
			}
			const tangCho = (DUYET_DUOC as readonly Ai[]).includes(ai)
				? CO_BAN_CHO.length
				: 0;
			in1(`${ai} x choToiDuyet -> ${hang.choToiDuyet - nenCho[ai]}`);
			if (hang.choToiDuyet !== nenCho[ai] + tangCho)
				sai.push(
					`dem cho duyet ${ai}: ${hang.choToiDuyet} != ${nenCho[ai]} + ${tangCho}`,
				);
		}
		expect(sai).toEqual([]);
	});
});
