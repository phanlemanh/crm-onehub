"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { crmMessages } from "@/lib/messages/crm";

export function PageLoadingStatus() {
	return (
		<span role="status" className="sr-only">
			{crmMessages(useLocale()).misc.loadingPage}
		</span>
	);
}
