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
import {
	Field,
	FieldError,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@crm/ui/components/field";
import { useLocale } from "@crm/ui/components/locale-provider";
import { RadioGroup, RadioGroupItem } from "@crm/ui/components/radio-group";
import { Spinner } from "@crm/ui/components/spinner";
import {
	KET_LUAN_BAO_SAI,
	type KetLuanBaoSai,
} from "@crm/validation/tai-lieu-hoi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { taiLieuMessages } from "@/lib/messages/tai-lieu";
import { useTRPC } from "@/lib/trpc/client";

const MA_LOI_MAY_CHU = 500;

type LoiTrpc = { message: string; data?: { httpStatus?: number } | null };

function cauLoi(mau: string, mayChu: string, loi: LoiTrpc | null) {
	if (!loi) return null;
	return dien(mau, {
		loi:
			loi.data?.httpStatus !== undefined && loi.data.httpStatus < MA_LOI_MAY_CHU
				? loi.message
				: mayChu,
	});
}

function useLamMoiSucKhoe() {
	const trpc = useTRPC();
	const qc = useQueryClient();
	return () =>
		qc.invalidateQueries({ queryKey: trpc.taiLieu.sucKhoe.queryKey() });
}

export function NutXuLyChuaTraLoi({ hoiId }: { hoiId: string }) {
	const m = taiLieuMessages(useLocale()).sucKhoe;
	const trpc = useTRPC();
	const lamMoi = useLamMoiSucKhoe();
	const xuLy = useMutation(
		trpc.taiLieu.xuLyChuaTraLoi.mutationOptions({ onSuccess: lamMoi }),
	);
	const loi = cauLoi(m.chuaXuLy, m.mayChu, xuLy.error);
	return (
		<div className="flex flex-col items-end gap-1">
			<Button
				disabled={xuLy.isPending}
				onClick={() => xuLy.mutate({ hoiId })}
				size="sm"
				variant="outline"
			>
				{xuLy.isPending ? <Spinner /> : null}
				{m.daXuLy}
			</Button>
			{loi ? <FieldError>{loi}</FieldError> : null}
		</div>
	);
}

const NHAN_KET_LUAN = {
	SAI: "sai",
	DUNG: "dung",
} as const satisfies Record<KetLuanBaoSai, "sai" | "dung">;

function laKetLuan(v: string): v is KetLuanBaoSai {
	return (KET_LUAN_BAO_SAI as readonly string[]).includes(v);
}

export function NutXuLyBaoSai({ id }: { id: string }) {
	const m = taiLieuMessages(useLocale()).sucKhoe;
	const trpc = useTRPC();
	const lamMoi = useLamMoiSucKhoe();
	const idNhom = useId();
	const [mo, setMo] = useState(false);
	const [ketLuan, setKetLuan] = useState<KetLuanBaoSai | null>(null);
	const xuLy = useMutation(
		trpc.taiLieu.xuLyBaoSai.mutationOptions({
			onSuccess: async () => {
				setMo(false);
				await lamMoi();
			},
		}),
	);
	const loi = cauLoi(m.chuaXuLy, m.mayChu, xuLy.error);

	const doiMo = (tiep: boolean) => {
		setMo(tiep);
		if (tiep) {
			xuLy.reset();
			setKetLuan(null);
		}
	};

	return (
		<Dialog onOpenChange={doiMo} open={mo}>
			<DialogTrigger asChild>
				<Button size="sm" variant="outline">
					{m.daXuLy}
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{m.ketLuan.tieuDe}</DialogTitle>
					<DialogDescription>{m.ketLuan.moTa}</DialogDescription>
				</DialogHeader>
				<FieldSet>
					<FieldLegend variant="label">{m.ketLuan.nhan}</FieldLegend>
					<RadioGroup
						disabled={xuLy.isPending}
						onValueChange={(v) => setKetLuan(laKetLuan(v) ? v : null)}
						value={ketLuan ?? ""}
					>
						{KET_LUAN_BAO_SAI.map((k) => (
							<Field key={k} orientation="horizontal">
								<RadioGroupItem id={`${idNhom}-${k}`} value={k} />
								<FieldLabel htmlFor={`${idNhom}-${k}`}>
									{m.ketLuan[NHAN_KET_LUAN[k]]}
								</FieldLabel>
							</Field>
						))}
					</RadioGroup>
					{loi ? <FieldError>{loi}</FieldError> : null}
				</FieldSet>
				<DialogFooter>
					<DialogClose asChild>
						<Button disabled={xuLy.isPending} variant="outline">
							{m.ketLuan.huy}
						</Button>
					</DialogClose>
					<Button
						disabled={xuLy.isPending || ketLuan === null}
						onClick={() => {
							if (ketLuan) xuLy.mutate({ id, ketLuan });
						}}
					>
						{xuLy.isPending ? <Spinner /> : null}
						{m.ketLuan.gui}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
