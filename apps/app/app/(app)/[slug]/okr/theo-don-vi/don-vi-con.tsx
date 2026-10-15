"use client";

import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SectionHeading } from "@crm/ui/components/section-heading";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import Link from "next/link";
import { okrMessages } from "@/lib/messages/okr";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import type { DonViCon as Con } from "./bang-don-vi";

/**
 * «Đơn vị trực thuộc» dưới bảng: mỗi con trực tiếp một ô liên kết tới trang
 * của nó (giữ `kyOkr`), số mục tiêu đã công bố theo `okr.countByUnit` (thủ tục
 * không trả số KR) hoặc «Chưa đặt OKR», và cờ «Chưa có trưởng».
 */
export function DonViCon({
	con,
	dem,
	ky,
}: {
	con: Con[];
	dem: Record<string, number> | undefined;
	ky: string | null;
}) {
	const m = okrMessages(useLocale());
	const b = m.donViBang;
	const url = useWorkspaceUrl();
	if (con.length === 0) return null;
	const lienKet = (khoa: string) => {
		const q = new URLSearchParams({ [SEARCH_PARAM.okr.don]: khoa });
		if (ky) q.set(SEARCH_PARAM.okr.ky, ky);
		return `${url("/okr/theo-don-vi")}?${q}`;
	};
	return (
		<section className="flex flex-col gap-3" data-don-vi-con>
			<SectionHeading>{b.donViTrucThuoc}</SectionHeading>
			<div className="grid gap-2 md:grid-cols-2">
				{con.map((c) => {
					const n = dem === undefined ? undefined : (dem[c.khoa] ?? 0);
					return (
						<Item asChild key={c.khoa} size="sm" variant="outline">
							<Link href={lienKet(c.khoa)}>
								<ItemContent>
									<ItemTitle translate="no">{c.ten}</ItemTitle>
									<ItemDescription className="tabular-nums">
										{n === undefined
											? null
											: n === 0
												? b.chuaDatOkr
												: m.demMucTieu(n)}
									</ItemDescription>
								</ItemContent>
								{c.coTruong ? null : (
									<ItemActions>
										<StatusIndicator
											label={m.chuaCoTruong}
											size="sm"
											tone="warning"
										/>
									</ItemActions>
								)}
							</Link>
						</Item>
					);
				})}
			</div>
		</section>
	);
}
