"use client";

import Checkmark from "@carbon/icons-react/es/Checkmark";
import {
	Card,
	CardAction,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { DotMatrix } from "@crm/ui/components/dot-matrix";
import { Icon } from "@crm/ui/components/icon";
import { cn } from "@crm/ui/lib/utils";
import type { ReactNode } from "react";
import {
	daTroiTuLucGui,
	dongHoDaTroi,
	laLauHonThuongLe,
} from "@/lib/agent-builder-cho";
import type { TroChuyenMessages } from "@/lib/messages/agent-builder-tro-chuyen";
import { useSeconds } from "@/lib/use-seconds";

export type BuocDung = {
	nhan: string;
	vat: string | null;
};

export function TheDangDung({
	buoc,
	daXong,
	dangGhi,
	batDauLuc,
	t,
	nutDung,
}: {
	buoc: BuocDung[];
	daXong: number;
	dangGhi: string | null;
	batDauLuc: string | null;
	t: TroChuyenMessages;
	nutDung: ReactNode;
}) {
	const daTroiMs = daTroiTuLucGui(batDauLuc, useSeconds());
	const dongHo = dongHoDaTroi(daTroiMs);
	const lauHon = laLauHonThuongLe(daTroiMs);

	return (
		<Card className="w-full max-w-lg" data-slot="the-dang-dung">
			<CardHeader>
				<CardTitle>{t.dung.dangDung}</CardTitle>
				<CardAction className="flex items-center gap-3 text-muted-foreground text-xs tabular-nums">
					{dongHo ? (
						<span data-slot="da-troi">{t.dung.daTroi(dongHo)}</span>
					) : null}
					<span className="font-mono">{t.dung.tienDo(String(daXong))}</span>
				</CardAction>
			</CardHeader>
			<CardContent className="flex flex-col gap-2">
				<ol className="flex flex-col gap-1" aria-label={t.dung.nhanTienDo}>
					{buoc.map(({ nhan, vat }, index) => {
						const done = index < daXong;
						const active = index === daXong && daXong < buoc.length;
						return (
							<li
								key={nhan}
								className={cn(
									"flex min-h-8 min-w-0 flex-col justify-center gap-1 rounded-md px-2",
									active && "bg-muted py-2",
								)}
								aria-current={active ? "step" : undefined}
							>
								<div className="flex min-w-0 items-center gap-2">
									<span
										className={cn(
											"flex size-5 shrink-0 items-center justify-center font-mono text-xs",
											(done || active) && "text-ring",
											!done && !active && "text-muted-foreground",
										)}
									>
										{done ? (
											<Icon icon={Checkmark} className="size-3.5" />
										) : active ? (
											<DotMatrix decorative />
										) : (
											index + 1
										)}
									</span>
									<span
										className={cn(
											"min-w-0 flex-1 wrap-break-word text-sm",
											!done && !active && "text-muted-foreground",
										)}
									>
										{nhan}
									</span>
									<span
										className={cn(
											"shrink-0 text-xs",
											done && vat && "font-mono",
											active ? "text-foreground" : "text-muted-foreground",
										)}
									>
										{done && vat
											? vat.replace("agent/", "")
											: done
												? t.dung.xong
												: active
													? t.dung.dangLam
													: t.dung.dangXep}
									</span>
								</div>
								{active && dangGhi ? (
									<p className="pl-7 font-mono text-muted-foreground text-xs">
										{t.dung.dangGhi(dangGhi)}
									</p>
								) : null}
							</li>
						);
					})}
				</ol>
				{lauHon ? (
					<p
						className="px-2 text-pretty text-muted-foreground text-xs"
						data-slot="lau-hon"
					>
						{t.dung.lauHon}
					</p>
				) : null}
			</CardContent>
			<CardFooter className="gap-2 border-t">
				<p className="min-w-0 flex-1 text-pretty text-muted-foreground text-xs">
					{t.dung.roiTrang}
				</p>
				{nutDung}
			</CardFooter>
		</Card>
	);
}
