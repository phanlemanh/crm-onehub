"use client";

import { Button } from "@crm/ui/components/button";
import { ComboboxMulti } from "@crm/ui/components/combobox-multi";
import { DatePicker } from "@crm/ui/components/date-picker";
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
import { DU_AN } from "@crm/validation/du-an-lich";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { duAnMessages } from "@/lib/messages/du-an";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

function NoiDung({ duAnId, onXong }: { duAnId: string; onXong: () => void }) {
	const m = duAnMessages(useLocale()).moc;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const lich = useQuery(trpc.duAn.lich.queryOptions({ id: duAnId }));
	const [ten, setTen] = useState("");
	const [ngay, setNgay] = useState<string | null>(null);
	const [cho, setCho] = useState<string[]>([]);
	const [loi, setLoi] = useState<{
		o: "ten" | "ngay" | "chung";
		chu: string;
	} | null>(null);
	const tao = useMutation(trpc.duAn.mocTao.mutationOptions());
	const viec = (lich.data?.viec ?? []).map((v) => ({
		value: v.id,
		label: v.tieuDe,
	}));

	const gui = async () => {
		const chu = ten.trim();
		if (chu === "") {
			setLoi({ o: "ten", chu: m.tenTrong });
			return;
		}
		if (!ngay) {
			setLoi({ o: "ngay", chu: m.ngayTrong });
			return;
		}
		setLoi(null);
		try {
			await tao.mutateAsync({ duAnId, ten: chu, ngay, cho });
			await cache.viec();
			onXong();
		} catch (e) {
			setLoi({ o: "chung", chu: e instanceof Error ? e.message : m.tenTrong });
		}
	};

	return (
		<form
			className="flex flex-col gap-4"
			data-hop-moc=""
			onSubmit={(event) => {
				event.preventDefault();
				void gui();
			}}
		>
			<DialogHeader>
				<DialogTitle>{m.tieuDe}</DialogTitle>
			</DialogHeader>
			<Field data-invalid={loi?.o === "ten" ? true : undefined}>
				<FieldLabel htmlFor="ten-moc">{m.ten}</FieldLabel>
				<Input
					autoComplete="off"
					id="ten-moc"
					maxLength={DU_AN.tenToiDa}
					onChange={(event) => setTen(event.target.value)}
					placeholder={m.tenGoiY}
					translate="no"
					value={ten}
				/>
				{loi?.o === "ten" ? <FieldError>{loi.chu}</FieldError> : null}
			</Field>
			<Field data-invalid={loi?.o === "ngay" ? true : undefined}>
				<FieldLabel>{m.ngay}</FieldLabel>
				<DatePicker onChange={setNgay} value={ngay} />
				{loi?.o === "ngay" ? <FieldError>{loi.chu}</FieldError> : null}
			</Field>
			<Field>
				<FieldLabel>{m.cho}</FieldLabel>
				<ComboboxMulti
					aria-label={m.cho}
					max={DU_AN.viecToiDa}
					onValuesChange={setCho}
					options={viec}
					placeholder={m.chonViec}
					translate="no"
					values={cho}
				/>
				{loi?.o === "chung" ? <FieldError>{loi.chu}</FieldError> : null}
			</Field>
			<DialogFooter>
				<DialogClose asChild>
					<Button type="button" variant="outline">
						{m.huy}
					</Button>
				</DialogClose>
				<Button disabled={tao.isPending} type="submit">
					{m.luu}
				</Button>
			</DialogFooter>
		</form>
	);
}

export function HopThemMoc({
	duAnId,
	open,
	onOpenChange,
}: {
	duAnId: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent>
				{open ? (
					<NoiDung duAnId={duAnId} onXong={() => onOpenChange(false)} />
				) : null}
			</DialogContent>
		</Dialog>
	);
}
