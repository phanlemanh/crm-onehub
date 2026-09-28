"use client";

import { Alert, AlertDescription } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMutation } from "@tanstack/react-query";
import { useId } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { useTRPC } from "@/lib/trpc/client";

export type NguonCuaTrang = { id: string; tenTep: string };

export function NguonTrang({ nguon }: { nguon: NguonCuaTrang }) {
	const t = taiLieuMessages(useLocale());
	const m = t.doc.tepNguon;
	const trpc = useTRPC();
	const ma = useId();
	const idTieuDe = `${ma}-tieu-de`;
	const taiVe = useMutation(
		trpc.taiLieuNguon.taiVe.mutationOptions({
			onSuccess: (r) => window.location.assign(r.url),
		}),
	);
	const loi = taiVe.error;

	return (
		<section
			aria-labelledby={idTieuDe}
			className="flex flex-col gap-2"
			data-nguon-trang=""
		>
			<p className="font-medium text-sm" id={idTieuDe}>
				{m.tieuDe}
			</p>
			<Item size="sm" variant="outline">
				<ItemContent>
					<ItemTitle title={nguon.tenTep} translate="no">
						{nguon.tenTep}
					</ItemTitle>
					<ItemDescription>{m.moTa}</ItemDescription>
				</ItemContent>
				<ItemActions>
					<Button
						data-tai-nguon={nguon.id}
						disabled={taiVe.isPending}
						onClick={() => taiVe.mutate({ id: nguon.id })}
						size="sm"
						variant="outline"
					>
						{taiVe.isPending ? m.dangTaiVe : m.taiVe}
					</Button>
				</ItemActions>
			</Item>
			{loi && !taiVe.isPending ? (
				<Alert data-loi-tai-nguon="" role="status">
					<AlertDescription>
						{dien(m.loi, {
							loi:
								loi.data?.httpStatus !== undefined && loi.data.httpStatus < 500
									? loi.message
									: t.duyet.mayChu,
						})}
					</AlertDescription>
				</Alert>
			) : null}
		</section>
	);
}
