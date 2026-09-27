"use client";

import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Progress } from "@crm/ui/components/progress";
import { Skeleton } from "@crm/ui/components/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { onboardingMessages } from "@/lib/messages/onboarding";
import { useTRPC } from "@/lib/trpc/client";
import { huy, type LuongXoa, luongXoaMoi, moHoi, xacNhan } from "../luong-xoa";
import { DongMoKeHoach } from "./dong-mo-ke-hoach";
import { type Bac, OBac } from "./o-bac";
import { ThemMoiGioi } from "./them-moi-gioi";

const BAC: readonly Bac[] = ["accountAt", "courseAt", "activeAt", "dealAt"];

export function HoSoKeHoach({ planId }: { planId: string }) {
	const m = onboardingMessages(useLocale());
	const trpc = useTRPC();
	const queryClient = useQueryClient();

	const [luong, setLuong] = useState<LuongXoa<string>>(luongXoaMoi<string>());

	const buoc = useQuery(trpc.onboarding.listSteps.queryOptions({ planId }));
	const ghiDanh = useQuery(
		trpc.onboarding.listEnrollments.queryOptions({ id: planId }),
	);
	const keHoach = useQuery(
		trpc.onboarding.planById.queryOptions({ id: planId }),
	);

	const xoa = useMutation(
		trpc.onboarding.removeEnrollment.mutationOptions({
			onSuccess: () => {
				queryClient.invalidateQueries({
					queryKey: trpc.onboarding.listEnrollments.queryKey({ id: planId }),
				});
			},
		}),
	);

	if (buoc.isPending || ghiDanh.isPending) {
		return (
			<div aria-live="polite" className="flex flex-col gap-2">
				<span className="text-muted-foreground text-sm">{m.loading}</span>
				<Skeleton className="h-24 w-full" />
				<Skeleton className="h-24 w-full" />
			</div>
		);
	}

	const rows = buoc.data?.rows ?? [];
	const xong = rows.filter((b) => b.completedAt !== null).length;
	const chuaGiao = rows.filter((b) => b.assigneeId === null).length;
	const nay = Date.now();
	const dsGhiDanh = ghiDanh.data ?? [];
	const mauSo = dsGhiDanh.length;

	const daTrongPheu = dsGhiDanh.map((e) => e.contactId);

	return (
		<div className="grid gap-4 md:grid-cols-2">
			<div className="flex items-center justify-end gap-2 md:col-span-2">
				{keHoach.data ? (
					<DongMoKeHoach
						planId={planId}
						closedAt={
							keHoach.data.closedAt === null
								? null
								: String(keHoach.data.closedAt)
						}
					/>
				) : null}
			</div>
			<Card>
				<CardHeader>
					<CardTitle>{m.hoSo.steps}</CardTitle>
					<CardDescription>
						{m.hoSo.stepsSummary
							.replace("{xong}", String(xong))
							.replace("{tong}", String(rows.length))
							.replace("{chuaGiao}", String(chuaGiao))}
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-3">
					{rows.map((b) => {
						const han = new Date(b.dueAt);
						const quaHan = b.completedAt === null && han.getTime() < nay;
						return (
							<div className="flex flex-col gap-1" key={b.id}>
								<div className="flex items-baseline justify-between gap-3">
									<span
										className={`min-w-0 truncate text-sm ${b.completedAt !== null ? "text-muted-foreground line-through" : "font-medium"}`}
									>
										{b.label}
									</span>
									<span
										className={`shrink-0 text-xs tabular-nums ${quaHan ? "font-medium text-foreground" : "text-muted-foreground"}`}
									>
										{han.toLocaleDateString()}
									</span>
								</div>
								<div className="flex flex-wrap items-center gap-2">
									<Badge variant="outline" translate="no">
										{b.departmentName}
									</Badge>
									{quaHan ? (
										<Badge variant="outline">{m.hoSo.overdue}</Badge>
									) : null}
									{b.assigneeId === null ? (
										<Badge variant="secondary">{m.hoSo.unassigned}</Badge>
									) : null}
								</div>
							</div>
						);
					})}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>{m.hoSo.funnel}</CardTitle>
					<CardDescription>
						{m.hoSo.funnelDenominator.replace("{n}", String(mauSo))}
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					{mauSo === 0 ? (
						<Empty>
							<EmptyHeader>
								<EmptyTitle>{m.hoSo.emptyFunnelTitle}</EmptyTitle>
								<EmptyDescription>{m.hoSo.emptyFunnelBody}</EmptyDescription>
							</EmptyHeader>
							<EmptyContent>
								<ThemMoiGioi planId={planId} daTrongPheu={daTrongPheu} />
							</EmptyContent>
						</Empty>
					) : (
						<>
							{BAC.map((bac) => {
								const dat = dsGhiDanh.filter((e) => e[bac] !== null).length;
								return (
									<div className="flex flex-col gap-1.5" key={bac}>
										<div className="flex items-baseline justify-between gap-3">
											<span className="min-w-0 truncate text-sm">
												{m.bac[bac]}
											</span>
											<span className="shrink-0 text-sm tabular-nums">
												{dat}/{mauSo}
											</span>
										</div>
										<Progress value={(dat / mauSo) * 100} />
									</div>
								);
							})}
							<ul className="flex flex-col gap-2">
								{dsGhiDanh.map((e) => (
									<li
										className="flex flex-col gap-1"
										data-ghi-danh={e.id}
										key={e.id}
									>
										<span
											className="truncate font-medium text-sm"
											translate="no"
										>
											{e.contactName}
										</span>
										<div className="flex flex-wrap gap-1">
											{BAC.map((bac) => (
												<OBac
													key={bac}
													enrollmentId={e.id}
													planId={planId}
													bac={bac}
													ngay={e[bac] === null ? null : String(e[bac])}
													tenNguoi={e.contactName}
												/>
											))}
										</div>
									</li>
								))}
							</ul>
							<div>
								<ThemMoiGioi planId={planId} daTrongPheu={daTrongPheu} />
							</div>
						</>
					)}
				</CardContent>
			</Card>

			<ConfirmDialog
				nut={m.hoSo.confirmAction}
				onConfirm={() =>
					setLuong((hien) =>
						xacNhan(hien, (id) => xoa.mutate({ planId, contactId: id })),
					)
				}
				onOpenChange={(mo) => {
					if (!mo) setLuong(huy);
				}}
				open={luong.dangHoi !== null}
				pending={xoa.isPending}
				than={m.hoSo.confirmBody}
				thoi={m.hoSo.confirmCancel}
				tieuDe={m.hoSo.confirmTitle}
			/>
			{dsGhiDanh.length > 0 ? (
				<div className="md:col-span-2">
					<Button
						onClick={() => {
							const dau = dsGhiDanh[0];
							if (dau !== undefined) setLuong((h) => moHoi(h, dau.contactId));
						}}
						variant="outline"
					>
						{m.hoSo.remove}
					</Button>
				</div>
			) : null}
		</div>
	);
}
