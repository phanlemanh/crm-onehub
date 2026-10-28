"use client";

import { useRef, useState } from "react";
import type { TrangThaiDongKr } from "./du-lieu-bo";

export type KhoaDong = string;

export type LyChuaLuu =
	| Extract<TrangThaiDongKr, { loai: "chua-luu" }>["ly"]
	| "muc-tieu-chua-luu";

export type TrangThaiLuu =
	| { loai: "yen" }
	| { loai: "dang-luu" }
	| { loai: "chua-luu"; ly: LyChuaLuu }
	| { loai: "loi"; cau: string };

export type ViecLuu = (id: string | null) => Promise<{ id: string }>;

type Hang = {
	dangChay: boolean;
	cho: ViecLuu | null;
	id: string | null;
	doi: readonly ((id: string | null) => void)[];
};

const HANG_TRONG: Hang = { dangChay: false, cho: null, id: null, doi: [] };

const YEN: TrangThaiLuu = { loai: "yen" };

const O_SO_MAY_CHU = /(^|\s)(startValue|targetValue|currentValue): /;

export type LoaiLoiLuu = "so" | "khac";

export function loaiLoiLuu(loi: Error): LoaiLoiLuu {
	return O_SO_MAY_CHU.test(loi.message) ? "so" : "khac";
}

export type LuuDong = {
	luu: (khoa: KhoaDong, viec: ViecLuu) => void;
	guiMotLan: (khoa: KhoaDong, dau: string, viec: ViecLuu) => void;
	trangThai: (khoa: KhoaDong) => TrangThaiLuu;
	chuaLuu: (khoa: KhoaDong, ly: LyChuaLuu | null) => void;
	danhDauGo: (khoa: KhoaDong, coChu: boolean) => void;
	quen: (khoa: readonly KhoaDong[]) => void;
	id: (khoa: KhoaDong) => string | null;
	choId: (khoa: KhoaDong) => Promise<string | null>;
	dangLuu: (khoa: KhoaDong) => boolean;
	daLuu: ReadonlySet<string>;
	coChuaLuu: boolean;
};

export function useLuuDong(cauLoi: (loi: Error) => string): LuuDong {
	const hang = useRef<ReadonlyMap<KhoaDong, Hang>>(new Map());
	const daGui = useRef<ReadonlyMap<KhoaDong, string>>(new Map());
	const [trang, datTrang] = useState<ReadonlyMap<KhoaDong, TrangThaiLuu>>(
		new Map(),
	);
	const [ids, datIds] = useState<ReadonlyMap<KhoaDong, string>>(new Map());
	const [dangGo, datDangGo] = useState<ReadonlySet<KhoaDong>>(new Set());

	const doiGo = (khoa: KhoaDong, coChu: boolean) =>
		datDangGo((cu) => {
			if (cu.has(khoa) === coChu) return cu;
			const moi = new Set(cu);
			if (coChu) moi.add(khoa);
			else moi.delete(khoa);
			return moi;
		});

	const layHang = (khoa: KhoaDong): Hang =>
		hang.current.get(khoa) ?? HANG_TRONG;
	const ghiHang = (khoa: KhoaDong, h: Hang) => {
		hang.current = new Map(hang.current).set(khoa, h);
	};
	const datTrangThai = (khoa: KhoaDong, t: TrangThaiLuu) =>
		datTrang((cu) => new Map(cu).set(khoa, t));

	const xongHang = (khoa: KhoaDong) => {
		const h = layHang(khoa);
		ghiHang(khoa, { ...h, dangChay: false, doi: [] });
		for (const bao of h.doi) bao(h.id);
	};

	function chay(khoa: KhoaDong, viec: ViecLuu): void {
		ghiHang(khoa, { ...layHang(khoa), dangChay: true, cho: null });
		datTrangThai(khoa, { loai: "dang-luu" });
		viec(layHang(khoa).id).then(
			({ id }) => {
				ghiHang(khoa, { ...layHang(khoa), id });
				datIds((cu) => new Map(cu).set(khoa, id));
				datTrang((cu) =>
					cu.get(khoa)?.loai === "chua-luu" ? cu : new Map(cu).set(khoa, YEN),
				);
				tiep(khoa);
			},
			(loi) => {
				const ro = loi instanceof Error ? loi : new Error(String(loi));
				datTrangThai(khoa, { loai: "loi", cau: cauLoi(ro) });
				tiep(khoa);
			},
		);
	}

	function tiep(khoa: KhoaDong): void {
		const sau = layHang(khoa).cho;
		if (sau) chay(khoa, sau);
		else xongHang(khoa);
	}

	const luu = (khoa: KhoaDong, viec: ViecLuu) => {
		doiGo(khoa, false);
		const h = layHang(khoa);
		if (h.dangChay) {
			ghiHang(khoa, { ...h, cho: viec });
			return;
		}
		chay(khoa, viec);
	};

	const nhoGui = (khoa: KhoaDong, dau: string | null) => {
		const moi = new Map(daGui.current);
		if (dau === null) moi.delete(khoa);
		else moi.set(khoa, dau);
		daGui.current = moi;
	};

	const guiMotLan = (khoa: KhoaDong, dau: string, viec: ViecLuu) => {
		doiGo(khoa, false);
		if (daGui.current.get(khoa) === dau) return;
		nhoGui(khoa, dau);
		luu(khoa, async (id) => {
			try {
				return await viec(id);
			} catch (loi) {
				nhoGui(khoa, null);
				throw loi;
			}
		});
	};

	const choId = (khoa: KhoaDong) =>
		new Promise<string | null>((xong) => {
			const h = layHang(khoa);
			if (!h.dangChay) {
				xong(h.id);
				return;
			}
			ghiHang(khoa, { ...h, doi: [...h.doi, xong] });
		});

	const chuaLuu = (khoa: KhoaDong, ly: LyChuaLuu | null) => {
		doiGo(khoa, false);
		const cu = trang.get(khoa) ?? YEN;
		if (ly === null && cu.loai !== "chua-luu") return;
		datTrangThai(khoa, ly === null ? YEN : { loai: "chua-luu", ly });
	};

	const quen = (khoa: readonly KhoaDong[]) => {
		const bo = new Set(khoa);
		const loc = <T>(cu: ReadonlyMap<KhoaDong, T>) =>
			new Map([...cu].filter(([k]) => !bo.has(k)));
		datTrang(loc);
		datDangGo((cu) => new Set([...cu].filter((k) => !bo.has(k))));
	};

	return {
		luu,
		guiMotLan,
		trangThai: (khoa) => trang.get(khoa) ?? YEN,
		chuaLuu,
		danhDauGo: doiGo,
		quen,
		id: (khoa) => layHang(khoa).id,
		choId,
		dangLuu: (khoa) => layHang(khoa).dangChay,
		daLuu: new Set([...ids].flatMap(([khoa, id]) => (khoa === id ? [] : [id]))),
		coChuaLuu:
			dangGo.size > 0 ||
			[...trang.values()].some(
				(t) => t.loai === "chua-luu" || t.loai === "loi",
			),
	};
}
