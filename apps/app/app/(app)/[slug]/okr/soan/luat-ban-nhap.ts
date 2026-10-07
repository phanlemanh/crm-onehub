import { docSoOkr } from "@crm/validation/okr-kr";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { khoaKr, khoaMucTieu } from "./moc-nop";
import { khoaSo } from "./so-theo-khoa";
import type {
	DemDuaVao,
	DongKr,
	DongSoan,
	DonViSoan,
	KetSoBanNhap,
	KhoiNhap,
	NhanDong,
	SoDaGo,
	SoKr,
} from "./kieu";

const DA_NHAN: ReadonlySet<DongSoan["trangThai"]> = new Set(["nhan", "sua"]);
const DA_QUYET: ReadonlySet<DongSoan["trangThai"]> = new Set([
	"nhan",
	"sua",
	"bac",
]);

export const daNhan = (d: DongSoan): boolean => DA_NHAN.has(d.trangThai);

const daQuyet = (d: DongSoan): boolean => DA_QUYET.has(d.trangThai);

export function cayNhap(dong: readonly DongSoan[]): KhoiNhap[] {
	const khoi = new Map<string, KhoiNhap>();
	for (const d of dong) {
		if (d.loai !== "muc-tieu-moi") continue;
		const cu = khoi.get(d.khoa)?.mucTieu;
		if (cu && (daQuyet(cu) || !daQuyet(d))) continue;
		khoi.set(d.khoa, { mucTieu: d, kr: [], canChinh: [] });
	}
	for (const d of dong) {
		if (d.loai === "muc-tieu-moi") continue;
		const cha = khoi.get(d.chaKhoa);
		if (!cha) continue;
		if (d.loai === "kr-moi") cha.kr.push(d);
		else cha.canChinh.push(d);
	}
	return [...khoi.values()];
}

function noiDungCua(d: DongSoan): string {
	switch (d.loai) {
		case "muc-tieu-moi":
			return JSON.stringify([d.ten, d.viSaoLucNay, d.loaiMucTieu, d.viSao]);
		case "kr-moi":
			return JSON.stringify([d.ten, d.kieu, d.donVi, d.khoiDiemGoiY, d.viSao]);
		case "can-chinh-moi":
			return JSON.stringify([d.dichId, d.tenDich, d.viSao]);
	}
}

function chaCua(d: DongSoan, ds: readonly DongSoan[]): string | null {
	if (d.loai === "muc-tieu-moi") return null;
	const cha = ds.find((x) => x.loai === "muc-tieu-moi" && x.khoa === d.chaKhoa);
	return cha ? cha.khoaDong : d.chaKhoa;
}

const khoaKara = (d: DongSoan): string =>
	d.loai === "muc-tieu-moi"
		? khoaMucTieu(d.khoa)
		: d.loai === "kr-moi"
			? khoaKr(d.chaKhoa, d.khoa)
			: d.khoaDong;

const tenCua = (d: DongSoan): string =>
	d.loai === "can-chinh-moi" ? d.tenDich : d.ten;

export function soBanNhap(
	truoc: readonly DongSoan[],
	sau: readonly DongSoan[],
): KetSoBanNhap {
	const nhan = new Map<string, NhanDong>();
	const truocTen = new Map<string, string>();
	if (truoc.length === 0) return { dong: [...sau], nhan, truocTen };
	const theoKara = new Map(truoc.map((d) => [khoaKara(d), d] as const));
	const cu = new Map(truoc.map((d) => [d.khoaDong, d] as const));
	const moi = new Set(sau.map((d) => d.khoaDong));
	const daKhop = new Set<DongSoan>();
	const doiCha = (c: DongSoan, d: DongSoan) => {
		const chaCu = chaCua(c, truoc);
		const chaMoi = chaCua(d, sau);
		if (chaCu === null || chaMoi === null || chaCu === chaMoi) return false;
		return moi.has(chaCu) || cu.has(chaMoi);
	};
	for (const d of sau) {
		const c = theoKara.get(khoaKara(d)) ?? cu.get(d.khoaDong);
		if (!c) {
			nhan.set(d.khoaDong, "vua-them");
			continue;
		}
		daKhop.add(c);
		if (doiCha(c, d)) nhan.set(d.khoaDong, "vua-chuyen");
		else if (noiDungCua(c) !== noiDungCua(d)) {
			nhan.set(d.khoaDong, "vua-sua");
			if (tenCua(c) !== tenCua(d)) truocTen.set(d.khoaDong, tenCua(c));
		}
	}
	const daBo = truoc
		.filter(
			(d) => !daKhop.has(d) && !moi.has(d.khoaDong) && d.trangThai === "cho",
		)
		.map((d) => ({ ...d, trangThai: "bac" as const }));
	for (const d of daBo) nhan.set(d.khoaDong, "da-bo");
	return { dong: [...sau, ...daBo], nhan, truocTen };
}

export function soMacDinh(kr: DongKr): SoKr {
	return {
		khoiDiem: kr.khoiDiemGoiY === null ? "" : String(kr.khoiDiemGoiY),
		dich: "",
	};
}

export const canSo = (kr: DongKr): boolean => kr.kieu !== "moc";

function krDaNhan(cay: readonly KhoiNhap[]): DongKr[] {
	return cay
		.filter((k) => daNhan(k.mucTieu))
		.flatMap((k) => k.kr)
		.filter(daNhan);
}

export function soCua(kr: DongKr, so: SoDaGo): SoKr {
	const dung = so[khoaSo(kr)];
	if (dung) return dung;
	const theoTen = Object.values(so).find((s) => s?.khoaDong === kr.khoaDong);
	return theoTen ?? soMacDinh(kr);
}

export function laDuSo(kr: DongKr, so: SoDaGo): boolean {
	if (!canSo(kr)) return true;
	const s = soCua(kr, so);
	return docSoOkr(s.khoiDiem) !== null && docSoOkr(s.dich) !== null;
}

export function krThieuSo(cay: readonly KhoiNhap[], so: SoDaGo): string[] {
	return krDaNhan(cay)
		.filter(canSo)
		.filter((kr) => {
			const s = soCua(kr, so);
			return docSoOkr(s.khoiDiem) === null || docSoOkr(s.dich) === null;
		})
		.map((kr) => kr.id);
}

export function demDong(cay: readonly KhoiNhap[]): number {
	return cay.reduce((t, k) => t + 1 + k.kr.length + k.canChinh.length, 0);
}

export function demDuaVao(cay: readonly KhoiNhap[]): DemDuaVao {
	const mt = cay.filter((k) => daNhan(k.mucTieu));
	return {
		soMucTieu: mt.length,
		soKr: mt.reduce((t, k) => t + k.kr.filter(daNhan).length, 0),
	};
}

export function krDuaVao(
	cay: readonly KhoiNhap[],
	so: SoDaGo,
): { deXuatId: string; khoiDiem: number; dich: number }[] {
	return krDaNhan(cay)
		.filter(canSo)
		.flatMap((kr) => {
			const s = soCua(kr, so);
			const khoiDiem = docSoOkr(s.khoiDiem);
			const dich = docSoOkr(s.dich);
			return khoiDiem === null || dich === null
				? []
				: [{ deXuatId: kr.id, khoiDiem, dich }];
		});
}

function khoaDonCua(dv: DonViSoan): string {
	if (dv.level === "bo-phan") return `bp:${dv.divisionId ?? ""}`;
	if (dv.level === "phong-ban") return `pb:${dv.departmentId ?? ""}`;
	return "goc";
}

export function duongTheoDonVi(slug: string, dv: DonViSoan): string {
	const q = new URLSearchParams({
		[SEARCH_PARAM.okr.ky]: dv.cycleId,
		[SEARCH_PARAM.okr.don]: khoaDonCua(dv),
	});
	return `/${slug}/okr/theo-don-vi?${q.toString()}`;
}

export function duongTrangSoan(slug: string, cuocSoanId: string): string {
	return `/${slug}/okr/soan/${encodeURIComponent(cuocSoanId)}`;
}

export function laTrangSoan(duong: string): boolean {
	const phan = duong.split("/").filter(Boolean);
	const i = phan.indexOf("okr");
	return i >= 0 && phan[i + 1] === "soan" && phan.length > i + 2;
}
