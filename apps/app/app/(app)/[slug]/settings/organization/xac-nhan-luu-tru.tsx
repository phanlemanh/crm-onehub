"use client";

import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMutation } from "@tanstack/react-query";
import { useRef } from "react";
import { toast } from "sonner";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { toChucMessages } from "@/lib/messages/to-chuc";
import { useTRPC } from "@/lib/trpc/client";
import type { HoiLuuTru } from "./kieu";
import { useLamMoiToChuc } from "./lam-moi";

export function XacNhanLuuTru({
	hoi,
	dong,
	daLuu,
}: {
	hoi: HoiLuuTru | null;
	dong: () => void;
	daLuu: (x: HoiLuuTru) => void;
}) {
	const m = toChucMessages(useLocale());
	const trpc = useTRPC();
	const lamMoi = useLamMoiToChuc();
	const dangHoanTac = useRef(false);
	const luuPb = useMutation(trpc.org.archiveDepartment.mutationOptions());
	const luuBp = useMutation(trpc.org.archiveDivision.mutationOptions());
	const khoiPb = useMutation(trpc.org.restoreDepartment.mutationOptions());
	const khoiBp = useMutation(trpc.org.restoreDivision.mutationOptions());
	const dangLuu = luuPb.isPending || luuBp.isPending;

	const hoanTac = (x: HoiLuuTru) => {
		if (dangHoanTac.current) return;
		dangHoanTac.current = true;
		const xong = {
			onSuccess: async () => {
				toast.success(dien(m.daKhoiPhucTen, { ten: x.name }));
				await lamMoi();
			},
			onError: (e: { message: string }) => toast.error(e.message),
			onSettled: () => {
				dangHoanTac.current = false;
			},
		};
		if (x.loai === "phong-ban") khoiPb.mutate({ id: x.id }, xong);
		else khoiBp.mutate({ id: x.id }, xong);
	};

	return (
		<ConfirmDialog
			open={hoi !== null}
			onOpenChange={(mo) => {
				if (!mo && !dangLuu) dong();
			}}
			tieuDe={dien(m.xacNhanLuuTru.tieuDe, { ten: hoi?.name ?? "" })}
			than={m.xacNhanLuuTru.than}
			nut={m.luuTru}
			thoi={m.xacNhanLuuTru.giu}
			pending={dangLuu}
			tone="default"
			onConfirm={() => {
				const x = hoi;
				if (x === null || dangLuu) return;
				const sau = {
					onSuccess: async () => {
						dong();
						daLuu(x);
						await lamMoi();
						toast.success(dien(m.daLuuTruTen, { ten: x.name }), {
							action: { label: m.hoanTac, onClick: () => hoanTac(x) },
						});
					},
					onError: (e: { message: string }) => {
						dong();
						toast.error(e.message);
					},
				};
				if (x.loai === "phong-ban") luuPb.mutate({ id: x.id }, sau);
				else luuBp.mutate({ id: x.id }, sau);
			}}
		/>
	);
}
