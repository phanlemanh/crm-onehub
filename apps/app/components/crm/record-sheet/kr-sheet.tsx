"use client";

import ChartLine from "@carbon/icons-react/es/ChartLine";
import ChevronLeft from "@carbon/icons-react/es/ChevronLeft";
import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import { Button } from "@crm/ui/components/button";
import { StatGroup } from "@crm/ui/components/dashboard";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { ConfidenceIndicator } from "@crm/ui/components/okr-status";
import { PickListDialog } from "@crm/ui/components/pick-list-dialog";
import { Progress } from "@crm/ui/components/progress";
import { Skeleton } from "@crm/ui/components/skeleton";
import { StatCard } from "@crm/ui/components/stat-card";
import { TargetLineChart } from "@crm/ui/components/target-line-chart";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@crm/ui/components/tooltip";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { useSearchInput } from "@crm/ui/hooks/use-search-input";
import { formatDay, formatDayShort } from "@crm/ui/lib/format";
import {
	skipToken,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
	type ReactNode,
	type RefObject,
	useEffect,
	useRef,
	useState,
} from "react";
import { toast } from "sonner";
import { giaTri } from "@/app/(app)/[slug]/okr/bang-kr";
import { coNutCapNhat, useCapNhatKr } from "@/app/(app)/[slug]/okr/cap-nhat-kr";
import { CANH_KR } from "@/app/(app)/[slug]/okr/kieu";
import { useXemDuocBanGhi } from "@/app/(app)/[slug]/okr/nguon-so";
import {
	CuonCaKhungContext,
	DetailSheetEmpty,
	DetailSheetHeader,
	DetailSheetProperties,
	DetailSheetProperty,
	DetailSheetProse,
	DetailSheetSection,
	type DetailSheetTab,
	DetailSheetTabs,
	SECTION_TITLE,
} from "@/components/detail-sheet";
import { okrMessages } from "@/lib/messages/okr";
import { okrCanhKrMessages } from "@/lib/messages/okr-canh-kr";
import { okrSoMessages } from "@/lib/messages/okr-so";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { TAB_SO_NGUON } from "./dien-bien-kr";
import { type BangChungVao, KrBangChung } from "./kr-bang-chung";
import {
	type CanhKr,
	type DuongVe,
	KrViecDanhSach,
	type LoaiSangKien,
	loiTheoNguoiLam,
	type TrangThaiCanh,
	type ViecVao,
} from "./kr-viec";
import { dien, dienNode } from "./plan-copy";
import { recordKey, useRecordSheetView, useRecordStack } from "./record-stack";
import { NoiDungSoKr } from "./so-kr-sheet";

const TAB = {
	viec: "viec",
	bangChung: "bang-chung",
	soNguon: TAB_SO_NGUON,
} as const;

type ChiTiet = RouterOutputs["okr"]["objective"];
type KrCuaMt = ChiTiet["keyResults"][number];
type DienBien = RouterOutputs["okr"]["dienBien"];
type Huong = "truoc" | "ke";

export type DauNganKr = {
	tieuDe: string | null;
	mucTieu: ReactNode;
	hanhDong: ReactNode;
};

export function KhungKr({
	duLieu,
	tab,
	onTab,
	onBack,
	viec,
	bangChung,
	dau,
	than,
}: {
	duLieu: TrangThaiCanh;
	tab: string;
	onTab: (tab: string) => void;
	onBack?: () => void;
	viec: ReactNode;
	bangChung: ReactNode;
	dau?: DauNganKr;
	than?: (tabs: ReactNode) => ReactNode;
}) {
	const m = okrCanhKrMessages(useLocale()).khung;
	const canh = duLieu.loai === "xong" ? duLieu.canh : null;
	const tabs: DetailSheetTab[] = [
		{ value: TAB.viec, label: m.tabViec, content: viec },
		...(canh?.kr.kind === "moc"
			? [{ value: TAB.bangChung, label: m.tabBangChung, content: bangChung }]
			: []),
	];
	const dangMo = tabs.some((t) => t.value === tab) ? tab : TAB.viec;
	const tenKr = canh?.kr.title ?? dau?.tieuDe ?? null;
	const theTab = (
		<DetailSheetTabs tabs={tabs} value={dangMo} onValueChange={onTab} />
	);
	return (
		<div
			className="contents"
			data-kr-sheet={canh?.kr.id}
			data-kieu-kr={canh?.kr.kind}
		>
			<DetailSheetHeader
				title={
					tenKr === null ? m.tieuDeCho : <span translate="no">{tenKr}</span>
				}
				description={
					dau
						? dau.mucTieu
						: canh
							? dienNode(m.phuTrach, {
									ten: <span translate="no">{canh.kr.ownerName}</span>,
								})
							: undefined
				}
				actions={dau?.hanhDong}
				onBack={onBack}
			/>
			{than ? than(theTab) : theTab}
		</div>
	);
}

function ChonSangKien({
	canh,
	loai,
	dong,
}: {
	canh: CanhKr;
	loai: LoaiSangKien;
	dong: () => void;
}) {
	const t = okrCanhKrMessages(useLocale()).chon;
	const m = t[loai];
	const trpc = useTRPC();
	const qc = useQueryClient();
	const cache = useCrmCache();
	const [tim, setTim] = useState("");
	const [, doiTim] = useSearchInput(tim, setTim);
	const [chon, setChon] = useState<string[]>([]);
	const [dangGan, setDangGan] = useState(false);
	const [loi, setLoi] = useState<string | null>(null);
	const keHoach = useQuery({
		...trpc.onboarding.listPlans.queryOptions({
			q: tim,
			pageSize: CANH_KR.soGoiY,
		}),
		enabled: loai === "ke-hoach",
		placeholderData: (truoc) => truoc,
	});
	const chienDich = useQuery({
		...trpc.campaigns.list.queryOptions(),
		enabled: loai === "chien-dich",
	});
	const gan = useMutation(trpc.okr.ganSangKien.mutationOptions());
	const daGan = new Set(
		canh.dong.flatMap((d) =>
			d.loai === loai && d.lienKet.coQuyen && d.lienKet.id !== null
				? [d.lienKet.id]
				: [],
		),
	);
	const muc = (
		loai === "ke-hoach"
			? (keHoach.data?.rows ?? []).map((p) => ({
					id: p.id,
					label: p.companyName,
				}))
			: (chienDich.data ?? []).map((c) => ({ id: c.id, label: c.name }))
	).filter((x) => !daGan.has(x.id));

	const xacNhan = async () => {
		if (dangGan || chon.length === 0) return;
		setDangGan(true);
		setLoi(null);
		const daXong: string[] = [];
		try {
			for (const banGhiId of chon) {
				await gan.mutateAsync({
					keyResultId: canh.kr.id,
					loai,
					banGhiId,
				});
				daXong.push(banGhiId);
			}
			toast.success(t.daGan);
			dong();
		} catch (e) {
			setChon(chon.filter((id) => !daXong.includes(id)));
			setLoi(e instanceof Error ? e.message : String(e));
		} finally {
			setDangGan(false);
			await Promise.all([
				qc.invalidateQueries({
					queryKey: trpc.okr.canhKr.queryKey({ keyResultId: canh.kr.id }),
				}),
				cache.okr(canh.kr.objectiveId, { settle: "record" }),
			]);
		}
	};

	return (
		<PickListDialog
			open
			onOpenChange={(mo) => {
				if (!mo && !dangGan) dong();
			}}
			title={m.tieuDe}
			description={m.moTa}
			searchPlaceholder={m.tim}
			items={muc}
			selected={chon}
			onSelectedChange={setChon}
			confirmLabel={(n) => (n > 0 ? dien(m.xacNhan, { n }) : t.gan)}
			cancelLabel={t.huy}
			emptyLabel={m.rong}
			onConfirm={() => void xacNhan()}
			pending={dangGan}
			error={loi}
			onSearchChange={loai === "ke-hoach" ? doiTim : undefined}
		/>
	);
}

function useGhiCanh(keyResultId: string, objectiveId: string | null) {
	const t = okrCanhKrMessages(useLocale()).bao;
	const trpc = useTRPC();
	const qc = useQueryClient();
	const cache = useCrmCache();
	const lamMoi = () =>
		Promise.all([
			qc.invalidateQueries({
				queryKey: trpc.okr.canhKr.queryKey({ keyResultId }),
			}),
			objectiveId
				? cache.okr(objectiveId, { settle: "record" })
				: Promise.resolve(),
		]).then(() => undefined);
	const baoLoi = (e: { message: string }) => toast.error(e.message);
	const them = useMutation(trpc.okr.themViec.mutationOptions());
	const sua = useMutation(trpc.okr.suaViec.mutationOptions());
	const danhDau = useMutation(
		trpc.okr.danhDauViec.mutationOptions({
			onSettled: () => void lamMoi(),
			onError: baoLoi,
		}),
	);
	const go = useMutation(trpc.okr.goViec.mutationOptions({ onError: baoLoi }));
	const dinh = useMutation(trpc.okr.themBangChung.mutationOptions());
	const goBangChung = useMutation(
		trpc.okr.goBangChung.mutationOptions({ onError: baoLoi }),
	);

	return {
		onThem: async (vao: ViecVao) => {
			await them.mutateAsync({ keyResultId, ...vao });
			toast.success(t.daThem);
			await lamMoi();
		},
		onSua: async (id: string, vao: ViecVao) => {
			await sua.mutateAsync({ id, ...vao });
			toast.success(t.daLuu);
			await lamMoi();
		},
		onDanhDau: (id: string, xong: boolean) => danhDau.mutate({ id, xong }),
		onGo: async (id: string) => {
			await go.mutateAsync({ id });
			toast.success(t.daGo);
			await lamMoi();
		},
		onDinh: async (vao: BangChungVao) => {
			await dinh.mutateAsync({ keyResultId, ...vao });
			toast.success(t.daDinh);
			await lamMoi();
		},
		onGoBangChung: async (id: string) => {
			await goBangChung.mutateAsync({ id });
			toast.success(t.daGo);
			await lamMoi();
		},
	};
}

export function useDuongVe(): DuongVe {
	const { stack, close } = useRecordStack();
	return { onVe: close, coMucTieuDuoi: stack.length > 1 };
}

type ChuyenKr = { huong: Huong | null };

const CHUYEN_KR: ChuyenKr = { huong: null };

function LienKetMucTieu({ mt }: { mt: ChiTiet }) {
	const { stack, close, open } = useRecordStack();
	const ref = { kind: "objective", id: mt.id } as const;
	const duoi = stack.at(-2);
	const href = `?${new URLSearchParams({ [SEARCH_PARAM.record.stack]: recordKey(ref) })}`;
	return (
		<a
			className="rounded-sm outline-none hover:text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring/60"
			data-lien-ket-muc-tieu={mt.id}
			href={href}
			onClick={(e) => {
				e.preventDefault();
				if (duoi && recordKey(duoi) === recordKey(ref)) close();
				else open(ref);
			}}
			translate="no"
		>
			{mt.title}
		</a>
	);
}

function NutSangKr({
	huong,
	nutRef,
	tat,
	onSang,
}: {
	huong: Huong;
	nutRef: RefObject<HTMLButtonElement | null>;
	tat: boolean;
	onSang: (huong: Huong) => void;
}) {
	const m = okrCanhKrMessages(useLocale()).khung;
	const nhan = huong === "ke" ? m.krKe : m.krTruoc;
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					ref={nutRef}
					aria-label={nhan}
					data-nut={`kr-${huong}`}
					disabled={tat}
					onClick={() => onSang(huong)}
					size="icon-sm"
					variant="outline"
				>
					<Icon icon={huong === "ke" ? ChevronRight : ChevronLeft} />
				</Button>
			</TooltipTrigger>
			<TooltipContent>{nhan}</TooltipContent>
		</Tooltip>
	);
}

function DauNganHanhDong({
	keyResultId,
	mt,
	onCapNhat,
}: {
	keyResultId: string;
	mt: ChiTiet | undefined;
	onCapNhat: (mt: ChiTiet, kr: KrCuaMt) => void;
}) {
	const m = okrCanhKrMessages(useLocale()).khung;
	const { thayDinh } = useRecordStack();
	const truoc = useRef<HTMLButtonElement>(null);
	const ke = useRef<HTMLButtonElement>(null);
	const ds = mt?.keyResults ?? [];
	const viTri = ds.findIndex((k) => k.id === keyResultId);
	const kr = ds[viTri];
	const daBiet = kr !== undefined;

	useEffect(() => {
		const huong = CHUYEN_KR.huong;
		if (!daBiet || huong === null) return;
		CHUYEN_KR.huong = null;
		const [nut, khac] =
			huong === "ke"
				? [ke.current, truoc.current]
				: [truoc.current, ke.current];
		(nut && !nut.disabled ? nut : khac)?.focus();
	}, [daBiet]);

	const sang = (huong: Huong) => {
		const dich = ds[viTri + (huong === "ke" ? 1 : -1)];
		if (!dich) return;
		CHUYEN_KR.huong = huong;
		thayDinh({ kind: "kr", id: dich.id });
	};

	return (
		<div
			className="flex min-w-0 flex-wrap items-center justify-end gap-1"
			data-dau-ngan-kr
		>
			{!daBiet || ds.length > 1 ? (
				<>
					{daBiet ? (
						<span
							aria-live="polite"
							className="px-1 text-muted-foreground text-xs tabular-nums"
						>
							<span aria-hidden="true" data-dem-kr>
								{viTri + 1}/{ds.length}
							</span>
							<span className="sr-only">
								{dien(m.dem, { n: viTri + 1, tong: ds.length })}
							</span>
						</span>
					) : null}
					<NutSangKr
						huong="truoc"
						nutRef={truoc}
						onSang={sang}
						tat={!daBiet || viTri === 0}
					/>
					<NutSangKr
						huong="ke"
						nutRef={ke}
						onSang={sang}
						tat={!daBiet || viTri === ds.length - 1}
					/>
				</>
			) : null}
			{mt && kr && coNutCapNhat(mt, kr) ? (
				<Button
					data-nut="cap-nhat-ngan-kr"
					onClick={() => onCapNhat(mt, kr)}
					size="sm"
				>
					{m.capNhat}
				</Button>
			) : null}
		</div>
	);
}

function DauMuc({ children }: { children: ReactNode }) {
	return (
		<div className="px-5 pt-3">
			<h3 className={SECTION_TITLE}>{children}</h3>
		</div>
	);
}

function OSoKr({ mt, kr }: { mt: ChiTiet; kr: KrCuaMt }) {
	const locale = useLocale();
	const m = okrCanhKrMessages(locale).khung;
	return (
		<>
			<DetailSheetSection data-muc-ngan="so">
				<StatGroup>
					<StatCard
						data-o-so="hien-tai"
						description={
							kr.kind === "moc"
								? undefined
								: dien(m.dich, { so: giaTri(kr, kr.targetValue, locale) })
						}
						label={m.hienTai}
						value={giaTri(kr, kr.currentValue, locale)}
					/>
					<StatCard
						data-o-so="tien-do"
						description={
							mt.expected === null
								? undefined
								: dien(m.kyVong, { n: Math.round(mt.expected) })
						}
						label={m.tienDo}
						value={`${Math.round(kr.progress)}%`}
					/>
				</StatGroup>
			</DetailSheetSection>
			<DetailSheetSection data-muc-ngan="tien-do">
				<Progress
					expected={mt.expected}
					label={m.tienDo}
					value={kr.progress}
					variant="neutral"
				/>
			</DetailSheetSection>
		</>
	);
}

function NoiDungLichSu({ d, tenKr }: { d: DienBien; tenKr: string }) {
	const locale = useLocale();
	const t = okrToanCanhMessages(locale).dienBien;
	const kieu = { kind: d.kieu, unit: d.donVi };
	const lan = d.diem
		.filter((p) => p.giaTri !== null || p.tuTin !== null)
		.reverse();
	const coDoThi = d.kieu !== "moc" && d.diem.some((p) => p.giaTri !== null);
	return (
		<div className="flex flex-col gap-3">
			{coDoThi ? (
				<TargetLineChart
					data={d.diem.map((p) => ({
						x: formatDayShort(p.tuan, locale),
						value: p.giaTri,
						expected: p.kyVong,
					}))}
					height={160}
					label={t.bieuDo(tenKr)}
					target={d.dich}
					targetLabel={t.dich(giaTri(kieu, d.dich, locale))}
				/>
			) : null}
			{lan.length === 0 ? (
				<DetailSheetProse>{t.chuaCo}</DetailSheetProse>
			) : (
				<ItemGroup data-lich-su-kr>
					{lan.map((p) => (
						<Item
							data-lan-cap-nhat={p.tuan}
							key={p.tuan}
							size="sm"
							variant="outline"
						>
							<ItemContent>
								<ItemTitle>
									<span className="tabular-nums">
										{formatDay(p.tuan, locale)}
									</span>
									{p.giaTri === null ? null : (
										<span data-gia-tri-lan>
											{giaTri(kieu, p.giaTri, locale)}
										</span>
									)}
								</ItemTitle>
								{p.ghiChu ? (
									<ItemDescription translate="no">{p.ghiChu}</ItemDescription>
								) : null}
							</ItemContent>
							{p.tuTin ? (
								<ItemActions>
									<ConfidenceIndicator level={p.tuTin} size="sm" />
								</ItemActions>
							) : null}
						</Item>
					))}
				</ItemGroup>
			)}
		</div>
	);
}

function LichSuKr({ kr }: { kr: KrCuaMt }) {
	const locale = useLocale();
	const m = okrCanhKrMessages(locale).khung;
	const t = okrToanCanhMessages(locale).dienBien;
	const trpc = useTRPC();
	const db = useQuery(trpc.okr.dienBien.queryOptions({ keyResultId: kr.id }));
	return (
		<DetailSheetSection data-muc-ngan="lich-su" title={m.lichSu}>
			{db.isPending ? (
				<Skeleton className="h-40 w-full" />
			) : db.isError ? (
				<VungTaiLoi
					dangTai={db.isFetching}
					moTa={db.error.message}
					onThuLai={() => void db.refetch()}
					tieuDe={t.loi}
				/>
			) : (
				<NoiDungLichSu d={db.data} tenKr={kr.title} />
			)}
		</DetailSheetSection>
	);
}

function SoNguonKr({ kr }: { kr: KrCuaMt }) {
	const locale = useLocale();
	const m = okrCanhKrMessages(locale).khung;
	const s = okrSoMessages(locale);
	const xem = useXemDuocBanGhi();
	if (kr.source === "tay" && !kr.doCanh)
		return (
			<DetailSheetSection>
				<DetailSheetProse>{m.nguonTay}</DetailSheetProse>
			</DetailSheetSection>
		);
	if (xem === "chua-biet")
		return (
			<DetailSheetSection>
				<Skeleton className="h-8 w-full" />
			</DetailSheetSection>
		);
	if (xem === "khong")
		return (
			<DetailSheetSection>
				<DetailSheetProse>{s.trangThai.bangKr.chiOkr}</DetailSheetProse>
			</DetailSheetSection>
		);
	return <NoiDungSoKr keyResultId={kr.id} />;
}

function ChiTietKr({ kr }: { kr: KrCuaMt }) {
	const locale = useLocale();
	const m = okrCanhKrMessages(locale).khung;
	return (
		<DetailSheetSection data-muc-ngan="chi-tiet" title={m.chiTiet}>
			<DetailSheetProperties columns={1}>
				<DetailSheetProperty label={m.chiTietPhuTrach}>
					<span translate="no">{kr.owner.name}</span>
				</DetailSheetProperty>
				{kr.dueOn ? (
					<DetailSheetProperty label={m.chiTietHan}>
						{formatDay(kr.dueOn, locale)}
					</DetailSheetProperty>
				) : null}
				<DetailSheetProperty label={m.chiTietKieu}>
					{okrMessages(locale).kieu[kr.kind]}
				</DetailSheetProperty>
			</DetailSheetProperties>
		</DetailSheetSection>
	);
}

function CacMucKr({
	mt,
	kr,
	tabs,
	tab,
}: {
	mt: ChiTiet;
	kr: KrCuaMt;
	tabs: ReactNode;
	tab: string;
}) {
	const m = okrCanhKrMessages(useLocale()).khung;
	const soNguon = useRef<HTMLElement>(null);
	const moSoNguon = tab === TAB.soNguon;
	useEffect(() => {
		if (moSoNguon) soNguon.current?.scrollIntoView?.({ block: "start" });
	}, [moSoNguon]);
	return (
		<div>
			<OSoKr kr={kr} mt={mt} />
			<LichSuKr kr={kr} />
			<section className="border-b" data-muc-ngan="viec-bang-chung">
				<DauMuc>{m.viecBangChung}</DauMuc>
				{tabs}
			</section>
			<section className="border-b" data-muc-ngan="so-nguon" ref={soNguon}>
				<DauMuc>{m.soNguon}</DauMuc>
				<SoNguonKr kr={kr} />
			</section>
			<ChiTietKr kr={kr} />
		</div>
	);
}

function DangTaiKr() {
	const m = okrCanhKrMessages(useLocale()).khung;
	return (
		<DetailSheetSection>
			<div aria-busy="true" className="flex flex-col gap-3" data-khung-xuong-kr>
				<span className="sr-only" role="status">
					{m.dangTaiNgan}
				</span>
				<div className="grid grid-cols-2 gap-3">
					<Skeleton className="h-20 w-full" />
					<Skeleton className="h-20 w-full" />
				</div>
				<Skeleton className="h-3 w-full" />
				<Skeleton className="h-40 w-full" />
			</div>
		</DetailSheetSection>
	);
}

function KhongThayKr({ ve }: { ve: DuongVe }) {
	const m = okrCanhKrMessages(useLocale()).khung;
	return (
		<DetailSheetEmpty
			action={
				<Button data-nut="ve-muc-tieu" onClick={ve.onVe} variant="outline">
					{ve.coMucTieuDuoi ? m.khongCo.veMucTieu : m.khongCo.dongKhung}
				</Button>
			}
			description={m.khongThay}
			icon={ChartLine}
			title={m.khongCo.tieuDe}
		/>
	);
}

type TrangMucTieu = {
	data: ChiTiet | undefined;
	isError: boolean;
	isPending: boolean;
	isFetching: boolean;
};

type TrangThaiNgan =
	| "ST-ngan-kr-mo"
	| "ST-ngan-kr-chi-doc"
	| "ST-ngan-kr-dang-tai"
	| "ST-ngan-kr-loi"
	| "ST-ngan-kr-khong-thay";

function ThanNganKr({
	duLieu,
	mtQ,
	kr,
	ve,
	onThuLai,
	children,
}: {
	duLieu: TrangThaiCanh;
	mtQ: TrangMucTieu;
	kr: KrCuaMt | null;
	ve: DuongVe;
	onThuLai: () => void;
	children: (mt: ChiTiet, kr: KrCuaMt) => ReactNode;
}) {
	const m = okrCanhKrMessages(useLocale()).khung;
	const mt = mtQ.data;
	const [trangThai, noiDung]: [TrangThaiNgan, ReactNode] =
		duLieu.loai === "loi" && duLieu.khongCo
			? ["ST-ngan-kr-khong-thay", <KhongThayKr key="kt" ve={ve} />]
			: duLieu.loai === "loi" || mtQ.isError
				? [
						"ST-ngan-kr-loi",
						<DetailSheetSection key="loi">
							<VungTaiLoi
								dangTai={mtQ.isFetching}
								moTa={m.loiTaiMoTa}
								onThuLai={onThuLai}
								tieuDe={m.loiTai}
							/>
						</DetailSheetSection>,
					]
				: duLieu.loai === "dang-tai" || mtQ.isPending
					? ["ST-ngan-kr-dang-tai", <DangTaiKr key="dt" />]
					: !mt || !kr
						? ["ST-ngan-kr-khong-thay", <KhongThayKr key="kt" ve={ve} />]
						: [
								coNutCapNhat(mt, kr) ? "ST-ngan-kr-mo" : "ST-ngan-kr-chi-doc",
								children(mt, kr),
							];
	return (
		<CuonCaKhungContext.Provider value>
			<div
				className="flex min-h-0 flex-1 flex-col overflow-y-auto"
				data-than-ngan-kr
				data-trang-thai={trangThai}
			>
				{noiDung}
			</div>
		</CuonCaKhungContext.Provider>
	);
}

export function KrSheet({ keyResultId }: { keyResultId: string }) {
	const trpc = useTRPC();
	const router = useRouter();
	const workspaceUrl = useWorkspaceUrl();
	const { stack, close, open, lotDuoi } = useRecordStack();
	const { tab, setTab } = useRecordSheetView(TAB.viec);
	const q = useQuery(trpc.okr.canhKr.queryOptions({ keyResultId }));
	const nguoi = useQuery(trpc.okr.thanhVien.queryOptions());
	const toi = useQuery(trpc.users.me.queryOptions());
	const [gan, setGan] = useState<LoaiSangKien | null>(null);
	const objectiveId = q.data?.kr.objectiveId ?? null;
	const duoi = stack.at(-2);
	const mtId = objectiveId ?? (duoi?.kind === "objective" ? duoi.id : null);
	const mtQ = useQuery(
		trpc.okr.objective.queryOptions(mtId ? { id: mtId } : skipToken),
	);
	const capNhat = useCapNhatKr();
	const ghi = useGhiCanh(keyResultId, objectiveId);
	const duoiMotMinh = stack.length === 1;
	const loiNguoiLam = (loi: Error, vao: ViecVao) =>
		loiTheoNguoiLam(
			loi,
			vao.nguoiLamUserId,
			async () => (await nguoi.refetch()).data,
		);

	useEffect(() => {
		if (objectiveId && duoiMotMinh)
			lotDuoi({ kind: "objective", id: objectiveId });
	}, [objectiveId, duoiMotMinh, lotDuoi]);

	const duLieu: TrangThaiCanh = q.data
		? { loai: "xong", canh: q.data }
		: q.error
			? {
					loai: "loi",
					thongDiep: q.error.message,
					khongCo: q.error.data?.code === "NOT_FOUND",
				}
			: { loai: "dang-tai" };
	const ve = useDuongVe();
	const mt = mtQ.data;
	const krMt = mt?.keyResults.find((k) => k.id === keyResultId) ?? null;
	const thuLai = () => {
		if (q.isError) void q.refetch();
		if (mtQ.isError) void mtQ.refetch();
	};

	return (
		<>
			<KhungKr
				duLieu={duLieu}
				tab={tab}
				onTab={setTab}
				onBack={ve.coMucTieuDuoi ? close : undefined}
				dau={{
					tieuDe: krMt?.title ?? null,
					mucTieu: mt && krMt ? <LienKetMucTieu mt={mt} /> : null,
					hanhDong: (
						<DauNganHanhDong
							keyResultId={keyResultId}
							mt={krMt ? mt : undefined}
							onCapNhat={capNhat.mo}
						/>
					),
				}}
				than={(tabs) => (
					<ThanNganKr
						duLieu={duLieu}
						kr={krMt}
						mtQ={mtQ}
						onThuLai={thuLai}
						ve={ve}
					>
						{(mtDu, krDu) => (
							<CacMucKr kr={krDu} mt={mtDu} tab={tab} tabs={tabs} />
						)}
					</ThanNganKr>
				)}
				viec={
					<KrViecDanhSach
						duLieu={duLieu}
						nguoi={(nguoi.data ?? []).map((u) => ({
							value: u.id,
							label: u.name,
							hint: u.email,
						}))}
						nguoiDangTai={nguoi.isPending}
						nguoiMacDinh={toi.data?.id ?? ""}
						hanhDong={{
							onThem: (vao) =>
								ghi.onThem(vao).catch((loi) => loiNguoiLam(loi, vao)),
							onSua: (id, vao) =>
								ghi.onSua(id, vao).catch((loi) => loiNguoiLam(loi, vao)),
							onDanhDau: ghi.onDanhDau,
							onGo: ghi.onGo,
							onGan: setGan,
							onMo: (loai, id) => {
								if (loai === "ke-hoach") open({ kind: "plan", id });
								else router.push(workspaceUrl(`/campaigns/${id}`));
							},
							onThuLai: () => void q.refetch(),
							ve,
						}}
					/>
				}
				bangChung={
					q.data ? (
						<KrBangChung
							canh={q.data}
							onDinh={ghi.onDinh}
							onGo={ghi.onGoBangChung}
						/>
					) : null
				}
			/>
			{capNhat.hop}
			{gan && q.data?.quyen.ganDuoc ? (
				<ChonSangKien canh={q.data} loai={gan} dong={() => setGan(null)} />
			) : null}
		</>
	);
}
