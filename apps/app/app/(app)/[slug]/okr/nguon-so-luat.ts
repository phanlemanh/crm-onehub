import {
	BAC_GHI_DANH,
	type BacGhiDanh,
	type KieuPhamVi,
	MA_CHI_SO,
	type MaChiSo,
	type PhamViChiSo,
} from "@crm/validation/okr-chi-so";
import type { NguonKr } from "@crm/validation/okr-kr";
import {
	type DatNguonKrInput,
	datNguonKrInput,
	type LyDoDocSheet,
	sheetIdTuUrl,
} from "@crm/validation/okr-nguon";
import { OKR_SO_MAN } from "@/lib/okr-so-man";
import type { RouterOutputs } from "@/lib/trpc/types";
import type { KetQua } from "./kieu";

type ChiTiet = RouterOutputs["okr"]["objective"];
export type MucTieuNguon = Pick<
	ChiTiet,
	"cycleId" | "status" | "level" | "unitId"
>;

export type NhapNguon = {
	loai: NguonKr;
	chiSo: MaChiSo;
	kieuPhamVi: KieuPhamVi;
	idPhamVi: string;
	bac: BacGhiDanh;
	url: string;
	o: string;
};

export type ChoDoc = { docTruoc: string | null | undefined; tu: number };

export type TrangThaiDoc =
	| { loai: "dang-doc" }
	| { loai: "qua-han" }
	| { loai: "doc-duoc"; giaTri: number; luc: string }
	| { loai: "loi"; lyDo: LyDoDocSheet };

type DonViMacDinh = { kieu: KieuPhamVi; id: string };

function phamViMacDinh(mt: MucTieuNguon): DonViMacDinh {
	const id = mt.unitId ?? "";
	switch (mt.level) {
		case "bo-phan":
			return { kieu: "bo-phan", id };
		case "phong-ban":
			return { kieu: "phong-ban", id };
		case "ca-nhan":
			return { kieu: "nguoi", id };
		case "onehub":
			return { kieu: "toan-cong-ty", id: "" };
	}
}

export function nhapNguonDau(kr: KetQua | null, mt: MucTieuNguon): NhapNguon {
	const n = kr?.nguonMay ?? null;
	const mac = phamViMacDinh(mt);
	const pv = n?.phamVi ?? null;
	return {
		loai: n?.loai ?? "tay",
		chiSo: n?.chiSo ?? MA_CHI_SO[0],
		kieuPhamVi: pv?.kieu ?? mac.kieu,
		idPhamVi: pv === null ? mac.id : pv.kieu === "toan-cong-ty" ? "" : pv.id,
		bac: n?.bac ?? BAC_GHI_DANH[0],
		url: n?.sheetId ? `${OKR_SO_MAN.urlBangTinh}${n.sheetId}` : "",
		o: n?.sheetO ?? "",
	};
}

export function phamViCua(g: NhapNguon): PhamViChiSo {
	return g.kieuPhamVi === "toan-cong-ty"
		? { kieu: "toan-cong-ty" }
		: { kieu: g.kieuPhamVi, id: g.idPhamVi };
}

export function bacCua(g: NhapNguon): BacGhiDanh | undefined {
	return g.chiSo === "ghi-danh-dat-bac" ? g.bac : undefined;
}

export function vaoDatNguon(
	keyResultId: string,
	g: NhapNguon,
): DatNguonKrInput | null {
	const tho =
		g.loai === "crm"
			? {
					keyResultId,
					loai: g.loai,
					chiSo: g.chiSo,
					phamVi: phamViCua(g),
					bac: bacCua(g),
				}
			: g.loai === "bang-tinh"
				? { keyResultId, loai: g.loai, url: g.url.trim(), o: g.o.trim() }
				: { keyResultId, loai: g.loai };
	const r = datNguonKrInput.safeParse(tho);
	return r.success ? r.data : null;
}

export function nhapNguonKhac(a: NhapNguon, b: NhapNguon): boolean {
	return (
		a.loai !== b.loai ||
		a.chiSo !== b.chiSo ||
		a.kieuPhamVi !== b.kieuPhamVi ||
		a.idPhamVi !== b.idPhamVi ||
		a.bac !== b.bac ||
		a.url !== b.url ||
		a.o !== b.o
	);
}

export function nguonDaDoi(kr: KetQua | null, g: NhapNguon): boolean {
	const n = kr?.nguonMay ?? null;
	if (n === null) return g.loai !== "tay";
	if (n.loai !== g.loai) return true;
	if (g.loai === "crm") {
		const pv = phamViCua(g);
		const cu = n.phamVi;
		return (
			n.chiSo !== g.chiSo ||
			(n.bac ?? undefined) !== bacCua(g) ||
			cu?.kieu !== pv.kieu ||
			(cu.kieu !== "toan-cong-ty" &&
				pv.kieu !== "toan-cong-ty" &&
				cu.id !== pv.id)
		);
	}
	if (g.loai === "bang-tinh")
		return sheetIdTuUrl(g.url) !== n.sheetId || g.o.trim() !== n.sheetO;
	return false;
}

export function trangThaiDoc(
	kr: KetQua | null,
	g: NhapNguon,
	cho: ChoDoc,
	bayGio: number,
): TrangThaiDoc | null {
	const n = kr?.nguonMay ?? null;
	if (n === null || n.loai !== "bang-tinh" || g.loai !== "bang-tinh")
		return null;
	if (nguonDaDoi(kr, g)) return null;
	const dangCho =
		n.docLuc === null ||
		(n.docGiaTri === null && n.docLoi === null) ||
		(cho.docTruoc !== undefined && n.docLuc === cho.docTruoc);
	if (dangCho)
		return bayGio - cho.tu >= OKR_SO_MAN.docThuToiDaMs
			? { loai: "qua-han" }
			: { loai: "dang-doc" };
	if (n.docLoi !== null) return { loai: "loi", lyDo: n.docLoi };
	if (n.docGiaTri === null || n.docLuc === null) return { loai: "dang-doc" };
	return { loai: "doc-duoc", giaTri: n.docGiaTri, luc: n.docLuc };
}
