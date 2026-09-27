"use client";

import Renew from "@carbon/icons-react/es/Renew";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Progress } from "@crm/ui/components/progress";
import { SimpleTable, SimpleTableRow } from "@crm/ui/components/simple-table";
import { Skeleton } from "@crm/ui/components/skeleton";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { formatMoney } from "@crm/ui/lib/format";
import type { Locale } from "@crm/ui/lib/locale";
import { useQuery } from "@tanstack/react-query";
import {
	type TroLyOkrMessages,
	troLyOkrMessages,
} from "@/lib/messages/tro-ly-okr";
import { useTRPC } from "@/lib/trpc/client";

const CELL = "px-3 py-2.5 align-middle";
const DONG_CHO = ["mot", "hai", "ba", "bon", "nam"];
const MUC_BAO = 80;
const DAY_TRAN = 100;
const XU = 100;

export type DoiSoatHien = {
	thang: string;
	ketQua: "khop" | "lech" | "khong-doi-soat-duoc";
	lechPhanTram: number | null;
	lyDo: string | null;
};

export function tienUsd(usd: number, locale: Locale): string {
	return formatMoney(Math.round(usd * XU), "usd", locale);
}

export function thangHien(thang: string): string {
	const [nam, so] = thang.split("-");
	return `${so}/${nam}`;
}

function lyDoDoiSoat(
	lyDo: string | null,
	d: TroLyOkrMessages["so"]["doiSoat"],
) {
	if (lyDo === "khong-co-khoa-rieng") return d.khongCoKhoaRieng;
	if (lyDo?.startsWith("loi-gateway:")) {
		return d.loiGateway(lyDo.slice("loi-gateway:".length));
	}
	return d.khongRo;
}

export function dongDoiSoat(
	doiSoat: DoiSoatHien | null,
	locale: Locale,
): string {
	const d = troLyOkrMessages(locale).so.doiSoat;
	if (!doiSoat) return d.chuaCo;
	const thang = thangHien(doiSoat.thang);
	const lech = new Intl.NumberFormat(locale, {
		maximumFractionDigits: 1,
	}).format(doiSoat.lechPhanTram ?? 0);
	if (doiSoat.ketQua === "khop") return d.khop(thang, lech);
	if (doiSoat.ketQua === "lech") return d.lech(thang, lech);
	return d.khongDuoc(thang, lyDoDoiSoat(doiSoat.lyDo, d));
}

export function TheSoChiPhi() {
	const locale = useLocale();
	const m = troLyOkrMessages(locale).so;
	const trpc = useTRPC();
	const so = useQuery(trpc.okr.aiChiTieu.queryOptions());
	const tien = (usd: number) => tienUsd(usd, locale);

	const dau = (
		<CardHeader>
			<CardTitle>{m.tieuDe}</CardTitle>
			<CardDescription>{m.moTa}</CardDescription>
		</CardHeader>
	);

	if (so.isError) {
		return (
			<Card data-the="so-chi-phi">
				{dau}
				<CardContent>
					<Empty data-trang-thai="loi">
						<EmptyHeader>
							<EmptyTitle>{m.loi}</EmptyTitle>
						</EmptyHeader>
						<EmptyContent>
							<Button
								variant="outline"
								size="sm"
								data-nut="thu-lai-so"
								onClick={() => void so.refetch()}
							>
								<Icon icon={Renew} data-icon="inline-start" />
								{m.thuLai}
							</Button>
						</EmptyContent>
					</Empty>
				</CardContent>
			</Card>
		);
	}

	if (!so.data) {
		return (
			<Card data-the="so-chi-phi" aria-busy="true">
				{dau}
				<CardContent className="flex flex-col gap-3">
					{DONG_CHO.map((dong) => (
						<Skeleton key={dong} className="h-6 w-full" />
					))}
				</CardContent>
			</Card>
		);
	}

	const du = so.data;
	const coBuoc = du.theoNhom.some((n) => n.soBuoc > 0);
	if (!coBuoc) {
		return (
			<Card data-the="so-chi-phi">
				{dau}
				<CardContent className="flex flex-col gap-4">
					<Empty data-trang-thai="rong">
						<EmptyHeader>
							<EmptyTitle>{m.rong}</EmptyTitle>
							<EmptyDescription>
								{m.rongMoTa(tien(du.troLyOkr.tranUsd))}
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
					<p className="text-muted-foreground text-sm" data-doi-soat>
						{dongDoiSoat(du.doiSoat, locale)}
					</p>
				</CardContent>
			</Card>
		);
	}

	const phanTram = du.troLyOkr.phanTram;
	const muc =
		phanTram >= DAY_TRAN ? m.muc100 : phanTram >= MUC_BAO ? m.muc80 : null;
	const dong = du.theoNhom.filter((n) => n.nhom !== "chua-gan" || n.usd > 0);

	return (
		<Card data-the="so-chi-phi">
			{dau}
			<CardContent className="flex flex-col gap-4">
				<div className="flex flex-col gap-2" data-tran>
					<div className="flex items-center justify-between gap-3 text-sm">
						<span>{m.troLyOkr}</span>
						<span className="tabular-nums">
							{tien(du.troLyOkr.chiUsd)} / {tien(du.troLyOkr.tranUsd)} (
							{phanTram}%)
						</span>
					</div>
					<Progress value={Math.min(phanTram, DAY_TRAN)} label={m.thanh} />
					{muc ? (
						<StatusIndicator
							size="sm"
							tone={phanTram >= DAY_TRAN ? "error" : "warning"}
							label={muc}
						/>
					) : null}
				</div>
				<SimpleTable
					surface="page"
					columns={[
						{ id: "viec", header: m.cotViec },
						{ id: "tien", header: m.cotTien, width: "w-24", align: "right" },
					]}
				>
					{dong.map((n) => (
						<SimpleTableRow key={n.nhom} data-nhom={n.nhom}>
							<TableCell
								className={
									n.nhom === "chua-gan" ? `${CELL} text-muted-foreground` : CELL
								}
							>
								{m.nhom[n.nhom]}
							</TableCell>
							<TableCell
								className={`${CELL} text-right tabular-nums`}
								data-tien
							>
								{tien(n.usd)}
							</TableCell>
						</SimpleTableRow>
					))}
					<SimpleTableRow data-nhom="tong">
						<TableCell className={`${CELL} font-medium`}>{m.tong}</TableCell>
						<TableCell
							className={`${CELL} text-right font-medium tabular-nums`}
							data-tien
						>
							{tien(du.tongUsd)}
						</TableCell>
					</SimpleTableRow>
				</SimpleTable>
				<p className="text-muted-foreground text-sm" data-doi-soat>
					{dongDoiSoat(du.doiSoat, locale)}
				</p>
			</CardContent>
		</Card>
	);
}
