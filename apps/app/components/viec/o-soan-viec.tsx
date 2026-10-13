"use client";

import { Button } from "@crm/ui/components/button";
import { Combobox } from "@crm/ui/components/combobox";
import { ComboboxMulti } from "@crm/ui/components/combobox-multi";
import { DatePicker } from "@crm/ui/components/date-picker";
import { Field, FieldError, FieldLabel } from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { useLocale } from "@crm/ui/components/locale-provider";
import { VIEC } from "@crm/validation/viec";
import { useMutation, useQuery } from "@tanstack/react-query";
import { type ReactNode, useRef, useState } from "react";
import type { TimelineAnchor } from "@/components/crm/timeline/timeline";
import { viecMessages } from "@/lib/messages/viec";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

const TOI = "toi";

export function OSoanViec({
	anchor,
	loaiChon,
	onXong,
}: {
	anchor: TimelineAnchor | null;
	loaiChon?: ReactNode;
	onXong?: () => void;
}) {
	const m = viecMessages(useLocale()).oSoan;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const [tieuDe, setTieuDe] = useState("");
	const [nguoi, setNguoi] = useState(TOI);
	const [han, setHan] = useState<string | null>(null);
	const [theoDoi, setTheoDoi] = useState<string[]>([]);
	const [loi, setLoi] = useState<string | null>(null);
	const dangGui = useRef(false);
	const ds = useQuery(trpc.onboarding.nguoiNhanViec.queryOptions());
	const toi = useQuery(trpc.users.me.queryOptions());
	const toiId = toi.data?.id;
	const nguoiThucHienId = nguoi === TOI ? toiId : nguoi;
	const khac = (ds.data ?? [])
		.filter((u) => u.id !== toiId)
		.map((u) => ({ value: u.id, label: u.name }));
	const ungVienTheoDoi = (ds.data ?? [])
		.filter((u) => u.id !== nguoiThucHienId)
		.map((u) => ({ value: u.id, label: u.id === toiId ? m.toi : u.name }));

	const chonNguoi = (ke: string) => {
		const id = ke === TOI ? toiId : ke;
		setNguoi(ke);
		setTheoDoi((cu) => cu.filter((ma) => ma !== id));
	};

	const tao = useMutation(
		trpc.viec.create.mutationOptions({
			onSuccess: async () => {
				setTieuDe("");
				setNguoi(TOI);
				setHan(null);
				setTheoDoi([]);
				setLoi(null);
				await cache.viec();
				onXong?.();
			},
			onError: (e) => setLoi(e.message || m.loi),
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
			...(anchor ?? {}),
			tieuDe: chu,
			hanNgay: han ? han : null,
			nguoiThucHienId: nguoi === TOI ? undefined : nguoi,
			nguoiTheoDoiIds: theoDoi.filter((ma) => ma !== nguoiThucHienId),
		});
	};

	return (
		<form
			className="flex flex-col gap-3"
			data-o-soan-viec=""
			onSubmit={(event) => {
				event.preventDefault();
				gui();
			}}
		>
			{loaiChon}
			<Input
				aria-label={m.tieuDe}
				autoComplete="off"
				maxLength={VIEC.tieuDeToiDa}
				onChange={(event) => setTieuDe(event.target.value)}
				placeholder={m.tieuDe}
				translate="no"
				value={tieuDe}
			/>
			<div className="grid gap-3 sm:grid-cols-3">
				<Field>
					<FieldLabel>{m.nguoiThucHien}</FieldLabel>
					<Combobox
						aria-label={m.nguoiThucHien}
						empty={m.khongAi}
						onValueChange={chonNguoi}
						options={[{ value: TOI, label: m.toi }, ...khac]}
						searchPlaceholder={m.timNguoi}
						translate="no"
						value={nguoi}
					/>
				</Field>
				<Field>
					<FieldLabel>{m.han}</FieldLabel>
					<DatePicker onChange={setHan} placeholder={m.chonHan} value={han} />
				</Field>
				<Field>
					<FieldLabel>{m.nguoiTheoDoi}</FieldLabel>
					<ComboboxMulti
						aria-label={m.nguoiTheoDoi}
						empty={m.khongAi}
						max={VIEC.theoDoiToiDa}
						onValuesChange={setTheoDoi}
						options={ungVienTheoDoi}
						placeholder={m.khongTheoDoi}
						searchPlaceholder={m.timNguoi}
						translate="no"
						values={theoDoi}
					/>
				</Field>
			</div>
			<div className="flex flex-col items-end gap-1">
				<Button disabled={tao.isPending} type="submit">
					{tao.isPending ? m.dangGiao : m.giao}
				</Button>
				{loi ? <FieldError>{loi}</FieldError> : null}
			</div>
		</form>
	);
}
