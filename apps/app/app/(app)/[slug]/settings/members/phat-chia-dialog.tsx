"use client";

import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import { settingsMessages } from "@/lib/messages/settings";
import type { ThanhVienMessages } from "@/lib/messages/settings-thanh-vien";

export function PhatChiaDialog({
	t,
	ten,
	url,
	loi,
	open,
	onOpenChange,
}: {
	t: ThanhVienMessages;
	ten: string;
	url: string | null;
	loi: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const settings = settingsMessages(useLocale());
	const linkId = useId();
	const [daChep, setDaChep] = useState(false);

	useEffect(() => {
		if (!open) setDaChep(false);
	}, [open]);

	const chep = () => {
		if (!url) return;

		const clipboard = navigator.clipboard;

		if (!clipboard) {
			toast.error(settings.chep.hong(t.phatChia.nhanLienKet.toLowerCase()));
			return;
		}

		clipboard
			.writeText(url)
			.then(() => setDaChep(true))
			.catch(() =>
				toast.error(settings.chep.hong(t.phatChia.nhanLienKet.toLowerCase())),
			);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t.phatChia.tieuDe}</DialogTitle>
					{url ? (
						<DialogDescription>{t.phatChia.moTa(ten)}</DialogDescription>
					) : null}
				</DialogHeader>

				{url ? (
					<Field>
						<FieldLabel htmlFor={linkId}>{t.phatChia.nhanLienKet}</FieldLabel>
						<Input id={linkId} readOnly translate="no" value={url} />
						<FieldDescription>
							{daChep ? t.phatChia.daChep(ten) : t.phatChia.giaiThich}
						</FieldDescription>
					</Field>
				) : (
					<Alert variant="destructive">
						<AlertTitle>{t.phatChia.loi}</AlertTitle>
						{loi ? <AlertDescription>{loi}</AlertDescription> : null}
					</Alert>
				)}

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{t.phatChia.dong}
					</Button>
					{url && !daChep ? (
						<Button onClick={chep}>{t.phatChia.chep}</Button>
					) : null}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
