"use client";

import ArrowRight from "@carbon/icons-react/es/ArrowRight";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMutation } from "@tanstack/react-query";
import { useId, useRef } from "react";
import { toast } from "sonner";
import { dien, dienNode } from "@/components/crm/record-sheet/plan-copy";
import { okrTaiCoCauMessages } from "@/lib/messages/okr-tai-co-cau";
import { toChucMessages } from "@/lib/messages/to-chuc";
import { useTRPC } from "@/lib/trpc/client";
import type { HoiLuuTru } from "./kieu";
import { useLamMoiToChuc } from "./lam-moi";

function HopLuuTruChan({
	hoi,
	okrMo,
	dong,
	moChuyen,
}: {
	hoi: HoiLuuTru | null;
	okrMo: number;
	dong: () => void;
	moChuyen: (x: HoiLuuTru) => void;
}) {
	const c = okrTaiCoCauMessages(useLocale()).toChuc;
	const lyDo = useId();
	const cap = hoi?.loai ?? "phong-ban";
	return (
		<Dialog
			open={hoi !== null}
			onOpenChange={(mo) => {
				if (!mo) dong();
			}}
		>
			<DialogContent data-hop="luu-tru-chan">
				<DialogHeader>
					<DialogTitle>
						{dienNode(c.chan.tieuDe, {
							ten: <span translate="no">{hoi?.name ?? ""}</span>,
						})}
					</DialogTitle>
					<DialogDescription>{c.chan.moTa[cap]}</DialogDescription>
				</DialogHeader>
				<Alert variant="warning">
					<Icon icon={WarningAlt} />
					<AlertTitle>{c.chan.canhBao}</AlertTitle>
					<AlertDescription>
						<p id={lyDo} data-ly-do-chan>
							{c.chan.lyDo[cap](okrMo)}
						</p>
						<div className="flex flex-col gap-2 sm:flex-row">
							<Button
								variant="outline"
								size="sm"
								aria-haspopup="dialog"
								data-nut="chuyen-okr-tu-luu-tru"
								onClick={() => {
									if (hoi) moChuyen(hoi);
								}}
							>
								{c.chuyenOkr}
								<Icon icon={ArrowRight} data-icon="inline-end" />
							</Button>
						</div>
					</AlertDescription>
				</Alert>
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">{c.chan.huy}</Button>
					</DialogClose>
					<Button disabled aria-describedby={lyDo} data-nut="luu-tru-khoa">
						{c.chan.luuTru}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function XacNhanLuuTru({
	hoi,
	okrMo,
	dong,
	daLuu,
	moChuyen,
}: {
	hoi: HoiLuuTru | null;
	okrMo: number;
	dong: () => void;
	daLuu: (x: HoiLuuTru) => void;
	moChuyen: (x: HoiLuuTru) => void;
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

	if (okrMo > 0)
		return (
			<HopLuuTruChan hoi={hoi} okrMo={okrMo} dong={dong} moChuyen={moChuyen} />
		);

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
