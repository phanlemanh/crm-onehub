"use client";

import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import { useLocale } from "@crm/ui/components/locale-provider";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { type ViecMessages, viecMessages } from "@/lib/messages/viec";
import type { RouterOutputs } from "@/lib/trpc/types";
import { HanViec, type TrangThaiViec } from "./trang-thai-viec";

export type TheBang =
	RouterOutputs["viec"]["bang"]["cot"][number]["viec"][number];

export const COT_BANG = [
	"CHUA_LAM",
	"DANG_LAM",
	"CHO_DANH_GIA",
	"XONG",
] as const satisfies readonly TrangThaiViec[];

export type CotBang = (typeof COT_BANG)[number];

export function laCotBang(t: string): t is CotBang {
	return (COT_BANG as readonly string[]).includes(t);
}

export function nhanDich(
	m: ViecMessages,
	nguon: TrangThaiViec,
	den: CotBang,
): string {
	if (den === "XONG") return m.nut.xong;
	if (den === "CHO_DANH_GIA") return m.nut.guiDanhGia;
	if (den === "CHUA_LAM") return m.bang.veChuaLam;
	return nguon === "CHUA_LAM" ? m.nut.batDau : m.nut.lamLai;
}

export function PhuTheViec({
	the,
	hienNguoi,
}: {
	the: TheBang;
	hienNguoi: boolean;
}) {
	const m = viecMessages(useLocale());
	return (
		<>
			{the.cha ? (
				<span className="break-words text-muted-foreground text-xs">
					<span translate="no">
						{dien(m.bang.thuoc, { cha: the.cha.tieuDe })}
					</span>
				</span>
			) : null}
			<span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
				{the.hanNgay ? <HanViec viec={the} /> : null}
				{hienNguoi ? (
					<span className="text-muted-foreground" translate="no">
						{the.nguoiThucHien.name}
					</span>
				) : null}
				{the.con ? (
					<Badge data-dem-con="" variant="secondary">
						<span className="tabular-nums">
							{dien(m.bang.conXong, {
								xong: the.con.xong,
								tong: the.con.tong,
							})}
						</span>
					</Badge>
				) : null}
			</span>
		</>
	);
}

export function TheViecBang({
	the,
	hienNguoi,
	khoa,
	onMo,
	onChuyen,
}: {
	the: TheBang;
	hienNguoi: boolean;
	khoa: boolean;
	onMo: () => void;
	onChuyen: (den: CotBang) => void;
}) {
	const m = viecMessages(useLocale());
	const dich = the.chuyenDuoc.filter(
		(d): d is CotBang => laCotBang(d) && d !== the.trangThai,
	);
	const choDanhGia = the.trangThai === "CHO_DANH_GIA" && dich.length === 0;
	return (
		<div className="flex min-w-0 flex-col gap-1" data-the-viec={the.id}>
			<button
				className="break-words text-start font-medium outline-none hover:underline focus-visible:underline"
				onClick={onMo}
				translate="no"
				type="button"
			>
				{the.tieuDe}
			</button>
			<PhuTheViec hienNguoi={hienNguoi} the={the} />
			{the.trangThai === "XONG" && dich.length === 0 ? null : (
				<div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								data-chuyen-sang=""
								disabled={khoa || dich.length === 0}
								size="sm"
								variant="ghost"
							>
								{m.bang.chuyenSang}
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="start">
							<DropdownMenuLabel>
								<span translate="no">
									{dien(m.bang.chuyenSangCua, { tieuDe: the.tieuDe })}
								</span>
							</DropdownMenuLabel>
							{dich.map((den) => (
								<DropdownMenuItem
									data-dich={den}
									key={den}
									onSelect={() => onChuyen(den)}
								>
									{nhanDich(m, the.trangThai, den)}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			)}
			{choDanhGia ? (
				<span className="text-muted-foreground text-xs">
					{m.bang.choDanhGiaKhoa}
				</span>
			) : null}
		</div>
	);
}
