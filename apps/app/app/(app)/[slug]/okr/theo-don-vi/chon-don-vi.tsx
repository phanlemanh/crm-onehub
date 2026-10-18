"use client";

import { Combobox, type ComboboxOption } from "@crm/ui/components/combobox";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useMemo, useState } from "react";
import { okrMessages } from "@/lib/messages/okr";
import type { CayDuLieu } from "../kieu";
import { type DonChonOkr, khoaDon, parseAsDonOkr } from "../okr-search-params";
import { khopTim, type LuaChonDonVi, luaChonDonVi } from "./bang-don-vi";

const thanhOChon = (lc: LuaChonDonVi): ComboboxOption => ({
	value: lc.khoa,
	label: lc.ten,
	hint: lc.goiY,
});

export function ChonDonVi({
	cay,
	tenGoc,
	dem,
	don,
	chonDon,
}: {
	cay: CayDuLieu;
	tenGoc: string;
	dem: Record<string, number> | undefined;
	don: DonChonOkr;
	chonDon: (d: DonChonOkr) => void;
}) {
	const m = okrMessages(useLocale());
	const b = m.donViBang;
	const [tim, datTim] = useState("");
	const nguoi =
		don.loai === "nguoi"
			? (cay.people.find((p) => p.id === don.id) ?? null)
			: null;
	const tatCa = useMemo(
		() =>
			luaChonDonVi(
				cay,
				tenGoc,
				dem,
				nguoi ? { id: nguoi.id, ten: nguoi.name } : null,
				{
					caCongTy: b.caCongTy,
					thuoc: (duong) => `${b.thuoc} ${duong}`,
					demMucTieu: m.demMucTieu,
				},
			),
		[cay, tenGoc, dem, nguoi, b, m.demMucTieu],
	);
	const khoa = khoaDon(don);
	const dangChon = tatCa.find((lc) => lc.khoa === khoa);
	return (
		<Combobox
			aria-label={b.chonDonVi}
			className="w-full sm:w-72"
			data-chon-don-vi
			data-don-chon={khoa}
			empty={b.khongKhopDonVi}
			onSearchChange={datTim}
			onValueChange={(v) => {
				const d = parseAsDonOkr.parse(v);
				if (d) chonDon(d);
			}}
			options={tatCa.filter((lc) => khopTim(lc, tim)).map(thanhOChon)}
			placeholder={b.chonDonVi}
			search={tim}
			searchPlaceholder={b.timDonVi}
			selectedOption={dangChon ? thanhOChon(dangChon) : undefined}
			size="sm"
			translate="no"
			value={khoa}
		/>
	);
}
