import { docSoOkr } from "@crm/validation/okr-kr";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
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

export function soBanNhap(
	truoc: readonly DongSoan[],
	sau: readonly DongSoan[],
): KetSoBanNhap {
	const nhan = new Map<string, NhanDong>();
	if (truoc.length === 0) return { dong: [...sau], nhan };
	const cu = new Map(truoc.map((d) => [d.khoaDong, d] as const));
	const moi = new Set(sau.map((d) => d.khoaDong));
	const doiCha = (c: DongSoan, d: DongSoan) => {
		const chaCu = chaCua(c, truoc);
		const chaMoi = chaCua(d, sau);
		if (chaCu === null || chaMoi === null || chaCu === chaMoi) return false;
		return moi.has(chaCu) || cu.has(chaMoi);
	};
	for (const d of sau) {
		const c = cu.get(d.khoaDong);
		if (!c) nhan.set(d.khoaDong, "vua-them");
		else if (doiCha(c, d)) nhan.set(d.khoaDong, "vua-chuyen");
		else if (noiDungCua(c) !== noiDungCua(d)) nhan.set(d.khoaDong, "vua-sua");
	}
	const daBo = truoc
		.filter((d) => !moi.has(d.khoaDong) && d.trangThai === "cho")
		.map((d) => ({ ...d, trangThai: "bac" as const }));
	for (const d of daBo) nhan.set(d.khoaDong, "da-bo");
	return { dong: [...sau, ...daBo], nhan };
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
	return so[kr.id] ?? soMacDinh(kr);
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
