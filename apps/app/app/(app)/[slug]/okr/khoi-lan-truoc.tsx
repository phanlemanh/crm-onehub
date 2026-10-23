"use client";

import Renew from "@carbon/icons-react/es/Renew";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { NGHIA_TU_TIN } from "@crm/ui/components/okr-status";
import { Skeleton } from "@crm/ui/components/skeleton";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { toneTheoNghia } from "@crm/ui/lib/status-tone";
import { useQuery } from "@tanstack/react-query";
import { okrMessages } from "@/lib/messages/okr";
import { okrLanTruocMessages } from "@/lib/messages/okr-lan-truoc";
import { useTRPC } from "@/lib/trpc/client";
import { giaTri } from "./bang-kr";
import { ngayGioVN } from "./cap-nhat-tuan/cap-nhat-tuan";
import type { KrCapNhat } from "./kieu";
import { ghiChuLanTruoc, type LanTruocKr } from "./lan-truoc-kr";

export function KhoiLanTruoc({ kr, lan }: { kr: KrCapNhat; lan: LanTruocKr }) {
	const locale = useLocale();
	const m = okrLanTruocMessages(locale);
	const mc = okrMessages(locale).capNhat;
	const trpc = useTRPC();
	const db = useQuery(
		trpc.okr.dienBien.queryOptions({ keyResultId: kr.keyResultId }),
	);
	const { ngay, gio } = ngayGioVN(lan.luc, locale);
	const ghiChu = db.isSuccess ? ghiChuLanTruoc(db.data.diem, lan.luc) : null;

	return (
		<Item data-lan-truoc size="sm" variant="outline">
			<ItemContent>
				<ItemTitle>
					{m.tieuDe} · {ngay}, {gio}
				</ItemTitle>
				<ItemDescription className="flex flex-wrap items-center gap-x-2">
					{lan.giaTri === null ? null : (
						<span className="tabular-nums" data-lan-truoc-so>
							{giaTri(kr, lan.giaTri, locale)}
						</span>
					)}
					{lan.tuTin === null ? null : (
						<StatusIndicator
							label={mc.mucTuTin[lan.tuTin]}
							tone={toneTheoNghia(NGHIA_TU_TIN[lan.tuTin])}
						/>
					)}
				</ItemDescription>
				{db.isPending ? (
					<Skeleton className="h-4 w-full" data-ghi-chu-truoc-cho />
				) : db.isError ? (
					<ItemDescription aria-live="polite" data-ghi-chu-truoc-loi>
						{m.loiGhiChu}
					</ItemDescription>
				) : ghiChu === null ? null : (
					<ItemDescription data-ghi-chu-truoc translate="no" unclamped>
						{ghiChu}
					</ItemDescription>
				)}
			</ItemContent>
			{db.isError ? (
				<ItemActions>
					<Button
						disabled={db.isFetching}
						onClick={() => void db.refetch()}
						size="sm"
						type="button"
						variant="outline"
					>
						<Icon data-icon="inline-start" icon={Renew} />
						{m.thuLai}
					</Button>
				</ItemActions>
			) : null}
		</Item>
	);
}
