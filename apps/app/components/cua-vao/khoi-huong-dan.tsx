import { StepList, StepListItem } from "@crm/ui/components/step-list";

export type BuocHienRa = { tieuDe: string; moTa: string };

export function KhoiHuongDan({
	tieuDe,
	moTa,
	buoc,
	laGi,
}: {
	tieuDe: string;
	moTa: string;
	buoc: BuocHienRa[];
	laGi: string;
}) {
	return (
		<div className="contents" data-khoi-huong-dan="">
			<p className="hidden max-w-[18ch] font-semibold text-5xl/tight text-balance tracking-tight lg:block 2xl:text-6xl/tight">
				{laGi}
			</p>
			<div className="flex w-full max-w-xl flex-col gap-5">
				<div className="flex flex-col gap-1.5">
					<p className="font-mono text-muted-foreground text-xs/4 uppercase">
						{tieuDe}
					</p>
					<p className="text-muted-foreground text-sm">{moTa}</p>
				</div>
				<StepList label={tieuDe} tinh>
					{buoc.map((b, i) => (
						<StepListItem
							description={b.moTa}
							key={b.tieuDe}
							step={i + 1}
							title={b.tieuDe}
						/>
					))}
				</StepList>
			</div>
			<p className="text-muted-foreground text-sm lg:hidden">{laGi}</p>
		</div>
	);
}
