"use client";

import { Button } from "@crm/ui/components/button";
import { DatePicker } from "@crm/ui/components/date-picker";
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
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { ngayVn } from "@/lib/tai-lieu-man";
import { useTRPC } from "@/lib/trpc/client";

const MA_LOI_MAY_CHU = 500;

export function DatXacMinh({
	slug,
	den,
}: {
	slug: string;
	den: string | null;
}) {
	const m = taiLieuMessages(useLocale()).doc.xacMinh;
	const trpc = useTRPC();
	const router = useRouter();
	const idNgay = useId();
	const [mo, setMo] = useState(false);
	const [ngay, setNgay] = useState<string | null>(den ? ngayVn(den) : null);
	const luu = useMutation(
		trpc.taiLieu.datXacMinh.mutationOptions({
			onSuccess: () => {
				setMo(false);
				router.refresh();
			},
		}),
	);
	const loi = luu.error
		? dien(m.chuaLuu, {
				loi:
					luu.error.data?.httpStatus !== undefined &&
					luu.error.data.httpStatus < MA_LOI_MAY_CHU
						? luu.error.message
						: m.mayChu,
			})
		: null;

	const doiMo = (tiep: boolean) => {
		setMo(tiep);
		if (tiep) {
			luu.reset();
			setNgay(den ? ngayVn(den) : null);
		}
	};

	return (
		<Dialog onOpenChange={doiMo} open={mo}>
			<DialogTrigger asChild>
				<Button data-dat-xac-minh="" size="sm" variant="outline">
					{m.datHan}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{m.datHan}</DialogTitle>
					<DialogDescription>{m.moTa}</DialogDescription>
				</DialogHeader>
				<Field data-invalid={loi ? true : undefined}>
					<FieldLabel htmlFor={idNgay}>{m.ngay}</FieldLabel>
					<DatePicker
						disabled={luu.isPending}
						id={idNgay}
						onChange={setNgay}
						value={ngay}
					/>
					{loi ? <FieldError>{loi}</FieldError> : null}
				</Field>
				<DialogFooter>
					{den ? (
						<Button
							disabled={luu.isPending}
							onClick={() => luu.mutate({ slug, den: null })}
							variant="ghost"
						>
							{m.goHan}
						</Button>
					) : null}
					<DialogClose asChild>
						<Button disabled={luu.isPending} variant="outline">
							{m.huy}
						</Button>
					</DialogClose>
					<Button
						disabled={luu.isPending || ngay === null}
						onClick={() => {
							if (ngay) luu.mutate({ slug, den: ngay });
						}}
					>
						{luu.isPending ? <Spinner /> : null}
						{m.luu}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
