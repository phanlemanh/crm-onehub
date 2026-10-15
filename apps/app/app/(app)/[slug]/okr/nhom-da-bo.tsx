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
import { type ComponentProps, useEffect, useState } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { BangMucTieu } from "./bang-muc-tieu";
import type { MucTieu } from "./kieu";

const KHONG_MO: ReadonlySet<string> = new Set();

const DAU_NHOM = {
	"da-bo": { "data-nhom-da-bo": "" },
	"dang-theo-doi": { "data-nhom-dang-theo-doi": "" },
	"tham-gia": { "data-nhom": "tham-gia" },
} as const;

export function NhomMucTieuGap({
	nhan,
	ma,
	ds,
	hienDonVi,
	danhDauCuaToi,
	diemCam,
	moNhuBangChinh = false,
	moKhi = false,
}: {
	nhan: string;
	ma: keyof typeof DAU_NHOM;
	ds: MucTieu[];
	hienDonVi: boolean;
	danhDauCuaToi: boolean;
	diemCam?: ComponentProps<typeof BangMucTieu>["diemCam"];
	/** Mở KR như bảng chính (thu/mở theo đường dẫn) thay vì gập hết. */
	moNhuBangChinh?: boolean;
	/** Tự mở (một lần) khi điều kiện đúng — kể cả khi nó đúng sau lúc trang đã dựng. */
	moKhi?: boolean;
}) {
	const [mo, setMo] = useState(moKhi);
	useEffect(() => {
		if (moKhi) setMo(true);
	}, [moKhi]);
	if (ds.length === 0) return null;
	return (
		<Collapsible {...DAU_NHOM[ma]} onOpenChange={setMo} open={mo}>
			<CollapsibleTrigger asChild>
				<Button className="group" size="sm" variant="ghost">
					<Icon
						className="transition-transform group-aria-expanded:rotate-90 motion-reduce:transition-none"
						data-icon="inline-start"
						icon={ChevronRight}
					/>
					{nhan}
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent className="pt-3">
				<BangMucTieu
					danhDauCuaToi={danhDauCuaToi}
					dangMo={moNhuBangChinh ? undefined : KHONG_MO}
					diemCam={diemCam}
					ds={ds}
					hienDonVi={hienDonVi}
				/>
			</CollapsibleContent>
		</Collapsible>
	);
}

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
	return (
		<NhomMucTieuGap
			danhDauCuaToi={danhDauCuaToi}
			ds={ds}
			hienDonVi={hienDonVi}
			ma="da-bo"
			nhan={k.nhomDaBo(ds.length)}
		/>
	);
}

export function NhomDangTheoDoi({ ds }: { ds: MucTieu[] }) {
	const k = okrMessages(useLocale()).khoiMucTieu;
	return (
		<NhomMucTieuGap
			danhDauCuaToi={false}
			ds={ds}
			hienDonVi
			ma="dang-theo-doi"
			nhan={k.nhomDangTheoDoi(ds.length)}
		/>
	);
}
