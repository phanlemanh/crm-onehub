"use client";

import { Button } from "@crm/ui/components/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { Textarea } from "@crm/ui/components/textarea";
import { OKR_KHEP } from "@crm/validation/okr-khep";
import { useMutation } from "@tanstack/react-query";
import { useId, useState } from "react";
import { toast } from "sonner";
import type { ChuKy } from "@/app/(app)/[slug]/okr/kieu";
import { okrMessages } from "@/lib/messages/okr";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

const FORM = "okr-an-chu-ky";

export function HopThoaiAnChuKy({
	ky,
	open,
	onOpenChange,
}: {
	ky: ChuKy;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const a = okrMessages(useLocale()).caiDat.chuKy.an;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const ma = useId();
	const [lyDo, setLyDo] = useState("");
	const du = lyDo.trim().length >= OKR_KHEP.lyDo.toiThieu;

	const an = useMutation(
		trpc.okr.anChuKy.mutationOptions({
			onSuccess: async () => {
				await cache.okr();
				toast.success(a.xong(ky.name));
				setLyDo("");
				onOpenChange(false);
			},
			onError: async (error) => {
				toast.error(error.message);
				await cache.okr();
			},
		}),
	);

	return (
		<Dialog
			open={open}
			onOpenChange={(mo) => {
				if (!an.isPending) onOpenChange(mo);
			}}
		>
			<DialogContent data-hop-an-chu-ky={ky.id}>
				<DialogHeader>
					<DialogTitle>{a.tieuDe(ky.name)}</DialogTitle>
					<DialogDescription>{a.moTa}</DialogDescription>
				</DialogHeader>
				<form
					id={FORM}
					onSubmit={(event) => {
						event.preventDefault();
						if (du && !an.isPending)
							an.mutate({ id: ky.id, lyDo: lyDo.trim() });
					}}
				>
					<Field>
						<FieldLabel htmlFor={`${ma}-ly-do`}>{a.nhan}</FieldLabel>
						<Textarea
							id={`${ma}-ly-do`}
							rows={3}
							value={lyDo}
							maxLength={OKR_KHEP.lyDo.toiDa}
							translate="no"
							data-o-ly-do-an
							onChange={(event) => setLyDo(event.target.value)}
						/>
						<FieldDescription>{a.moTaO}</FieldDescription>
					</Field>
				</form>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" disabled={an.isPending}>
							{a.huy}
						</Button>
					</DialogClose>
					<Button
						type="submit"
						form={FORM}
						disabled={!du || an.isPending}
						data-nut="an-chu-ky"
					>
						{an.isPending ? <Spinner data-icon="inline-start" /> : null}
						{a.nut}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
