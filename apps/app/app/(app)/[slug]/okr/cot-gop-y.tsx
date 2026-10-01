"use client";

import Close from "@carbon/icons-react/es/Close";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Field, FieldDescription } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { ItemDescription, ItemGroup } from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SheetRailHeader, SheetRailTitle } from "@crm/ui/components/sheet";
import { Shimmer } from "@crm/ui/components/shimmer";
import { Skeleton } from "@crm/ui/components/skeleton";
import {
	ketQuaTroLy,
	type LyDoKhongSanSang,
	TRO_LY_OKR_TRAN,
	type TruongVietLai,
} from "@crm/validation/okr-tro-ly";
import { useMutation, useQuery } from "@tanstack/react-query";
import { type ReactNode, useId, useState } from "react";
import { toast } from "sonner";
import { okrGopYMessages } from "@/lib/messages/okr-gop-y";
import { troLyOkrMessages } from "@/lib/messages/tro-ly-okr";
import { homNayVn } from "@/lib/okr-chu-ky-nhan";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { phimCot, TheGopY } from "./the-gop-y";
import type { DongHien, KetQuyet } from "./the-gop-y-props";

type Cach = "nhan" | "sua" | "bac" | "bo-qua";
type DaQuyet = { dong: DongHien; ket: KetQuyet };

export type GiaTriDaNhan = {
	truong: TruongVietLai;
	keyResultId: string | null;
	giaTri: string;
};

const DA_NOP = ketQuaTroLy.shape.trangThai.enum["da-nop"];

const THANG_MOI_NAM = 12;

type LyDoKhoa = "tam-nghi" | "het-luot";

const HIEN_KHI_CHUA_SAN_SANG = {
	tat: "vang",
	"viec-tat": "vang",
	"don-vi-chua-bat": "vang",
	"het-tran-thang": "tam-nghi",
	"het-tran-ngay": "het-luot",
	"chua-noi-tac-tu": "vang",
	"chua-co-khoa-mo-hinh": "vang",
	"het-tran-gateway": "vang",
} as const satisfies Record<LyDoKhongSanSang, "vang" | LyDoKhoa>;

const THU_TU_TRUONG = {
	title: 0,
	whyNow: 1,
	"kr.title": 2,
} as const satisfies Record<TruongVietLai, number>;

const THU_TU_LOAI = { "viet-lai": 0, hoi: 3, "can-chinh": 4 } as const;

const KET_CUA_CACH = {
	nhan: "accepted",
	sua: "accepted",
	bac: "dismissed",
	"bo-qua": "skipped",
} as const satisfies Record<Cach, KetQuyet>;

function hang(d: DongHien): number {
	return d.loai === "viet-lai" && d.truong
		? THU_TU_TRUONG[d.truong]
		: THU_TU_LOAI[d.loai];
}

function sapXep(ds: DongHien[]): DongHien[] {
	return ds
		.map((d, i) => ({ d, i }))
		.sort((a, b) => hang(a.d) - hang(b.d) || a.i - b.i)
		.map(({ d }) => d);
}

export function dauThangSau(homNay: string): string {
	const thang = (Number(homNay.slice(5, 7)) % THANG_MOI_NAM) + 1;
	return `01/${String(thang).padStart(2, "0")}`;
}

type TrangThaiNut =
	| { loai: "an" }
	| { loai: "khoa"; vi: LyDoKhoa | "sua" }
	| { loai: "nho" }
	| { loai: "mo" }
	| { loai: "cho"; so: number };

type SanSang =
	| { bat: true }
	| { bat: false; lyDo: LyDoKhongSanSang }
	| undefined;

function trangThaiNut(
	sanSang: SanSang,
	coSuaChuaLuu: boolean,
	soCho: number,
	dangSoan: boolean,
): TrangThaiNut {
	if (!sanSang) return { loai: "an" };
	if (!sanSang.bat) {
		const hien = HIEN_KHI_CHUA_SAN_SANG[sanSang.lyDo];
		return hien === "vang" ? { loai: "an" } : { loai: "khoa", vi: hien };
	}
	if (coSuaChuaLuu) return { loai: "khoa", vi: "sua" };
	if (soCho > 0) return { loai: "cho", so: soCho };
	return dangSoan ? { loai: "mo" } : { loai: "nho" };
}

function nhipHoiLai(batDau: number | null, bayGio: number): number | false {
	return batDau !== null && bayGio - batDau < TRO_LY_OKR_TRAN.tranChoMs
		? TRO_LY_OKR_TRAN.hoiLaiMs
		: false;
}

function cuonToi(o: HTMLElement | null) {
	o?.scrollIntoView({ block: "nearest" });
}

export function useGopY({
	objectiveId,
	keyResultId,
	coSuaChuaLuu,
	onDaNhan,
	moKr,
}: {
	objectiveId: string | null;
	keyResultId?: string;
	coSuaChuaLuu: boolean;
	onDaNhan: (nhan: GiaTriDaNhan) => void;
	moKr?: (keyResultId: string) => void;
}) {
	const locale = useLocale();
	const m = okrGopYMessages(locale);
	const mTroLy = troLyOkrMessages(locale);
	const trpc = useTRPC();
	const cache = useCrmCache();
	const dich = { objectiveId: objectiveId ?? "", keyResultId };
	const coDich = objectiveId !== null;
	const [cotMoTay, setCotMoTay] = useState<boolean | null>(null);
	const [batDau, setBatDau] = useState<number | null>(null);
	const [daQuyet, setDaQuyet] = useState<readonly DaQuyet[]>([]);
	const [loiDong, setLoiDong] = useState<Readonly<Record<string, string>>>({});
	const [dangQuyet, setDangQuyet] = useState<string | null>(null);
	const [oDuocChi, setODuocChi] = useState<TruongVietLai | null>(null);

	const sanSang = useQuery({
		...trpc.okr.troLySanSang.queryOptions(dich),
		enabled: coDich,
		retry: false,
	});
	const bat = sanSang.data?.bat === true;
	const danhSach = useQuery({
		...trpc.okr.troLyDanhSach.queryOptions(dich),
		enabled: coDich && bat,
		retry: false,
		refetchInterval: (q) =>
			cotMoTay !== false && q.state.data?.dangSoan === true
				? nhipHoiLai(batDau ?? q.state.dataUpdatedAt, Date.now())
				: false,
	});
	const deXuat = useMutation(trpc.okr.troLyDeXuat.mutationOptions());
	const quyetDong = useMutation(trpc.okr.troLyQuyet.mutationOptions());
	const daHoanTac = (nhan: GiaTriDaNhan, objectiveId: string) => {
		onDaNhan(nhan);
		toast.success(m.toast.daHoanTac);
		void cache.okr(objectiveId);
	};
	const loiHoanTac = (e: { message: string }) => toast.error(e.message);
	const suaMucTieu = useMutation(
		trpc.okr.updateObjective.mutationOptions({
			onSuccess: (_kq, vao) => {
				if (vao.title !== undefined) {
					daHoanTac(
						{ truong: "title", keyResultId: null, giaTri: vao.title },
						vao.id,
					);
				} else if (vao.whyNow !== undefined) {
					daHoanTac(
						{ truong: "whyNow", keyResultId: null, giaTri: vao.whyNow },
						vao.id,
					);
				}
			},
			onError: loiHoanTac,
		}),
	);
	const suaKr = useMutation(
		trpc.okr.updateKeyResult.mutationOptions({
			onSuccess: (_kq, vao) => {
				if (vao.title === undefined || objectiveId === null) return;
				daHoanTac(
					{ truong: "kr.title", keyResultId: vao.id, giaTri: vao.title },
					objectiveId,
				);
			},
			onError: loiHoanTac,
		}),
	);

	const ds = danhSach.data;
	const dongCho = ds?.dong ?? [];
	const dangSoan = ds?.dangSoan === true;
	const cotMo = bat && (cotMoTay ?? (dongCho.length > 0 || dangSoan));
	if (batDau === null && dangSoan && danhSach.dataUpdatedAt > 0) {
		setBatDau(danhSach.dataUpdatedAt);
	}
	const moi = batDau === null || danhSach.dataUpdatedAt >= batDau;
	const quaHan =
		batDau !== null &&
		dangSoan &&
		danhSach.dataUpdatedAt - batDau >= TRO_LY_OKR_TRAN.tranChoMs;
	const idDaQuyet = new Set(daQuyet.map((q) => q.dong.id));
	const dong = sapXep([
		...dongCho.filter((d) => !idDaQuyet.has(d.id)),
		...daQuyet.map((q) => q.dong),
	]);
	const soCho = dongCho.filter((d) => !idDaQuyet.has(d.id)).length;
	const maKetThuc = ds?.maKetThuc ?? null;
	const hong =
		danhSach.isError ||
		quaHan ||
		(moi &&
			((ds?.lyDo ?? null) !== null ||
				(!dangSoan &&
					dong.length === 0 &&
					maKetThuc !== null &&
					maKetThuc !== DA_NOP)));
	const nut = trangThaiNut(sanSang.data, coSuaChuaLuu, soCho, dangSoan);

	const nho = () => {
		if (!coDich || !bat || coSuaChuaLuu || deXuat.isPending) return;
		deXuat.mutate(dich, {
			onSuccess: (kq) => {
				if (!kq.bat) {
					void sanSang.refetch();
					return;
				}
				setBatDau(Date.now());
				setCotMoTay(true);
				void danhSach.refetch();
			},
			onError: (e) => toast.error(e.message),
		});
	};

	const baoNhan = (d: DongHien, giaTri: string) => {
		if (d.loai !== "viet-lai" || d.truong === null) return;
		onDaNhan({ truong: d.truong, keyResultId: d.keyResultId, giaTri });
	};

	const hoanTac = (d: DongHien) => {
		const truoc = d.truoc;
		if (d.truong === null || truoc === null) return;
		if (d.truong === "kr.title" && d.keyResultId) {
			suaKr.mutate({ id: d.keyResultId, title: truoc });
			return;
		}
		suaMucTieu.mutate(
			d.truong === "title"
				? { id: d.objectiveId, title: truoc }
				: { id: d.objectiveId, whyNow: truoc },
		);
	};

	const quyet = (d: DongHien, cach: Cach, giaTri?: string) => {
		if (dangQuyet !== null) return;
		setDangQuyet(d.id);
		setLoiDong((cu) =>
			Object.fromEntries(Object.entries(cu).filter(([id]) => id !== d.id)),
		);
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
					const cuoi = giaTri ?? d.sau;
					setDaQuyet((cu) => [...cu, { dong: d, ket: KET_CUA_CACH[cach] }]);
					void cache.okr(d.objectiveId);
					if (cach !== "nhan" && cach !== "sua") return;
					if (d.loai === "viet-lai" && cuoi !== null) {
						baoNhan(d, cuoi);
						toast.success(m.toast.daNhan, {
							action: { label: m.toast.hoanTac, onClick: () => hoanTac(d) },
						});
						return;
					}
					toast.success(m.toast.daNhan);
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

	const ketCua = (id: string): DaQuyet | undefined =>
		daQuyet.find((q) => q.dong.id === id);

	return {
		laKr: keyResultId !== undefined,
		nut,
		cotMo,
		moCot: () => {
			setCotMoTay(true);
			if (dangSoan) void danhSach.refetch();
		},
		dongCot: () => setCotMoTay(false),
		nho,
		dangGui: deXuat.isPending,
		dangSoan: (dangSoan || !moi) && !quaHan,
		hong,
		dong,
		loiDong,
		dangQuyet,
		ketCua,
		quyet,
		coSuaChuaLuu,
		oDuocChi,
		chiO: setODuocChi,
		moKr,
	};
}

export type GopY = ReturnType<typeof useGopY>;

export function NutGopY({ gopY }: { gopY: GopY }) {
	const m = okrGopYMessages(useLocale());
	const idMoTa = useId();
	const nut = gopY.nut;
	if (nut.loai === "an") return null;
	if (nut.loai === "khoa") {
		const moTa =
			nut.vi === "tam-nghi"
				? m.nut.tamNghi(dauThangSau(homNayVn(new Date())))
				: nut.vi === "het-luot"
					? m.nut.hetLuot
					: m.nut.khoaSua;
		return (
			<Field data-disabled data-nut-gop-y="khoa">
				<div>
					<Button
						type="button"
						variant="outline"
						disabled
						aria-describedby={idMoTa}
					>
						{m.nut.nho}
					</Button>
				</div>
				<FieldDescription id={idMoTa}>{moTa}</FieldDescription>
			</Field>
		);
	}
	return (
		<div data-nut-gop-y={nut.loai}>
			<Button
				type="button"
				variant="outline"
				disabled={gopY.dangGui}
				onClick={nut.loai === "nho" ? gopY.nho : gopY.moCot}
			>
				{nut.loai === "cho" ? m.nut.dangCho(String(nut.so)) : m.nut.nho}
			</Button>
		</div>
	);
}

function KhungCot({
	gopY,
	ban,
	children,
}: {
	gopY: GopY;
	ban?: boolean;
	children: ReactNode;
}) {
	const m = okrGopYMessages(useLocale());
	return (
		<section
			aria-label={m.cot.tieuDe}
			aria-busy={ban}
			data-cot-gop-y
			data-khong-giu
			ref={cuonToi}
			onKeyDown={phimCot}
		>
			<SheetRailHeader>
				<SheetRailTitle>
					{gopY.laKr ? m.cot.tieuDeKr : m.cot.tieuDe}
				</SheetRailTitle>
				<Button
					type="button"
					size="icon-sm"
					variant="ghost"
					aria-label={m.cot.dong}
					onClick={gopY.dongCot}
				>
					<Icon icon={Close} />
				</Button>
			</SheetRailHeader>
			{children}
		</section>
	);
}

export function CotGopY({
	gopY,
	oDangSua,
	coGoiYTinh,
}: {
	gopY: GopY;
	oDangSua: ReadonlySet<TruongVietLai>;
	coGoiYTinh?: boolean;
}) {
	const m = okrGopYMessages(useLocale());
	if (gopY.hong) {
		return (
			<KhungCot gopY={gopY}>
				<Empty>
					<EmptyHeader>
						<EmptyTitle>{m.cot.loi}</EmptyTitle>
					</EmptyHeader>
					<EmptyContent>
						<Button
							type="button"
							size="sm"
							variant="outline"
							disabled={gopY.dangGui || gopY.nut.loai === "khoa"}
							onClick={gopY.nho}
						>
							{m.cot.thuLai}
						</Button>
					</EmptyContent>
				</Empty>
			</KhungCot>
		);
	}
	if (gopY.dong.length === 0 && gopY.dangSoan) {
		return (
			<KhungCot gopY={gopY} ban>
				<Shimmer>{gopY.laKr ? m.cot.dangDocKr : m.cot.dangDocMucTieu}</Shimmer>
				<ItemGroup>
					<Skeleton className="h-20 w-full" data-khung-dong />
					<Skeleton className="h-20 w-full" data-khung-dong />
					<Skeleton className="h-14 w-full" data-khung-dong />
				</ItemGroup>
			</KhungCot>
		);
	}
	if (gopY.dong.length === 0) {
		return (
			<KhungCot gopY={gopY}>
				<Empty>
					<EmptyHeader>
						<EmptyTitle>{m.cot.rong}</EmptyTitle>
						<EmptyDescription>
							{gopY.laKr
								? coGoiYTinh
									? m.cot.rongCoGoiY
									: m.cot.rongMoTaKr
								: m.cot.rongMoTa}
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</KhungCot>
		);
	}
	const conCho = gopY.dong.filter((d) => gopY.ketCua(d.id) === undefined);
	return (
		<KhungCot gopY={gopY} ban={gopY.dangSoan}>
			<ItemDescription>
				{conCho.length === 0
					? m.cot.daQuyetHet
					: m.cot.soDong(String(conCho.length))}
			</ItemDescription>
			<ItemGroup>
				{gopY.dong.map((d) => (
					<TheGopY
						key={d.id}
						dong={d}
						gopY={gopY}
						ket={gopY.ketCua(d.id)?.ket}
						khoaNhan={d.truong !== null && oDangSua.has(d.truong)}
					/>
				))}
			</ItemGroup>
		</KhungCot>
	);
}
