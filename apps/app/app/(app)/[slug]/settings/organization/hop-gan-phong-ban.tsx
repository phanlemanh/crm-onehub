"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { PickListDialog } from "@crm/ui/components/pick-list-dialog";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { toChucMessages } from "@/lib/messages/to-chuc";
import { useTRPC } from "@/lib/trpc/client";
import type { BoPhanDuLieu, CayDuLieu } from "./kieu";
import { useLamMoiToChuc } from "./lam-moi";

export function HopGanPhongBan({
	cay,
	bp,
	dong,
}: {
	cay: CayDuLieu;
	bp: BoPhanDuLieu;
	dong: () => void;
}) {
	const t = toChucMessages(useLocale());
	const m = t.gan;
	const trpc = useTRPC();
	const lamMoi = useLamMoiToChuc();
	const gan = useMutation(trpc.org.attachDepartments.mutationOptions());
	const [chon, setChon] = useState<string[]>([]);
	const [loi, setLoi] = useState<string | null>(null);

	const muc = [
		...cay.chuaXep.map((pb) => ({
			id: pb.id,
			label: pb.name,
			hint: t.chuaXep,
		})),
		...cay.divisions
			.filter((d) => d.id !== bp.id)
			.flatMap((d) =>
				d.departments.map((pb) => ({
					id: pb.id,
					label: pb.name,
					hint: dien(m.dangO, { ten: d.name }),
				})),
			),
	];

	return (
		<PickListDialog
			open
			onOpenChange={(mo) => {
				if (!mo && !gan.isPending) dong();
			}}
			title={dien(m.tieuDe, { bp: bp.name })}
			description={dien(m.moTa, { bp: bp.name })}
			searchPlaceholder={t.hopChon.tim}
			items={muc}
			selected={chon}
			onSelectedChange={setChon}
			confirmLabel={(n) => dien(m.nut, { n })}
			cancelLabel={t.hopChon.huy}
			emptyLabel={m.rong}
			error={loi}
			pending={gan.isPending}
			onConfirm={() => {
				if (gan.isPending || chon.length === 0) return;
				setLoi(null);
				gan.mutate(
					{ divisionId: bp.id, departmentIds: chon },
					{
						onSuccess: async () => {
							toast.success(dien(m.xong, { n: chon.length, bp: bp.name }));
							await lamMoi();
							dong();
						},
						onError: (e) => setLoi(e.message),
					},
				);
			}}
		/>
	);
}
