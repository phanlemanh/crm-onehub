"use client";

import Add from "@carbon/icons-react/es/Add";
import Close from "@carbon/icons-react/es/Close";
import Link from "@carbon/icons-react/es/Link";
import Notification from "@carbon/icons-react/es/Notification";
import NotificationFilled from "@carbon/icons-react/es/NotificationFilled";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import Renew from "@carbon/icons-react/es/Renew";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { EntityLogo } from "@crm/ui/components/entity-logo";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { KaraTrace } from "@crm/ui/components/kara";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import { krTheoKara } from "@crm/validation/okr-theo-kara";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { useContext, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { BangKr, type DemCanhKr } from "@/app/(app)/[slug]/okr/bang-kr";
import { BangVet } from "@/app/(app)/[slug]/okr/bang-vet";
import type { DiemCam } from "@/app/(app)/[slug]/okr/diem-cam";
import { useGopYMucTieu } from "@/app/(app)/[slug]/okr/gop-y-kara";
import { HopThoaiCanChinh } from "@/app/(app)/[slug]/okr/hop-thoai-can-chinh";
import {
	HopThoaiCapNhatKr,
	krCapNhatTuSheet,
} from "@/app/(app)/[slug]/okr/hop-thoai-cap-nhat-kr";
import { HopThoaiKr } from "@/app/(app)/[slug]/okr/hop-thoai-kr";
import { HopThoaiMucTieu } from "@/app/(app)/[slug]/okr/hop-thoai-muc-tieu";
import { CELL, type KetQua } from "@/app/(app)/[slug]/okr/kieu";
import {
	BoKhoaUrl,
	khoaHopOkr,
	useHopOkr,
} from "@/app/(app)/[slug]/okr/ngan-okr-url";
import {
	DeXuatNeo,
	type LoiDiKr,
	VungKara,
} from "@/app/(app)/[slug]/okr/nhom-kara";
import { parseAsNeoGopY } from "@/app/(app)/[slug]/okr/okr-search-params";
import {
	NhanTinhTrang,
	NhanTrangThai,
} from "@/app/(app)/[slug]/okr/tien-do-kr";
import { OwnerCell } from "@/components/crm/owner-cell";
import {
	CuonCaKhungContext,
	DetailSheetBody,
	DetailSheetEmpty,
	DetailSheetSection,
	DetailSheetStat,
	DetailSheetStats,
	type DetailSheetTab,
	DetailSheetTable,
} from "@/components/detail-sheet";
import { NhanGioiHan } from "@/components/okr/nhan-gioi-han";
import { okrMessages } from "@/lib/messages/okr";
import { okrGioiHanMessages } from "@/lib/messages/okr-gioi-han";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { TabDienBien } from "./objective-dien-bien";
import {
	coDaiDuyet,
	DaiDuyet,
	DongLyDoGuiKhoa,
	khoaGuiDuyet,
	NutGuiDuyet,
} from "./objective-duyet";
import { HopMucHienThi } from "./objective-hien-thi";
import { TabTraoDoi } from "./objective-trao-doi";
import { dien } from "./plan-copy";
import { RecordSheetFrame } from "./record-parts";
import { useRecordSheetView, useRecordStack } from "./record-stack";

type ChiTiet = RouterOutputs["okr"]["objective"];
type NoiGop = ChiTiet["alignments"][number];

const TRANG_THAI_SHEET = {
	nhap: "ST-sheet-nhap",
	"cho-duyet": "ST-sheet-choduyet",
	"cong-bo": "ST-sheet-congbo",
	"da-bo": "ST-sheet-dabo",
} as const satisfies Record<ChiTiet["status"], string>;

const ghiDuoc = (mt: ChiTiet) => mt.canEdit && mt.status !== "da-bo";

const suaNoiDung = (mt: ChiTiet) => ghiDuoc(mt) && mt.choDuyet === null;

function useXong(objectiveId: string, baoXong: string, sau: () => void) {
	const cache = useCrmCache();
	return {
		onSuccess: (kq: { canhBao: string | null }) => {
			if (kq.canhBao) toast.warning(kq.canhBao);
			toast.success(baoXong);
			sau();
			void cache.okr(objectiveId);
		},
		onError: (e: { message: string }) => {
			sau();
			toast.error(e.message);
		},
	};
}

function NutTheoDoi({ mt }: { mt: ChiTiet }) {
	const m = okrMessages(useLocale()).sheet;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const theoDoi = useMutation(
		trpc.okr.follow.mutationOptions({
			onSuccess: () => cache.okr(mt.id, { settle: "record" }),
			onError: (e) => toast.error(e.message),
		}),
	);
	const dang = theoDoi.isPending ? theoDoi.variables.on : mt.following;
	return (
		<Button
			aria-pressed={dang}
			data-nut="theo-doi"
			disabled={theoDoi.isPending}
			onClick={() => theoDoi.mutate({ objectiveId: mt.id, on: !dang })}
			size="sm"
			variant="outline"
		>
			<Icon
				data-icon="inline-start"
				icon={dang ? NotificationFilled : Notification}
			/>
			<span className="max-sm:sr-only">{dang ? m.dangTheoDoi : m.theoDoi}</span>
		</Button>
	);
}

function HanhDongMucTieu({
	mt,
	moHienThi,
}: {
	mt: ChiTiet;
	moHienThi: () => void;
}) {
	const locale = useLocale();
	const m = okrMessages(locale).sheet;
	const g = okrGioiHanMessages(locale);
	const trpc = useTRPC();
	const toi = useQuery(trpc.users.me.queryOptions());
	const [hoi, setHoi] = useState<"cong-bo" | "bo" | "xoa" | null>(null);
	const [, datHop] = useHopOkr();
	const { close } = useRecordStack();
	const cache = useCrmCache();
	const dongHoi = () => setHoi(null);
	const congBo = useMutation(
		trpc.okr.publishObjective.mutationOptions(
			useXong(mt.id, m.daCongBo, dongHoi),
		),
	);
	const bo = useMutation(
		trpc.okr.dropObjective.mutationOptions(useXong(mt.id, m.daBo, dongHoi)),
	);
	const xoa = useMutation(
		trpc.okr.xoaMucTieu.mutationOptions({
			onSuccess: () => {
				toast.success(m.daXoa);
				dongHoi();
				close();
				void cache.okr(mt.id);
			},
			onError: (e) => {
				dongHoi();
				toast.error(e.message);
				void cache.okr(mt.id);
			},
		}),
	);
	const dungLai = useMutation(
		trpc.okr.dungLaiMucTieu.mutationOptions({
			onSuccess: (kq) => {
				if (kq.canhBao) toast.warning(kq.canhBao);
				toast.success(
					kq.canGuiDuyet ? m.daDungLai.guiDuyet : m.daDungLai.congBo,
				);
				void cache.okr(mt.id);
			},
			onError: (e) => toast.error(e.message),
		}),
	);

	const vuaTraLai =
		mt.traLaiGanNhat?.nguoi?.id !== undefined &&
		mt.traLaiGanNhat.nguoi.id === toi.data?.id;

	const hopXoa = (
		<ConfirmDialog
			nut={m.hoiXoa.action}
			thoi={m.hoiXoa.cancel}
			tieuDe={m.hoiXoa.title}
			than={m.hoiXoa.body(mt.keyResults.length)}
			noiDung={
				<p className="font-medium text-sm" translate="no">
					{mt.title}
				</p>
			}
			open={hoi === "xoa"}
			pending={xoa.isPending}
			onOpenChange={(mo) => {
				if (!mo && !xoa.isPending) dongHoi();
			}}
			onConfirm={() => {
				if (!xoa.isPending) xoa.mutate({ id: mt.id });
			}}
		/>
	);
	const mucXoa = (
		<DropdownMenuItem
			data-muc="xoa-muc-tieu"
			variant="destructive"
			onSelect={() => setHoi("xoa")}
		>
			{m.xoa}
		</DropdownMenuItem>
	);

	if (mt.status === "da-bo")
		return (
			<>
				{mt.quyen.dungLai ? (
					<Button
						size="sm"
						variant="outline"
						data-nut="dung-lai"
						disabled={dungLai.isPending}
						onClick={() => dungLai.mutate({ id: mt.id })}
					>
						{m.dungLai}
					</Button>
				) : null}
				{mt.quyen.xoa ? (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button aria-label={m.menu} size="icon-sm" variant="ghost">
								<Icon icon={OverflowMenuHorizontal} />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">{mucXoa}</DropdownMenuContent>
					</DropdownMenu>
				) : null}
				{hopXoa}
			</>
		);

	if (!ghiDuoc(mt)) return null;

	return (
		<>
			{mt.quyen.guiDuyet ? (
				mt.traLaiGanNhat === null ? (
					<NutGuiDuyet
						objectiveId={mt.id}
						soKr={mt.keyResults.length}
						nguoiDuyet={mt.nguoiDuyetDuKien}
						lyDo="dong-rieng"
					/>
				) : null
			) : mt.quyen.congBo && !mt.quyen.duyet ? (
				<Button
					size="sm"
					variant={vuaTraLai ? "outline" : "default"}
					data-variant={vuaTraLai ? "outline" : "default"}
					data-nut="cong-bo"
					disabled={congBo.isPending}
					onClick={() => setHoi("cong-bo")}
				>
					{m.congBo}
				</Button>
			) : null}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button aria-label={m.menu} size="icon-sm" variant="ghost">
						<Icon icon={OverflowMenuHorizontal} />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem
						disabled={!suaNoiDung(mt)}
						onSelect={() => void datHop({ loai: "muc-tieu" })}
					>
						{m.sua}
					</DropdownMenuItem>
					<DropdownMenuItem
						data-muc="muc-hien-thi"
						disabled={!mt.quyen.datHienThi}
						onSelect={moHienThi}
					>
						{g.menuMucHienThi}
					</DropdownMenuItem>
					{mt.quyen.xoa ? (
						mucXoa
					) : (
						<DropdownMenuItem
							data-muc="bo-muc-tieu"
							variant="destructive"
							onSelect={() => setHoi("bo")}
						>
							{m.bo}
						</DropdownMenuItem>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
			{hopXoa}
			<ConfirmDialog
				tone="default"
				nut={m.hoiCongBo.action}
				thoi={m.hoiCongBo.cancel}
				tieuDe={m.hoiCongBo.title}
				than={m.hoiCongBo.body}
				open={hoi === "cong-bo"}
				pending={congBo.isPending}
				onOpenChange={(mo) => {
					if (!mo && !congBo.isPending) dongHoi();
				}}
				onConfirm={() => {
					if (!congBo.isPending) congBo.mutate({ id: mt.id });
				}}
			/>
			<ConfirmDialog
				nut={m.hoiBo.action}
				thoi={m.hoiBo.cancel}
				tieuDe={m.hoiBo.title}
				than={m.hoiBo.body}
				open={hoi === "bo"}
				pending={bo.isPending}
				onOpenChange={(mo) => {
					if (!mo && !bo.isPending) dongHoi();
				}}
				onConfirm={() => {
					if (!bo.isPending) bo.mutate({ id: mt.id });
				}}
			/>
		</>
	);
}

function MenuKr({
	mt,
	kr,
	capNhat,
	sua,
	xoa,
}: {
	mt: ChiTiet;
	kr: KetQua;
	capNhat: () => void;
	sua: () => void;
	xoa: () => void;
}) {
	const m = okrMessages(useLocale()).sheet;
	const capNhatDuoc = kr.hienTaiQuaCapNhat && mt.canEditKr.includes(kr.id);
	const suaDuoc =
		mt.status !== "da-bo" &&
		mt.choDuyet === null &&
		mt.canEditKr.includes(kr.id);
	const xoaDuoc = suaNoiDung(mt);
	if (!capNhatDuoc && !suaDuoc && !xoaDuoc) return null;
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					aria-label={dien(m.menuKr, { ten: kr.title })}
					size="icon-sm"
					variant="ghost"
				>
					<Icon icon={OverflowMenuHorizontal} />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{capNhatDuoc ? (
					<DropdownMenuItem data-muc="cap-nhat-kr" onSelect={capNhat}>
						{m.capNhatKr}
					</DropdownMenuItem>
				) : null}
				{suaDuoc ? (
					<DropdownMenuItem data-muc="sua-kr" onSelect={sua}>
						{m.suaKr}
					</DropdownMenuItem>
				) : null}
				{xoaDuoc ? (
					<DropdownMenuItem variant="destructive" onSelect={xoa}>
						{m.xoaKr}
					</DropdownMenuItem>
				) : null}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function demCanh(mt: ChiTiet): ReadonlyMap<string, DemCanhKr> {
	return new Map(
		mt.keyResults.map((k) => [
			k.id,
			{
				xong: k.soViec.xong,
				tong: k.soViec.tong,
				sangKien: k.soSangKien,
				coBangChung: k.coBangChung,
				suaDuoc:
					mt.kyGhiDuoc &&
					mt.status !== "da-bo" &&
					mt.choDuyet === null &&
					mt.canEditKr.includes(k.id),
			},
		]),
	);
}

type HopKr = { loai: "cap-nhat"; kr: KetQua; sessionId: string | null };

function NganOkr({ mt }: { mt: ChiTiet }) {
	const [hop, datHop] = useHopOkr();
	const kr =
		hop?.loai === "kr"
			? (mt.keyResults.find((k) => k.id === hop.id) ?? null)
			: null;
	const duoc =
		hop === null
			? false
			: hop.loai === "kr"
				? kr !== null &&
					mt.status !== "da-bo" &&
					mt.choDuyet === null &&
					mt.canEditKr.includes(kr.id)
				: hop.loai === "kr-moi"
					? suaNoiDung(mt) || mt.themKrLe
					: suaNoiDung(mt);
	if (hop === null) return null;
	if (!duoc)
		return <BoKhoaUrl key={khoaHopOkr(hop)} bo={() => void datHop(null)} />;
	const dong = () => void datHop(null);
	if (hop.loai === "muc-tieu") {
		return (
			<HopThoaiMucTieu
				key={khoaHopOkr(hop)}
				yeuCau={{ loai: "sua", mucTieu: mt }}
				dong={dong}
			/>
		);
	}
	return (
		<HopThoaiKr
			key={khoaHopOkr(hop)}
			objectiveId={mt.id}
			mucTieu={mt}
			kr={kr}
			chuMacDinh={mt.owner.id}
			suaDuocCot={mt.canEdit || (kr === null && mt.themKrLe)}
			dong={dong}
		/>
	);
}

function KhuViSao({ mt }: { mt: ChiTiet }) {
	const m = okrMessages(useLocale()).sheet;
	if (mt.whyNow.trim() === "") return null;
	return (
		<div data-khu="vi-sao">
			<DetailSheetSection title={m.khuViSao}>
				<p className="text-pretty text-sm" translate="no">
					{mt.whyNow}
				</p>
			</DetailSheetSection>
		</div>
	);
}

function KhuGopVao({ mt }: { mt: ChiTiet }) {
	const m = okrMessages(useLocale()).sheet;
	if (mt.alignments.length === 0) return null;
	return (
		<div data-khu="gop-vao">
			<DetailSheetSection title={m.khuGopVao}>
				<ItemGroup>
					{mt.alignments.map((g) => (
						<Item
							data-gop-vao={g.alignmentId}
							key={g.alignmentId}
							role="listitem"
							size="xs"
						>
							<ItemContent>
								<ItemTitle title={g.objectiveTitle} translate="no">
									{g.objectiveTitle}
								</ItemTitle>
								<ItemDescription unclamped>
									<span translate="no">{g.unitName}</span>
									{g.keyResultTitle ? (
										<>
											{" · "}
											{dien(m.quaKr, { ten: g.keyResultTitle })}
										</>
									) : null}
								</ItemDescription>
							</ItemContent>
						</Item>
					))}
				</ItemGroup>
			</DetailSheetSection>
		</div>
	);
}

function TabKr({ mt, diemCam }: { mt: ChiTiet; diemCam?: DiemCam }) {
	const m = okrMessages(useLocale()).sheet;
	const trpc = useTRPC();
	const [hop, setHop] = useState<HopKr | null>(null);
	const [, datHopOkr] = useHopOkr();
	const moPhien = useMutation(trpc.okr.moCapNhat.mutationOptions());
	const moCapNhat = (kr: KetQua) => {
		setHop({ loai: "cap-nhat", kr, sessionId: null });
		moPhien.mutate(
			{ entry: "sheet" },
			{
				onSuccess: ({ sessionId }) =>
					setHop((cu) => (cu?.kr.id === kr.id ? { ...cu, sessionId } : cu)),
			},
		);
	};
	const [xoa, setXoa] = useState<KetQua | null>(null);
	const go = useMutation(
		trpc.okr.removeKeyResult.mutationOptions(
			useXong(mt.id, m.daXoaKr, () => setXoa(null)),
		),
	);
	const coMenu =
		mt.status !== "da-bo" && (mt.canEdit || mt.canEditKr.length > 0);
	const gopY = useGopYMucTieu({
		objectiveId: mt.id,
		soGopYCho: mt.soGopYCho,
		canEdit: mt.canEdit,
		krSuaDuoc: mt.canEditKr,
		ghiDuoc: mt.status !== "da-bo" && mt.choDuyet === null && mt.kyGhiDuoc,
	});
	const moKr = (di: LoiDiKr) => {
		if (di.loai === "kr-moi") void datHopOkr({ loai: "kr-moi" });
		else if (di.loai === "sua-kr")
			void datHopOkr({ loai: "kr", id: di.keyResultId });
		else void datHopOkr({ loai: "muc-tieu" });
	};
	const theoKara = krTheoKara(mt.trail);
	const diemKara: DiemCam = {
		duoiKr: (kr) => {
			const ds = gopY.nhom.theoKr.get(kr.id) ?? [];
			if (ds.length === 0) return null;
			return (
				<div className="flex flex-col gap-1">
					{ds.map((d) => (
						<DeXuatNeo d={d} gopY={gopY} key={d.id} moKr={moKr} />
					))}
				</div>
			);
		},
		sauTenKr: (kr) => (theoKara.has(kr.id) ? <KaraTrace /> : null),
	};
	const vung = useRef<HTMLDivElement>(null);
	const [neo, setNeo] = useQueryState(SEARCH_PARAM.okr.neoGopY, parseAsNeoGopY);
	const coVungKara = gopY.noiDung !== "tat";
	const khoKhung = useContext(CuonCaKhungContext);
	useEffect(() => {
		if (!neo || !gopY.daTai || khoKhung === "chua-biet") return;
		if (coVungKara) {
			const giam = window.matchMedia(
				"(prefers-reduced-motion: reduce)",
			).matches;
			vung.current?.scrollIntoView({
				block: "start",
				behavior: giam ? "auto" : "smooth",
			});
		}
		void setNeo(null);
	}, [neo, gopY.daTai, coVungKara, setNeo, khoKhung]);

	return (
		<DetailSheetBody>
			<KhuViSao mt={mt} />
			{gopY.nhom.viSao.length > 0 ? (
				<div className="flex flex-col gap-1 px-5 pb-3">
					{gopY.nhom.viSao.map((d) => (
						<DeXuatNeo d={d} gopY={gopY} key={d.id} moKr={moKr} />
					))}
				</div>
			) : null}
			<KhuGopVao mt={mt} />
			<div
				className="scroll-mt-4 px-5 py-3 empty:hidden"
				data-vung-kara
				ref={vung}
			>
				<VungKara gopY={gopY} moKr={moKr} soKr={mt.keyResults.length} />
			</div>
			<DetailSheetTable>
				<BangKr
					diemCam={{ ...diemKara, ...diemCam }}
					mucTieu={mt}
					keyResults={mt.keyResults}
					kind={mt.kind}
					expected={mt.expected}
					danhDauCuaToi={false}
					hoiDoiTrong={suaNoiDung(mt) && !gopY.coHoiDoiTrong}
					canh={demCanh(mt)}
					nhanHanhDong={m.cotThaoTac}
					hanhDong={
						coMenu
							? (kr) => (
									<MenuKr
										mt={mt}
										kr={kr}
										capNhat={() => moCapNhat(kr)}
										sua={() => void datHopOkr({ loai: "kr", id: kr.id })}
										xoa={() => setXoa(kr)}
									/>
								)
							: undefined
					}
				/>
			</DetailSheetTable>
			{mt.keyResults.length > 0 ? (
				<p className="px-5 pt-2 text-muted-foreground text-xs" data-tien-do-tu>
					{m.tienDoTuSo(String(mt.progress), String(mt.keyResults.length))}
				</p>
			) : null}
			{suaNoiDung(mt) || mt.themKrLe ? (
				<div className="px-5 py-3">
					<Button
						size="sm"
						variant="outline"
						data-nut="them-kr"
						aria-haspopup="dialog"
						onClick={() => void datHopOkr({ loai: "kr-moi" })}
					>
						<Icon icon={Add} data-icon="inline-start" />
						{m.themKr}
					</Button>
				</div>
			) : null}
			{hop ? (
				<HopThoaiCapNhatKr
					kr={krCapNhatTuSheet(mt, hop.kr)}
					chuTen={hop.kr.owner.name}
					ghiHo={!hop.kr.laCuaToi}
					sessionId={hop.sessionId}
					loiMo={moPhien.isError}
					moLai={() => moCapNhat(hop.kr)}
					dong={() => setHop(null)}
				/>
			) : null}
			<ConfirmDialog
				tone="destructive"
				nut={m.hoiXoaKr.action}
				thoi={m.hoiXoaKr.cancel}
				tieuDe={dien(m.hoiXoaKr.title, { ten: xoa?.title ?? "" })}
				than={m.hoiXoaKr.body}
				open={xoa !== null}
				pending={go.isPending}
				onOpenChange={(mo) => {
					if (!mo && !go.isPending) setXoa(null);
				}}
				onConfirm={() => {
					if (xoa && !go.isPending) go.mutate({ id: xoa.id });
				}}
			/>
		</DetailSheetBody>
	);
}

function TabCanChinh({ mt }: { mt: ChiTiet }) {
	const m = okrMessages(useLocale()).sheet;
	const trpc = useTRPC();
	const [gan, setGan] = useState(false);
	const [goDi, setGoDi] = useState<NoiGop | null>(null);
	const go = useMutation(
		trpc.okr.removeAlignment.mutationOptions(
			useXong(mt.id, m.daGo, () => setGoDi(null)),
		),
	);
	const sua = suaNoiDung(mt);
	const tenNoi = (g: NoiGop) => g.keyResultTitle ?? g.objectiveTitle;

	const nutGan = sua ? (
		<Button
			size="sm"
			variant="outline"
			data-nut="gan-can-chinh"
			aria-haspopup="dialog"
			onClick={() => setGan(true)}
		>
			<Icon icon={Link} data-icon="inline-start" />
			{m.ganThem}
		</Button>
	) : undefined;

	const cot: SimpleTableColumn[] = [
		{ id: "donVi", header: m.cotCanChinh.donVi, width: "w-36" },
		{ id: "mucTieu", header: m.cotCanChinh.mucTieu },
		{ id: "kr", header: m.cotCanChinh.kr },
		...(sua ? [{ id: "go", srLabel: m.hoiGo.action, width: "w-12" }] : []),
	];

	return (
		<DetailSheetBody>
			{mt.alignments.length === 0 ? (
				<DetailSheetEmpty
					icon={Link}
					title={m.chuaCanChinh.title}
					description={m.chuaCanChinh.body}
					action={nutGan}
				/>
			) : (
				<>
					<DetailSheetTable>
						<SimpleTable columns={cot}>
							{mt.alignments.map((g) => (
								<SimpleTableRow
									key={g.alignmentId}
									data-noi-gop={g.alignmentId}
								>
									<TableCell className={CELL}>
										<span translate="no">{g.unitName}</span>
									</TableCell>
									<TableCell className={CELL}>
										<span className="whitespace-normal" translate="no">
											{g.objectiveTitle}
										</span>
									</TableCell>
									<TableCell className={CELL}>
										{g.keyResultTitle ? (
											<span className="whitespace-normal" translate="no">
												{g.keyResultTitle}
											</span>
										) : (
											<EmptyCellValue />
										)}
									</TableCell>
									{sua ? (
										<TableCell className={CELL}>
											<Button
												aria-label={dien(m.goCanChinh, { ten: tenNoi(g) })}
												size="icon-sm"
												variant="ghost"
												disabled={go.isPending}
												onClick={() => setGoDi(g)}
											>
												<Icon icon={Close} />
											</Button>
										</TableCell>
									) : null}
								</SimpleTableRow>
							))}
						</SimpleTable>
					</DetailSheetTable>
					{nutGan ? <div className="px-5 py-3">{nutGan}</div> : null}
				</>
			)}
			{gan ? (
				<HopThoaiCanChinh
					objectiveId={mt.id}
					daGop={mt.alignments}
					dong={() => setGan(false)}
				/>
			) : null}
			<ConfirmDialog
				tone="default"
				nut={m.hoiGo.action}
				thoi={m.hoiGo.cancel}
				tieuDe={dien(m.hoiGo.title, { ten: goDi ? tenNoi(goDi) : "" })}
				than={m.hoiGo.body}
				open={goDi !== null}
				pending={go.isPending}
				onOpenChange={(mo) => {
					if (!mo && !go.isPending) setGoDi(null);
				}}
				onConfirm={() => {
					if (goDi && !go.isPending) go.mutate({ id: goDi.alignmentId });
				}}
			/>
		</DetailSheetBody>
	);
}

function SoMucTieu({ mt }: { mt: ChiTiet }) {
	const t = okrMessages(useLocale());
	const m = t.sheet;
	return (
		<DetailSheetStats>
			<DetailSheetStat label={m.tienDo}>
				<span className="tabular-nums" data-tien-do>
					{mt.progress}%
				</span>
				{mt.expected !== null ? (
					<span className="text-muted-foreground tabular-nums">
						{" · "}
						{dien(m.leRa, { n: mt.expected })}
					</span>
				) : null}
			</DetailSheetStat>
			<DetailSheetStat label={m.tinhTrang}>
				<NhanTinhTrang
					progress={mt.progress}
					expected={mt.expected}
					kind={mt.kind}
				/>
			</DetailSheetStat>
			<DetailSheetStat label={t.phuTrach}>
				<span translate="no">
					<OwnerCell owner={{ ...mt.owner, image: null }} xuongDongDienThoai />
				</span>
			</DetailSheetStat>
		</DetailSheetStats>
	);
}

function dauKhung(mt: ChiTiet): string {
	if (mt.choDuyet) return mt.quyen.duyet ? "cho-nguoi-duyet" : "cho-nguoi-gui";
	if (mt.traLaiGanNhat) return "bi-tra-lai";
	return mt.hienThi;
}

function LoiKhung({
	khongThay,
	thuLai,
}: {
	khongThay: boolean;
	thuLai: () => void;
}) {
	const m = okrGioiHanMessages(useLocale());
	const { close } = useRecordStack();
	return khongThay ? (
		<div className="contents" data-khung-khong-thay>
			<DetailSheetEmpty
				icon={WarningAlt}
				title={m.khongThay.tieuDe}
				description={m.khongThay.moTa}
				action={
					<Button size="sm" variant="outline" onClick={close}>
						{m.khongThay.dong}
					</Button>
				}
			/>
		</div>
	) : (
		<div className="contents" data-khung-loi>
			<DetailSheetEmpty
				icon={WarningAlt}
				title={m.loiTai.tieuDe}
				description={m.loiTai.moTa}
				action={
					<Button size="sm" variant="outline" onClick={thuLai}>
						<Icon icon={Renew} data-icon="inline-start" />
						{m.loiTai.thuLai}
					</Button>
				}
			/>
		</div>
	);
}

export function ObjectiveSheet({
	objectiveId,
	diemCam,
}: {
	objectiveId: string;
	diemCam?: DiemCam;
}) {
	const locale = useLocale();
	const t = okrMessages(locale);
	const m = t.sheet;
	const mtc = okrToanCanhMessages(locale);
	const trpc = useTRPC();
	const { tab, setTab } = useRecordSheetView("kr");
	const query = useQuery(trpc.okr.objective.queryOptions({ id: objectiveId }));
	const binhLuan = useQuery(trpc.okr.comments.queryOptions({ objectiveId }));
	const [hopHienThi, setHopHienThi] = useState(false);
	const khongThay = query.error?.data?.code === "NOT_FOUND";
	const mt = khongThay ? undefined : query.data;
	const tenKy = mt?.cycleName;

	const tabs: DetailSheetTab[] = mt
		? [
				{
					value: "kr",
					label: m.tabKr,
					count: mt.keyResults.length,
					content: <TabKr diemCam={diemCam} mt={mt} />,
				},
				{
					value: "can-chinh",
					label: m.tabCanChinh,
					count: mt.alignments.length,
					content: <TabCanChinh mt={mt} />,
				},
				{
					value: "vet",
					label: m.tabVetNhan,
					count: mt.trail.length,
					content: (
						<DetailSheetBody>
							<DetailSheetTable>
								<BangVet
									trail={mt.trail}
									keyResults={mt.keyResults}
									alignments={mt.alignments}
								/>
							</DetailSheetTable>
						</DetailSheetBody>
					),
				},
				{
					value: "trao-doi",
					label: m.tabTraoDoi,
					count: binhLuan.data?.dong.length ?? null,
					content: (
						<TabTraoDoi
							ghiNhanDuoc={mt.status === "cong-bo"}
							objectiveId={mt.id}
							keyResults={mt.keyResults.map((k) => ({
								id: k.id,
								title: k.title,
							}))}
						/>
					),
				},
				{
					value: "dien-bien",
					label: mtc.dienBien.tab,
					count: null,
					content: (
						<TabDienBien
							keyResults={mt.keyResults.map((k) => ({
								id: k.id,
								title: k.title,
							}))}
						/>
					),
				},
			]
		: [];

	return (
		<div
			className="contents"
			data-okr-sheet={objectiveId}
			data-trang-thai={mt ? TRANG_THAI_SHEET[mt.status] : undefined}
			data-dau-khung={mt ? dauKhung(mt) : undefined}
		>
			<RecordSheetFrame
				loading={query.isPending}
				error={mt ? null : (query.error?.message ?? null)}
				errorView={
					query.error ? (
						<LoiKhung
							khongThay={khongThay}
							thuLai={() => void query.refetch()}
						/>
					) : null
				}
				title={mt ? <span translate="no">{mt.title}</span> : m.tieuDePhu}
				description={
					mt ? (
						<>
							<span translate="no">{mt.unitName}</span>
							{tenKy ? (
								<>
									{" · "}
									<span translate="no">{tenKy}</span>
								</>
							) : null}
						</>
					) : undefined
				}
				note={
					mt ? (
						<>
							<Badge variant="outline">{t.loai[mt.kind]}</Badge>
							<NhanTrangThai status={mt.status} />
							{mt.hienThi === "gioi-han" ? (
								<NhanGioiHan
									soNguoiXem={mt.nguoiXem.length}
									moHop={mt.quyen.datHienThi ? () => setHopHienThi(true) : null}
								/>
							) : null}
						</>
					) : null
				}
				media={mt ? <EntityLogo name={mt.title} size="lg" /> : null}
				actions={
					mt ? (
						<>
							<NutTheoDoi mt={mt} />
							{ghiDuoc(mt) ||
							(mt.status === "da-bo" && (mt.quyen.dungLai || mt.quyen.xoa)) ? (
								<HanhDongMucTieu
									mt={mt}
									moHienThi={() => setHopHienThi(true)}
								/>
							) : null}
						</>
					) : null
				}
				stats={
					mt ? (
						<>
							{coDaiDuyet(mt) ? (
								<DetailSheetSection>
									<DaiDuyet mucTieu={mt} />
								</DetailSheetSection>
							) : null}
							{ghiDuoc(mt) && khoaGuiDuyet(mt) ? (
								<DetailSheetSection>
									<DongLyDoGuiKhoa objectiveId={mt.id} />
								</DetailSheetSection>
							) : null}
							<SoMucTieu mt={mt} />
						</>
					) : null
				}
				tabs={tabs}
				tab={tab}
				onTabChange={setTab}
				cuonCaKhung
			/>
			{mt ? <NganOkr mt={mt} /> : null}
			{mt && hopHienThi ? (
				<HopMucHienThi
					mucTieu={{
						id: mt.id,
						title: mt.title,
						hienThi: mt.hienThi,
						nguoiXem: mt.nguoiXem,
						coCanChinh: mt.alignments.length > 0,
					}}
					dong={() => setHopHienThi(false)}
					moCanChinh={() => {
						setHopHienThi(false);
						setTab("can-chinh");
					}}
				/>
			) : null}
		</div>
	);
}
