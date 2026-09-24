import Checkmark from "@carbon/icons-react/es/Checkmark";
import { Badge } from "@crm/ui/components/badge";
import { Icon } from "@crm/ui/components/icon";
import type { ReactNode } from "react";

export type TrangThaiBuoc = "xong" | "dang" | "cho";

export type Buoc = {
	id: string;
	tieuDe: ReactNode;
	moTa?: ReactNode;
	trangThai: TrangThaiBuoc;
	than?: ReactNode;
};

export function CacBuoc({ buoc, nhan }: { buoc: Buoc[]; nhan: string }) {
	return (
		<ol aria-label={nhan} className="flex flex-col">
			{buoc.map((b, i) => (
				<li
					key={b.id}
					aria-current={b.trangThai === "dang" ? "step" : undefined}
					className="flex gap-3 pb-5 last:pb-0"
				>
					<Badge
						variant={b.trangThai === "cho" ? "outline" : "secondary"}
						className="mt-0.5 size-6 px-0 tabular-nums"
					>
						{b.trangThai === "xong" ? (
							<Icon icon={Checkmark} aria-label="Đã xong" />
						) : (
							i + 1
						)}
					</Badge>
					<div className="flex min-w-0 flex-1 flex-col gap-1">
						<p
							className={
								b.trangThai === "cho"
									? "text-muted-foreground text-sm"
									: "font-medium text-sm"
							}
						>
							{b.tieuDe}
						</p>
						{b.moTa ? (
							<p className="text-muted-foreground text-sm">{b.moTa}</p>
						) : null}
						{b.than ? <div className="pt-2">{b.than}</div> : null}
					</div>
				</li>
			))}
		</ol>
	);
}
