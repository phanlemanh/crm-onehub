import Warning from "@carbon/icons-react/es/Warning";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Icon } from "@crm/ui/components/icon";

export function OLoiDangNhap({
	tieuDe,
	moTa,
}: {
	tieuDe: string;
	moTa: string;
}) {
	return (
		<Alert variant="destructive">
			<Icon icon={Warning} />
			<AlertTitle>{tieuDe}</AlertTitle>
			<AlertDescription>{moTa}</AlertDescription>
		</Alert>
	);
}
