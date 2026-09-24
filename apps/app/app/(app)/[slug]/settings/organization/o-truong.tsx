"use client";

import { Button } from "@crm/ui/components/button";
import { Combobox } from "@crm/ui/components/combobox";
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMutation } from "@tanstack/react-query";
import { useId } from "react";
import { toast } from "sonner";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { toChucMessages } from "@/lib/messages/to-chuc";
import { useTRPC } from "@/lib/trpc/client";
import { useLamMoiToChuc } from "./lam-moi";

export type UngVienTruong = { id: string; name: string; hint?: string };

export function OTruong({
	kind,
	donVi,
	nhan,
	moTa,
	truong,
	ungVien,
	sua,
}: {
	kind: "division" | "department";
	donVi: { id: string; name: string };
	nhan: string;
	moTa: string;
	truong: { id: string; name: string } | null;
	ungVien: UngVienTruong[];
	sua: boolean;
}) {
	const t = toChucMessages(useLocale());
	const m = t.chiTiet;
	const trpc = useTRPC();
	const lamMoi = useLamMoiToChuc();
	const ma = useId();
	const dat = useMutation(trpc.org.setHead.mutationOptions());
	const trong = ungVien.length === 0;

	const gui = (userId: string | null) => {
		if (dat.isPending) return;
		dat.mutate(
			{ kind, id: donVi.id, userId },
			{
				onSuccess: async () => {
					toast.success(
						dien(userId ? m.daDatTruong : m.daBoTruong, { ten: donVi.name }),
					);
					await lamMoi();
				},
				onError: (e) => toast.error(e.message),
			},
		);
	};

	return (
		<Field data-o-truong={kind}>
			<FieldLabel htmlFor={ma}>{nhan}</FieldLabel>
			<div className="flex items-center gap-2">
				<Combobox
					id={ma}
					translate="no"
					options={ungVien.map((n) => ({
						value: n.id,
						label: n.name,
						hint: n.hint,
					}))}
					selectedOption={
						truong ? { value: truong.id, label: truong.name } : undefined
					}
					value={truong?.id ?? ""}
					onValueChange={(v) => {
						if (v && v !== truong?.id) gui(v);
					}}
					placeholder={trong ? m.chuaCoNguoiDeChon : t.donVi.khongAi}
					searchPlaceholder={m.timNguoi}
					empty={m.khongThay}
					disabled={!sua || trong || dat.isPending}
				/>
				{truong && sua ? (
					<Button
						variant="ghost"
						size="sm"
						disabled={dat.isPending}
						onClick={() => gui(null)}
					>
						{m.boTruong}
					</Button>
				) : null}
			</div>
			<FieldDescription>{trong ? m.themNguoiTruoc : moTa}</FieldDescription>
		</Field>
	);
}
