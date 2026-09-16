"use client";

import { Button } from "@crm/ui/components/button";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { LocalRelativeTime } from "@/components/local-date-time";
import {
	type ThanhVienMessages,
	thanhVienMessages,
} from "@/lib/messages/settings-thanh-vien";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { AllowDialog } from "./allow-dialog";
import { ConfirmDialog } from "./confirm-dialog";

type Allowance = RouterOutputs["workspace"]["allowances"]["rows"][number];
type Role = keyof ThanhVienMessages["vaiTro"];

export function AllowancesTable() {
	const t = thanhVienMessages(useLocale());
	const trpc = useTRPC();

	const [moChoPhep, setMoChoPhep] = useState(false);
	const [loi, setLoi] = useState<string | null>(null);
	const [dangRut, setDangRut] = useState<Allowance | null>(null);

	const workspace = useQuery(trpc.workspace.get.queryOptions());
	const allowances = useQuery({
		...trpc.workspace.allowances.queryOptions(),
		enabled: workspace.data?.canManageMembers ?? false,
	});

	const lamMoi = async () => {
		await allowances.refetch();
	};

	const choPhep = useMutation(
		trpc.workspace.allowEmail.mutationOptions({
			onSuccess: async () => {
				setMoChoPhep(false);
				setLoi(null);
				await lamMoi();
				toast.success(t.hopThoaiChoPhep.xong);
			},
			onError: (error) => setLoi(error.message),
		}),
	);

	const rut = useMutation(
		trpc.workspace.revokeAllowance.mutationOptions({
			onSuccess: async () => {
				setDangRut(null);
				await lamMoi();
				toast.success(t.xacNhan.rut.xong);
			},
			onError: (error) => {
				setDangRut(null);
				toast.error(error.message);
			},
		}),
	);

	if (!workspace.data?.canManageMembers) return null;

	const rows = (allowances.data?.rows ?? []).filter(
		(row) => row.status === "pending",
	);

	return (
		<section className="flex flex-col gap-4">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h2 className="font-medium text-base">{t.duocPhepVao.tieuDe}</h2>
					<p className="text-muted-foreground text-sm">{t.duocPhepVao.moTa}</p>
				</div>

				<Button onClick={() => setMoChoPhep(true)}>
					{t.duocPhepVao.nutThem}
				</Button>
			</div>

			{rows.length === 0 ? (
				<p className="text-muted-foreground text-sm">{t.duocPhepVao.trong}</p>
			) : (
				<table className="w-full text-sm">
					<thead className="text-muted-foreground">
						<tr className="border-b">
							<th className="py-2 text-left font-normal">
								{t.duocPhepVao.diaChi}
							</th>
							<th className="py-2 text-left font-normal">
								{t.duocPhepVao.vaiTro}
							</th>
							<th className="py-2 text-left font-normal">
								{t.duocPhepVao.nguoiChoPhep}
							</th>
							<th className="py-2 text-left font-normal tabular-nums">
								{t.duocPhepVao.luc}
							</th>
							<th className="py-2 text-right font-normal">
								<span className="sr-only">{t.duocPhepVao.hanhDong}</span>
							</th>
						</tr>
					</thead>

					<tbody>
						{rows.map((row) => (
							<tr key={row.id} className="border-b last:border-0">
								<td className="py-2">{row.email}</td>
								<td className="py-2">{t.vaiTro[row.role as Role]}</td>
								<td className="py-2 text-muted-foreground">
									{row.invitedByName ?? "—"}
								</td>
								<td className="py-2 text-muted-foreground tabular-nums">
									<LocalRelativeTime date={row.createdAt} />
								</td>
								<td className="py-2 text-right">
									<Button
										variant="ghost"
										size="sm"
										disabled={rut.isPending}
										onClick={() => setDangRut(row)}
									>
										{t.duocPhepVao.rut}
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			)}

			<AllowDialog
				t={t}
				open={moChoPhep}
				onOpenChange={(next) => {
					setMoChoPhep(next);
					if (!next) setLoi(null);
				}}
				onSubmit={(values) => choPhep.mutate(values)}
				pending={choPhep.isPending}
				loi={loi}
			/>

			<ConfirmDialog
				tieuDe={t.xacNhan.rut.tieuDe}
				than={t.xacNhan.rut.than}
				nut={t.xacNhan.rut.nut}
				thoi={t.xacNhan.thoi}
				open={dangRut !== null}
				onOpenChange={(next) => {
					if (!next) setDangRut(null);
				}}
				onConfirm={() => {
					if (dangRut) rut.mutate({ allowanceId: dangRut.id });
				}}
				pending={rut.isPending}
			/>
		</section>
	);
}
