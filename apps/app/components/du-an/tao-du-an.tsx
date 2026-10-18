"use client";

import { Button } from "@crm/ui/components/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Textarea } from "@crm/ui/components/textarea";
import { DU_AN } from "@crm/validation/du-an-lich";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { duAnMessages } from "@/lib/messages/du-an";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

export type DuAnSua = { id: string; ten: string; moTa: string | null };

function NoiDung({
	sua,
	onXong,
}: {
	sua: DuAnSua | null;
	onXong: (id: string) => void;
}) {
	const m = duAnMessages(useLocale()).form;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const [ten, setTen] = useState(sua?.ten ?? "");
	const [moTa, setMoTa] = useState(sua?.moTa ?? "");
	const [loi, setLoi] = useState<string | null>(null);
	const tao = useMutation(trpc.duAn.tao.mutationOptions());
	const doi = useMutation(trpc.duAn.sua.mutationOptions());
	const dangGui = tao.isPending || doi.isPending;

	const gui = async () => {
		const chu = ten.trim();
		if (chu === "") {
			setLoi(m.tenTrong);
			return;
		}
		if (chu.length > DU_AN.tenToiDa) {
			setLoi(dien(m.tenDai, { n: DU_AN.tenToiDa }));
			return;
		}
		setLoi(null);
		const moTaGui = moTa.trim() === "" ? null : moTa.trim();
		try {
			if (sua) {
				await doi.mutateAsync({ id: sua.id, ten: chu, moTa: moTaGui });
				await cache.viec();
				onXong(sua.id);
			} else {
				const moi = await tao.mutateAsync({ ten: chu, moTa: moTaGui });
				await cache.viec();
				onXong(moi.id);
			}
		} catch (e) {
			setLoi(e instanceof Error ? e.message : m.tenTrong);
		}
	};

	return (
		<DialogContent>
			<form
				className="flex flex-col gap-4"
				data-hop-du-an=""
				onSubmit={(event) => {
					event.preventDefault();
					void gui();
				}}
			>
				<DialogHeader>
					<DialogTitle>{sua ? m.sua : m.tao}</DialogTitle>
				</DialogHeader>
				<Field data-invalid={loi ? true : undefined}>
					<FieldLabel htmlFor="ten-du-an">{m.ten}</FieldLabel>
					<Input
						aria-invalid={loi ? true : undefined}
						autoComplete="off"
						id="ten-du-an"
						maxLength={DU_AN.tenToiDa}
						onChange={(event) => setTen(event.target.value)}
						placeholder={m.tenGoiY}
						translate="no"
						value={ten}
					/>
					{loi ? <FieldError>{loi}</FieldError> : null}
				</Field>
				<Field>
					<FieldLabel htmlFor="mo-ta-du-an">{m.moTa}</FieldLabel>
					<Textarea
						id="mo-ta-du-an"
						maxLength={DU_AN.moTaToiDa}
						onChange={(event) => setMoTa(event.target.value)}
						translate="no"
						value={moTa}
					/>
				</Field>
				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="outline">
							{m.huy}
						</Button>
					</DialogClose>
					<Button disabled={dangGui} type="submit">
						{sua ? m.nutLuu : m.nutTao}
					</Button>
				</DialogFooter>
			</form>
		</DialogContent>
	);
}

export function HopDuAn({
	open,
	onOpenChange,
	sua = null,
	onXong,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	sua?: DuAnSua | null;
	onXong: (id: string) => void;
}) {
	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			{open ? <NoiDung onXong={onXong} sua={sua} /> : null}
		</Dialog>
	);
}
