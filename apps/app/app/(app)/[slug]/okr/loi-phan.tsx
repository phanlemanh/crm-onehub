"use client";

import Renew from "@carbon/icons-react/es/Renew";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { okrMessages } from "@/lib/messages/okr";

/** Lỗi tải của MỘT phần trong Của tôi — hai phần còn lại vẫn hiện dữ liệu của chúng. */
export function LoiPhan({ thuLai }: { thuLai: () => void }) {
	const m = okrMessages(useLocale()).baPhan;
	return (
		<div
			className="flex flex-wrap items-center gap-3 text-sm"
			data-trang-thai="ST-ctbp-loi-phan"
			role="alert"
		>
			<span className="text-muted-foreground">{m.loiPhan}</span>
			<Button
				data-nut="thu-lai-phan"
				onClick={thuLai}
				size="sm"
				variant="outline"
			>
				<Icon data-icon="inline-start" icon={Renew} />
				{m.thuLai}
			</Button>
		</div>
	);
}
