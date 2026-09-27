"use client";

import Copy from "@carbon/icons-react/es/Copy";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useMessages } from "@crm/ui/components/locale-provider";
import { toast } from "sonner";

export function CopyValue({ value, label }: { value: string; label: string }) {
	const msg = useMessages();
	const ten = label.toLowerCase();
	const unavailable = () => toast.error(msg.chep.hong(ten));

	return (
		<Button
			variant="ghost"
			size="icon"
			type="button"
			onClick={() => {
				const clipboard = navigator.clipboard;

				if (!clipboard) {
					unavailable();
					return;
				}

				clipboard
					.writeText(value)
					.then(() => toast.success(msg.chep.xong(label)))
					.catch(unavailable);
			}}
		>
			<Icon icon={Copy} />
			<span className="sr-only">{msg.chep.nhan(ten)}</span>
		</Button>
	);
}
