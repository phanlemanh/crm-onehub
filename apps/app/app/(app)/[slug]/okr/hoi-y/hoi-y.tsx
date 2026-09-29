"use client";

import Renew from "@carbon/icons-react/es/Renew";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { Button } from "@crm/ui/components/button";
import { Card, CardContent, CardHeader } from "@crm/ui/components/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { OKR_HOI_Y } from "@crm/validation/okr-hoi-y";
import { skipToken, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { okrHoiYMessages } from "@/lib/messages/okr-hoi-y";
import { useTRPC } from "@/lib/trpc/client";
import { useChuKy, useKyHoiY } from "../chon-chu-ky";
import type { ChuKy } from "../kieu";
import { ChuaChuKy } from "../trang-thai-okr";
import { ChuNguoi, dien, ghep } from "./chu";
import { DaiMoc } from "./dai-moc";
import { BanVietTruoc, BanVietTruocDaNiem } from "./khoi-ban-truoc";
import { KhoiDoPhu } from "./khoi-do-phu";
import { KhoiGom } from "./khoi-gom";
import { DuBaY, HetHan, KhoiMoDau, OSoanY, YCuaBan } from "./khoi-gop";
import { KhoiKetLuan } from "./khoi-ket-luan";
import { KhoiKetQua } from "./khoi-ket-qua";
import { KhoiYDongNghiep } from "./khoi-y-dong-nghiep";
import { type HoiY, type TrangThaiMan, trangThaiMan } from "./man-hoi-y";
import { SheetMoHoiY, useMoHoiY } from "./sheet-mo-hoi-y";

const KHUNG_TAI = ["mot", "hai", "ba"] as const;

function DangTaiHoiY() {
	const m = okrHoiYMessages(useLocale());
	return (
		<div aria-busy="true" className="flex flex-col gap-6" data-khoi="dang-tai">
			<p className="sr-only" role="status">
				{m.dangTai}
			</p>
			<Skeleton className="h-12 w-full" />
			{KHUNG_TAI.map((k) => (
				<Card key={k}>
					<CardHeader>
						<Skeleton className="h-5 w-2/3" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-4 w-full" />
						<Skeleton className="h-4 w-4/5" />
					</CardContent>
				</Card>
			))}
		</div>
	);
}

function LoiHoiY({ thuLai }: { thuLai: () => void }) {
	const m = okrHoiYMessages(useLocale()).loi;
	return (
		<Empty data-khoi="loi">
			<EmptyHeader>
				<EmptyMedia variant="icon">
					<Icon icon={WarningAlt} />
				</EmptyMedia>
				<EmptyTitle>{m.tieuDe}</EmptyTitle>
				<EmptyDescription>{m.moTa}</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				<Button onClick={thuLai} variant="outline">
					<Icon data-icon="inline-start" icon={Renew} />
					{m.thuLai}
				</Button>
			</EmptyContent>
		</Empty>
	);
}

function TrongHoiY({
	quanTri,
	ky,
	chuKy,
}: {
	quanTri: boolean;
	ky: ChuKy | null;
	chuKy: ChuKy[];
}) {
	const m = okrHoiYMessages(useLocale()).trong;
	const [, setMo] = useMoHoiY();
	const { datKy } = useChuKy();
	const kyMo = ky?.phase === "lap-ke-hoach" ? ky : null;
	if (!quanTri) {
		return (
			<Empty data-khoi="trong-thanh-vien">
				<EmptyHeader>
					<EmptyTitle>{m.thanhVien}</EmptyTitle>
					<EmptyDescription>{m.thanhVienMoTa}</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}
	return (
		<Empty data-khoi="trong-quan-tri">
			<EmptyHeader>
				<EmptyTitle>{m.quanTri}</EmptyTitle>
				<EmptyDescription>
					{kyMo
						? ghep(m.quanTriMoTa, { ky: <ChuNguoi>{kyMo.name}</ChuNguoi> })
						: m.ngoaiPha}
				</EmptyDescription>
			</EmptyHeader>
			{kyMo ? (
				<EmptyContent>
					<Button data-nut="mo-hoi-y" onClick={() => void setMo(true)}>
						{m.mo}
					</Button>
					<SheetMoHoiY chuKy={chuKy} cycleId={kyMo.id} onXong={datKy} />
				</EmptyContent>
			) : null}
		</Empty>
	);
}

function NoiDung({
	h,
	tt,
	bayGio,
	tenKy,
}: {
	h: HoiY;
	tt: TrangThaiMan;
	bayGio: number;
	tenKy: string;
}) {
	const m = okrHoiYMessages(useLocale()).moDau;
	switch (tt) {
		case "gop":
			return (
				<>
					<DaiMoc bayGio={bayGio} h={h} />
					<KhoiMoDau
						ghiChu={dien(m.gopGoiY, { n: OKR_HOI_Y.yMoiNguoi })}
						h={h}
					/>
					{h.quyen.gopDuoc ? <OSoanY h={h} /> : null}
					{!h.quyen.gopDuoc && h.cuaToi.y.length >= OKR_HOI_Y.yMoiNguoi ? (
						<DuBaY />
					) : null}
					{h.cuaToi.y.length > 0 ? <YCuaBan chiDoc={false} h={h} /> : null}
					<KhoiYDongNghiep h={h} />
					<KhoiDoPhu h={h} />
				</>
			);
		case "da-niem-phong":
			return (
				<>
					<DaiMoc bayGio={bayGio} h={h} />
					<KhoiMoDau ghiChu={m.nguoiChonGoiY} h={h} />
					<BanVietTruocDaNiem chuDe={null} h={h} />
					<KhoiYDongNghiep h={h} />
					<KhoiDoPhu h={h} />
				</>
			);
		case "het-han":
			return (
				<>
					<DaiMoc bayGio={bayGio} h={h} />
					<HetHan h={h} />
					<KhoiMoDau
						ghiChu={dien(m.gopGoiY, { n: OKR_HOI_Y.yMoiNguoi })}
						h={h}
					/>
					{h.cuaToi.y.length > 0 ? <YCuaBan chiDoc h={h} /> : null}
					<KhoiYDongNghiep h={h} />
					<KhoiDoPhu h={h} />
				</>
			);
		case "viet-truoc":
			return (
				<>
					<DaiMoc bayGio={bayGio} h={h} />
					<KhoiMoDau ghiChu={m.nguoiChonGoiY} h={h} />
					<BanVietTruoc h={h} />
					<KhoiYDongNghiep h={h} />
					<KhoiDoPhu h={h} />
				</>
			);
		case "gom":
			return <KhoiGom bayGio={bayGio} h={h} />;
		case "chon-chua-du":
		case "chon-du":
			return <KhoiKetLuan bayGio={bayGio} h={h} tenKy={tenKy} />;
		case "ket-qua":
			return <KhoiKetQua bayGio={bayGio} h={h} />;
		default:
			return null;
	}
}

export function HoiYMan() {
	const trpc = useTRPC();
	const { cycles, cycleId } = useKyHoiY();
	const access = useQuery(trpc.okr.access.queryOptions());
	const hoiY = useQuery(
		trpc.okr.hoiY.queryOptions(cycleId === null ? skipToken : { cycleId }),
	);
	const [bayGio] = useState(() => Date.now());
	const quanTri = access.data?.canManageProgram === true;

	if (cycles.data?.cycles.length === 0 && !access.isPending) {
		return (
			<div data-trang-thai="chua-chu-ky">
				<ChuaChuKy quanTri={quanTri} />
			</div>
		);
	}
	if (cycles.isError || hoiY.isError) {
		return (
			<div data-trang-thai="loi">
				<LoiHoiY
					thuLai={() => {
						if (cycles.isError) void cycles.refetch();
						if (hoiY.isError) void hoiY.refetch();
					}}
				/>
			</div>
		);
	}
	if (cycles.isPending || access.isPending || hoiY.isPending) {
		return (
			<div data-trang-thai="dang-tai">
				<DangTaiHoiY />
			</div>
		);
	}
	const chuKy = cycles.data.cycles;
	const ky = chuKy.find((c) => c.id === cycleId) ?? null;
	if (hoiY.data === null) {
		return (
			<div data-trang-thai={quanTri ? "trong-quan-tri" : "trong-thanh-vien"}>
				<TrongHoiY chuKy={chuKy} ky={ky} quanTri={quanTri} />
			</div>
		);
	}
	const tt = trangThaiMan(hoiY.data);
	return (
		<div className="flex min-w-0 flex-col gap-3" data-trang-thai={tt}>
			<NoiDung bayGio={bayGio} h={hoiY.data} tenKy={ky?.name ?? ""} tt={tt} />
		</div>
	);
}
