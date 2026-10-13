import { createHash } from "node:crypto";
import {
	type DongTungCau,
	docTungCau,
	type KetCucHai,
	type KetCucMot,
	ketCucHai,
	nhanHaiCau,
	nhanMotCau,
} from "../../tro-ly-doc-kho/rang/quyet-do";
import { BO_MAU } from "./bo-mau-config";
import { type BoMau, type CauMau, khuonBoMau } from "./khuon";

export type O = { k: number; n: number; loi: number };
export type Bang = {
	tang: Record<string, O>;
	kieuChu: Record<string, O>;
	zalo: Record<string, O>;
	khongDat: string[];
};
export type SoMa = { thieu: string[]; trung: string[]; la: string[] };
export type BaoCao = {
	bam: string;
	bamTroLy: string;
	maCham: number;
	luot: string;
	tong: string[];
	bang: Bang;
	soLuot: { mot: number; hai: number };
};

export const bam = (chu: string) =>
	createHash("sha256").update(chu).digest("hex");

const NHOM_NGOAI = "khong-phai-quy-dinh";

export function oTang(c: CauMau): string {
	if (c.tang !== "S6") return c.tang;
	return c.ganTrang ? "S6-gan" : "S6-ngoai";
}

export function nhanCua(d: DongTungCau): string {
	if (d.luot === 1) return nhanMotCau(d.nhom, d.ketCuc as KetCucMot);
	return nhanHaiCau(
		d.zalo ? ketCucHai(d.zalo, d.zalo.coHang) : (d.ketCuc as KetCucHai),
	);
}

function dat(d: DongTungCau, nhan: string): boolean {
	if (d.luot === 1) return nhan === "dung-trang" || nhan === "tu-choi-dung";
	return d.nhom === NHOM_NGOAI ? nhan === "khong-chuyen" : nhan === "chuyen";
}

function cong(
	bang: Record<string, O>,
	khoa: string,
	nhan: string,
	laDat: boolean,
) {
	const o = bang[khoa] ?? { k: 0, n: 0, loi: 0 };
	bang[khoa] =
		nhan === "loi"
			? { ...o, loi: o.loi + 1 }
			: { k: o.k + (laDat ? 1 : 0), n: o.n + 1, loi: o.loi };
}

export function tinhBang(bo: BoMau, dong: readonly DongTungCau[]): Bang {
	const theoMa = new Map(bo.cau.map((c) => [c.id, c]));
	const tang: Record<string, O> = {};
	const kieuChu: Record<string, O> = {};
	const zalo: Record<string, O> = {};
	const khongDat: string[] = [];
	for (const d of dong) {
		const c = theoMa.get(d.id);
		if (!c) continue;
		const nhan = nhanCua(d);
		const laDat = dat(d, nhan);
		if (d.luot === 1) {
			cong(tang, oTang(c), nhan, laDat);
			cong(kieuChu, c.kieuChu, nhan, laDat);
		} else cong(zalo, oTang(c), nhan, laDat);
		if (!laDat) khongDat.push(`${d.id} (luot ${d.luot}: ${nhan})`);
	}
	return { tang, kieuChu, zalo, khongDat: khongDat.sort() };
}

export function soMa(bo: BoMau, dong: readonly DongTungCau[]): SoMa {
	const can = {
		1: bo.cau.filter((c) => c.nhom !== NHOM_NGOAI).map((c) => c.id),
		2: bo.cau.map((c) => c.id),
	} as const;
	const thieu: string[] = [];
	const trung: string[] = [];
	const la: string[] = [];
	for (const luot of [1, 2] as const) {
		const dem = new Map<string, number>();
		for (const d of dong.filter((x) => x.luot === luot))
			dem.set(d.id, (dem.get(d.id) ?? 0) + 1);
		for (const id of can[luot])
			if (!dem.has(id)) thieu.push(`${id} (luot ${luot})`);
		for (const [id, n] of dem) {
			if (n > 1) trung.push(`${id} (luot ${luot})`);
			if (!(can[luot] as readonly string[]).includes(id))
				la.push(`${id} (luot ${luot})`);
		}
	}
	return { thieu, trung, la };
}

const dongO = (khoa: string, o: O) =>
	`| ${khoa} | ${o.k} | ${o.n} | ${o.n === 0 ? "—" : `${((o.k / o.n) * 100).toFixed(1)}%`} | ${o.loi} |`;

function bangChu(tieuDe: string, ds: Record<string, O>): string[] {
	return [
		`### ${tieuDe}`,
		"",
		"| ô | đạt | đếm | tỉ lệ | lỗi |",
		"| --- | --- | --- | --- | --- |",
		...Object.keys(ds)
			.sort()
			.map((k) => dongO(k, ds[k] as O)),
		"",
	];
}

export function phanBang(bang: Bang): string {
	return [
		...bangChu(
			"Lượt một theo tầng — đạt là trả lời đúng trang hay từ chối đúng",
			bang.tang,
		),
		...bangChu("Lượt một theo kiểu chữ", bang.kieuChu),
		...bangChu(
			"Lượt hai qua Zalo theo tầng — đạt là chuyển đúng cho trợ lý kho, ngoài kho thì không chuyển",
			bang.zalo,
		),
		"### Không đạt",
		"",
		...(bang.khongDat.length
			? bang.khongDat.map((x) => `- ${x}`)
			: ["- (không có)"]),
		"",
	].join("\n");
}

export function ghiBaoCao(x: BaoCao): string {
	const { mo, dong } = BO_MAU.bangChung.mocBang;
	return [
		"# Đo trợ lý kho trên bộ câu hỏi mẫu",
		"",
		`bam bo-mau: ${x.bam}`,
		`bam tro-ly: ${x.bamTroLy}`,
		`ma thoat cham-bo-do: ${x.maCham}`,
		`thu muc luot cham-bo-do: ${x.luot}`,
		`luot 1: ${x.soLuot.mot} ma`,
		`luot 2: ${x.soLuot.hai} ma`,
		"",
		"## Tổng của script chấm",
		"",
		...x.tong.map((d) => `- ${d}`),
		"",
		"## Bảng",
		"",
		phanBang(x.bang),
		mo,
		"```json",
		JSON.stringify(x.bang, null, 2),
		"```",
		dong,
		"",
	].join("\n");
}

export function docBaoCao(
	md: string,
): { bam: string; maCham: number; bang: Bang } | null {
	const b = md.match(/^bam bo-mau: ([0-9a-f]{64})$/m)?.[1];
	const m = md.match(/^ma thoat cham-bo-do: (\d+)$/m)?.[1];
	const { mo, dong } = BO_MAU.bangChung.mocBang;
	const i = md.indexOf(mo);
	const j = md.indexOf(dong);
	if (!b || m === undefined || i < 0 || j < i) return null;
	const khoi = md
		.slice(i + mo.length, j)
		.replace(/```json|```/g, "")
		.trim();
	try {
		return { bam: b, maCham: Number(m), bang: JSON.parse(khoi) as Bang };
	} catch {
		return null;
	}
}

function oLech(a: Bang, b: Bang): string[] {
	const ds: string[] = [];
	for (const phan of ["tang", "kieuChu", "zalo"] as const) {
		const khoa = new Set([...Object.keys(a[phan]), ...Object.keys(b[phan])]);
		for (const k of [...khoa].sort())
			for (const t of ["k", "n", "loi"] as const) {
				const x = a[phan][k]?.[t];
				const y = b[phan][k]?.[t];
				if (x !== y)
					ds.push(
						`${phan}.${k}.${t} bao cao ${x ?? "-"}, tinh lai ${y ?? "-"}`,
					);
			}
	}
	if (JSON.stringify(a.khongDat) !== JSON.stringify(b.khongDat))
		ds.push("khongDat bao cao khac tinh lai");
	return ds;
}

export type KetKiem =
	| {
			ok: true;
			bang: Bang;
			maCham: number;
			soLuot: { mot: number; hai: number };
	  }
	| { ok: false; loi: string };

export function kiemBangChung(
	boTho: string,
	md: string | null,
	jsonl: string | null,
): KetKiem {
	if (md === null)
		return { ok: false, loi: `thieu tep ${BO_MAU.bangChung.baoCao}` };
	if (jsonl === null)
		return { ok: false, loi: `thieu tep ${BO_MAU.bangChung.tungCau}` };
	const bc = docBaoCao(md);
	if (!bc)
		return {
			ok: false,
			loi: `${BO_MAU.bangChung.baoCao} khong doc duoc (thieu dong bam, ma thoat hay khoi bang)`,
		};
	const bamBo = bam(boTho);
	if (bc.bam !== bamBo)
		return {
			ok: false,
			loi: `bam lech: bao cao ${bc.bam}, bo-mau.json ${bamBo} — bo doi sau lan do, chay --do`,
		};
	const bo = khuonBoMau.parse(JSON.parse(boTho));
	let dong: DongTungCau[];
	try {
		dong = docTungCau(jsonl);
	} catch (e) {
		return {
			ok: false,
			loi: `${BO_MAU.bangChung.tungCau} sai khuon: ${e instanceof Error ? e.message : String(e)}`,
		};
	}
	const so = soMa(bo, dong);
	const hong = [
		...so.thieu.map((x) => `thieu ${x}`),
		...so.trung.map((x) => `trung ${x}`),
		...so.la.map((x) => `ma la ${x}`),
	];
	if (hong.length > 0)
		return { ok: false, loi: `tap ma lech: ${hong.join("; ")}` };
	const tinh = tinhBang(bo, dong);
	const lech = oLech(bc.bang, tinh);
	if (lech.length > 0) return { ok: false, loi: `o lech: ${lech.join("; ")}` };
	if (!md.includes(phanBang(tinh)))
		return {
			ok: false,
			loi: "o lech: bang chu trong bao cao khac bang tinh lai",
		};
	return {
		ok: true,
		bang: tinh,
		maCham: bc.maCham,
		soLuot: {
			mot: dong.filter((d) => d.luot === 1).length,
			hai: dong.filter((d) => d.luot === 2).length,
		},
	};
}
