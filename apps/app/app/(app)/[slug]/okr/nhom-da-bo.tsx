"use client";

import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import { Button } from "@crm/ui/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { okrMessages } from "@/lib/messages/okr";
import { BangMucTieu } from "./bang-muc-tieu";
import type { MucTieu } from "./kieu";

const KHONG_MO: ReadonlySet<string> = new Set();

export function NhomDaBo({
	ds,
	hienDonVi,
	danhDauCuaToi,
}: {
	ds: MucTieu[];
	hienDonVi: boolean;
	danhDauCuaToi: boolean;
}) {
	const k = okrMessages(useLocale()).khoiMucTieu;
	if (ds.length === 0) return null;
	return (
		<Collapsible data-nhom-da-bo>
			<CollapsibleTrigger asChild>
				<Button className="group" size="sm" variant="ghost">
					<Icon
						className="transition-transform group-aria-expanded:rotate-90 motion-reduce:transition-none"
						data-icon="inline-start"
						icon={ChevronRight}
					/>
					{k.nhomDaBo(ds.length)}
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent className="pt-3">
				<BangMucTieu
					danhDauCuaToi={danhDauCuaToi}
					dangMo={KHONG_MO}
					ds={ds}
					hienDonVi={hienDonVi}
				/>
			</CollapsibleContent>
		</Collapsible>
	);
}
