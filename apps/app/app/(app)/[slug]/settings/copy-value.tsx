"use client";

import Copy from "@carbon/icons-react/es/Copy";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { toast } from "sonner";
import { settingsMessages } from "@/lib/messages/settings";

export function CopyValue({ value, label }: { value: string; label: string }) {
	const t = settingsMessages(useLocale());
	const unavailable = () => toast.error(t.chep.hong(label.toLowerCase()));

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
					.then(() => toast.success(t.chep.xong(label)))
					.catch(unavailable);
			}}
		>
			<Icon icon={Copy} />
			<span className="sr-only">
				{t.chep.nhan} {label.toLowerCase()}
			</span>
		</Button>
	);
}
