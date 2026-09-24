"use client";

import { Button } from "@crm/ui/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/app/(app)/[slug]/settings/members/confirm-dialog";
import { dien, toChucMessages } from "@/lib/messages/to-chuc";
import { useTRPC } from "@/lib/trpc/client";
import type { CayDuLieu } from "./kieu";
import { useLamMoiToChuc } from "./lam-moi";

type Muc = {
	loai: "bo-phan" | "phong-ban";
	id: string;
	name: string;
	purgeable: boolean;
};

export function DaLuuTruToChuc({ cay }: { cay: CayDuLieu }) {
	const m = toChucMessages(useLocale());
	const trpc = useTRPC();
	const lamMoi = useLamMoiToChuc();
	const [hoiXoa, setHoiXoa] = useState<Muc | null>(null);

	const khoiBp = useMutation(trpc.org.restoreDivision.mutationOptions());
	const khoiPb = useMutation(
		trpc.onboarding.restoreDepartment.mutationOptions(),
	);
	const xoaBp = useMutation(trpc.org.purgeDivision.mutationOptions());
	const xoaPb = useMutation(trpc.onboarding.purgeDepartment.mutationOptions());

	const muc: Muc[] = [
		...cay.archived.divisions.map((d) => ({ loai: "bo-phan" as const, ...d })),
		...cay.archived.departments.map((d) => ({
			loai: "phong-ban" as const,
			...d,
		})),
	];
	if (muc.length === 0) return null;

	const dangKhoi = khoiBp.isPending || khoiPb.isPending;
	const dangXoa = xoaBp.isPending || xoaPb.isPending;
	const loi = (e: { message: string }) => toast.error(e.message);

	return (
		<Collapsible>
			<CollapsibleTrigger asChild>
				<Button variant="ghost" className="justify-start">
					{dien(m.daLuuTru, { n: muc.length })}
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<ul className="divide-y rounded-lg border">
					{muc.map((x) => (
						<li
							key={`${x.loai}-${x.id}`}
							className="flex items-center justify-between gap-3 px-3 py-2"
							data-luu-tru={x.id}
						>
							<span
								className="min-w-0 truncate text-sm"
								translate="no"
								data-ten
							>
								{x.name}
							</span>
							<span className="flex shrink-0 items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									disabled={dangKhoi}
									onClick={() => {
										if (dangKhoi) return;
										const xong = { onSuccess: lamMoi, onError: loi };
										if (x.loai === "bo-phan") khoiBp.mutate({ id: x.id }, xong);
										else khoiPb.mutate({ id: x.id }, xong);
									}}
								>
									{m.khoiPhuc}
								</Button>
								{x.purgeable ? (
									<Button
										variant="ghost"
										size="sm"
										disabled={dangXoa}
										onClick={() => setHoiXoa(x)}
									>
										{m.xoaHan}
									</Button>
								) : null}
							</span>
						</li>
					))}
				</ul>
			</CollapsibleContent>

			<ConfirmDialog
				open={hoiXoa !== null}
				onOpenChange={(mo) => {
					if (!mo && !dangXoa) setHoiXoa(null);
				}}
				tieuDe={dien(m.xacNhanXoa.tieuDe, { ten: hoiXoa?.name ?? "" })}
				than={m.xacNhanXoa.than}
				nut={m.xoaHan}
				thoi={m.xacNhanXoa.giu}
				pending={dangXoa}
				onConfirm={() => {
					const x = hoiXoa;
					if (x === null || dangXoa) return;
					const sau = {
						onSuccess: async () => {
							setHoiXoa(null);
							await lamMoi();
						},
						onError: (e: { message: string }) => {
							setHoiXoa(null);
							loi(e);
						},
					};
					if (x.loai === "bo-phan") xoaBp.mutate({ id: x.id }, sau);
					else xoaPb.mutate({ id: x.id }, sau);
				}}
			/>
		</Collapsible>
	);
}
