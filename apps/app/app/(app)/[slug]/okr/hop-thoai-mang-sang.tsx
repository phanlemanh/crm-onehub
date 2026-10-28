"use client";

import { Button } from "@crm/ui/components/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import type { Locale } from "@crm/ui/lib/locale";
import { diemChuan, OKR_KHEP, type ThangCham } from "@crm/validation/okr-khep";
import { kiemSoTheoKieu, type LoiSoTheoKieu } from "@crm/validation/okr-kr";
import { useState } from "react";
import { okrKhepMessages } from "@/lib/messages/okr-khep";
import type { RouterOutputs } from "@/lib/trpc/types";
import { giaTri } from "./gia-tri-kr";

type MucTieuMang = RouterOutputs["okr"]["bangCham"]["mucTieu"][number];
type KrMang = MucTieuMang["krs"][number];

export type PhanMangSang = {
	chep: KrMang[];
	khongChep: { kr: KrMang; lyDo: LoiSoTheoKieu | "tron" }[];
};

export function phanMangSang(mt: MucTieuMang, thang: ThangCham): PhanMangSang {
	const ra: PhanMangSang = { chep: [], khongChep: [] };
	for (const k of mt.krs) {
		const chuan = diemChuan(k.diem ?? k.diemGoiY, thang) ?? 0;
		if (chuan >= OKR_KHEP.mangSang.diemTron) {
			ra.khongChep.push({ kr: k, lyDo: "tron" });
			continue;
		}
		const loi = kiemSoTheoKieu(k.kind, k.soChot, k.targetValue);
		if (loi) ra.khongChep.push({ kr: k, lyDo: loi });
		else ra.chep.push(k);
	}
	return ra;
}

function DanhSachChep({
	phan,
	locale,
}: {
	phan: PhanMangSang;
	locale: Locale;
}) {
	const mk = okrKhepMessages(locale).mangSang;
	return (
		<div className="flex flex-col gap-3">
			{phan.chep.length === 0 ? (
				<p className="text-sm">{mk.khongChepNao}</p>
			) : (
				<>
					<p className="font-medium text-sm">
						{mk.chep(String(phan.chep.length))}
					</p>
					<ItemGroup>
						{phan.chep.map((k) => (
							<Item data-kr-chep={k.id} key={k.id} size="sm" variant="outline">
								<ItemContent>
									<ItemTitle>
										<span translate="no">{k.title}</span>
									</ItemTitle>
									<ItemDescription>
										{mk.khoiDiemMoi(
											giaTri(k, k.soChot, locale),
											giaTri(k, k.targetValue, locale),
										)}
									</ItemDescription>
								</ItemContent>
							</Item>
						))}
					</ItemGroup>
				</>
			)}
			{phan.khongChep.length > 0 ? (
				<div className="flex flex-col gap-1 text-muted-foreground text-sm">
					<p>{mk.khongChep}</p>
					{phan.khongChep.map(({ kr, lyDo }) => (
						<p data-kr-khong-chep={kr.id} key={kr.id}>
							<span translate="no">«{kr.title}»</span> — {mk.lyDo[lyDo]}
						</p>
					))}
				</div>
			) : null}
			<p className="text-muted-foreground text-sm">{mk.canChinh}</p>
		</div>
	);
}

export function HopThoaiMangSang({
	mucTieu,
	thang,
	tenKy,
	kyKe,
	dong,
	xacNhan,
}: {
	mucTieu: MucTieuMang;
	thang: ThangCham;
	tenKy: string;
	kyKe: string | null;
	dong: () => void;
	xacNhan: () => Promise<boolean>;
}) {
	const locale = useLocale();
	const m = okrKhepMessages(locale);
	const mk = m.mangSang;
	const [dangGui, setDangGui] = useState(false);
	const gui = async () => {
		setDangGui(true);
		const xong = await xacNhan();
		setDangGui(false);
		if (xong) dong();
	};
	return (
		<Dialog open onOpenChange={(mo) => (mo ? undefined : dong())}>
			<DialogContent data-hop-thoai-mang-sang={mucTieu.id}>
				<DialogHeader>
					<DialogTitle>
						{m.cham.mangSang}{" "}
						{kyKe === null ? null : <span translate="no">{kyKe}</span>}
					</DialogTitle>
					<DialogDescription>
						{kyKe === null ? mk.khongKy : mk.moTa(kyKe, tenKy)}
					</DialogDescription>
				</DialogHeader>
				{kyKe === null ? null : (
					<DanhSachChep locale={locale} phan={phanMangSang(mucTieu, thang)} />
				)}
				<DialogFooter>
					<DialogClose asChild>
						<Button variant="outline">
							{kyKe === null ? mk.dong : mk.huy}
						</Button>
					</DialogClose>
					{kyKe === null ? null : (
						<Button
							data-nut="xac-nhan-mang-sang"
							disabled={dangGui}
							onClick={() => void gui()}
						>
							{mk.xacNhan}
						</Button>
					)}
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
