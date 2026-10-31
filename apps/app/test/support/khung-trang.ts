import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import {
	type CoTrongCay,
	coKhiTai,
	type DocTep,
	GOC_KHO,
	hamMacDinh,
	hamTen,
	moiPhanTu,
	nhapCucBo,
	phanTich,
	TIEN_SLUG,
} from "../lib/quet-jsx";

export const GOC_TRANG = "apps/app/app/";
export const TEP_NGOAI_LE = "apps/app/test/fixtures/khung-trang-ngoai-le.json";
export const SAU_NHAP = 3;

export const LOAI_NGOAI_LE = [
	"ngoai-app",
	"ban-mau",
	"toan-vung",
	"chuyen-huong-sau-tai",
	"tieu-de-theo-du-lieu",
	"no",
] as const;

export const dongNgoaiLe = z.object({
	tep: z.string(),
	loai: z.string(),
	ly_do: z.string(),
});

export type DongNgoaiLe = z.infer<typeof dongNgoaiLe>;

export type NhomTrang = "khung" | "chuyen-huong" | "ngoai-le" | "lech";

export type KetQuaQuet = {
	loi: string[];
	nhom: Record<NhomTrang, string[]>;
};

export type ChayGit = (thamSo: string[]) => string;

const chayGitThat: ChayGit = (thamSo) =>
	execFileSync("git", ["-C", GOC_KHO, ...thamSo], {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "ignore"],
	});

export function locTrang(ds: string[]): string[] {
	return ds
		.filter((t) => t.startsWith(GOC_TRANG) && t.endsWith("/page.tsx"))
		.sort();
}

export function moiTrang(git: ChayGit = chayGitThat): string[] {
	const ra = git([
		"ls-files",
		"--cached",
		"--others",
		"--exclude-standard",
		"--",
		GOC_TRANG,
	]);
	return locTrang([...new Set(ra.split("\n").filter(Boolean))]);
}

export function tenNgan(tep: string): string {
	return tep.startsWith(TIEN_SLUG)
		? tep.slice(TIEN_SLUG.length)
		: tep.replace(GOC_TRANG, "");
}

export function docNgoaiLe(nguon: string): DongNgoaiLe[] {
	const kq = z.array(dongNgoaiLe).safeParse(JSON.parse(nguon));
	if (!kq.success) {
		throw new Error(`ktm: ${TEP_NGOAI_LE} sai khuon: ${kq.error.message}`);
	}
	return kq.data;
}

export function bangThat(): DongNgoaiLe[] {
	return docNgoaiLe(readFileSync(join(GOC_KHO, TEP_NGOAI_LE), "utf8"));
}

export function denLucTai(
	doc: DocTep,
	tep: string,
	trung: CoTrongCay,
	sau: number = SAU_NHAP,
): CoTrongCay {
	const nguon = doc(tep);
	if (nguon === null) return () => false;
	const sf = phanTich(tep, nguon);
	const nhap = nhapCucBo(sf, tep);
	return (ten, node) => {
		if (trung(ten, node)) return true;
		if (sau <= 0) return false;
		const tepCon = nhap.get(ten);
		if (!tepCon) {
			const hamCungTep = /^[A-Z]/.test(ten) ? hamTen(sf, ten) : null;
			return (
				hamCungTep !== null &&
				coKhiTai(hamCungTep, denLucTai(doc, tep, trung, sau - 1))
			);
		}
		const nguonCon = doc(tepCon);
		if (nguonCon === null) return false;
		const ham = hamTen(phanTich(tepCon, nguonCon), ten);
		return (
			ham !== null && coKhiTai(ham, denLucTai(doc, tepCon, trung, sau - 1))
		);
	};
}

export type HinhDauTrang = {
	coJsx: boolean;
	dauTrang: boolean;
	tieuDe: boolean;
	moTa: boolean;
	h1: boolean;
};

export function hinhDauTrang(
	doc: DocTep,
	tep: string,
	nguon: string,
): HinhDauTrang {
	const sf = phanTich(tep, nguon);
	const ham = hamMacDinh(sf);
	const co = (ten: string) =>
		ham !== null &&
		coKhiTai(
			ham,
			denLucTai(doc, tep, (t) => t === ten),
		);
	return {
		coJsx: moiPhanTu(sf).length > 0,
		dauTrang: co("PageShellHeader"),
		tieuDe: co("PageShellTitle"),
		moTa: co("PageShellDescription"),
		h1: co("h1"),
	};
}

export function laKhung(h: HinhDauTrang): boolean {
	return h.dauTrang && h.tieuDe && h.moTa && !h.h1;
}

function loiDauTrang(ngan: string, h: HinhDauTrang): string[] {
	if (!h.dauTrang) {
		return [`ktm: ${ngan} dung dau trang ngoai PageShellHeader`];
	}
	const loi: string[] = [];
	if (!h.tieuDe) loi.push(`ktm: ${ngan} thieu tieu de luc tai`);
	if (!h.moTa) loi.push(`ktm: ${ngan} thieu mo ta luc tai`);
	if (h.h1) loi.push(`ktm: ${ngan} dung <h1> rieng`);
	return loi;
}

function loiBang(trang: Set<string>, bang: DongNgoaiLe[]): string[] {
	const loi: string[] = [];
	const daThay = new Set<string>();
	const loai = new Set<string>(LOAI_NGOAI_LE);
	for (const d of bang) {
		const ngan = tenNgan(d.tep);
		if (daThay.has(d.tep)) loi.push(`ktm: ngoai le trung ${ngan}`);
		daThay.add(d.tep);
		if (!trang.has(d.tep)) loi.push(`ktm: ngoai le tro tep khong con ${ngan}`);
		if (!loai.has(d.loai))
			loi.push(`ktm: ngoai le loai la ${d.loai} o ${ngan}`);
		if (d.ly_do.trim() === "") loi.push(`ktm: ngoai le thieu ly do o ${ngan}`);
	}
	return loi;
}

export function quetKhungTrang(
	doc: DocTep,
	trang: string[],
	bang: DongNgoaiLe[],
): KetQuaQuet {
	const ds = locTrang(trang);
	const loi = loiBang(new Set(ds), bang);
	const theoTep = new Map(bang.map((d) => [d.tep, d]));
	const nhom = {
		khung: [],
		"chuyen-huong": [],
		"ngoai-le": [],
		lech: [],
	} satisfies KetQuaQuet["nhom"] as KetQuaQuet["nhom"];
	for (const t of ds) {
		const ngan = tenNgan(t);
		const nguon = doc(t);
		if (nguon === null) {
			loi.push(`ktm: khong doc duoc ${ngan}`);
			nhom.lech.push(t);
			continue;
		}
		const h = hinhDauTrang(doc, t, nguon);
		const dong = theoTep.get(t);
		if (dong) {
			nhom["ngoai-le"].push(t);
			if (laKhung(h) || !h.coJsx) loi.push(`ktm: ngoai le thua ${ngan}`);
			if (dong.loai === "tieu-de-theo-du-lieu" && !h.dauTrang) {
				loi.push(
					`ktm: ${ngan} mang tieu-de-theo-du-lieu ma khong co PageShellHeader luc tai`,
				);
			}
			continue;
		}
		if (!h.coJsx) {
			nhom["chuyen-huong"].push(t);
			continue;
		}
		const loiTrang = loiDauTrang(ngan, h);
		if (loiTrang.length === 0) nhom.khung.push(t);
		else {
			nhom.lech.push(t);
			loi.push(...loiTrang);
		}
	}
	return { loi, nhom };
}

export function soTapTrang(daQuet: string[], lsFiles: string[]): string[] {
	const a = new Set(locTrang(daQuet));
	const b = new Set(locTrang(lsFiles));
	const lech =
		a.size !== b.size ||
		[...a].some((t) => !b.has(t)) ||
		[...b].some((t) => !a.has(t));
	return lech ? ["ktm: tap trang lech ls-files"] : [];
}
