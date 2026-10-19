"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { parseAsString, useQueryStates } from "nuqs";
import { loTrinhMessages } from "@/lib/messages/lo-trinh";
import { SEARCH_PARAM } from "@/lib/search-param-keys";

export type MucChon = { ma: string; ten: string };

const THAM_SO = {
	[SEARCH_PARAM.loTrinh.sanPham]: parseAsString,
	[SEARCH_PARAM.loTrinh.viec]: parseAsString,
};

export function BoChonSanPham({
	ds,
	dangMo,
}: {
	ds: MucChon[];
	dangMo: string;
}) {
	const m = loTrinhMessages(useLocale());
	const [, dat] = useQueryStates(THAM_SO, { shallow: false, history: "push" });
	if (ds.length < 2) return null;
	const ten = ds.find((s) => s.ma === dangMo)?.ten ?? ds[0]?.ten ?? "";
	return (
		<Select
			value={dangMo}
			onValueChange={(ma) =>
				void dat({
					[SEARCH_PARAM.loTrinh.sanPham]: ma === ds[0]?.ma ? null : ma,
					[SEARCH_PARAM.loTrinh.viec]: null,
				})
			}
		>
			<SelectTrigger aria-label={m.sanPham.chon} data-lo-trinh-bo-chon="">
				<SelectValue>
					<span translate="no">{ten}</span>
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{ds.map((s) => (
					<SelectItem key={s.ma} value={s.ma} data-lo-trinh-san-pham={s.ma}>
						<span translate="no">{s.ten}</span>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
