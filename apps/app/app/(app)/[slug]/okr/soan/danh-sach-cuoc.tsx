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
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Sheet,
	SheetBody,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
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

function DanhSachDong({
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
		<ItemGroup aria-label={m.cuoc.nhan} data-ds-cuoc>
			{cuoc.map((c) => {
				const moLuc = ngay.format(new Date(c.moLuc));
				const viec = c.trangThai === "dang" ? m.cuoc.tiep : m.cuoc.xem;
				return (
					<Item
						key={c.id}
						size="sm"
						variant="outline"
						role="listitem"
						data-cuoc-id={c.id}
					>
						<ItemContent>
							<ItemTitle>
								<span className="tabular-nums">{moLuc}</span>
							</ItemTitle>
							<ItemDescription>
								{m.cuoc.nguoiMo} <span translate="no">{c.nguoiMo.name}</span> ·{" "}
								<span className="tabular-nums" data-dong-nhan>
									{m.cuoc.dongNhan(
										so.format(c.soDongNhan),
										so.format(c.soDongTong),
									)}
								</span>
							</ItemDescription>
							<StatusIndicator
								size="sm"
								tone={TONE_CUOC[c.trangThai]}
								label={m.cuoc.trangThai[c.trangThai]}
							/>
						</ItemContent>
						<ItemActions>
							<Button
								size="sm"
								variant="outline"
								data-nut="mo-cuoc"
								aria-label={m.cuoc.nutCuoc(viec, moLuc)}
								onClick={() => mo(c.id)}
							>
								{viec}
							</Button>
						</ItemActions>
					</Item>
				);
			})}
		</ItemGroup>
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
								{m.cuoc.dem(String(ds.data.soCuocDaDung), tran)}
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
						<DanhSachDong cuoc={cuoc} mo={mo} m={m} locale={locale} />
					)}
				</SheetBody>
			</SheetContent>
		</Sheet>
	);
}
