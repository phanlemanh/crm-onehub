import { Alert, AlertTitle } from "@crm/ui/components/alert";

export function LienKetKhongHopLe({
	title,
	message,
}: {
	title: string;
	message: string;
}) {
	return (
		<div className="flex flex-col gap-8">
			<h2 className="text-2xl/8 font-semibold tracking-tight text-balance">
				{title}
			</h2>
			<Alert variant="destructive">
				<AlertTitle>{message}</AlertTitle>
			</Alert>
		</div>
	);
}
