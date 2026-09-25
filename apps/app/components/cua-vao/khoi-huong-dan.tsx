import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
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
		<div className="flex w-full max-w-md flex-col gap-6" data-khoi-huong-dan="">
			<Card>
				<CardHeader>
					<CardTitle>{tieuDe}</CardTitle>
					<CardDescription>{moTa}</CardDescription>
				</CardHeader>
				<CardContent>
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
				</CardContent>
			</Card>
			<p className="text-muted-foreground text-sm">{laGi}</p>
		</div>
	);
}
