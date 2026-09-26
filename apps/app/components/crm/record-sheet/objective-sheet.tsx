"use client";

import Add from "@carbon/icons-react/es/Add";
import Close from "@carbon/icons-react/es/Close";
import Link from "@carbon/icons-react/es/Link";
import Notification from "@carbon/icons-react/es/Notification";
import NotificationFilled from "@carbon/icons-react/es/NotificationFilled";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { EntityLogo } from "@crm/ui/components/entity-logo";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	SimpleTable,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { BangKr } from "@/app/(app)/[slug]/okr/bang-kr";
import { BangVet } from "@/app/(app)/[slug]/okr/bang-vet";
import { HopThoaiCanChinh } from "@/app/(app)/[slug]/okr/hop-thoai-can-chinh";
import {
	HopThoaiCapNhatKr,
	krCapNhatTuSheet,
} from "@/app/(app)/[slug]/okr/hop-thoai-cap-nhat-kr";
import { HopThoaiKr } from "@/app/(app)/[slug]/okr/hop-thoai-kr";
import { HopThoaiMucTieu } from "@/app/(app)/[slug]/okr/hop-thoai-muc-tieu";
import { CELL, type KetQua } from "@/app/(app)/[slug]/okr/kieu";
import {
	NhanTinhTrang,
	NhanTrangThai,
} from "@/app/(app)/[slug]/okr/tien-do-kr";
import { ConfirmDialog } from "@/app/(app)/[slug]/settings/members/confirm-dialog";
import { OwnerCell } from "@/components/crm/owner-cell";
import {
	DetailSheetBody,
	DetailSheetEmpty,
	DetailSheetStat,
	DetailSheetStats,
	type DetailSheetTab,
} from "@/components/detail-sheet";
import { okrMessages } from "@/lib/messages/okr";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { TabDienBien } from "./objective-dien-bien";
import { TabTraoDoi } from "./objective-trao-doi";
import { dien } from "./plan-copy";
import { RecordSheetFrame } from "./record-parts";
import { useRecordSheetView } from "./record-stack";

type ChiTiet = RouterOutputs["okr"]["objective"];
type NoiGop = ChiTiet["alignments"][number];

const TRANG_THAI_SHEET = {
	nhap: "ST-sheet-nhap",
	"cong-bo": "ST-sheet-congbo",
	"da-bo": "ST-sheet-dabo",
} as const satisfies Record<ChiTiet["status"], string>;

const ghiDuoc = (mt: ChiTiet) => mt.canEdit && mt.status !== "da-bo";

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

function HanhDongMucTieu({ mt }: { mt: ChiTiet }) {
	const m = okrMessages(useLocale()).sheet;
	const trpc = useTRPC();
	const [hoi, setHoi] = useState<"cong-bo" | "bo" | "sua" | null>(null);
	const dongHoi = () => setHoi(null);
	const congBo = useMutation(
		trpc.okr.publishObjective.mutationOptions(
			useXong(mt.id, m.daCongBo, dongHoi),
		),
	);
	const bo = useMutation(
		trpc.okr.dropObjective.mutationOptions(useXong(mt.id, m.daBo, dongHoi)),
	);

	if (!ghiDuoc(mt)) return null;

	return (
		<>
			{mt.status === "nhap" ? (
				<Button
					size="sm"
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
					<DropdownMenuItem onSelect={() => setHoi("sua")}>
						{m.sua}
					</DropdownMenuItem>
					<DropdownMenuItem variant="destructive" onSelect={() => setHoi("bo")}>
						{m.bo}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
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
			{hoi === "sua" ? (
				<HopThoaiMucTieu yeuCau={{ loai: "sua", mucTieu: mt }} dong={dongHoi} />
			) : null}
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
	const capNhatDuoc = kr.hienTaiQuaCapNhat && (kr.laCuaToi || mt.canEdit);
	const suaDuoc = mt.status !== "da-bo" && mt.canEditKr.includes(kr.id);
	const xoaDuoc = ghiDuoc(mt);
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
					<DropdownMenuItem onSelect={sua}>{m.suaKr}</DropdownMenuItem>
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

type HopKr =
	| { loai: "tao" }
	| { loai: "sua"; kr: KetQua }
	| { loai: "cap-nhat"; kr: KetQua; sessionId: string | null };

function TabKr({ mt }: { mt: ChiTiet }) {
	const m = okrMessages(useLocale()).sheet;
	const trpc = useTRPC();
	const [hop, setHop] = useState<HopKr | null>(null);
	const moPhien = useMutation(trpc.okr.moCapNhat.mutationOptions());
	const moCapNhat = (kr: KetQua) => {
		setHop({ loai: "cap-nhat", kr, sessionId: null });
		moPhien.mutate(
			{ entry: "sheet" },
			{
				onSuccess: ({ sessionId }) =>
					setHop((cu) =>
						cu?.loai === "cap-nhat" && cu.kr.id === kr.id
							? { ...cu, sessionId }
							: cu,
					),
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

	return (
		<DetailSheetBody>
			<BangKr
				keyResults={mt.keyResults}
				kind={mt.kind}
				expected={mt.expected}
				danhDauCuaToi={false}
				nhanHanhDong={m.cotThaoTac}
				hanhDong={
					coMenu
						? (kr) => (
								<MenuKr
									mt={mt}
									kr={kr}
									capNhat={() => moCapNhat(kr)}
									sua={() => setHop({ loai: "sua", kr })}
									xoa={() => setXoa(kr)}
								/>
							)
						: undefined
				}
			/>
			{ghiDuoc(mt) ? (
				<div className="px-5 py-3">
					<Button
						size="sm"
						variant="outline"
						data-nut="them-kr"
						aria-haspopup="dialog"
						onClick={() => setHop({ loai: "tao" })}
					>
						<Icon icon={Add} data-icon="inline-start" />
						{m.themKr}
					</Button>
				</div>
			) : null}
			{hop?.loai === "cap-nhat" ? (
				<HopThoaiCapNhatKr
					kr={krCapNhatTuSheet(mt, hop.kr)}
					chuTen={hop.kr.owner.name}
					ghiHo={!hop.kr.laCuaToi}
					sessionId={hop.sessionId}
					loiMo={moPhien.isError}
					moLai={() => moCapNhat(hop.kr)}
					dong={() => setHop(null)}
				/>
			) : hop ? (
				<HopThoaiKr
					objectiveId={mt.id}
					kr={hop.loai === "sua" ? hop.kr : null}
					chuMacDinh={mt.owner.id}
					suaDuocCot={mt.canEdit}
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
	const sua = ghiDuoc(mt);
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
					<SimpleTable columns={cot}>
						{mt.alignments.map((g) => (
							<SimpleTableRow key={g.alignmentId} data-noi-gop={g.alignmentId}>
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
					<OwnerCell owner={{ ...mt.owner, image: null }} />
				</span>
			</DetailSheetStat>
		</DetailSheetStats>
	);
}

export function ObjectiveSheet({ objectiveId }: { objectiveId: string }) {
	const locale = useLocale();
	const t = okrMessages(locale);
	const m = t.sheet;
	const mtc = okrToanCanhMessages(locale);
	const trpc = useTRPC();
	const { tab, setTab } = useRecordSheetView("kr");
	const query = useQuery(trpc.okr.objective.queryOptions({ id: objectiveId }));
	const binhLuan = useQuery(trpc.okr.comments.queryOptions({ objectiveId }));
	const cycles = useQuery(trpc.okr.cycles.queryOptions());
	const mt = query.data;
	const tenKy = mt
		? cycles.data?.cycles.find((c) => c.id === mt.cycleId)?.name
		: undefined;

	const tabs: DetailSheetTab[] = mt
		? [
				{
					value: "kr",
					label: m.tabKr,
					count: mt.keyResults.length,
					content: <TabKr mt={mt} />,
				},
				{
					value: "can-chinh",
					label: m.tabCanChinh,
					count: mt.alignments.length,
					content: <TabCanChinh mt={mt} />,
				},
				{
					value: "vet",
					label: m.tabVet,
					count: mt.trail.length,
					content: (
						<DetailSheetBody>
							<BangVet
								trail={mt.trail}
								keyResults={mt.keyResults}
								alignments={mt.alignments}
							/>
						</DetailSheetBody>
					),
				},
				{
					value: "trao-doi",
					label: m.tabTraoDoi,
					count: binhLuan.data?.comments.length ?? null,
					content: (
						<TabTraoDoi
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
		>
			<RecordSheetFrame
				loading={query.isPending}
				error={query.error?.message ?? null}
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
						</>
					) : null
				}
				media={mt ? <EntityLogo name={mt.title} size="lg" /> : null}
				actions={
					mt ? (
						<>
							<NutTheoDoi mt={mt} />
							{ghiDuoc(mt) ? <HanhDongMucTieu mt={mt} /> : null}
						</>
					) : null
				}
				stats={mt ? <SoMucTieu mt={mt} /> : null}
				tabs={tabs}
				tab={tab}
				onTabChange={setTab}
			/>
		</div>
	);
}
