"use client";

import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import { Button } from "@crm/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useQuery } from "@tanstack/react-query";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { duAnMessages } from "@/lib/messages/du-an";
import { useTRPC } from "@/lib/trpc/client";
import type { PhamVi } from "./pham-vi";

export function OPhamVi({
	phamVi,
	onChon,
	onTao,
}: {
	phamVi: PhamVi;
	onChon: (phamVi: PhamVi) => void;
	onTao: () => void;
}) {
	const m = duAnMessages(useLocale()).phamVi;
	const trpc = useTRPC();
	const mo = useQuery(trpc.duAn.list.queryOptions({ trangThai: "mo" }));
	const dong = useQuery(trpc.duAn.list.queryOptions({ trangThai: "dong" }));
	const dsMo = mo.data ?? [];
	const dsDong = dong.data ?? [];
	const duAn =
		phamVi.loai === "du-an"
			? [...dsMo, ...dsDong].find((d) => d.id === phamVi.id)
			: undefined;
	const nhan =
		phamVi.loai === "cua-toi"
			? m.cuaToi
			: phamVi.loai === "tat-ca"
				? m.tatCa
				: (duAn?.ten ?? "…");
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button data-o-pham-vi="" size="sm" variant="outline">
					<span className="text-muted-foreground">{m.nhan}:</span>
					<span translate={phamVi.loai === "du-an" ? "no" : undefined}>
						{nhan}
					</span>
					<ChevronDown aria-hidden="true" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="start">
				<DropdownMenuItem onSelect={() => onChon({ loai: "cua-toi" })}>
					{m.cuaToi}
				</DropdownMenuItem>
				<DropdownMenuItem onSelect={() => onChon({ loai: "tat-ca" })}>
					{m.tatCa}
				</DropdownMenuItem>
				{dsMo.length > 0 || dsDong.length > 0 ? (
					<>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuLabel>{m.dangMo}</DropdownMenuLabel>
							{dsMo.map((d) => (
								<DropdownMenuItem
									data-du-an={d.id}
									key={d.id}
									onSelect={() => onChon({ loai: "du-an", id: d.id })}
								>
									<span translate="no">{d.ten}</span>
								</DropdownMenuItem>
							))}
							{dsDong.length > 0 ? (
								<DropdownMenuSub>
									<DropdownMenuSubTrigger data-da-dong="">
										{dien(m.daDong, { n: dsDong.length })}
									</DropdownMenuSubTrigger>
									<DropdownMenuSubContent>
										{dsDong.map((d) => (
											<DropdownMenuItem
												data-du-an={d.id}
												key={d.id}
												onSelect={() => onChon({ loai: "du-an", id: d.id })}
											>
												<span translate="no">{d.ten}</span>
											</DropdownMenuItem>
										))}
									</DropdownMenuSubContent>
								</DropdownMenuSub>
							) : null}
						</DropdownMenuGroup>
					</>
				) : null}
				<DropdownMenuSeparator />
				<DropdownMenuItem onSelect={onTao}>{m.tao}</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
