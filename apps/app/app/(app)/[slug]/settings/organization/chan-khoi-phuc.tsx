import type { Locale } from "@crm/ui/lib/locale";
import type { KetQuaKhoiPhuc } from "@crm/validation/to-chuc-luu-tru";
import type { ReactNode } from "react";
import { dienNode } from "@/components/crm/record-sheet/plan-copy";
import { toChucMessages } from "@/lib/messages/to-chuc";

type ChanKhoiPhuc = Extract<KetQuaKhoiPhuc, { chan: unknown }>["chan"];

export function cauChanKhoiPhuc(locale: Locale, chan: ChanKhoiPhuc): ReactNode {
	const m = toChucMessages(locale);
	const mau =
		chan.loai === "cha-luu-tru" ? m.khoiPhucChaLuuTru : m.khoiPhucTrungTen;
	return (
		<span data-chan-khoi-phuc={chan.loai}>
			{dienNode(mau, { ten: <span translate="no">{chan.ten}</span> })}
		</span>
	);
}
