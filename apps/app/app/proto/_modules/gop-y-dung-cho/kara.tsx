"use client";

import AiGenerate from "@carbon/icons-react/es/AiGenerate";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { KaraMark } from "@crm/ui/components/kara";
import Link from "next/link";
import type { MouseEvent } from "react";
import type { MucTieuDu } from "../muc-tieu-va-kr/du-lieu";
import { STATE, soGopYCho } from "./du-lieu";

function chanNoiBot(su: MouseEvent) {
	su.stopPropagation();
}

export function ChipGopY({ mt }: { mt: MucTieuDu }) {
	const so = soGopYCho(mt.id);
	if (so === 0) return null;
	return (
		<Button
			asChild
			data-chip-gop-y={mt.id}
			onClick={chanNoiBot}
			size="xs"
			variant="outline"
		>
			<Link
				aria-label={`Kara có ${so} góp ý chờ cho «${mt.ten}» — mở khung chi tiết`}
				href={`?state=${STATE.bChiTiet}`}
			>
				<KaraMark scope={`${so} góp ý`} />
			</Link>
		</Button>
	);
}

export function DauTheoKara() {
	return (
		<span
			className="inline-flex items-center gap-1 text-muted-foreground text-xs"
			data-theo-kara
			title="Tên này đổi theo đề xuất của Kara. Dấu mất khi có người sửa tay."
		>
			<Icon icon={AiGenerate} />
			theo Kara
		</span>
	);
}
