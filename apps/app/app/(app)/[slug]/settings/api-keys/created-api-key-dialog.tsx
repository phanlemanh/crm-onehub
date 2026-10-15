"use client";

import { Alert, AlertDescription } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { CopyValue } from "@crm/ui/components/copy-value";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@crm/ui/components/input-group";
import { useLocale } from "@crm/ui/components/locale-provider";
import { khoaApiMessages } from "@/lib/messages/settings-khoa-api";
import type { LoaiKhoa } from "./loai-khoa";

export type KhoaVuaTao = {
	name: string | null;
	key: string;
	loai?: LoaiKhoa;
};

export function CreatedApiKeyDialog({
	apiKey,
	onOpenChange,
}: {
	apiKey: KhoaVuaTao | null;
	onOpenChange: (open: boolean) => void;
}) {
	const t = khoaApiMessages(useLocale());

	return (
		<Dialog open={apiKey !== null} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						<span translate="no">{apiKey?.name ?? t.daTao.khoaNay}</span>{" "}
						{t.daTao.daTao}
					</DialogTitle>
					<DialogDescription>{t.daTao.moTa}</DialogDescription>
				</DialogHeader>

				<InputGroup>
					<InputGroupInput
						value={apiKey?.key ?? ""}
						readOnly
						translate="no"
						mono
					/>
					<InputGroupAddon align="inline-end">
						<CopyValue value={apiKey?.key ?? ""} label={t.daTao.nhanChep} />
					</InputGroupAddon>
				</InputGroup>

				{apiKey?.loai === "keo-tin-hieu" ? (
					<Alert data-slot="khoa-keo-tin-hieu">
						<AlertDescription>{t.daTao.keoTinHieu}</AlertDescription>
					</Alert>
				) : null}

				<DialogFooter>
					<DialogClose asChild dongNgay>
						<Button>{t.daTao.xong}</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
