"use client";

import { Alert, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { FieldDescription } from "@crm/ui/components/field";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Sheet,
	SheetBody,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import {
	SimpleTable,
	SimpleTableCell,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { Spinner } from "@crm/ui/components/spinner";
import {
	StatusIndicator,
	type StatusTone,
} from "@crm/ui/components/status-indicator";
import { useMutation, useQuery } from "@tanstack/react-query";
import { type OkrSoanMessages, okrSoanMessages } from "@/lib/messages/okr-soan";
import { OKR_CHU_KY } from "@/lib/okr-chu-ky-nhan";
import { useTRPC } from "@/lib/trpc/client";
import type { CuocSoan, DonViSoan } from "./kieu";

const TONE_CUOC = {
	dang: "warning",
	"da-dua-vao": "success",
	bo: "neutral",
} as const satisfies Record<CuocSoan["trangThai"], StatusTone>;

function NutMoCuoc({
	donVi,
	mo,
	m,
}: {
	donVi: DonViSoan;
	mo: (cuocSoanId: string) => void;
	m: OkrSoanMessages;
}) {
	const trpc = useTRPC();
	const moi = useMutation(
		trpc.okr.soanMo.mutationOptions({
			onSuccess: (kq) => {
				if (kq.ok) mo(kq.cuoc.id);
			},
		}),
	);
	const tuChoi = moi.data?.ok === false ? moi.data.lyDo : null;
	return (
		<EmptyContent>
			<Button
				size="sm"
				variant="outline"
				data-nut="mo-cuoc-moi"
				disabled={moi.isPending}
				onClick={() => moi.mutate(donVi)}
			>
				{m.nut.soan}
			</Button>
			{tuChoi ? (
				<FieldDescription data-loi="mo-cuoc-moi">
					{m.lyDo[tuChoi]}
				</FieldDescription>
			) : null}
		</EmptyContent>
	);
}

function BangCuoc({
	cuoc,
	mo,
	m,
	locale,
}: {
	cuoc: readonly CuocSoan[];
	mo: (cuocSoanId: string) => void;
	m: OkrSoanMessages;
	locale: string;
}) {
	const ngay = new Intl.DateTimeFormat(locale, {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		timeZone: OKR_CHU_KY.muiGio,
	});
	const so = new Intl.NumberFormat(locale);
	return (
		<SimpleTable
			surface="page"
			columns={[
				{ id: "ngay", header: m.cuoc.cotNgay, width: "w-28" },
				{ id: "nguoi", header: m.cuoc.cotNguoi },
				{ id: "dong", header: m.cuoc.cotDong, width: "w-24", align: "right" },
				{ id: "trang-thai", header: m.cuoc.cotTrangThai, width: "w-28" },
				{ id: "mo", srLabel: m.cuoc.cotMo, width: "w-20" },
			]}
		>
			{cuoc.map((c) => {
				const moLuc = ngay.format(new Date(c.moLuc));
				const viec = c.trangThai === "dang" ? m.cuoc.tiep : m.cuoc.xem;
				return (
					<SimpleTableRow key={c.id} data-cuoc-id={c.id}>
						<SimpleTableCell>
							<span className="tabular-nums">{moLuc}</span>
						</SimpleTableCell>
						<SimpleTableCell>
							<span translate="no">{c.nguoiMo.name}</span>
						</SimpleTableCell>
						<SimpleTableCell numeric>
							{so.format(c.soDongNhan)}/{so.format(c.soDongTong)}
						</SimpleTableCell>
						<SimpleTableCell>
							<StatusIndicator
								size="sm"
								tone={TONE_CUOC[c.trangThai]}
								label={m.cuoc.trangThai[c.trangThai]}
							/>
						</SimpleTableCell>
						<SimpleTableCell align="right">
							<Button
								size="sm"
								variant="outline"
								data-nut="mo-cuoc"
								aria-label={m.cuoc.nutCuoc(viec, moLuc)}
								onClick={() => mo(c.id)}
							>
								{viec}
							</Button>
						</SimpleTableCell>
					</SimpleTableRow>
				);
			})}
		</SimpleTable>
	);
}

export function DanhSachCuoc({
	donVi,
	dong,
	mo,
}: {
	donVi: DonViSoan;
	dong: () => void;
	mo: (cuocSoanId: string) => void;
}) {
	const locale = useLocale();
	const m = okrSoanMessages(locale);
	const trpc = useTRPC();
	const ds = useQuery({
		...trpc.okr.soanDanhSachCuoc.queryOptions(donVi),
		retry: false,
	});
	const cuoc = [...(ds.data?.cuoc ?? [])].sort((a, b) =>
		b.moLuc.localeCompare(a.moLuc),
	);
	const tran = String(ds.data?.tranCuoc ?? "");
	const rong = ds.data !== undefined && cuoc.length === 0;
	const ky = cuoc[0]?.tenChuKy;
	return (
		<Sheet
			open
			onOpenChange={(moRa) => {
				if (!moRa) dong();
			}}
		>
			<SheetContent
				side="right"
				size="md"
				data-cuoc={rong ? "rong" : "danh-sach"}
			>
				<SheetHeader>
					<SheetTitle>{ky ? m.cuoc.tieuDe(ky) : m.nut.soan}</SheetTitle>
					{ds.data ? (
						<SheetDescription>
							<span className="tabular-nums">
								{m.cuoc.dem(String(cuoc.length), tran)}
							</span>
						</SheetDescription>
					) : null}
				</SheetHeader>
				<SheetBody>
					{ds.isPending ? (
						<Spinner />
					) : ds.isError ? (
						<Alert role="alert">
							<AlertTitle>{m.cuoc.loi}</AlertTitle>
						</Alert>
					) : rong ? (
						<Empty border="solid">
							<EmptyHeader>
								<EmptyTitle>{m.cuoc.rong}</EmptyTitle>
								<EmptyDescription>{m.cuoc.rongMoTa(tran)}</EmptyDescription>
							</EmptyHeader>
							<NutMoCuoc donVi={donVi} mo={mo} m={m} />
						</Empty>
					) : (
						<BangCuoc cuoc={cuoc} mo={mo} m={m} locale={locale} />
					)}
				</SheetBody>
			</SheetContent>
		</Sheet>
	);
}
