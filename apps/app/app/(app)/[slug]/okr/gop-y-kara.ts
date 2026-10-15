"use client";

import type { KaraBusyState } from "@crm/ui/components/kara/busy";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	ketQuaTroLy,
	type LyDoKhongSanSang,
	laLyDoKhongQuyet,
	TRO_LY_OKR_TRAN,
} from "@crm/validation/okr-tro-ly";
import {
	type QueryClient,
	type QueryKey,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import {
	type OkrGopYMessages,
	okrGopYMessages,
} from "@/lib/messages/okr-gop-y";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import type { DongHien } from "./the-gop-y-props";

export type CachQuyet = "nhan" | "sua" | "bac" | "bo-qua";

export type NoiDungKara =
	| "tat"
	| "chua-goi"
	| "dang-doc"
	| "rong"
	| "loi"
	| "tai-loi"
	| "nho-loi"
	| "co-gop-y";

export type DocLaiKara = "yen" | "dang-doc" | "loi" | "nho-loi";

export type LoaiLoiNho = "khong-quyen" | "mat-mang" | "khac";

const loiCoMa = z.object({ data: z.object({ code: z.string() }) });

function maLoi(cause: unknown): string | null {
	const doc = loiCoMa.safeParse(cause);
	return doc.success ? doc.data.data.code : null;
}

export function loaiLoiNho(cause: unknown): LoaiLoiNho {
	const ma = maLoi(cause);
	if (ma === null) return "mat-mang";
	return ma === "FORBIDDEN" ? "khong-quyen" : "khac";
}

export type TrangThaiDong =
	| "cho"
	| "dang-quyet"
	| "da-quyet"
	| "dang-hoan-tac"
	| "da-hoan-tac";

export type LoaiLoiDong = "khong-con" | "da-cu" | "chua-san-sang" | "mat-mang";

export function loaiLoiDong(cause: unknown): LoaiLoiDong {
	const ma = maLoi(cause);
	if (ma === null) return "mat-mang";
	if (ma === "NOT_FOUND") return "khong-con";
	if (ma === "CONFLICT") return "da-cu";
	return "chua-san-sang";
}

export function cauLoiDong(cause: unknown, m: OkrGopYMessages): string {
	return m.loiDong[loaiLoiDong(cause)];
}

export type NutKara =
	| { loai: "an" }
	| { loai: "mo" }
	| { loai: "khoa"; vi: "het-luot" | "tam-nghi" };

type NoiGop = RouterOutputs["okr"]["objective"]["alignments"][number];

export type KetDong = {
	ket: "accepted" | "skipped";
	giaTri: string | null;
	daHoanTac: boolean;
	canChinhId: string | null;
};

function khopDich(g: NoiGop, d: DongHien): boolean {
	return d.targetKeyResultId !== null
		? g.targetKeyResultId === d.targetKeyResultId
		: g.targetKeyResultId === null &&
				g.targetObjectiveId === d.targetObjectiveId;
}

export function lienKetVuaTao(
	truoc: readonly NoiGop[],
	sau: readonly NoiGop[],
	d: DongHien,
): string | null {
	const cu = new Set(truoc.map((g) => g.alignmentId));
	const moi = sau.filter((g) => khopDich(g, d) && !cu.has(g.alignmentId));
	return moi.length === 1 ? (moi[0]?.alignmentId ?? null) : null;
}

export type NhomGopY = {
	capBo: DongHien[];
	viSao: DongHien[];
	theoKr: ReadonlyMap<string, DongHien[]>;
};

const DA_NOP = ketQuaTroLy.shape.trangThai.enum["da-nop"];

export type LyDoTat = "het-luot" | "tam-nghi" | "chua-bat" | "tam-tat";

const TAT_KHI_CHUA_SAN_SANG = {
	tat: "tam-tat",
	"viec-tat": "tam-tat",
	"don-vi-chua-bat": "chua-bat",
	"het-tran-thang": "tam-nghi",
	"het-tran-ngay": "het-luot",
	"chua-noi-tac-tu": "tam-tat",
	"chua-co-khoa-mo-hinh": "tam-tat",
	"het-tran-gateway": "tam-tat",
} as const satisfies Record<LyDoKhongSanSang, LyDoTat>;

const KET_CUA_CACH = {
	nhan: "accepted",
	sua: "accepted",
	bac: "skipped",
	"bo-qua": "skipped",
} as const satisfies Record<CachQuyet, KetDong["ket"]>;

function nhomTheoCho(ds: readonly DongHien[]): NhomGopY {
	const capBo: DongHien[] = [];
	const viSao: DongHien[] = [];
	const theoKr = new Map<string, DongHien[]>();
	for (const d of ds) {
		if (d.loai === "viet-lai" && d.truong === "whyNow") viSao.push(d);
		else if (d.keyResultId !== null && d.loai !== "can-chinh")
			theoKr.set(d.keyResultId, [...(theoKr.get(d.keyResultId) ?? []), d]);
		else capBo.push(d);
	}
	return { capBo, viSao, theoKr };
}

export function nhipHoiLai(tu: number, bayGio: number): number {
	return bayGio - tu < TRO_LY_OKR_TRAN.tranChoMs
		? TRO_LY_OKR_TRAN.hoiLaiMs
		: TRO_LY_OKR_TRAN.tranChoMs;
}

const DANG_THEO = new WeakMap<QueryClient, Set<string>>();

function theoDenXong(
	qc: QueryClient,
	objectiveId: string,
	batDau: number,
	hoi: () => Promise<RouterOutputs["okr"]["troLyDanhSach"]>,
	xong: () => Promise<void>,
): void {
	const dang = DANG_THEO.get(qc) ?? new Set<string>();
	DANG_THEO.set(qc, dang);
	if (dang.has(objectiveId)) return;
	dang.add(objectiveId);
	const vong = async () => {
		const ds = await hoi().catch(() => null);
		if (ds?.dangSoan === true) {
			setTimeout(() => void vong(), nhipHoiLai(batDau, Date.now()));
			return;
		}
		dang.delete(objectiveId);
		if (ds !== null) await xong();
	};
	setTimeout(() => void vong(), TRO_LY_OKR_TRAN.hoiLaiMs);
}

type CacheDanhSach = {
	mine: QueryKey;
	danhSach: QueryKey;
};

function soTrongDanhSach(
	qc: QueryClient,
	khoa: CacheDanhSach,
	objectiveId: string,
): number[] {
	const tuMine = qc
		.getQueriesData<RouterOutputs["okr"]["mine"]>({ queryKey: khoa.mine })
		.flatMap(([, d]) => [...(d?.objectives ?? []), ...(d?.dangTheoDoi ?? [])]);
	const tuDanhSach = qc
		.getQueriesData<RouterOutputs["okr"]["danhSach"]>({
			queryKey: khoa.danhSach,
		})
		.flatMap(([, d]) => d?.rows ?? []);
	return [...tuMine, ...tuDanhSach]
		.filter((mt) => mt.id === objectiveId)
		.map((mt) => mt.soGopYCho);
}

function theoThuTu(
	ds: readonly DongHien[],
	thuTu: readonly string[],
): DongHien[] {
	const viTri = (d: DongHien, i: number) => {
		const truoc = thuTu.indexOf(d.id);
		return truoc === -1 ? thuTu.length + i : truoc;
	};
	return ds
		.map((d, i) => ({ d, i: viTri(d, i) }))
		.sort((a, b) => a.i - b.i)
		.map(({ d }) => d);
}

export function useGopYMucTieu({
	objectiveId,
	soGopYCho,
	canEdit,
	krSuaDuoc,
	ghiDuoc,
}: {
	objectiveId: string | null;
	soGopYCho: number | null;
	canEdit: boolean;
	krSuaDuoc: readonly string[];
	ghiDuoc: boolean;
}) {
	const trpc = useTRPC();
	const cache = useCrmCache();
	const qc = useQueryClient();
	const locale = useLocale();
	const mGopY = okrGopYMessages(locale);
	const coDich = objectiveId !== null;
	const dich = { objectiveId: objectiveId ?? "" };
	const nhoDuoc = canEdit || krSuaDuoc.length > 0;
	const [batDau, setBatDau] = useState<number | null>(null);
	const [thayDocLuc, setThayDocLuc] = useState<number | null>(null);
	const [ketCua, setKetCua] = useState<Readonly<Record<string, KetDong>>>({});
	const [daQuyet, setDaQuyet] = useState<readonly DongHien[]>([]);
	const [loiDong, setLoiDong] = useState<Readonly<Record<string, string>>>({});
	const [dangQuyet, setDangQuyet] = useState<string | null>(null);
	const [noi, setNoi] = useState<string | null>(null);
	const [thuTu, setThuTu] = useState<readonly string[]>([]);
	const daDongBo = useRef(false);

	const sanSang = useQuery({
		...trpc.okr.troLySanSang.queryOptions(dich),
		enabled: coDich && nhoDuoc,
		retry: false,
	});
	const danhSach = useQuery({
		...trpc.okr.troLyDanhSach.queryOptions({ objectiveId: objectiveId ?? "" }),
		enabled: coDich && nhoDuoc,
		retry: false,
		refetchInterval: (q) =>
			q.state.data?.dangSoan === true
				? nhipHoiLai(thayDocLuc ?? Date.now(), Date.now())
				: false,
	});
	const deXuat = useMutation(trpc.okr.troLyDeXuat.mutationOptions());
	const loiNho: LoaiLoiNho | null = deXuat.isError
		? loaiLoiNho(deXuat.error)
		: null;
	const quyetDong = useMutation(trpc.okr.troLyQuyet.mutationOptions());
	const suaMucTieu = useMutation(trpc.okr.updateObjective.mutationOptions());
	const suaKr = useMutation(trpc.okr.updateKeyResult.mutationOptions());
	const goCanChinh = useMutation(trpc.okr.removeAlignment.mutationOptions());
	const lienKetHienCo = (): readonly NoiGop[] | null =>
		objectiveId
			? (qc.getQueryData<RouterOutputs["okr"]["objective"]>(
					trpc.okr.objective.queryKey({ id: objectiveId }),
				)?.alignments ?? null)
			: null;
	const lienKetSauKhiNhan = async (
		truoc: readonly NoiGop[] | null,
		d: DongHien,
	): Promise<string | null> => {
		if (truoc === null || !objectiveId) return null;
		await cache.okr(objectiveId);
		return lienKetVuaTao(truoc, lienKetHienCo() ?? [], d);
	};

	const ds = danhSach.data;
	const dongCho = ds?.dong ?? [];
	useEffect(() => {
		if (daDongBo.current || !objectiveId || ds === undefined) return;
		if (soGopYCho === null) return;
		daDongBo.current = true;
		const daThay = soTrongDanhSach(
			qc,
			{
				mine: trpc.okr.mine.pathKey(),
				danhSach: trpc.okr.danhSach.pathKey(),
			},
			objectiveId,
		);
		if ([soGopYCho, ...daThay].some((so) => so !== ds.dong.length))
			void cache.okr(objectiveId);
	}, [ds, soGopYCho, objectiveId, cache, qc, trpc]);

	const idCho = new Set(dongCho.map((d) => d.id));
	const tatCa = theoThuTu(
		[...dongCho, ...daQuyet.filter((d) => !idCho.has(d.id))],
		thuTu,
	);
	const conCho = dongCho.filter((d) => ketCua[d.id] === undefined).length;
	const dangSoan = ds?.dangSoan === true;
	if (dangSoan && thayDocLuc === null) setThayDocLuc(Date.now());
	if (!dangSoan && thayDocLuc !== null && danhSach.dataUpdatedAt > thayDocLuc)
		setThayDocLuc(null);
	const vuaSoan = useRef(false);
	useEffect(() => {
		if (vuaSoan.current && !dangSoan && objectiveId)
			void cache.okr(objectiveId);
		vuaSoan.current = dangSoan;
	}, [dangSoan, objectiveId, cache]);
	const quaHan =
		dangSoan &&
		thayDocLuc !== null &&
		Math.max(Date.now(), danhSach.dataUpdatedAt) - thayDocLuc >=
			TRO_LY_OKR_TRAN.tranChoMs;
	const maKetThuc = ds?.maKetThuc ?? null;

	const noiDung: NoiDungKara = (() => {
		if (!nhoDuoc) return "tat";
		if (danhSach.isError && ds === undefined) return "tai-loi";
		if (ds === undefined || ds.lyDo !== null) return "tat";
		if (tatCa.length > 0) return "co-gop-y";
		if (!ghiDuoc) return "tat";
		if (loiNho !== null) return "nho-loi";
		if (dangSoan && !quaHan) return "dang-doc";
		if (quaHan || (maKetThuc !== null && maKetThuc !== DA_NOP)) return "loi";
		if (maKetThuc === DA_NOP) return "rong";
		return "chua-goi";
	})();

	const docLai: DocLaiKara = (() => {
		if (loiNho !== null) return "nho-loi";
		if (batDau === null) return "yen";
		if (dangSoan && !quaHan) return "dang-doc";
		if (quaHan || (maKetThuc !== null && maKetThuc !== DA_NOP)) return "loi";
		return "yen";
	})();

	const tat: LyDoTat | null =
		sanSang.data && !sanSang.data.bat
			? TAT_KHI_CHUA_SAN_SANG[sanSang.data.lyDo]
			: null;

	const nut: NutKara = (() => {
		const s = sanSang.data;
		if (!s || (dangSoan && !quaHan) || !ghiDuoc) return { loai: "an" };
		if (s.bat) return { loai: "mo" };
		return tat === "het-luot" || tat === "tam-nghi"
			? { loai: "khoa", vi: tat }
			: { loai: "an" };
	})();

	const nho = () => {
		if (!coDich || nut.loai !== "mo" || deXuat.isPending) return;
		const muc = objectiveId ?? "";
		void deXuat.mutateAsync(dich).then(
			(kq) => {
				if (!kq.bat) {
					void sanSang.refetch();
					return;
				}
				const luc = Date.now();
				setBatDau(luc);
				setThayDocLuc(luc);
				void danhSach.refetch();
				theoDenXong(
					qc,
					muc,
					luc,
					() =>
						qc.fetchQuery({
							...trpc.okr.troLyDanhSach.queryOptions({ objectiveId: muc }),
							staleTime: 0,
						}),
					() => cache.okr(muc),
				);
			},
			() => void sanSang.refetch(),
		);
	};

	const thuLai = () => {
		if (nut.loai === "mo") nho();
		else void sanSang.refetch();
	};

	const baoLoi = (id: string, cause: unknown) =>
		setLoiDong((cu) => ({ ...cu, [id]: cauLoiDong(cause, mGopY) }));
	const xoaLoi = (id: string) => setLoiDong(({ [id]: _bo, ...cu }) => cu);

	const quyet = (
		d: DongHien,
		cach: CachQuyet,
		giaTri?: string,
		canCu?: string | null,
	) => {
		if (dangQuyet !== null || !ghiDuoc) return;
		const thuTuNay = tatCa.map((x) => x.id);
		const truocLienKet =
			d.loai === "can-chinh" && (cach === "nhan" || cach === "sua")
				? lienKetHienCo()
				: null;
		setDangQuyet(d.id);
		xoaLoi(d.id);
		void quyetDong
			.mutateAsync({ deXuatId: d.id, cach, giaTri, canCu })
			.then(
				async (kq) => {
					if (!kq.ok) {
						const cau = laLyDoKhongQuyet(kq.lyDo)
							? mGopY.loiQuyet[kq.lyDo]
							: null;
						if (cau === null) void sanSang.refetch();
						setLoiDong((cu) => ({
							...cu,
							[d.id]: cau ?? mGopY.loiDong["chua-san-sang"],
						}));
						return;
					}
					const canChinhId = await lienKetSauKhiNhan(truocLienKet, d);
					setThuTu(thuTuNay);
					setDaQuyet((cu) => [...cu.filter((x) => x.id !== d.id), d]);
					setKetCua((cu) => ({
						...cu,
						[d.id]: {
							ket: KET_CUA_CACH[cach],
							giaTri: giaTri ?? d.sau,
							daHoanTac: false,
							canChinhId,
						},
					}));
					if (objectiveId && truocLienKet === null) void cache.okr(objectiveId);
				},
				(cause: unknown) => {
					if (loaiLoiDong(cause) === "da-cu") void danhSach.refetch();
					baoLoi(d.id, cause);
				},
			)
			.finally(() => setDangQuyet(null));
	};

	const [dangHoan, setDangHoan] = useState<Readonly<Record<string, boolean>>>(
		{},
	);
	const datDangHoan = (id: string, dang: boolean) =>
		setDangHoan((cu) => ({ ...cu, [id]: dang }));

	const coHoanTac = (d: DongHien): boolean => {
		const k = ketCua[d.id];
		if (k?.ket !== "accepted" || k.daHoanTac) return false;
		if (d.loai === "can-chinh") return k.canChinhId !== null;
		return d.loai === "viet-lai" && d.truong !== null && d.truoc !== null;
	};

	const chayHoanTac = async (d: DongHien) => {
		const canChinhId = ketCua[d.id]?.canChinhId ?? null;
		if (d.loai === "can-chinh") {
			if (canChinhId !== null) await goCanChinh.mutateAsync({ id: canChinhId });
			return;
		}
		const truoc = d.truoc ?? "";
		if (d.truong === "kr.title" && d.keyResultId) {
			await suaKr.mutateAsync({ id: d.keyResultId, title: truoc });
			return;
		}
		await suaMucTieu.mutateAsync(
			d.truong === "title"
				? { id: d.objectiveId, title: truoc }
				: { id: d.objectiveId, whyNow: truoc },
		);
	};

	const hoanTac = async (d: DongHien) => {
		if (!coHoanTac(d) || dangHoan[d.id]) return;
		datDangHoan(d.id, true);
		xoaLoi(d.id);
		try {
			await chayHoanTac(d);
			setKetCua((cu) => {
				const k = cu[d.id];
				return k ? { ...cu, [d.id]: { ...k, daHoanTac: true } } : cu;
			});
			if (objectiveId) void cache.okr(objectiveId);
		} catch (cause) {
			baoLoi(d.id, cause);
		} finally {
			datDangHoan(d.id, false);
		}
	};

	const trangThai = (id: string): TrangThaiDong => {
		if (dangHoan[id]) return "dang-hoan-tac";
		const k = ketCua[id];
		if (k?.daHoanTac) return "da-hoan-tac";
		if (k) return "da-quyet";
		return dangQuyet === id ? "dang-quyet" : "cho";
	};

	const ban: KaraBusyState =
		(dangSoan && !quaHan) || deXuat.isPending
			? { label: mGopY.vung.dangDoc }
			: null;

	return {
		noiDung,
		nut,
		ban,
		nho,
		dangGui: deXuat.isPending,
		nhom: nhomTheoCho(tatCa),
		conCho,
		ketCua: (id: string): KetDong | undefined => ketCua[id],
		dangQuyet,
		loiDong,
		quyet,
		hoanTac,
		coHoanTac,
		trangThai,
		noi,
		datNoi: setNoi,
		coHoiDoiTrong: dongCho.some(
			(d) =>
				d.loai === "hoi" &&
				d.maVanDe === "thieu-doi-trong" &&
				ketCua[d.id] === undefined,
		),
		docLuc: ds?.docLuc ?? null,
		ghiDuoc,
		docLai,
		taiLai: () => void danhSach.refetch(),
		loiNho,
		thuLai,
		tat,
		daTai: !coDich || !nhoDuoc || danhSach.isError || ds !== undefined,
	};
}

export type GopYMucTieu = ReturnType<typeof useGopYMucTieu>;
