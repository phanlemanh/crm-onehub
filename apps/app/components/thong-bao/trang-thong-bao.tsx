"use client";

import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import {
	DanhSachNhomThongBao,
	type NhomThongBao,
} from "@/components/thong-bao/dong-thong-bao";
import { thongBaoMessages } from "@/lib/messages/thong-bao";

export type LocThongBao = "tat-ca" | "chua-doc";

export function TrangThongBaoThan({
	trangThai,
	loc,
	nhom,
	coThem,
	dangThem,
	onLoc,
	onXemThem,
	onMo,
	onThuLai,
}: {
	trangThai: "cho-tai" | "loi" | "xong";
	loc: LocThongBao;
	nhom: NhomThongBao[];
	coThem: boolean;
	dangThem: boolean;
	onLoc: (loc: LocThongBao) => void;
	onXemThem: () => void;
	onMo: (id: string) => void;
	onThuLai: () => void;
}) {
	const locale = useLocale();
	const m = thongBaoMessages(locale).trang;
	const c = thongBaoMessages(locale).chuong;
	const rong = nhom.every((n) => n.dong.length === 0);

	let than: React.ReactNode;
	if (trangThai === "cho-tai") {
		than = (
			<div className="flex flex-col gap-2" aria-busy="true">
				<Skeleton className="h-12 w-full" />
				<Skeleton className="h-12 w-full" />
				<Skeleton className="h-12 w-full" />
			</div>
		);
	} else if (trangThai === "loi") {
		than = (
			<VungTaiLoi
				tieuDe={m.taiLoiTieuDe}
				moTa={m.taiLoiMoTa}
				onThuLai={onThuLai}
			/>
		);
	} else if (rong && loc === "chua-doc") {
		than = (
			<Empty border="solid">
				<EmptyHeader>
					<EmptyTitle>{m.daDocHetTieuDe}</EmptyTitle>
					<EmptyDescription>{m.daDocHetMoTa}</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button variant="outline" size="sm" onClick={() => onLoc("tat-ca")}>
						{m.xemTatCa}
					</Button>
				</EmptyContent>
			</Empty>
		);
	} else if (rong) {
		than = (
			<Empty border="solid">
				<EmptyHeader>
					<EmptyTitle>{c.rongTieuDe}</EmptyTitle>
					<EmptyDescription>{c.rongMoTa}</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	} else {
		than = (
			<div className="flex flex-col gap-3">
				<DanhSachNhomThongBao nhanChuaDoc={c.chuaDoc} nhom={nhom} onMo={onMo} />
				{coThem ? (
					<div className="flex justify-center">
						<Button
							variant="outline"
							size="sm"
							disabled={dangThem}
							onClick={onXemThem}
						>
							{m.xemThem}
						</Button>
					</div>
				) : null}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4">
			<ToggleGroup
				type="single"
				variant="outline"
				size="sm"
				value={loc}
				onValueChange={(v) => {
					if (v === "tat-ca" || v === "chua-doc") onLoc(v);
				}}
				aria-label={m.tieuDe}
			>
				<ToggleGroupItem value="tat-ca">{m.loc.tatCa}</ToggleGroupItem>
				<ToggleGroupItem value="chua-doc">{m.loc.chuaDoc}</ToggleGroupItem>
			</ToggleGroup>
			{than}
		</div>
	);
}
