import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
	mkdirSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
} from "node:fs";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";

const { z } = createRequire(
	join(
		resolve(import.meta.dir, "..", "..", ".."),
		"apps",
		"agent",
		"package.json",
	),
)("zod") as typeof import("zod");
const NGAY_MS = 24 * 60 * 60 * 1000;

export const CHAM_BO_DO = {
	hanDungLaiMs: 7 * NGAY_MS,
	giuLuot: 10,
	banGhi: "_acceptance/tro-ly-doc-kho/evidence/cham-bo-do.md",
	evals: "_acceptance/tro-ly-doc-kho/evals.yaml",
	idEval: "E15",
	phamViThem: [
		"apps/agent/agent/**",
		"bun.lock",
		"_acceptance/tro-ly-doc-kho/rang/quyet-do.ts",
	],
	mocBanGhi: { mo: "<!-- ban-ghi-e15 -->", dong: "<!-- /ban-ghi-e15 -->" },
	nguong: {
		dungTrang: 0.8,
		tuChoiDung: 0.8,
		chuyenQuyDinh: 0.9,
		chuyenNhamToiDa: 0.1,
		traLoiKhongQuaKiem: 0,
	},
	lenhGhi: "bun _acceptance/tro-ly-doc-kho/rang/cham-bo-do.ts --ghi-ban-ghi",
} as const;

export type NhomCau =
	| "co-trang"
	| "khong-co"
	| "khong-dau"
	| "khong-phai-quy-dinh";
export type KetCucMot =
	| "khong-co-ket-qua"
	| "LOI"
	| "TRA_LOI-du"
	| "TRA_LOI-sai"
	| "TU_CHOI";
export type NhanMot = "dung-trang" | "tu-choi-dung" | "sai" | "loi";
export type KetCucHai = "loi" | "co-hang" | "khong-hang";
export type NhanHai = "chuyen" | "khong-chuyen" | "loi";
export type ChiSo = "dungTrang" | "tuChoiDung" | "chuyenQuyDinh" | "chuyenNham";
export type Chieu = ">=" | "<=";
export type Dem = { k: number; n: number };

export function nhanMotCau(nhom: NhomCau, ketCuc: KetCucMot): NhanMot {
	if (ketCuc === "khong-co-ket-qua" || ketCuc === "LOI") return "loi";
	if (nhom === "khong-co") return ketCuc === "TU_CHOI" ? "tu-choi-dung" : "sai";
	return ketCuc === "TRA_LOI-du" ? "dung-trang" : "sai";
}

export function nhanHaiCau(ketCuc: KetCucHai): NhanHai {
	if (ketCuc === "loi") return "loi";
	return ketCuc === "co-hang" ? "chuyen" : "khong-chuyen";
}

export type CauMot = { id: string; nhom: NhomCau; nhan: string };
export type CauHai = { id: string; quyDinh: boolean; nhan: string };
export type Nguong = typeof CHAM_BO_DO.nguong;

const CHIEU = {
	dungTrang: ">=",
	tuChoiDung: ">=",
	chuyenQuyDinh: ">=",
	chuyenNham: "<=",
} as const satisfies Record<ChiSo, Chieu>;
const CAC_CHI_SO = [
	"dungTrang",
	"tuChoiDung",
	"chuyenQuyDinh",
	"chuyenNham",
] as const satisfies readonly ChiSo[];
export type DemTheoChiSo = Record<ChiSo, Dem>;

export const phanTram = (x: number) => `${(x * 100).toFixed(1)}%`;
const tiLe = (d: Dem) => (d.n === 0 ? null : d.k / d.n);

export function vungXam(
	k: number,
	n: number,
	t: number,
	chieu: Chieu,
): "dat" | "xam" | "khong-dat" {
	if (n === 0) return "dat";
	const r = k / n;
	const se = Math.sqrt((t * (1 - t)) / n);
	if (chieu === ">=") return r >= t ? "dat" : r >= t - se ? "xam" : "khong-dat";
	return r <= t ? "dat" : r <= t + se ? "xam" : "khong-dat";
}

export type KetGop = { dat: boolean; dong: string; hoiLanBa: false };
export type QuyetDinh = { dungLai: boolean; dong: string };

export type KetLuan = {
	ma: 0 | 1 | 2;
	dong: string[];
	so: DemTheoChiSo;
	traLoiKhongQuaKiem: number;
	xam: ChiSo[];
};

function nguongCua(c: ChiSo, nguong: Nguong): number {
	return c === "chuyenNham" ? nguong.chuyenNhamToiDa : nguong[c];
}

export function ketLuan(
	mot: readonly CauMot[],
	hai: readonly CauHai[],
	nguong: Nguong,
	traLoiKhongQuaKiem = 0,
): KetLuan {
	const loi = [
		...mot.filter((c) => c.nhan === "loi").map((c) => c.id),
		...hai.filter((c) => c.nhan === "loi").map((c) => c.id),
	];
	const dem = (ds: readonly { nhan: string }[], nhan: string): Dem => {
		const sach = ds.filter((c) => c.nhan !== "loi");
		return { k: sach.filter((c) => c.nhan === nhan).length, n: sach.length };
	};
	const so = {
		dungTrang: dem(
			mot.filter((c) => c.nhom !== "khong-co"),
			"dung-trang",
		),
		tuChoiDung: dem(
			mot.filter((c) => c.nhom === "khong-co"),
			"tu-choi-dung",
		),
		chuyenQuyDinh: dem(
			hai.filter((c) => c.quyDinh),
			"chuyen",
		),
		chuyenNham: dem(
			hai.filter((c) => !c.quyDinh),
			"chuyen",
		),
	} satisfies DemTheoChiSo;
	if (loi.length > 0)
		return {
			ma: 2,
			dong: [`KHONG DO DUOC: ${loi.length} cau loi (${loi.join(", ")})`],
			so,
			traLoiKhongQuaKiem,
			xam: [],
		};
	const chiSo = CAC_CHI_SO;
	const nhan = new Map(
		chiSo.map((c) => [
			c,
			vungXam(so[c].k, so[c].n, nguongCua(c, nguong), CHIEU[c]),
		]),
	);
	const dong = chiSo.map((c) => {
		const r = tiLe(so[c]);
		return `${c}: ${r === null ? "—" : phanTram(r)} (${so[c].k}/${so[c].n}, nguong ${CHIEU[c]} ${phanTram(nguongCua(c, nguong))}) ${nhan.get(c)}`;
	});
	const kiemDat = traLoiKhongQuaKiem === nguong.traLoiKhongQuaKiem;
	dong.push(`tra loi co trich khong qua kiem: ${traLoiKhongQuaKiem}`);
	const xam = chiSo.filter((c) => nhan.get(c) === "xam");
	const dat = kiemDat && chiSo.every((c) => nhan.get(c) === "dat");
	return {
		ma: dat ? 0 : 1,
		dong,
		so,
		traLoiKhongQuaKiem,
		xam: kiemDat ? xam : [],
	};
}

export function keHoachHoiLai(
	kl: KetLuan,
	mot: readonly CauMot[],
	hai: readonly CauHai[],
): { chiSo: ChiSo; ids: string[] }[] {
	if (kl.ma === 2) return [];
	const cua = {
		dungTrang: mot.filter((c) => c.nhom !== "khong-co").map((c) => c.id),
		tuChoiDung: mot.filter((c) => c.nhom === "khong-co").map((c) => c.id),
		chuyenQuyDinh: hai.filter((c) => c.quyDinh).map((c) => c.id),
		chuyenNham: hai.filter((c) => !c.quyDinh).map((c) => c.id),
	} satisfies Record<ChiSo, string[]>;
	return kl.xam.map((chiSo) => ({ chiSo, ids: cua[chiSo] }));
}

export function gop(l1: Dem, l2: Dem, t: number, chieu: Chieu): KetGop {
	const g = { k: l1.k + l2.k, n: l1.n + l2.n };
	const r = g.n === 0 ? 0 : g.k / g.n;
	const dat = chieu === ">=" ? r >= t : r <= t;
	const t1 = l1.n === 0 ? 0 : l1.k / l1.n;
	const t2 = l2.n === 0 ? 0 : l2.k / l2.n;
	return {
		dat,
		dong: `luot 1 ${phanTram(t1)} · luot 2 ${phanTram(t2)} · gop ${phanTram(r)} (${g.k}/${g.n}, nguong ${chieu} ${phanTram(t)}) ${dat ? "dat" : "KHONG DAT"}`,
		hoiLanBa: false,
	};
}

export type TepBam = { duong: string; noiDung: string };
export type ModelIds = { kho: string; goc: string };

export function bamDauVao(tep: readonly TepBam[], modelIds: ModelIds): string {
	const h = createHash("sha256");
	for (const t of [...tep]
		.filter((x) => x.duong !== CHAM_BO_DO.banGhi)
		.sort((a, b) => a.duong.localeCompare(b.duong))) {
		h.update(`${t.duong}\0${t.noiDung}\0`);
	}
	h.update(`model:kho=${modelIds.kho}\0goc=${modelIds.goc}`);
	return h.digest("hex").slice(0, 16);
}

function pathsCuaE15(goc: string): string[] {
	const yaml = readFileSync(join(goc, CHAM_BO_DO.evals), "utf8");
	const khoi = yaml
		.split(/\n {2}- id: /)
		.find((k) => k.startsWith(`${CHAM_BO_DO.idEval}\n`));
	if (!khoi)
		throw new Error(
			`khong thay ${CHAM_BO_DO.idEval} trong ${CHAM_BO_DO.evals}`,
		);
	const phan = khoi.split(/\n {4}paths:\n/)[1] ?? "";
	return [...phan.matchAll(/^ {6}- "([^"]+)"$/gm)].map((m) => m[1] ?? "");
}

export function phamViBam(goc: string): string[] {
	const tat = spawnSync("git", ["ls-files"], { cwd: goc, encoding: "utf8" })
		.stdout.split("\n")
		.filter(Boolean);
	const mau = [...pathsCuaE15(goc), ...CHAM_BO_DO.phamViThem].map(
		(m) => new Bun.Glob(m),
	);
	return tat
		.filter((t) => t !== CHAM_BO_DO.banGhi && mau.some((g) => g.match(t)))
		.sort();
}

export function tepBam(goc: string, tepBo: string): TepBam[] {
	const ds = new Set(phamViBam(goc));
	ds.add(tepBo);
	return [...ds].map((duong) => ({
		duong,
		noiDung: readFileSync(join(goc, duong), "utf8"),
	}));
}

const khuonBanGhi = z.object({
	bam: z.string().min(1),
	doLuc: z.string().datetime(),
	dat: z.boolean(),
	modelIds: z.object({ kho: z.string().min(1), goc: z.string().min(1) }),
});
export type BanGhi = z.infer<typeof khuonBanGhi>;

export function ghiBanGhi(o: {
	bam: string;
	doLuc: Date;
	dat: boolean;
	modelIds: ModelIds;
	than: string;
}): string {
	const khoi: BanGhi = {
		bam: o.bam,
		doLuc: o.doLuc.toISOString(),
		dat: o.dat,
		modelIds: o.modelIds,
	};
	return `${CHAM_BO_DO.mocBanGhi.mo}\n${JSON.stringify(khoi)}\n${CHAM_BO_DO.mocBanGhi.dong}\n\n${o.than}\n`;
}

export function docBanGhi(md: string): BanGhi | null {
	const { mo, dong } = CHAM_BO_DO.mocBanGhi;
	const a = md.indexOf(mo);
	const b = md.indexOf(dong);
	if (a < 0 || b < a) return null;
	try {
		const v = khuonBanGhi.safeParse(
			JSON.parse(md.slice(a + mo.length, b).trim()),
		);
		return v.success ? v.data : null;
	} catch {
		return null;
	}
}

export function docBanGhiHead(goc: string, duong: string): string | null {
	const r = spawnSync("git", ["show", `HEAD:${duong}`], {
		cwd: goc,
		encoding: "utf8",
	});
	return r.status === 0 ? r.stdout : null;
}

export function quyetDungLai(
	banGhi: BanGhi | null,
	bam: string,
	now: Date,
	o: { doLai: boolean },
): QuyetDinh {
	if (o.doLai) return { dungLai: false, dong: "DO MOI: --do-lai" };
	if (!banGhi) return { dungLai: false, dong: "DO MOI: chua co ban ghi" };
	if (banGhi.bam !== bam) return { dungLai: false, dong: "DO MOI: bam doi" };
	if (
		now.getTime() - new Date(banGhi.doLuc).getTime() >
		CHAM_BO_DO.hanDungLaiMs
	)
		return { dungLai: false, dong: "DO MOI: qua han 7 ngay" };
	if (!banGhi.dat)
		return { dungLai: false, dong: "DO MOI: lan truoc khong dat" };
	return {
		dungLai: true,
		dong: `DUNG LAI ${bam}, do ngay ${banGhi.doLuc.slice(0, 10)}`,
	};
}

export function moThuMucLuot(goc: string, now: Date, pid: number): string {
	const d = join(goc, `${now.toISOString().replace(/[:.]/g, "-")}-${pid}`);
	mkdirSync(d, { recursive: true });
	return d;
}

export function donLuotCu(goc: string, giu: number): void {
	const ds = readdirSync(goc)
		.filter((t) => statSync(join(goc, t)).isDirectory())
		.sort();
	for (const t of ds.slice(0, Math.max(0, ds.length - giu)))
		rmSync(join(goc, t), { recursive: true, force: true });
}

export type GoiDo = (vai: "kho" | "goc") => Promise<{ modelId: string }>;

export async function doModel(
	goi: GoiDo,
): Promise<{ ma: 0; ids: ModelIds } | { ma: 2; dong: string }> {
	const ids: Partial<ModelIds> = {};
	for (const vai of ["kho", "goc"] as const) {
		try {
			const { modelId } = await goi(vai);
			if (!modelId?.trim())
				return {
					ma: 2,
					dong: `KHONG DO DUOC: do model ${vai} khong co modelId`,
				};
			ids[vai] = modelId;
		} catch (e) {
			return {
				ma: 2,
				dong: `KHONG DO DUOC: do model ${vai} loi: ${e instanceof Error ? e.message : String(e)}`,
			};
		}
	}
	return { ma: 0, ids: { kho: ids.kho ?? "", goc: ids.goc ?? "" } };
}

export function dongKetLuot(ma: number, tepBangChung: string): string[] {
	return ma === 0 ? [`GHI BAN GHI: ${CHAM_BO_DO.lenhGhi} ${tepBangChung}`] : [];
}
