"use client";

import Close from "@carbon/icons-react/es/Close";
import { Button } from "@crm/ui/components/button";
import { Combobox } from "@crm/ui/components/combobox";
import { Field, FieldError, FieldLabel } from "@crm/ui/components/field";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { formatDay } from "@crm/ui/lib/format";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { DetailSheetSection } from "@/components/detail-sheet";
import { viecMessages } from "@/lib/messages/viec";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

type ViecCho = {
	id: string;
	tieuDe: string;
	batDauNgay: string | null;
	hanNgay: string | null;
};

export function MucPhaiCho({
	viecId,
	duAnId,
	phaiCho,
	suaDuoc,
}: {
	viecId: string;
	duAnId: string;
	phaiCho: ViecCho[];
	suaDuoc: boolean;
}) {
	const locale = useLocale();
	const m = viecMessages(locale).khung;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const [loi, setLoi] = useState<string | null>(null);
	const lich = useQuery({
		...trpc.duAn.lich.queryOptions({ id: duAnId }),
		enabled: suaDuoc,
	});
	const tao = useMutation(trpc.duAn.phuThuocTao.mutationOptions());
	const go = useMutation(trpc.duAn.phuThuocXoa.mutationOptions());
	const daCho = new Set(phaiCho.map((v) => v.id));
	const chon = (lich.data?.viec ?? [])
		.filter((v) => v.id !== viecId && !daCho.has(v.id))
		.map((v) => ({ value: v.id, label: v.tieuDe }));

	const khoang = (v: ViecCho) =>
		[v.batDauNgay, v.hanNgay]
			.filter((x): x is string => x !== null)
			.map((x) => formatDay(x, locale))
			.join(" – ");

	const them = async (truocId: string) => {
		setLoi(null);
		try {
			await tao.mutateAsync({ truocId, sauId: viecId });
			await cache.viec();
		} catch (e) {
			setLoi(e instanceof Error ? e.message : m.themPhaiCho);
		}
	};

	const thoi = async (truocId: string) => {
		setLoi(null);
		try {
			await go.mutateAsync({ truocId, sauId: viecId });
			await cache.viec();
		} catch (e) {
			setLoi(e instanceof Error ? e.message : m.themPhaiCho);
		}
	};

	return (
		<DetailSheetSection
			data-muc-phai-cho=""
			title={dien(m.phaiCho, { n: phaiCho.length })}
		>
			<div className="flex flex-col gap-3">
				{phaiCho.length === 0 ? (
					<p className="text-muted-foreground text-sm">{m.khongPhaiCho}</p>
				) : (
					<ItemGroup className="gap-2">
						{phaiCho.map((v) => (
							<Item data-phai-cho={v.id} key={v.id} size="sm" variant="outline">
								<ItemContent>
									<ItemTitle translate="no">{v.tieuDe}</ItemTitle>
									{khoang(v) ? (
										<ItemDescription className="tabular-nums">
											{khoang(v)}
										</ItemDescription>
									) : null}
								</ItemContent>
								{suaDuoc ? (
									<ItemActions>
										<Button
											aria-label={dien(m.goPhaiCho, { ten: v.tieuDe })}
											disabled={go.isPending}
											onClick={() => void thoi(v.id)}
											size="icon"
											variant="ghost"
										>
											<Close aria-hidden="true" />
										</Button>
									</ItemActions>
								) : null}
							</Item>
						))}
					</ItemGroup>
				)}
				{suaDuoc ? (
					<Field data-invalid={loi ? true : undefined}>
						<FieldLabel>{m.themPhaiCho}</FieldLabel>
						<Combobox
							aria-label={m.themPhaiCho}
							empty={m.khongViecDuAn}
							onValueChange={(id) => void them(id)}
							options={chon}
							placeholder={m.chonViecDuAn}
							translate="no"
							value=""
						/>
						{loi ? <FieldError>{loi}</FieldError> : null}
					</Field>
				) : null}
			</div>
		</DetailSheetSection>
	);
}
