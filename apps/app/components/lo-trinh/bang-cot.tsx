"use client";

import { Board, type BoardColumn } from "@crm/ui/components/board";
import { useLocale } from "@crm/ui/components/locale-provider";
import { type ComponentProps, useMemo } from "react";
import { LO_TRINH } from "@/lib/lo-trinh/cau-hinh";
import { type LoTrinhMessages, loTrinhMessages } from "@/lib/messages/lo-trinh";
import { OMoc } from "./o-moc";
import { ChamTrangThai, nhanNhom } from "./o-trang-thai";
import type { ChiaCot } from "./tham-so";
import { KHONG_NHOM, THU_TU_NHOM, type Viec } from "./viec";

function cotCua(
	m: LoTrinhMessages,
	viec: Viec[],
	chia: ChiaCot,
): BoardColumn[] {
	const nhom = new Map<string, { label: string; ds: Viec[]; thuTu: string }>();
	const them = (id: string, label: string, thuTu: string, v: Viec) => {
		const g = nhom.get(id) ?? { label, ds: [], thuTu };
		g.ds.push(v);
		nhom.set(id, g);
	};
	for (const v of viec) {
		if (chia === "trang-thai")
			them(
				v.nhom_trang_thai,
				nhanNhom(m, v.nhom_trang_thai),
				String(THU_TU_NHOM.indexOf(v.nhom_trang_thai)),
				v,
			);
		else if (chia === "nhom")
			them(v.nhom || KHONG_NHOM, v.nhom || m.loc.khongNhom, v.nhom || "~", v);
		else them(v.loTep, v.loTen, v.loTep, v);
	}
	return [...nhom.entries()]
		.sort((a, b) => a[1].thuTu.localeCompare(b[1].thuTu))
		.map(([id, g]) => ({
			id,
			label: g.label,
			userLabel: chia !== "trang-thai",
			count: g.ds.length,
			cards: g.ds.slice(0, LO_TRINH.tranTheCot).map((v) => ({
				id: v.khoa,
				href: `#${v.khoa}`,
				title: v.cau_giao,
				subtitle: `${v.ma}${v.nhom ? ` · ${v.nhom}` : ""}`,
				meta: (
					<span className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
						<ChamTrangThai v={v} />
						<OMoc v={v} />
					</span>
				),
			})),
		}));
}

export function BangCot({
	viec,
	chia,
	moViec,
}: {
	viec: Viec[];
	chia: ChiaCot;
	moViec: (khoa: string) => void;
}) {
	const m = loTrinhMessages(useLocale());
	const NutThe = useMemo(
		() =>
			function NutThe({ href, children, className }: ComponentProps<"a">) {
				return (
					<button
						className={className}
						data-viec-khoa={String(href).slice(1)}
						onClick={() => moViec(String(href).slice(1))}
						type="button"
					>
						{children}
					</button>
				);
			},
		[moViec],
	);
	return (
		<div data-lo-trinh-bang-cot={chia}>
			<Board
				columns={cotCua(m, viec, chia)}
				label={m.thanhCongCu.bangCotNhan}
				linkComponent={NutThe}
			/>
		</div>
	);
}
