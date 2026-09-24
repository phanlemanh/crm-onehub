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

export function ConfirmDialog({
	tieuDe,
	than,
	nut,
	thoi,
	open,
	onOpenChange,
	onConfirm,
	pending,
	tone = "destructive",
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
}) {
	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{tieuDe}</AlertDialogTitle>
					<AlertDialogDescription>{than}</AlertDialogDescription>
				</AlertDialogHeader>

				<AlertDialogFooter>
					<AlertDialogCancel disabled={pending}>{thoi}</AlertDialogCancel>
					<AlertDialogAction
						variant={tone}
						data-variant={tone}
						disabled={pending}
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
