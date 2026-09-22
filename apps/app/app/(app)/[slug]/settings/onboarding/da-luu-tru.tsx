"use client";

import { Button } from "@crm/ui/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/app/(app)/[slug]/settings/members/confirm-dialog";
import { onboardingMessages } from "@/lib/messages/onboarding";
import { useTRPC } from "@/lib/trpc/client";
import { useLamMoiDieuPhoi } from "./lam-moi";

type Loai = "boPhan" | "khuon";
type MucLuuTru = { loai: Loai; id: string; name: string; purgeable: boolean };

export function DaLuuTru({ khoa }: { khoa: boolean }) {
	const m = onboardingMessages(useLocale());
	const trpc = useTRPC();
	const lamMoi = useLamMoiDieuPhoi();
	const [hoiXoa, setHoiXoa] = useState<MucLuuTru | null>(null);

	const boPhan = useQuery(
		trpc.onboarding.listDepartments.queryOptions({ archived: true }),
	);
	const khuon = useQuery(
		trpc.onboarding.listTemplates.queryOptions({ archived: true }),
	);

	const khoiPhucBoPhan = useMutation(
		trpc.onboarding.restoreDepartment.mutationOptions(),
	);
	const khoiPhucKhuon = useMutation(
		trpc.onboarding.restoreTemplate.mutationOptions(),
	);
	const xoaBoPhan = useMutation(
		trpc.onboarding.purgeDepartment.mutationOptions(),
	);
	const xoaKhuon = useMutation(trpc.onboarding.purgeTemplate.mutationOptions());

	const muc: MucLuuTru[] = [
		...(boPhan.data ?? []).map((d) => ({
			loai: "boPhan" as const,
			id: d.id,
			name: d.name,
			purgeable: d.purgeable,
		})),
		...(khuon.data ?? []).map((k) => ({
			loai: "khuon" as const,
			id: k.id,
			name: k.name,
			purgeable: k.purgeable,
		})),
	];

	if (muc.length === 0) return null;

	const dangKhoiPhuc = khoiPhucBoPhan.isPending || khoiPhucKhuon.isPending;
	const dangXoa = xoaBoPhan.isPending || xoaKhuon.isPending;
	const xuLy = {
		onSuccess: lamMoi,
		onError: (error: { message: string }) => toast.error(error.message),
	};

	return (
		<Collapsible className="md:col-span-2">
			<CollapsibleTrigger asChild>
				<Button variant="ghost">{`${m.quanLy.daLuuTru} (${muc.length})`}</Button>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<ul className="flex flex-col gap-2">
					{muc.map((x) => (
						<li
							className="flex items-center justify-between gap-3"
							data-luu-tru={x.id}
							key={`${x.loai}-${x.id}`}
						>
							<span className="min-w-0 truncate text-sm" translate="no">
								{x.name}
							</span>
							<div className="flex shrink-0 items-center gap-2">
								<Button
									variant="outline"
									disabled={khoa || dangKhoiPhuc}
									onClick={() => {
										if (dangKhoiPhuc) return;
										if (x.loai === "boPhan") {
											khoiPhucBoPhan.mutate({ id: x.id }, xuLy);
										} else {
											khoiPhucKhuon.mutate({ id: x.id }, xuLy);
										}
									}}
								>
									{m.quanLy.khoiPhuc}
								</Button>
								{x.purgeable ? (
									<Button
										variant="ghost"
										disabled={khoa || dangXoa}
										onClick={() => setHoiXoa(x)}
									>
										{m.quanLy.xoaVinhVien}
									</Button>
								) : null}
							</div>
						</li>
					))}
				</ul>
			</CollapsibleContent>

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
					const sauCung = {
						onSuccess: async () => {
							setHoiXoa(null);
							await lamMoi();
						},
						onError: (error: { message: string }) => {
							setHoiXoa(null);
							toast.error(error.message);
						},
					};
					if (x.loai === "boPhan") {
						xoaBoPhan.mutate({ id: x.id }, sauCung);
					} else {
						xoaKhuon.mutate({ id: x.id }, sauCung);
					}
				}}
			/>
		</Collapsible>
	);
}
