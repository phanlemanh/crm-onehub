"use client";

import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { KaraRetry } from "@crm/ui/components/kara/state";

export type VungTaiLoiProps = {
	tieuDe: string;
	moTa: string;
	onThuLai: () => void;
	dangTai?: boolean;
	"data-trang-thai"?: string;
};

export function VungTaiLoi({
	tieuDe,
	moTa,
	onThuLai,
	dangTai = false,
	"data-trang-thai": trangThai,
}: VungTaiLoiProps) {
	return (
		<Empty
			border="solid"
			size="compact"
			data-vung-tai-loi=""
			data-trang-thai={trangThai}
		>
			<EmptyHeader>
				<EmptyTitle>{tieuDe}</EmptyTitle>
				<EmptyDescription>{moTa}</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<KaraRetry onClick={onThuLai} disabled={dangTai} />
			</EmptyContent>
		</Empty>
	);
}
