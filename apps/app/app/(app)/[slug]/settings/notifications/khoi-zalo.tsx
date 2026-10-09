"use client";

import Copy from "@carbon/icons-react/es/Copy";
import SendAlt from "@carbon/icons-react/es/SendAlt";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@crm/ui/components/alert-dialog";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { Spinner } from "@crm/ui/components/spinner";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { StepList, StepListItem } from "@crm/ui/components/step-list";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { nhacQuaZaloMessages } from "@/lib/messages/nhac-qua-zalo";
import { gioPhut, nhomMa, ZALO_MAN } from "@/lib/nhac-qua-zalo-man";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

type MaVuaTao = { ma: string; expiresAt: string };

const BUOC = { timBot: 1, layMa: 2, nhanMa: 3 } as const;

export function KhoiZalo({
	khoangLamMoiMs = ZALO_MAN.lamMoiMs,
}: {
	khoangLamMoiMs?: number;
}) {
	const locale = useLocale();
	const t = nhacQuaZaloMessages(locale).khoiZalo;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const [maVuaTao, setMaVuaTao] = useState<MaVuaTao | null>(null);

	const trangThai = useQuery({
		...trpc.zalo.cuaToi.queryOptions(),
		refetchInterval: (query) =>
			query.state.data?.lienKet.loai === "ma-cho" ? khoangLamMoiMs : false,
	});

	const taoMa = useMutation(
		trpc.zalo.taoMa.mutationOptions({
			onSuccess: async (kq) => {
				setMaVuaTao({ ma: kq.ma, expiresAt: String(kq.expiresAt) });
				await cache.zalo();
			},
			onError: () => toast.error(t.loi),
		}),
	);

	const [guiThuLoi, setGuiThuLoi] = useState<string | null>(null);
	const guiThu = useMutation(
		trpc.zalo.guiThu.mutationOptions({
			onMutate: () => setGuiThuLoi(null),
			onSuccess: (kq) =>
				toast.success(kq.kenh === "zalo" ? t.daGuiThuZalo : t.daGuiThuSlack),
			onError: (e) => setGuiThuLoi(e.message || t.guiThuLoi),
		}),
	);

	const go = useMutation(
		trpc.zalo.go.mutationOptions({
			onSuccess: async () => {
				setMaVuaTao(null);
				await cache.zalo();
			},
			onError: () => toast.error(t.loi),
		}),
	);

	const du = trangThai.data;
	if (!du) return <Skeleton className="h-8 w-full" />;

	if (!du.zaloBat) {
		return <p className="text-muted-foreground text-sm">{t.tat}</p>;
	}

	const lienKet = du.lienKet;

	if (lienKet.loai === "da-noi") {
		return (
			<div className="flex flex-col gap-2">
				<div className="flex flex-wrap items-center gap-3">
					<StatusIndicator
						tone="success"
						className="text-sm"
						label={
							<>
								{t.daNoi} · <span translate="no">{lienKet.tenZalo}</span>
							</>
						}
					/>
					<Button
						variant="outline"
						size="sm"
						className="ml-auto"
						disabled={guiThu.isPending}
						onClick={() => guiThu.mutate()}
					>
						{guiThu.isPending ? (
							<Spinner data-icon="inline-start" />
						) : (
							<Icon icon={SendAlt} data-icon="inline-start" />
						)}
						{guiThu.isPending ? t.dangGui : t.guiThu}
					</Button>
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button variant="outline" size="sm">
								{t.go}
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>{t.goTieuDe}</AlertDialogTitle>
								<AlertDialogDescription>
									{du.uuTien === "ZALO" ? t.goVeSlack : t.goThuong}
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>{t.goGiu}</AlertDialogCancel>
								<AlertDialogAction
									variant="destructive"
									onClick={() => go.mutate()}
								>
									{t.goXacNhan}
								</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</div>
				{guiThuLoi ? (
					<p role="alert" className="text-destructive text-xs">
						{guiThuLoi}
					</p>
				) : null}
			</div>
		);
	}

	const maCho = lienKet.loai === "ma-cho";
	const hetHan = maCho ? gioPhut(locale, lienKet.expiresAt) : null;
	const buocDang = maCho ? BUOC.nhanMa : BUOC.layMa;

	return (
		<div className="flex flex-col gap-4">
			<p className="text-muted-foreground text-sm">
				{du.canNoiLai ? t.canNoiLai : t.chuaNoi}
			</p>
			<StepList activeStep={buocDang} label={t.baBuoc} markCompleted={maCho}>
				<StepListItem
					step={BUOC.timBot}
					activeStep={buocDang}
					title={
						<>
							{t.buocTimBot} <span translate="no">{du.tenBot ?? ""}</span>
						</>
					}
					description={maCho ? undefined : t.buocTimBotMoTa}
				/>
				<StepListItem
					step={BUOC.layMa}
					activeStep={buocDang}
					title={lienKet.loai === "ma-het-han" ? t.hetHan : t.buocLayMa}
					description={maCho ? undefined : t.buocLayMaMoTa}
				>
					{maCho ? null : (
						<Button
							size="sm"
							disabled={taoMa.isPending}
							onClick={() => taoMa.mutate()}
						>
							{taoMa.isPending ? <Spinner data-icon="inline-start" /> : null}
							{lienKet.loai === "ma-het-han" ? t.taoMaMoi : t.noi}
						</Button>
					)}
				</StepListItem>
				<StepListItem
					step={BUOC.nhanMa}
					activeStep={buocDang}
					title={t.buocNhanMa}
					description={maCho ? undefined : t.buocNhanMaMoTa}
				>
					{maCho ? (
						<div className="flex flex-col gap-3 rounded-lg border p-4">
							{maVuaTao ? (
								<>
									<p className="text-sm">{t.nhanMaCho(du.tenBot ?? "")}</p>
									<div className="flex flex-wrap items-center gap-3">
										<output
											aria-label={t.maNoi}
											className="font-medium font-mono text-3xl tabular-nums tracking-widest"
										>
											{nhomMa(maVuaTao.ma)}
										</output>
										<Button
											variant="outline"
											size="sm"
											onClick={async () => {
												await navigator.clipboard.writeText(maVuaTao.ma);
												toast.success(t.daChep);
											}}
										>
											<Icon icon={Copy} data-icon="inline-start" />
											{t.chepMa}
										</Button>
									</div>
								</>
							) : null}
							<div className="flex flex-wrap items-center gap-3">
								<div className="flex flex-col gap-1">
									<StatusIndicator busy size="sm" label={t.dangChoNgan} />
									<p className="text-muted-foreground text-xs">
										{t.hetHanLuc(hetHan ?? "")}
									</p>
								</div>
								{maVuaTao ? null : (
									<Button
										size="sm"
										variant="outline"
										className="ml-auto"
										disabled={taoMa.isPending}
										onClick={() => taoMa.mutate()}
									>
										{t.taoMaMoi}
									</Button>
								)}
							</div>
						</div>
					) : null}
				</StepListItem>
			</StepList>
		</div>
	);
}
