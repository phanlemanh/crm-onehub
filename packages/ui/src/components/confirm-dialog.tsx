"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@crm/ui/components/alert-dialog";
import { Button } from "@crm/ui/components/button";
import type { ReactNode } from "react";

export function ConfirmDialog({
	tieuDe,
	than,
	nut,
	thoi,
	open,
	onOpenChange,
	onConfirm,
	pending,
	tone,
	onCloseAutoFocus,
	noiDung,
	nutPhu,
	khoaNut = false,
}: {
	tieuDe: string;
	than: string;
	nut: string;
	thoi: string;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onConfirm: () => void;
	pending: boolean;
	tone?: "destructive" | "default";
	onCloseAutoFocus?: (event: Event) => void;
	noiDung?: ReactNode;
	nutPhu?: { nut: string; onClick: () => void } | null;
	khoaNut?: boolean;
}) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent onCloseAutoFocus={onCloseAutoFocus}>
				<AlertDialogHeader>
					<AlertDialogTitle>{tieuDe}</AlertDialogTitle>
					<AlertDialogDescription>{than}</AlertDialogDescription>
				</AlertDialogHeader>
				{noiDung}
				<AlertDialogFooter>
					<AlertDialogCancel disabled={pending}>{thoi}</AlertDialogCancel>
					{nutPhu ? (
						<Button
							aria-haspopup="dialog"
							data-nut-phu
							disabled={pending}
							onClick={nutPhu.onClick}
						>
							{nutPhu.nut}
						</Button>
					) : null}
					<AlertDialogAction
						variant={tone ?? "destructive"}
						data-variant={tone ?? "destructive"}
						disabled={pending || khoaNut}
						onClick={(event) => {
							event.preventDefault();
							onConfirm();
						}}
					>
						{nut}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
