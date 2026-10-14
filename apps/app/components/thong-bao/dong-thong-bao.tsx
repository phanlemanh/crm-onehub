"use client";

import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@crm/ui/components/item";
import { IndicatorDot } from "@crm/ui/components/status-indicator";
import Link from "next/link";

export type DongThongBao = {
	id: string;
	cau: string;
	gio: string;
	chuaDoc: boolean;
	href: string;
};

export type NhomThongBao = { nhan: string; dong: DongThongBao[] };

export function DanhSachNhomThongBao({
	nhom,
	nhanChuaDoc,
	onMo,
}: {
	nhom: NhomThongBao[];
	nhanChuaDoc: string;
	onMo: (id: string) => void;
}) {
	return (
		<div className="flex flex-col gap-1" data-slot="danh-sach-thong-bao">
			{nhom
				.filter((n) => n.dong.length > 0)
				.map((n) => (
					<section key={n.nhan} aria-label={n.nhan}>
						<p className="px-3 pt-2 pb-1 font-medium text-muted-foreground text-xs">
							{n.nhan}
						</p>
						<ItemGroup>
							{n.dong.map((dong) => (
								<Item
									key={dong.id}
									asChild
									size="sm"
									role="listitem"
									data-chua-doc={dong.chuaDoc ? "" : undefined}
								>
									<Link href={dong.href} onClick={() => onMo(dong.id)}>
										<ItemMedia>
											{dong.chuaDoc ? (
												<IndicatorDot tone="primary" aria-label={nhanChuaDoc} />
											) : (
												<span
													className="inline-block size-1.5"
													aria-hidden="true"
												/>
											)}
										</ItemMedia>
										<ItemContent>
											<ItemTitle>{dong.cau}</ItemTitle>
											<ItemDescription>{dong.gio}</ItemDescription>
										</ItemContent>
									</Link>
								</Item>
							))}
						</ItemGroup>
					</section>
				))}
		</div>
	);
}
