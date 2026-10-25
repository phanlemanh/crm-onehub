import type { CachLocTruong } from "@crm/db/fields-shape";
import { z } from "zod";

export const MOC_NGAY = [
	"overdue",
	"this-month",
	"next-month",
	"later",
] as const;

export type MocNgay = (typeof MOC_NGAY)[number];

export const GIA_TRI_TRONG = "none";

export const GIA_TRI_CO_TEP = "some";

export const TIEN_TO_LOC = {
	chua: "has:",
	tu: "gte:",
	den: "lte:",
} as const;

export type LocTruong =
	| { cach: "chua"; chu: string[]; trong: boolean }
	| { cach: "khoang"; tu: number | null; den: number | null; trong: boolean }
	| { cach: "moc"; moc: MocNgay[]; trong: boolean }
	| { cach: "tich"; co: boolean[] }
	| { cach: "coTep"; co: boolean; trong: boolean }
	| { cach: "luaChon" | "nguoi"; id: string[]; trong: boolean };

export class LocTruongError extends Error {
	constructor(readonly gia: string) {
		super(`"${gia}" is not a valid filter value for this field.`);
	}
}

const soLoc = z
	.string()
	.trim()
	.min(1)
	.transform(Number)
	.refine((so) => Number.isFinite(so));

const mocNgay = z.enum(MOC_NGAY);

type MotGia =
	| { loai: "trong" }
	| { loai: "chu"; chu: string }
	| { loai: "tu"; so: number }
	| { loai: "den"; so: number }
	| { loai: "moc"; moc: MocNgay }
	| { loai: "tich"; co: boolean }
	| { loai: "coTep" }
	| { loai: "id"; id: string };

function docMotGia(cach: CachLocTruong, gia: string): MotGia | null {
	if (cach === "tich") {
		if (gia === "yes") return { loai: "tich", co: true };
		if (gia === "no") return { loai: "tich", co: false };
		return null;
	}

	if (gia === GIA_TRI_TRONG) return { loai: "trong" };

	if (cach === "coTep") {
		return gia === GIA_TRI_CO_TEP ? { loai: "coTep" } : null;
	}

	if (cach === "chua") {
		if (!gia.startsWith(TIEN_TO_LOC.chua)) return null;
		const chu = gia.slice(TIEN_TO_LOC.chua.length).trim();
		return chu ? { loai: "chu", chu } : null;
	}

	if (cach === "khoang") {
		for (const loai of ["tu", "den"] as const) {
			if (!gia.startsWith(TIEN_TO_LOC[loai])) continue;
			const so = soLoc.safeParse(gia.slice(TIEN_TO_LOC[loai].length));
			return so.success ? { loai, so: so.data } : null;
		}
		return null;
	}

	if (cach === "moc") {
		const moc = mocNgay.safeParse(gia);
		return moc.success ? { loai: "moc", moc: moc.data } : null;
	}

	return gia.trim() ? { loai: "id", id: gia } : null;
}

export function laGiaTriHopLe(cach: CachLocTruong, gia: string): boolean {
	return docMotGia(cach, gia) !== null;
}

export function phanTichLocTruong(
	cach: CachLocTruong,
	giaTri: string[],
): LocTruong {
	const cacGia = giaTri.map((gia) => {
		const doc = docMotGia(cach, gia);
		if (!doc) throw new LocTruongError(gia);
		return doc;
	});
	const trong = cacGia.some((gia) => gia.loai === "trong");

	switch (cach) {
		case "chua":
			return {
				cach,
				chu: cacGia.flatMap((gia) => (gia.loai === "chu" ? [gia.chu] : [])),
				trong,
			};
		case "khoang":
			return {
				cach,
				tu:
					cacGia.flatMap((gia) => (gia.loai === "tu" ? [gia.so] : []))[0] ??
					null,
				den:
					cacGia.flatMap((gia) => (gia.loai === "den" ? [gia.so] : []))[0] ??
					null,
				trong,
			};
		case "moc":
			return {
				cach,
				moc: cacGia.flatMap((gia) => (gia.loai === "moc" ? [gia.moc] : [])),
				trong,
			};
		case "tich":
			return {
				cach,
				co: cacGia.flatMap((gia) => (gia.loai === "tich" ? [gia.co] : [])),
			};
		case "coTep":
			return {
				cach,
				co: cacGia.some((gia) => gia.loai === "coTep"),
				trong,
			};
		default:
			return {
				cach,
				id: cacGia.flatMap((gia) => (gia.loai === "id" ? [gia.id] : [])),
				trong,
			};
	}
}
