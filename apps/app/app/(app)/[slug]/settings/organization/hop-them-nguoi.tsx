"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { PickListDialog } from "@crm/ui/components/pick-list-dialog";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { toChucMessages } from "@/lib/messages/to-chuc";
import { useTRPC } from "@/lib/trpc/client";
import { type CayDuLieu, moiPhongBan, type PhongBanDuLieu } from "./kieu";
import { useLamMoiToChuc } from "./lam-moi";

export function HopThemNguoi({
	cay,
	pb,
	dong,
}: {
	cay: CayDuLieu;
	pb: PhongBanDuLieu;
	dong: () => void;
}) {
	const t = toChucMessages(useLocale());
	const m = t.them;
	const trpc = useTRPC();
	const lamMoi = useLamMoiToChuc();
	const them = useMutation(trpc.org.addPeople.mutationOptions());
	const [chon, setChon] = useState<string[]>([]);
	const [loi, setLoi] = useState<string | null>(null);
	const tenPb = new Map(moiPhongBan(cay).map((p) => [p.id, p.name]));

	const muc = cay.people
		.filter((n) => n.primaryDepartmentId !== pb.id)
		.map((n) => {
			const dangO = n.primaryDepartmentId
				? tenPb.get(n.primaryDepartmentId)
				: undefined;
			return {
				id: n.id,
				label: n.name,
				hint: dangO ? dien(m.seChuyen, { ten: dangO }) : m.chuaCo,
			};
		});

	return (
		<PickListDialog
			open
			onOpenChange={(mo) => {
				if (!mo && !them.isPending) dong();
			}}
			title={dien(m.tieuDe, { pb: pb.name })}
			description={m.moTa}
			searchPlaceholder={t.hopChon.tim}
			items={muc}
			selected={chon}
			onSelectedChange={setChon}
			confirmLabel={(n) => dien(m.nut, { n })}
			cancelLabel={t.hopChon.huy}
			emptyLabel={m.rong}
			error={loi}
			pending={them.isPending}
			onConfirm={() => {
				if (them.isPending || chon.length === 0) return;
				setLoi(null);
				them.mutate(
					{ departmentId: pb.id, userIds: chon },
					{
						onSuccess: async () => {
							toast.success(dien(m.xong, { n: chon.length, pb: pb.name }));
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
