"use client";

import OverflowMenuVertical from "@carbon/icons-react/es/OverflowMenuVertical";
import { Button } from "@crm/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";
import type { DongTatCa } from "@/lib/tin-hieu/loc-tat-ca";

export type ThaoTacLuuTru = {
	dangCho: string | null;
	onLuuTru: (dong: DongTatCa) => void;
	onKhoiPhuc: (dong: DongTatCa) => void;
};

export function MenuLuuTru({
	dong,
	daLuuTru,
	thaoTac,
}: {
	dong: DongTatCa;
	daLuuTru: boolean;
	thaoTac: ThaoTacLuuTru;
}) {
	const m = tinHieuMessages(useLocale());
	const t = m.tatCa.luuTru;
	const cho = thaoTac.dangCho !== null;
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button data-thao-tac-tat-ca={dong.ma} size="icon-xs" variant="ghost">
					<Icon icon={OverflowMenuVertical} />
					<span className="sr-only">
						{dien(m.trang.thaoTac, { ma: dong.ma })}
					</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{daLuuTru ? (
					<DropdownMenuItem
						data-khoi-phuc-tin-hieu={dong.ma}
						disabled={cho}
						onSelect={() => thaoTac.onKhoiPhuc(dong)}
					>
						{t.khoiPhuc}
					</DropdownMenuItem>
				) : (
					<>
						<DropdownMenuItem
							data-luu-tru-tin-hieu={dong.ma}
							disabled={cho || dong.daKeoVe}
							onSelect={() => thaoTac.onLuuTru(dong)}
						>
							{t.luuTru}
						</DropdownMenuItem>
						{dong.daKeoVe ? (
							<DropdownMenuLabel data-khong-luu-tru-duoc="">
								{t.khongLuuTruDuoc}
							</DropdownMenuLabel>
						) : null}
					</>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
