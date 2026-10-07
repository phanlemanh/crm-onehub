"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import {
	ketQuaTroLy,
	type LyDoKhongSanSang,
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
import { troLyOkrMessages } from "@/lib/messages/tro-ly-okr";
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
	| "co-gop-y";

export type DocLaiKara = "yen" | "dang-doc" | "loi";

export type NutKara =
	| { loai: "an" }
	| { loai: "mo" }
	| { loai: "khoa"; vi: "het-luot" | "tam-nghi" };

export type KetDong = {
	ket: "accepted" | "skipped";
	giaTri: string | null;
	daHoanTac: boolean;
};

export type NhomGopY = {
	capBo: DongHien[];
	viSao: DongHien[];
	theoKr: ReadonlyMap<string, DongHien[]>;
};

const DA_NOP = ketQuaTroLy.shape.trangThai.enum["da-nop"];

const KHOA_KHI_CHUA_SAN_SANG = {
	tat: null,
	"viec-tat": null,
	"don-vi-chua-bat": null,
	"het-tran-thang": "tam-nghi",
	"het-tran-ngay": "het-luot",
	"chua-noi-tac-tu": null,
	"chua-co-khoa-mo-hinh": null,
	"het-tran-gateway": null,
} as const satisfies Record<LyDoKhongSanSang, "tam-nghi" | "het-luot" | null>;

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

function nhipHoiLai(batDau: number | null, bayGio: number): number | false {
	return batDau !== null && bayGio - batDau < TRO_LY_OKR_TRAN.tranChoMs
		? TRO_LY_OKR_TRAN.hoiLaiMs
		: false;
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
	const mTroLy = troLyOkrMessages(useLocale());
	const coDich = objectiveId !== null;
	const dich = canEdit
		? { objectiveId: objectiveId ?? "" }
		: { objectiveId: objectiveId ?? "", keyResultId: krSuaDuoc[0] };
	const nhoDuoc = canEdit || krSuaDuoc.length > 0;
	const [batDau, setBatDau] = useState<number | null>(null);
	const [ketCua, setKetCua] = useState<Readonly<Record<string, KetDong>>>({});
	const [daQuyet, setDaQuyet] = useState<readonly DongHien[]>([]);
	const [loiDong, setLoiDong] = useState<Readonly<Record<string, string>>>({});
	const [dangQuyet, setDangQuyet] = useState<string | null>(null);
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
				? nhipHoiLai(batDau ?? q.state.dataUpdatedAt, Date.now())
				: false,
	});
	const deXuat = useMutation(trpc.okr.troLyDeXuat.mutationOptions());
	const quyetDong = useMutation(trpc.okr.troLyQuyet.mutationOptions());
	const suaMucTieu = useMutation(trpc.okr.updateObjective.mutationOptions());
	const suaKr = useMutation(trpc.okr.updateKeyResult.mutationOptions());

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
	const vuaSoan = useRef(false);
	useEffect(() => {
		if (vuaSoan.current && !dangSoan && objectiveId)
			void cache.okr(objectiveId);
		vuaSoan.current = dangSoan;
	}, [dangSoan, objectiveId, cache]);
	const quaHan =
		batDau !== null &&
		dangSoan &&
		danhSach.dataUpdatedAt - batDau >= TRO_LY_OKR_TRAN.tranChoMs;
	const maKetThuc = ds?.maKetThuc ?? null;

	const noiDung: NoiDungKara = (() => {
		if (!nhoDuoc || danhSach.isError || (ds?.lyDo ?? null) !== null)
			return "tat";
		if (ds === undefined) return "tat";
		if (tatCa.length > 0) return "co-gop-y";
		if (!ghiDuoc) return "tat";
		if (dangSoan && !quaHan) return "dang-doc";
		if (quaHan || (maKetThuc !== null && maKetThuc !== DA_NOP)) return "loi";
		if (maKetThuc === DA_NOP) return "rong";
		return "chua-goi";
	})();

	const docLai: DocLaiKara = (() => {
		if (batDau === null) return "yen";
		if (dangSoan && !quaHan) return "dang-doc";
		if (quaHan || (maKetThuc !== null && maKetThuc !== DA_NOP)) return "loi";
		return "yen";
	})();

	const nut: NutKara = (() => {
		const s = sanSang.data;
		if (!s || (dangSoan && !quaHan) || !ghiDuoc) return { loai: "an" };
		if (s.bat) return { loai: "mo" };
		const vi = KHOA_KHI_CHUA_SAN_SANG[s.lyDo];
		return vi === null ? { loai: "an" } : { loai: "khoa", vi };
	})();

	const nho = () => {
		if (!coDich || nut.loai !== "mo" || deXuat.isPending) return;
		deXuat.mutate(dich, {
			onSuccess: (kq) => {
				if (!kq.bat) {
					void sanSang.refetch();
					return;
				}
				setBatDau(Date.now());
				void danhSach.refetch();
			},
		});
	};

	const quyet = (d: DongHien, cach: CachQuyet, giaTri?: string) => {
		if (dangQuyet !== null || !ghiDuoc) return;
		const thuTuNay = tatCa.map((x) => x.id);
		setDangQuyet(d.id);
		setLoiDong(({ [d.id]: _bo, ...cu }) => cu);
		quyetDong.mutate(
			{ deXuatId: d.id, cach, giaTri },
			{
				onSuccess: (kq) => {
					if (!kq.ok) {
						void sanSang.refetch();
						const s = mTroLy.troLy.sanSang;
						setLoiDong((cu) => ({
							...cu,
							[d.id]: s.chuaSanSang(s.lyDo[kq.lyDo]),
						}));
						return;
					}
					setThuTu(thuTuNay);
					setDaQuyet((cu) => [...cu.filter((x) => x.id !== d.id), d]);
					setKetCua((cu) => ({
						...cu,
						[d.id]: {
							ket: KET_CUA_CACH[cach],
							giaTri: giaTri ?? d.sau,
							daHoanTac: false,
						},
					}));
					if (objectiveId) void cache.okr(objectiveId);
				},
				onError: (e) => {
					if (e.data?.code === "CONFLICT") {
						void danhSach.refetch();
						return;
					}
					setLoiDong((cu) => ({ ...cu, [d.id]: e.message }));
				},
				onSettled: () => setDangQuyet(null),
			},
		);
	};

	const hoanTac = (d: DongHien) => {
		const truoc = d.truoc;
		if (d.loai !== "viet-lai" || d.truong === null || truoc === null) return;
		const xong = {
			onSuccess: () => {
				setKetCua((cu) => {
					const k = cu[d.id];
					return k ? { ...cu, [d.id]: { ...k, daHoanTac: true } } : cu;
				});
				if (objectiveId) void cache.okr(objectiveId);
			},
			onError: (e: { message: string }) =>
				setLoiDong((cu) => ({ ...cu, [d.id]: e.message })),
		};
		if (d.truong === "kr.title" && d.keyResultId) {
			suaKr.mutate({ id: d.keyResultId, title: truoc }, xong);
			return;
		}
		suaMucTieu.mutate(
			d.truong === "title"
				? { id: d.objectiveId, title: truoc }
				: { id: d.objectiveId, whyNow: truoc },
			xong,
		);
	};

	return {
		noiDung,
		nut,
		nho,
		dangGui: deXuat.isPending,
		nhom: nhomTheoCho(tatCa),
		conCho,
		ketCua: (id: string): KetDong | undefined => ketCua[id],
		dangQuyet,
		loiDong,
		quyet,
		hoanTac,
		coHoiDoiTrong: dongCho.some(
			(d) =>
				d.loai === "hoi" &&
				d.maVanDe === "thieu-doi-trong" &&
				ketCua[d.id] === undefined,
		),
		docLuc: ds?.docLuc ?? null,
		ghiDuoc,
		docLai,
		daTai: !coDich || !nhoDuoc || danhSach.isError || ds !== undefined,
	};
}

export type GopYMucTieu = ReturnType<typeof useGopYMucTieu>;
