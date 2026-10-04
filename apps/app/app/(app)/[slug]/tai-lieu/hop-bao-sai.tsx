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
	DialogTrigger,
} from "@crm/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@crm/ui/components/field";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { Textarea } from "@crm/ui/components/textarea";
import { TAI_LIEU_HOI } from "@crm/validation/tai-lieu-hoi";
import { useMutation } from "@tanstack/react-query";
import { useId, useState } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { useTRPC } from "@/lib/trpc/client";

const MA_LOI_MAY_CHU = 500;

export function HopBaoSai({
	hoiId,
	cauHoi,
}: {
	hoiId: string;
	cauHoi: string;
}) {
	const m = taiLieuMessages(useLocale()).baoSai;
	const trpc = useTRPC();
	const idGhiChu = useId();
	const [mo, setMo] = useState(false);
	const [ghiChu, setGhiChu] = useState("");
	const bao = useMutation(
		trpc.hoiKho.baoSai.mutationOptions({ onSuccess: () => setMo(false) }),
	);

	if (bao.isSuccess) {
		return (
			<Button data-bao-sai="da-gui" disabled size="sm" variant="ghost">
				{m.daBao}
			</Button>
		);
	}

	const loi = bao.error
		? dien(m.chuaGui, {
				loi:
					bao.error.data?.httpStatus !== undefined &&
					bao.error.data.httpStatus < MA_LOI_MAY_CHU
						? bao.error.message
						: m.mayChu,
			})
		: null;
	const ghiChuSach = ghiChu.trim();

	const gui = () => {
		if (bao.isPending) return;
		bao.mutate(
			ghiChuSach ? { hoiId, cauHoi, ghiChu: ghiChuSach } : { hoiId, cauHoi },
		);
	};

	return (
		<Dialog onOpenChange={setMo} open={mo}>
			<DialogTrigger asChild>
				<Button data-bao-sai="mo" size="sm" variant="ghost">
					{m.nut}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{m.tieuDe}</DialogTitle>
					<DialogDescription>{m.moTa}</DialogDescription>
				</DialogHeader>
				<Field data-invalid={loi ? true : undefined}>
					<FieldLabel htmlFor={idGhiChu}>{m.ghiChu}</FieldLabel>
					<Textarea
						disabled={bao.isPending}
						id={idGhiChu}
						maxLength={TAI_LIEU_HOI.ghiChu.toiDa}
						onChange={(e) => setGhiChu(e.target.value)}
						translate="no"
						value={ghiChu}
					/>
					{loi ? <FieldError>{loi}</FieldError> : null}
				</Field>
				<DialogFooter>
					<DialogClose asChild>
						<Button disabled={bao.isPending} variant="outline">
							{m.huy}
						</Button>
					</DialogClose>
					<Button disabled={bao.isPending} onClick={gui}>
						{bao.isPending ? <Spinner /> : null}
						{m.gui}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
