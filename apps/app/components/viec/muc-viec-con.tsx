"use client";

import { Button } from "@crm/ui/components/button";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SectionHeading } from "@crm/ui/components/section-heading";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import {
	DetailSheetProperties,
	DetailSheetProperty,
	DetailSheetSection,
} from "@/components/detail-sheet";
import { viecMessages } from "@/lib/messages/viec";
import { useTRPC } from "@/lib/trpc/client";
import { OSoanViecCon } from "./o-soan-viec-con";
import { TrangThaiViecNhan } from "./trang-thai-viec";

export function MucViecCon({ viecId }: { viecId: string }) {
	const m = viecMessages(useLocale());
	const trpc = useTRPC();
	const open = useOpenRecord();
	const [dangThem, setDangThem] = useState(false);
	const q = useQuery(trpc.viec.con.queryOptions({ id: viecId }));
	const du = q.data;
	if (!du) return null;

	if (du.cha) {
		const cha = du.cha;
		return (
			<DetailSheetSection>
				<DetailSheetProperties>
					<DetailSheetProperty label={m.con.thuocViec}>
						<Button
							data-thuoc-viec=""
							onClick={() => open({ kind: "viec", id: cha.id })}
							size="sm"
							variant="link"
						>
							<span translate="no">{cha.tieuDe}</span>
						</Button>
					</DetailSheetProperty>
				</DetailSheetProperties>
			</DetailSheetSection>
		);
	}

	const tinh = du.con.filter((c) => c.trangThai !== "HUY");
	const xong = tinh.filter((c) => c.trangThai === "XONG").length;
	if (du.con.length === 0 && !du.themDuoc) return null;

	return (
		<DetailSheetSection>
			<div className="flex flex-col gap-3" data-muc-viec-con="">
				<SectionHeading
					actions={
						du.themDuoc && !dangThem ? (
							<Button
								data-them-viec-con=""
								onClick={() => setDangThem(true)}
								size="sm"
								variant="outline"
							>
								{m.con.them}
							</Button>
						) : null
					}
					level={4}
				>
					{dien(m.con.muc, { xong, tong: tinh.length })}
				</SectionHeading>
				{dangThem ? (
					<OSoanViecCon chaId={viecId} onXong={() => setDangThem(false)} />
				) : null}
				{du.con.length > 0 ? (
					<ItemGroup className="gap-1">
						{du.con.map((c) => (
							<Item asChild key={c.id} size="sm">
								<button
									data-viec-con={c.id}
									onClick={() => open({ kind: "viec", id: c.id })}
									type="button"
								>
									<ItemContent>
										<ItemTitle>
											<span translate="no">{c.tieuDe}</span>
										</ItemTitle>
										<ItemDescription>
											<TrangThaiViecNhan trangThai={c.trangThai} />
											<span className="mx-2">·</span>
											<span translate="no">{c.nguoiThucHien.name}</span>
										</ItemDescription>
									</ItemContent>
								</button>
							</Item>
						))}
					</ItemGroup>
				) : null}
			</div>
		</DetailSheetSection>
	);
}
