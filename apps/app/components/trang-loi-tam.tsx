"use client";

import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { useTransition } from "react";
import { trangLoiMessages } from "@/lib/messages/trang-loi";

export function TrangLoiTam({ retry }: { retry: () => void }) {
	const m = trangLoiMessages(useLocale());
	const [dangThu, chuyen] = useTransition();

	return (
		<Empty aria-live="polite">
			<EmptyHeader>
				<EmptyTitle aria-level={1} role="heading">
					{m.tieuDe}
				</EmptyTitle>
				<EmptyDescription>{m.than}</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button
					autoFocus
					disabled={dangThu}
					onClick={() => chuyen(() => retry())}
					type="button"
				>
					{dangThu ? <Spinner data-icon="inline-start" /> : null}
					{dangThu ? m.dangThu : m.thuLai}
				</Button>
			</EmptyContent>
		</Empty>
	);
}
