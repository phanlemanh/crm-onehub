"use client";

import { Alert, AlertDescription } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SimpleTable, SimpleTableRow } from "@crm/ui/components/simple-table";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import type { Locale } from "@crm/ui/lib/locale";
import { type NghiaTrangThai, toneTheoNghia } from "@crm/ui/lib/status-tone";
import type { TrangThaiNguon } from "@crm/validation/tai-lieu-nguon";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { type TaiLieuMessages, taiLieuMessages } from "@/lib/messages/tai-lieu";
import {
	duongDeXuat,
	duongTrang,
	neoNguon,
	ngayTaiLieu,
	TAI_LIEU_MAN,
} from "@/lib/tai-lieu-man";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { DangTaiDanhSach } from "./dang-tai";

export type HangNguon = {
	id: string;
	tenTep: string;
	trangThai: TrangThaiNguon;
	lyDo: string | null;
	taiLuc: Date | string;
	taiBoi: { name: string };
	trang: { slug: string; ten: string };
	deXuatId: string | null;
	coTheSoanLai: boolean;
};

export const NGHIA_NGUON = {
	CHO_DOC: "dangChay",
	CHO_SOAN: "dangChay",
	DANG_SOAN: "dangChay",
	DA_SOAN: "xong",
	CAN_GO_TAY: "cho",
	LOI: "hong",
} as const satisfies Record<TrangThaiNguon, NghiaTrangThai>;

const BAN = {
	CHO_DOC: true,
	CHO_SOAN: true,
	DANG_SOAN: true,
	DA_SOAN: false,
	CAN_GO_TAY: false,
	LOI: false,
} as const satisfies Record<TrangThaiNguon, boolean>;

const MA_LOI_MAY_CHU = 500;

function ngay(luc: Date | string, locale: Locale): string {
	return ngayTaiLieu(new Date(luc).toISOString(), locale);
}

function dangBan(rows: readonly HangNguon[]): boolean {
	return rows.some((r) => BAN[r.trangThai]);
}

export function BangNguon() {
	const locale = useLocale();
	const t = taiLieuMessages(locale);
	const m = t.nguon.bang;
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const ds = useQuery({
		...trpc.taiLieuNguon.list.queryOptions(),
		refetchInterval: (q) =>
			dangBan(q.state.data?.rows ?? []) ? TAI_LIEU_MAN.nguon.lamMoiMs : false,
	});
	const soanLai = useMutation(
		trpc.taiLieuNguon.soanLai.mutationOptions({
			onSuccess: () =>
				queryClient.invalidateQueries({
					queryKey: trpc.taiLieuNguon.list.queryKey(),
				}),
		}),
	);

	if (ds.isError && !ds.data)
		return (
			<Empty data-loi-tai="">
				<EmptyHeader>
					<EmptyTitle>{m.loiTai}</EmptyTitle>
				</EmptyHeader>
				<EmptyContent>
					<Button onClick={() => ds.refetch()} variant="outline">
						{t.loiTai.thuLai}
					</Button>
				</EmptyContent>
			</Empty>
		);
	if (!ds.data) return <DangTaiDanhSach />;

	const rows: readonly HangNguon[] = ds.data.rows;
	if (rows.length === 0)
		return (
			<Empty data-nguon-rong="">
				<EmptyHeader>
					<EmptyTitle>{m.rongTieuDe}</EmptyTitle>
					<EmptyDescription>{m.rongThan}</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);

	const loi = soanLai.error;
	const cauLoi =
		loi && !soanLai.isPending
			? dien(m.loiSoanLai, {
					loi:
						loi.data?.httpStatus !== undefined &&
						loi.data.httpStatus < MA_LOI_MAY_CHU
							? loi.message
							: t.nguon.hop.mayChu,
				})
			: null;
	const dangGui = (id: string) =>
		soanLai.isPending && soanLai.variables?.id === id;
	const hanhDong = (r: HangNguon) => (
		<HanhDong
			dangGui={dangGui(r.id)}
			m={m}
			onSoanLai={() => soanLai.mutate({ id: r.id })}
			r={r}
		/>
	);

	return (
		<div className="flex min-w-0 flex-col gap-4">
			<div aria-live="polite">
				{cauLoi ? (
					<Alert data-loi-soan-lai="" variant="destructive">
						<AlertDescription>{cauLoi}</AlertDescription>
					</Alert>
				) : null}
			</div>
			<div className="hidden md:block" data-bang-nguon="">
				<SimpleTable
					columns={[
						{ id: "nguon", header: m.cot.nguon },
						{ id: "trang", header: m.cot.trang },
						{ id: "tai-boi", header: m.cot.taiBoi },
						{ id: "trang-thai", header: m.cot.trangThai },
						{ id: "tai-luc", header: m.cot.taiLuc, align: "right" },
						{ id: "hanh-dong", srLabel: m.cot.trangThai },
					]}
					surface="page"
				>
					{rows.map((r) => (
						<SimpleTableRow
							data-nguon={r.id}
							data-trang-thai={r.trangThai}
							id={neoNguon(r.id)}
							key={r.id}
						>
							<TableCell>
								<span className="font-medium" translate="no">
									{r.tenTep}
								</span>
							</TableCell>
							<TableCell>
								<TenTrang r={r} />
							</TableCell>
							<TableCell translate="no">{r.taiBoi.name}</TableCell>
							<TableCell>
								<TrangThai m={m} r={r} />
							</TableCell>
							<TableCell className="text-right text-muted-foreground tabular-nums">
								{ngay(r.taiLuc, locale)}
							</TableCell>
							<TableCell className="text-right">{hanhDong(r)}</TableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			</div>
			<div className="md:hidden" data-the-nguon="">
				<ItemGroup>
					{rows.map((r) => (
						<Item
							data-nguon={r.id}
							data-trang-thai={r.trangThai}
							key={r.id}
							variant="outline"
						>
							<ItemContent>
								<ItemTitle translate="no">{r.tenTep}</ItemTitle>
								<ItemDescription>
									<TenTrang r={r} /> · {ngay(r.taiLuc, locale)}
								</ItemDescription>
								<TrangThai m={m} r={r} />
							</ItemContent>
							<ItemActions>{hanhDong(r)}</ItemActions>
						</Item>
					))}
				</ItemGroup>
			</div>
		</div>
	);
}

type BangMessages = TaiLieuMessages["nguon"]["bang"];

function TenTrang({ r }: { r: HangNguon }) {
	const url = useWorkspaceUrl();
	return (
		<Link href={url(duongTrang(r.trang.slug))} translate="no">
			{r.trang.ten}
		</Link>
	);
}

function TrangThai({ r, m }: { r: HangNguon; m: BangMessages }) {
	return (
		<span className="flex min-w-0 flex-col gap-1">
			<StatusIndicator
				busy={BAN[r.trangThai]}
				label={m.trangThai[r.trangThai]}
				size="sm"
				tone={toneTheoNghia(NGHIA_NGUON[r.trangThai])}
			/>
			{r.trangThai === "LOI" && r.lyDo ? (
				<span className="text-muted-foreground text-xs" data-ly-do="">
					{r.lyDo}
				</span>
			) : null}
		</span>
	);
}

function HanhDong({
	r,
	m,
	dangGui,
	onSoanLai,
}: {
	r: HangNguon;
	m: BangMessages;
	dangGui: boolean;
	onSoanLai: () => void;
}) {
	const url = useWorkspaceUrl();
	if (r.trangThai === "DA_SOAN" && r.deXuatId)
		return (
			<Button asChild size="sm" variant="outline">
				<Link href={url(duongDeXuat(r.deXuatId))}>{m.xemDeXuat}</Link>
			</Button>
		);
	if (!r.coTheSoanLai) return null;
	return (
		<Button disabled={dangGui} onClick={onSoanLai} size="sm" variant="outline">
			{dangGui ? m.dangSoanLai : m.soanLai}
		</Button>
	);
}
