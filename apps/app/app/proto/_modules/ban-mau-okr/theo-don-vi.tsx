"use client";

import Add from "@carbon/icons-react/es/Add";
import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import DocumentImport from "@carbon/icons-react/es/DocumentImport";
import Target from "@carbon/icons-react/es/Target";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { cn } from "@crm/ui/lib/utils";
import { type ReactNode, useState } from "react";
import {
	DetailSheet,
	DetailSheetBody,
	DetailSheetHeader,
	DetailSheetProperties,
	DetailSheetProperty,
	DetailSheetSection,
	DetailSheetStat,
	DetailSheetStats,
	type DetailSheetTab,
	DetailSheetTabs,
} from "@/components/detail-sheet";
import { KhoiMucTieu } from "./cua-toi";
import {
	CAY_DON_VI,
	type DonViMau,
	KY,
	LICH_SU_KR,
	MT_CSKH_1,
	MT_CSKH_2,
	MT_KD1,
	MT_KD2,
	MT_KETOAN,
	MT_KINHDOANH,
	MT_ONEHUB_1,
	MT_ONEHUB_2,
	MT_VANHANH,
	MUC_TIEU_CUA_DON_VI,
	type MucTieuMau,
} from "./du-lieu";
import {
	ChuThichVach,
	DangTai,
	giaTri,
	LoaiMucTieuNhan,
	Loi,
	TenNguoi,
	ThanhTienDo,
	TinhTrangKr,
	TuTin,
	tienDo,
} from "./phan-chung";

export type HinhDonVi =
	| "danh-sach"
	| "cay-can-chinh"
	| "sheet"
	| "rong"
	| "dang-tai"
	| "loi";

function tienDoMucTieu(mt: MucTieuMau): number {
	if (mt.kr.length === 0) return 0;
	return Math.round(mt.kr.reduce((t, k) => t + tienDo(k), 0) / mt.kr.length);
}

function soMucTieu(dv: DonViMau): number {
	return MUC_TIEU_CUA_DON_VI.get(dv.id)?.length ?? 0;
}

function tatCaDonVi(dv: DonViMau): DonViMau[] {
	return [dv, ...dv.con.flatMap(tatCaDonVi)];
}

function NutDonVi({
	dv,
	chon,
	cap,
}: {
	dv: DonViMau;
	chon: string;
	cap: number;
}) {
	const dangChon = dv.id === chon;
	const n = soMucTieu(dv);
	return (
		<li>
			<Button
				className={cn(
					"h-auto w-full justify-between gap-2 py-1.5 font-normal text-muted-foreground",
					dangChon &&
						"bg-muted text-foreground hover:bg-muted hover:text-foreground",
				)}
				style={{ paddingInlineStart: `${0.5 + cap * 1}rem` }}
				aria-current={dangChon ? "true" : undefined}
				variant="ghost"
			>
				<span className="min-w-0 truncate text-left" translate="no">
					{dv.ten}
				</span>
				<span className="shrink-0 text-xs tabular-nums">
					{n === 0 ? "chưa đặt" : n}
				</span>
			</Button>
			{dv.con.length > 0 ? (
				<ul>
					{dv.con.map((c) => (
						<NutDonVi cap={cap + 1} chon={chon} dv={c} key={c.id} />
					))}
				</ul>
			) : null}
		</li>
	);
}

function CayDonVi({ chon }: { chon: string }) {
	return (
		<nav
			aria-label="Đơn vị"
			className="hidden w-60 shrink-0 flex-col gap-2 lg:flex"
		>
			<span className="px-2 font-medium text-muted-foreground text-xs">
				Đơn vị · số mục tiêu
			</span>
			<ul aria-label="Cây tổ chức" className="flex flex-col">
				<NutDonVi cap={0} chon={chon} dv={CAY_DON_VI} />
			</ul>
		</nav>
	);
}

function ChonDonViMayNho({ chon }: { chon: string }) {
	return (
		<Select defaultValue={chon}>
			<SelectTrigger aria-label="Đơn vị" className="w-full lg:hidden">
				<SelectValue />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value={CAY_DON_VI.id}>{CAY_DON_VI.ten}</SelectItem>
				{CAY_DON_VI.con.map((bp) => (
					<SelectGroup key={bp.id}>
						<SelectLabel>{bp.ten}</SelectLabel>
						{tatCaDonVi(bp).map((dv) => (
							<SelectItem key={dv.id} value={dv.id}>
								{dv.ten}
							</SelectItem>
						))}
					</SelectGroup>
				))}
			</SelectContent>
		</Select>
	);
}

function timDonVi(id: string): DonViMau {
	return tatCaDonVi(CAY_DON_VI).find((d) => d.id === id) ?? CAY_DON_VI;
}

function DauDonVi({
	dv,
	che,
	datChe,
}: {
	dv: DonViMau;
	che: "danh-sach" | "cay";
	datChe: (v: "danh-sach" | "cay") => void;
}) {
	const mt = MUC_TIEU_CUA_DON_VI.get(dv.id) ?? [];
	const soKr = mt.reduce((t, m) => t + m.kr.length, 0);
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
			<div className="flex min-w-0 flex-col gap-1">
				<h3 className="font-medium text-base tracking-tight" translate="no">
					{dv.ten}
				</h3>
				<p className="flex flex-wrap items-center gap-x-2 text-muted-foreground text-xs">
					<span>
						{dv.cap === "goc"
							? "Cả công ty"
							: dv.cap === "bo-phan"
								? "Bộ phận"
								: "Phòng ban"}
					</span>
					<span aria-hidden="true">·</span>
					{dv.truong ? (
						<>
							<span>Trưởng</span>
							<TenNguoi avatar={false} ten={dv.truong.ten} />
						</>
					) : (
						<span>Chưa có trưởng</span>
					)}
					<span aria-hidden="true">·</span>
					<span className="tabular-nums">
						{mt.length} mục tiêu · {soKr} KR
					</span>
				</p>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<ToggleGroup
					aria-label="Cách xem"
					onValueChange={(v) => {
						if (v === "danh-sach" || v === "cay") datChe(v);
					}}
					size="sm"
					spacing={0}
					type="single"
					value={che}
					variant="outline"
				>
					<ToggleGroupItem value="danh-sach">Danh sách</ToggleGroupItem>
					<ToggleGroupItem value="cay">Cây căn chỉnh</ToggleGroupItem>
				</ToggleGroup>
			</div>
		</div>
	);
}

type NutCanChinh = {
	id: string;
	loai: "muc-tieu" | "kr";
	donVi: string;
	ten: string;
	phanTram: number;
	loaiMt: MucTieuMau["loai"];
	gop: number;
	lapLai: boolean;
	con: NutCanChinh[];
	trong?: string;
};

function nutMt(
	mt: MucTieuMau,
	con: NutCanChinh[],
	lapLai = false,
): NutCanChinh {
	return {
		id: `${mt.id}${lapLai ? "-lai" : ""}`,
		loai: "muc-tieu",
		donVi: mt.donVi,
		ten: mt.ten,
		phanTram: tienDoMucTieu(mt),
		loaiMt: mt.loai,
		gop: mt.gopVao.length,
		lapLai,
		con,
	};
}

function nutKr(
	mt: MucTieuMau,
	i: number,
	con: NutCanChinh[],
	trong?: string,
): NutCanChinh {
	const k = mt.kr[i];
	if (!k) throw new Error(`thieu kr ${mt.id}#${i}`);
	return {
		id: k.id,
		loai: "kr",
		donVi: mt.donVi,
		ten: k.ten,
		phanTram: tienDo(k),
		loaiMt: mt.loai,
		gop: 0,
		lapLai: false,
		con,
		trong,
	};
}

const CAY_CAN_CHINH: NutCanChinh[] = [
	nutMt(MT_ONEHUB_1, [
		nutKr(MT_ONEHUB_1, 0, [
			nutMt(MT_KINHDOANH, [
				nutKr(MT_KINHDOANH, 0, [nutMt(MT_KD1, []), nutMt(MT_KD2, [])]),
			]),
			nutMt(MT_KD2, [], true),
		]),
		nutKr(MT_ONEHUB_1, 1, [
			nutMt(MT_VANHANH, [nutMt(MT_CSKH_1, [], true)]),
			nutMt(MT_CSKH_1, []),
		]),
	]),
	nutMt(MT_ONEHUB_2, [
		nutKr(MT_ONEHUB_2, 0, [nutMt(MT_CSKH_2, [])]),
		nutKr(MT_ONEHUB_2, 1, [], "Chưa đơn vị nào góp vào KR này"),
	]),
];

const CHUA_CAN_CHINH: NutCanChinh[] = [nutMt(MT_KETOAN, [])];

function DongCanChinh({ nut, cap }: { nut: NutCanChinh; cap: number }) {
	const laKr = nut.loai === "kr";
	return (
		<li>
			<div
				className={cn(
					"grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b py-2 pe-4 sm:grid-cols-[minmax(0,1fr)_9rem_6.5rem]",
					nut.lapLai && "text-muted-foreground",
				)}
				style={{ paddingInlineStart: `${1 + cap * 1.25}rem` }}
			>
				<span className="flex min-w-0 items-start gap-2">
					{nut.con.length > 0 ? (
						<Icon
							className="mt-0.5 shrink-0 text-muted-foreground"
							icon={ChevronDown}
						/>
					) : (
						<span aria-hidden="true" className="w-4 shrink-0" />
					)}
					<span className="flex min-w-0 flex-col gap-0.5">
						<span
							className={cn("text-sm", !laKr && !nut.lapLai && "font-medium")}
							translate="no"
						>
							{laKr ? `KR · ${nut.ten}` : nut.ten}
						</span>
						<span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted-foreground text-xs">
							{laKr ? null : <span translate="no">{nut.donVi}</span>}
							{nut.gop > 1 ? (
								<Badge variant="outline">Góp vào {nut.gop} chỗ</Badge>
							) : null}
							{nut.lapLai ? <span>· cũng hiện ở chỗ góp kia</span> : null}
							{nut.trong ? <span>{nut.trong}</span> : null}
						</span>
					</span>
				</span>
				<span className="col-start-1 flex items-center gap-2 ps-6 sm:col-start-auto sm:ps-0">
					<ThanhTienDo
						className="w-24 sm:w-full"
						nhan={nut.ten}
						phanTram={nut.phanTram}
					/>
					<span className="text-xs tabular-nums sm:hidden">
						{nut.phanTram}%
					</span>
				</span>
				<span className="row-start-1 flex justify-end sm:row-start-auto sm:justify-start">
					<TinhTrangKr loai={nut.loaiMt} phanTram={nut.phanTram} size="sm" />
				</span>
			</div>
			{nut.con.length > 0 ? (
				<ul>
					{nut.con.map((c) => (
						<DongCanChinh cap={cap + 1} key={c.id} nut={c} />
					))}
				</ul>
			) : null}
		</li>
	);
}

function CayCanChinh() {
	return (
		<div className="flex flex-col gap-3">
			<ChuThichVach />
			<div className="overflow-hidden rounded-lg border">
				<ul aria-label="Cây căn chỉnh toàn công ty">
					{CAY_CAN_CHINH.map((n) => (
						<DongCanChinh cap={0} key={n.id} nut={n} />
					))}
				</ul>
				<p className="border-b bg-muted/50 px-4 py-2 font-medium text-muted-foreground text-xs">
					Chưa căn chỉnh vào đâu
				</p>
				<ul aria-label="Mục tiêu chưa căn chỉnh">
					{CHUA_CAN_CHINH.map((n) => (
						<DongCanChinh cap={0} key={n.id} nut={n} />
					))}
				</ul>
			</div>
		</div>
	);
}

function SheetMucTieu({ mt }: { mt: MucTieuMau }) {
	const [tab, setTab] = useState("kr");
	const p = tienDoMucTieu(mt);
	const tabs: DetailSheetTab[] = [
		{
			value: "kr",
			label: "KR",
			count: mt.kr.length,
			content: (
				<DetailSheetBody>
					<DetailSheetSection title="Kết quả then chốt">
						<ul className="flex flex-col divide-y">
							{mt.kr.map((k) => (
								<li className="flex flex-col gap-1.5 py-2.5" key={k.id}>
									<div className="flex items-start justify-between gap-3">
										<span className="text-sm" translate="no">
											{k.ten}
										</span>
										<TuTin coNhan={false} muc={k.tuTin} size="sm" />
									</div>
									<ThanhTienDo
										kyVong={k.kieu === "moc" ? null : undefined}
										nhan={k.ten}
										phanTram={tienDo(k)}
									/>
									<div className="flex items-center justify-between gap-3 text-muted-foreground text-xs">
										<TenNguoi avatar={false} ten={k.phuTrach.ten} />
										<span className="tabular-nums">
											{giaTri(k)} /{" "}
											{k.kieu === "moc" ? "mốc" : giaTri(k, k.dich)}
										</span>
									</div>
								</li>
							))}
						</ul>
					</DetailSheetSection>
				</DetailSheetBody>
			),
		},
		{
			value: "can-chinh",
			label: "Căn chỉnh",
			count: mt.gopVao.length,
			content: (
				<DetailSheetBody>
					<DetailSheetSection title="Góp vào">
						<ul className="flex flex-col gap-2 text-sm">
							{mt.gopVao.map((g) => (
								<li key={`${g.donVi}-${g.mucTieu}`} translate="no">
									{g.donVi} › {g.kr ?? g.mucTieu}
								</li>
							))}
						</ul>
					</DetailSheetSection>
				</DetailSheetBody>
			),
		},
		{
			value: "hoat-dong",
			label: "Hoạt động",
			content: (
				<DetailSheetBody>
					<DetailSheetSection title="Hoạt động">
						<ul className="flex flex-col gap-3">
							{LICH_SU_KR.map((v) => (
								<li className="flex gap-2.5" key={`${v.luc}-${v.cau}`}>
									<PersonAvatar name={v.nguoi.ten} size="sm" />
									<div className="min-w-0 flex-1 text-sm">
										<p>
											<span className="font-medium" translate="no">
												{v.nguoi.ten}
											</span>{" "}
											<span className="text-muted-foreground">{v.cau}</span>
										</p>
										<p className="text-muted-foreground text-xs">{v.luc}</p>
									</div>
								</li>
							))}
						</ul>
					</DetailSheetSection>
				</DetailSheetBody>
			),
		},
	];

	return (
		<DetailSheet onOpenChange={() => undefined} open>
			<DetailSheetHeader
				description={
					<>
						Mục tiêu · <span translate="no">{mt.donVi}</span> · {KY.ten}
					</>
				}
				media={
					<span className="flex size-10 items-center justify-center rounded-lg border">
						<Icon icon={Target} />
					</span>
				}
				note={<LoaiMucTieuNhan loai={mt.loai} />}
				onClose={() => undefined}
				title={<span translate="no">{mt.ten}</span>}
			/>
			<DetailSheetStats>
				<DetailSheetStat label={`Tiến độ · lẽ ra ${KY.kyVong}%`}>
					<span className="tabular-nums">{p}%</span>
				</DetailSheetStat>
				<DetailSheetStat label="Tình trạng">
					<TinhTrangKr loai={mt.loai} phanTram={p} />
				</DetailSheetStat>
				<DetailSheetStat label="Phụ trách">
					<TenNguoi ten={mt.phuTrach.ten} />
				</DetailSheetStat>
			</DetailSheetStats>
			<DetailSheetSection title="Chi tiết">
				<DetailSheetProperties>
					<DetailSheetProperty label="Chu kỳ">{KY.ten}</DetailSheetProperty>
					<DetailSheetProperty label="Công bố">02/11</DetailSheetProperty>
					<DetailSheetProperty label="Tham gia">
						<span translate="no">Bùi Thu Nga</span>
					</DetailSheetProperty>
				</DetailSheetProperties>
			</DetailSheetSection>
			<DetailSheetTabs onValueChange={setTab} tabs={tabs} value={tab} />
		</DetailSheet>
	);
}

export function TheoDonVi({ hinh }: { hinh: HinhDonVi }) {
	const [che, setChe] = useState<"danh-sach" | "cay">(
		hinh === "cay-can-chinh" ? "cay" : "danh-sach",
	);
	const chon = hinh === "rong" ? "kho" : "cskh";
	const dv = timDonVi(chon);
	const mt = MUC_TIEU_CUA_DON_VI.get(chon) ?? [];

	let noiDung: ReactNode;
	if (hinh === "dang-tai") noiDung = <DangTai dong={3} />;
	else if (hinh === "loi")
		noiDung = (
			<Loi cau="Không lấy được OKR của đơn vị này. Thử lại, hoặc chọn đơn vị khác bên trái." />
		);
	else if (hinh === "rong") {
		noiDung = (
			<Empty className="rounded-lg border">
				<EmptyHeader>
					<EmptyTitle>
						<span translate="no">{dv.ten}</span> chưa đặt OKR cho {KY.ten}
					</EmptyTitle>
					<EmptyDescription>
						Phòng ban chưa có trưởng. Bạn là trưởng bộ phận Vận hành nên đặt
						được thay — hoặc nhập bộ OKR đang có trong bảng tính.
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent className="flex-row justify-center">
					<Button size="sm">
						<Icon icon={Add} data-icon="inline-start" />
						Đặt mục tiêu
					</Button>
					<Button size="sm" variant="outline">
						<Icon icon={DocumentImport} data-icon="inline-start" />
						Nhập từ bảng tính
					</Button>
				</EmptyContent>
			</Empty>
		);
	} else if (che === "cay") noiDung = <CayCanChinh />;
	else {
		noiDung = (
			<div className="flex flex-col gap-3">
				<ChuThichVach />
				{mt.map((m) => (
					<KhoiMucTieu hienDonVi={false} key={m.id} mucTieu={m} />
				))}
			</div>
		);
	}

	return (
		<div className="flex gap-6">
			<CayDonVi chon={chon} />
			<div className="flex min-w-0 flex-1 flex-col gap-4">
				<ChonDonViMayNho chon={chon} />
				<DauDonVi che={che} datChe={setChe} dv={dv} />
				{noiDung}
			</div>
			{hinh === "sheet" ? <SheetMucTieu mt={MT_CSKH_1} /> : null}
		</div>
	);
}
