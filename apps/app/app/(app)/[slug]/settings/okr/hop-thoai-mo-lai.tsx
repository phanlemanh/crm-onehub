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
import { okrKhepMessages } from "@/lib/messages/okr-khep";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

const FORM = "okr-mo-lai-ky";

export function HopThoaiMoLai({
	ky,
	open,
	onOpenChange,
}: {
	ky: ChuKy;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const c = okrKhepMessages(useLocale()).caiDat.moLai;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const ma = useId();
	const [lyDo, setLyDo] = useState("");
	const du = lyDo.trim().length >= OKR_KHEP.lyDo.toiThieu;

	const moLai = useMutation(
		trpc.okr.moLaiKy.mutationOptions({
			onSuccess: async () => {
				await cache.okr();
				toast.success(c.daMo(ky.name));
				setLyDo("");
				onOpenChange(false);
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	return (
		<Dialog
			open={open}
			onOpenChange={(mo) => {
				if (!moLai.isPending) onOpenChange(mo);
			}}
		>
			<DialogContent data-hop-mo-lai={ky.id}>
				<DialogHeader>
					<DialogTitle>{c.tieuDe(ky.name)}</DialogTitle>
					<DialogDescription>{c.moTa}</DialogDescription>
				</DialogHeader>
				<form
					id={FORM}
					onSubmit={(event) => {
						event.preventDefault();
						if (du && !moLai.isPending)
							moLai.mutate({ id: ky.id, lyDo: lyDo.trim() });
					}}
				>
					<Field>
						<FieldLabel htmlFor={`${ma}-ly-do`}>{c.nhan}</FieldLabel>
						<Textarea
							id={`${ma}-ly-do`}
							rows={3}
							value={lyDo}
							maxLength={OKR_KHEP.lyDo.toiDa}
							translate="no"
							data-o-ly-do-mo-lai
							onChange={(event) => setLyDo(event.target.value)}
						/>
						<FieldDescription>{c.moTaO}</FieldDescription>
					</Field>
				</form>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline" disabled={moLai.isPending}>
							{c.huy}
						</Button>
					</DialogClose>
					<Button
						type="submit"
						form={FORM}
						disabled={!du || moLai.isPending}
						data-nut="mo-lai-ky"
					>
						{moLai.isPending ? <Spinner data-icon="inline-start" /> : null}
						{c.nut}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
