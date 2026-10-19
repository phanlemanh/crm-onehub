"use client";

import { Button } from "@crm/ui/components/button";
import { Combobox } from "@crm/ui/components/combobox";
import { DatePicker } from "@crm/ui/components/date-picker";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { useLocale } from "@crm/ui/components/locale-provider";
import { VIEC } from "@crm/validation/viec";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useId, useRef, useState } from "react";
import { viecMessages } from "@/lib/messages/viec";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

const TOI = "toi";

export function OSoanViecCon({
	chaId,
	onXong,
}: {
	chaId: string;
	onXong: () => void;
}) {
	const tat = viecMessages(useLocale());
	const m = tat.con;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const maTieuDe = useId();
	const [tieuDe, setTieuDe] = useState("");
	const [nguoi, setNguoi] = useState(TOI);
	const [han, setHan] = useState<string | null>(null);
	const [loi, setLoi] = useState<string | null>(null);
	const dangGui = useRef(false);
	const ds = useQuery(trpc.onboarding.nguoiNhanViec.queryOptions());
	const toi = useQuery(trpc.users.me.queryOptions());
	const khac = (ds.data ?? [])
		.filter((u) => u.id !== toi.data?.id)
		.map((u) => ({ value: u.id, label: u.name }));

	const tao = useMutation(
		trpc.viec.taoCon.mutationOptions({
			onSuccess: async () => {
				setTieuDe("");
				setNguoi(TOI);
				setHan(null);
				setLoi(null);
				await cache.viec();
				onXong();
			},
			onError: (e) => setLoi(e.data ? e.message : m.loi),
			onSettled: () => {
				dangGui.current = false;
			},
		}),
	);

	const gui = () => {
		const chu = tieuDe.trim();
		if (chu === "" || dangGui.current) return;
		dangGui.current = true;
		setLoi(null);
		tao.mutate({
			chaId,
			tieuDe: chu,
			hanNgay: han,
			nguoiThucHienId: nguoi === TOI ? undefined : nguoi,
		});
	};

	return (
		<form
			className="flex flex-col gap-3"
			data-o-soan-viec-con=""
			onSubmit={(event) => {
				event.preventDefault();
				gui();
			}}
		>
			<Field>
				<FieldLabel htmlFor={maTieuDe}>{m.tieuDe}</FieldLabel>
				<Input
					autoComplete="off"
					id={maTieuDe}
					maxLength={VIEC.tieuDeToiDa}
					name="tieuDeViecCon"
					onChange={(event) => setTieuDe(event.target.value)}
					placeholder={m.goiY}
					translate="no"
					value={tieuDe}
				/>
			</Field>
			<div className="grid gap-3 sm:grid-cols-2">
				<Field>
					<FieldLabel>{tat.oSoan.nguoiThucHien}</FieldLabel>
					<Combobox
						aria-label={tat.oSoan.nguoiThucHien}
						empty={tat.oSoan.khongAi}
						onValueChange={setNguoi}
						options={[{ value: TOI, label: tat.oSoan.toi }, ...khac]}
						searchPlaceholder={tat.oSoan.timNguoi}
						translate="no"
						value={nguoi}
					/>
				</Field>
				<Field>
					<FieldLabel>{tat.oSoan.han}</FieldLabel>
					<DatePicker
						onChange={setHan}
						placeholder={tat.oSoan.chonHan}
						value={han}
					/>
				</Field>
			</div>
			<FieldDescription>{m.mangGan}</FieldDescription>
			<div className="flex flex-col items-start gap-1">
				<Button disabled={tao.isPending} type="submit" variant="outline">
					{tao.isPending ? m.dangThem : m.themNut}
				</Button>
				{loi ? <FieldError>{loi}</FieldError> : null}
			</div>
		</form>
	);
}
