"use client";

import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import type { TaiLieuMessages } from "@/lib/messages/tai-lieu";

export function LoiTai({
	m,
	thuLai,
}: {
	m: TaiLieuMessages;
	thuLai: () => void;
}) {
	return (
		<Empty data-loi-tai="">
			<EmptyHeader>
				<EmptyTitle>{m.loiTai.tieuDe}</EmptyTitle>
			</EmptyHeader>
			<EmptyContent>
				<Button onClick={thuLai} variant="outline">
					{m.loiTai.thuLai}
				</Button>
			</EmptyContent>
		</Empty>
	);
}
