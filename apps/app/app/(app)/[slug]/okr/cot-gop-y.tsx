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
import { Field, FieldDescription, FieldError } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Shimmer } from "@crm/ui/components/shimmer";
import { Skeleton } from "@crm/ui/components/skeleton";
import {
	Suggestion,
	type SuggestionDecision,
} from "@crm/ui/components/suggestion";
import {
	ketQuaTroLy,
	type LyDoKhongSanSang,
	TRO_LY_OKR_TRAN,
	type TruongVietLai,
} from "@crm/validation/okr-tro-ly";
import { useMutation, useQuery } from "@tanstack/react-query";
import { type KeyboardEvent, type ReactNode, useId, useState } from "react";
import { toast } from "sonner";
import { okrGopYMessages } from "@/lib/messages/okr-gop-y";
import { homNayVn } from "@/lib/okr-chu-ky-nhan";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";

type DongHien = RouterOutputs["okr"]["troLyDanhSach"]["dong"][number];
type Cach = "nhan" | "sua" | "bac" | "bo-qua";
type KetQuyet = SuggestionDecision | "skipped";
type DaQuyet = { dong: DongHien; ket: KetQuyet; giaTri: string | null };

export type GiaTriDaNhan = {
	truong: TruongVietLai;
	keyResultId: string | null;
	giaTri: string;
};

const DA_NOP = ketQuaTroLy.shape.trangThai.enum["da-nop"];

export const LOP_THAN_HOP = {
	motCot: "-m-1 max-h-[70svh] overflow-y-auto p-1",
	coCot:
		"-m-1 grid max-h-[70svh] items-start gap-6 overflow-y-auto p-1 sm:grid-cols-2",
} as const;

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
	| { loai: "cho"; so: number };

type SanSang =
	| { bat: true }
	| { bat: false; lyDo: LyDoKhongSanSang }
	| undefined;

function trangThaiNut(
	sanSang: SanSang,
	coSuaChuaLuu: boolean,
	soCho: number,
): TrangThaiNut {
	if (!sanSang) return { loai: "an" };
	if (!sanSang.bat) {
		const hien = HIEN_KHI_CHUA_SAN_SANG[sanSang.lyDo];
		return hien === "vang" ? { loai: "an" } : { loai: "khoa", vi: hien };
	}
	if (coSuaChuaLuu) return { loai: "khoa", vi: "sua" };
	return soCho > 0 ? { loai: "cho", so: soCho } : { loai: "nho" };
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
}: {
	objectiveId: string | null;
	keyResultId?: string;
	coSuaChuaLuu: boolean;
	onDaNhan: (nhan: GiaTriDaNhan) => void;
}) {
	const m = okrGopYMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();
	const dich = { objectiveId: objectiveId ?? "", keyResultId };
	const coDich = objectiveId !== null;
	const [cotMoTay, setCotMoTay] = useState<boolean | null>(null);
	const [batDau, setBatDau] = useState<number | null>(null);
	const [daQuyet, setDaQuyet] = useState<readonly DaQuyet[]>([]);
	const [loiDong, setLoiDong] = useState<Readonly<Record<string, string>>>({});
	const [dangQuyet, setDangQuyet] = useState<string | null>(null);

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
			cotMoTay === true && q.state.data?.dangSoan === true
				? nhipHoiLai(batDau, Date.now())
				: false,
	});
	const deXuat = useMutation(trpc.okr.troLyDeXuat.mutationOptions());
	const quyetDong = useMutation(trpc.okr.troLyQuyet.mutationOptions());
	const suaMucTieu = useMutation(trpc.okr.updateObjective.mutationOptions());
	const suaKr = useMutation(trpc.okr.updateKeyResult.mutationOptions());

	const ds = danhSach.data;
	const dongCho = ds?.dong ?? [];
	const dangSoan = ds?.dangSoan === true;
	const cotMo = bat && (cotMoTay ?? (dongCho.length > 0 || dangSoan));
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
	const nut = trangThaiNut(sanSang.data, coSuaChuaLuu, soCho);

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
		const xong = {
			onSuccess: () => {
				baoNhan(d, truoc);
				toast.success(m.toast.daHoanTac);
				void cache.okr(d.objectiveId);
			},
			onError: (e: { message: string }) => toast.error(e.message),
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
						setLoiDong((cu) => ({ ...cu, [d.id]: m.dong.khongConBat }));
						return;
					}
					const cuoi = giaTri ?? d.sau;
					setDaQuyet((cu) => [
						...cu,
						{ dong: d, ket: KET_CUA_CACH[cach], giaTri: cuoi },
					]);
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
				onError: (e) => setLoiDong((cu) => ({ ...cu, [d.id]: e.message })),
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
		moCot: () => setCotMoTay(true),
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
				onClick={nut.loai === "cho" ? gopY.moCot : gopY.nho}
			>
				{nut.loai === "cho" ? m.nut.dangCho(String(nut.so)) : m.nut.nho}
			</Button>
		</div>
	);
}

function DongVietLai({
	dong,
	gopY,
	khoaNhan,
}: {
	dong: DongHien;
	gopY: GopY;
	khoaNhan: boolean;
}) {
	const m = okrGopYMessages(useLocale());
	const [banSua, setBanSua] = useState<string | null>(null);
	const [lanMo, setLanMo] = useState(0);
	const daQuyet = gopY.ketCua(dong.id);
	const ket = daQuyet?.ket;
	const huySua = () => {
		setBanSua(null);
		setLanMo((n) => n + 1);
	};
	const escTrongOSua = (su: KeyboardEvent<HTMLDivElement>) => {
		if (su.key === "Escape" && su.target instanceof HTMLInputElement) {
			setBanSua(null);
		}
	};
	const nhan = `${m.dong.loai["viet-lai"]} · ${dong.truong ? m.dong.truong[dong.truong] : ""}`;
	return (
		<Item
			size="sm"
			variant="outline"
			data-dong={dong.id}
			onKeyDownCapture={escTrongOSua}
		>
			<ItemContent>
				<Suggestion
					key={`${lanMo}-${ket ?? "cho"}`}
					label={nhan}
					before={dong.truoc ?? ""}
					value={daQuyet?.giaTri ?? dong.sau ?? ""}
					rationale={dong.lyDo}
					pending={gopY.dangQuyet === dong.id}
					decided={ket === "skipped" ? undefined : ket}
					error={gopY.loiDong[dong.id]}
					acceptDisabledReason={khoaNhan ? m.dong.khoaODangSua : undefined}
					onAccept={() => gopY.quyet(dong, "nhan")}
					onDismiss={() => gopY.quyet(dong, "bac")}
					onEdit={setBanSua}
				/>
				{banSua !== null && ket === undefined ? (
					<ItemActions>
						<Button
							type="button"
							size="sm"
							disabled={
								khoaNhan || banSua.trim() === "" || gopY.dangQuyet !== null
							}
							onClick={() => gopY.quyet(dong, "sua", banSua.trim())}
						>
							{m.dong.nhanBanSua}
						</Button>
						<Button type="button" size="sm" variant="ghost" onClick={huySua}>
							{m.dong.huySua}
						</Button>
					</ItemActions>
				) : null}
			</ItemContent>
		</Item>
	);
}

function DongCauHoi({ dong, gopY }: { dong: DongHien; gopY: GopY }) {
	const m = okrGopYMessages(useLocale());
	const ket = gopY.ketCua(dong.id)?.ket;
	const loi = gopY.loiDong[dong.id];
	return (
		<Item size="sm" variant="outline" data-dong={dong.id}>
			<ItemContent>
				<ItemDescription>{m.dong.loai.hoi}</ItemDescription>
				<p translate="no">{dong.sau ?? dong.lyDo}</p>
				{dong.sau ? <ItemDescription>{dong.lyDo}</ItemDescription> : null}
				{ket ? (
					<ItemDescription>{m.dong.daBoQua}</ItemDescription>
				) : (
					<ItemActions>
						<Button
							type="button"
							size="sm"
							variant="outline"
							disabled={gopY.dangQuyet !== null}
							onClick={() => gopY.quyet(dong, "bo-qua")}
						>
							{m.dong.boQua}
						</Button>
					</ItemActions>
				)}
				{loi ? <FieldError>{loi}</FieldError> : null}
			</ItemContent>
		</Item>
	);
}

function DongCanChinh({ dong, gopY }: { dong: DongHien; gopY: GopY }) {
	const m = okrGopYMessages(useLocale());
	const ket = gopY.ketCua(dong.id)?.ket;
	return (
		<Item size="sm" variant="outline" data-dong={dong.id}>
			<ItemContent>
				<Suggestion
					label={m.dong.loai["can-chinh"]}
					value={dong.tenDich ?? ""}
					rationale={dong.lyDo}
					pending={gopY.dangQuyet === dong.id}
					decided={ket === "skipped" ? undefined : ket}
					error={gopY.loiDong[dong.id]}
					onAccept={() => gopY.quyet(dong, "nhan")}
					onDismiss={() => gopY.quyet(dong, "bac")}
				/>
			</ItemContent>
		</Item>
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
			ref={cuonToi}
		>
			<Item size="xs">
				<ItemContent>
					<p>{gopY.laKr ? m.cot.tieuDeKr : m.cot.tieuDe}</p>
				</ItemContent>
				<ItemActions>
					<Button
						type="button"
						size="icon-sm"
						variant="ghost"
						aria-label={m.cot.dong}
						onClick={gopY.dongCot}
					>
						<Icon icon={Close} />
					</Button>
				</ItemActions>
			</Item>
			{children}
		</section>
	);
}

export function CotGopY({
	gopY,
	oDangSua,
}: {
	gopY: GopY;
	oDangSua: ReadonlySet<TruongVietLai>;
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
							{gopY.laKr ? m.cot.rongMoTaKr : m.cot.rongMoTa}
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
			</KhungCot>
		);
	}
	const conCho = gopY.dong.filter((d) => gopY.ketCua(d.id) === undefined);
	return (
		<KhungCot gopY={gopY} ban={gopY.dangSoan}>
			<ItemDescription>{m.cot.soDong(String(conCho.length))}</ItemDescription>
			<ItemGroup>
				{gopY.dong.map((d) =>
					d.loai === "hoi" ? (
						<DongCauHoi key={d.id} dong={d} gopY={gopY} />
					) : d.loai === "can-chinh" ? (
						<DongCanChinh key={d.id} dong={d} gopY={gopY} />
					) : (
						<DongVietLai
							key={d.id}
							dong={d}
							gopY={gopY}
							khoaNhan={d.truong !== null && oDangSua.has(d.truong)}
						/>
					),
				)}
			</ItemGroup>
		</KhungCot>
	);
}
