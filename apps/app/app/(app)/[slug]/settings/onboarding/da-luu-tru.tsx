"use client";

import { ArchivedList } from "@crm/ui/components/archived-list";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { onboardingMessages } from "@/lib/messages/onboarding";
import { useTRPC } from "@/lib/trpc/client";
import { useLamMoiDieuPhoi } from "./lam-moi";

type MucLuuTru = { id: string; name: string; purgeable: boolean };

export function DaLuuTru({ khoa }: { khoa: boolean }) {
	const m = onboardingMessages(useLocale());
	const trpc = useTRPC();
	const lamMoi = useLamMoiDieuPhoi();
	const [hoiXoa, setHoiXoa] = useState<MucLuuTru | null>(null);

	const khuon = useQuery(
		trpc.onboarding.listTemplates.queryOptions({ archived: true }),
	);
	const khoiPhucKhuon = useMutation(
		trpc.onboarding.restoreTemplate.mutationOptions(),
	);
	const xoaKhuon = useMutation(trpc.onboarding.purgeTemplate.mutationOptions());

	const muc: MucLuuTru[] = (khuon.data ?? []).map((k) => ({
		id: k.id,
		name: k.name,
		purgeable: k.purgeable,
	}));

	if (muc.length === 0) return null;

	const dangKhoiPhuc = khoiPhucKhuon.isPending;
	const dangXoa = xoaKhuon.isPending;
	const xuLy = {
		onSuccess: lamMoi,
		onError: (error: { message: string }) => toast.error(error.message),
	};

	return (
		<div className="md:col-span-2">
			<ArchivedList
				label={m.quanLy.daLuuTru}
				restoreLabel={m.quanLy.khoiPhuc}
				purgeLabel={m.quanLy.xoaVinhVien}
				items={muc}
				disabled={khoa}
				pending={dangKhoiPhuc || dangXoa}
				onRestore={(id) => {
					if (dangKhoiPhuc) return;
					khoiPhucKhuon.mutate({ id }, xuLy);
				}}
				onPurge={(x) => setHoiXoa(x)}
			/>

			<ConfirmDialog
				open={hoiXoa !== null}
				onOpenChange={(mo) => {
					if (!mo && !dangXoa) setHoiXoa(null);
				}}
				tieuDe={m.quanLy.xacNhanXoaTieuDe.replace("{ten}", hoiXoa?.name ?? "")}
				than={m.quanLy.xacNhanXoaThan}
				nut={m.quanLy.xoaVinhVien}
				thoi={m.quanLy.giu}
				pending={dangXoa}
				onConfirm={() => {
					const x = hoiXoa;
					if (x === null || dangXoa) return;
					xoaKhuon.mutate(
						{ id: x.id },
						{
							onSuccess: async () => {
								setHoiXoa(null);
								await lamMoi();
							},
							onError: (error: { message: string }) => {
								setHoiXoa(null);
								toast.error(error.message);
							},
						},
					);
				}}
			/>
		</div>
	);
}
