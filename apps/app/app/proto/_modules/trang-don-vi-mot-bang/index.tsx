"use client";

import { Button } from "@crm/ui/components/button";
import {
	DataTable,
	type DataTableColumn,
	type DataTableFacet,
	type DataTableTabs,
} from "@crm/ui/components/data-table";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemTitle,
} from "@crm/ui/components/item";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import { SectionHeading } from "@crm/ui/components/section-heading";
import {
	Sheet,
	SheetBody,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import { Skeleton } from "@crm/ui/components/skeleton";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import type { TableQueryState } from "@crm/ui/lib/table-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { type KrMau, type MucTieuMau, NGUOI } from "../ban-mau-okr/du-lieu";
import {
	giaTri,
	LoaiMucTieuNhan,
	TenNguoi,
	TinhTrangKr,
	tienDo,
} from "../ban-mau-okr/phan-chung";
import { TrangMucTieu } from "../dieu-huong-khu-muc-tieu/khung";
import { CayCanChinh, ChamDiem, HopTuan, TienDoO } from "./cach-xem-khac";
import {
	bacTinhTrang,
	canBan,
	chuaGop,
	DA_BO,
	DON_VI,
	type DonViPhang,
	donVi,
	duongTrang,
	krCuaNguoi,
	maDon,
	mucTieuCua,
	mucTieuCuaNguoi,
	NGUOI_DON,
	type NguoiPhang,
	NHAP,
	soKrCham,
	thuoc,
	tienDoMucTieu,
} from "./du-lieu";
import {
	type CachXem,
	HangCongCuDonVi,
	HangCongCuKhungXuong,
	KhungHangCongCu,
} from "./hang-cong-cu";

/* ——— Cảnh của từng state ——— */

type Canh = {
	don: string;
	xem: CachXem;
	moChon?: boolean;
	tab?: string;
	moKr?: string[];
	kieu?: "dang-tai" | "loi";
	hoi2?: boolean;
	ghim?: string;
};

const CANH = {
	"ST-dvb-danh-sach": {
		don: "pb:cskh",
		xem: "danh-sach",
		ghim: "Hỏi-2 · máy khuyên: bấm tên mục tiêu mở ngăn chi tiết, bấm dòng mở KR",
	},
	"ST-dvb-mo-kr": { don: "pb:cskh", xem: "danh-sach", moKr: ["c1"] },
	"ST-dvb-chon-don-vi": { don: "pb:cskh", xem: "danh-sach", moChon: true },
	"ST-dvb-can-ban": { don: "pb:cskh", xem: "danh-sach", tab: "can-ban" },
	"ST-dvb-khong-khop": { don: "pb:kd2", xem: "danh-sach", tab: "can-ban" },
	"ST-dvb-rong": { don: "bp:taichinh", xem: "danh-sach" },
	"ST-dvb-chua-truong": { don: "bp:vanhanh", xem: "danh-sach" },
	"ST-dvb-cong-ty": { don: "cty", xem: "danh-sach" },
	"ST-dvb-nguoi": { don: "nguoi:thao", xem: "danh-sach" },
	"ST-dvb-hop-tuan": { don: "pb:cskh", xem: "hop-tuan" },
	"ST-dvb-cham-diem": { don: "pb:cskh", xem: "cham" },
	"ST-dvb-cay": { don: "pb:cskh", xem: "cay" },
	"ST-dvb-dang-tai": { don: "pb:cskh", xem: "danh-sach", kieu: "dang-tai" },
	"ST-dvb-loi": { don: "pb:cskh", xem: "danh-sach", kieu: "loi" },
	"ST-dvb-hoi-2-nut-chi-tiet": {
		don: "pb:cskh",
		xem: "danh-sach",
		hoi2: true,
		ghim: "Hỏi-2 · lối khác: nút «Chi tiết» riêng cuối dòng",
	},
} satisfies Record<string, Canh>;

/* ——— Đơn đang xem: một đơn vị của cây, hoặc một người ——— */

type Don = {
	ma: string;
	id: string;
	ten: string;
	laCongTy: boolean;
	dv: DonViPhang | null;
	nguoi: NguoiPhang | null;
	mucTieu: MucTieuMau[];
};

function giaiDon(ma: string): Don | null {
	if (ma.startsWith("nguoi:")) {
		const ng = NGUOI_DON.get(ma.slice("nguoi:".length));
		if (!ng) return null;
		return {
			ma,
			id: ng.nguoi.id,
			ten: ng.nguoi.ten,
			laCongTy: false,
			dv: null,
			nguoi: ng,
			mucTieu: mucTieuCuaNguoi(ng.nguoi.id),
		};
	}
	const dv = DON_VI.find((d) => maDon(d) === ma);
	if (!dv) return null;
	return {
		ma,
		id: dv.id,
		ten: dv.ten,
		laCongTy: dv.loai === "cty",
		dv,
		nguoi: null,
		mucTieu: mucTieuCua(dv.id),
	};
}

/* ——— Truy vấn bảng (giữ trong bộ nhớ: bản mẫu không ghi máy chủ) ——— */

const TAB_LOC: DataTableTabs = {
	id: "loc",
	allLabel: "Tất cả",
	options: [
		{ value: "can-ban", label: "Cần bàn" },
		{ value: "chua-gop", label: "Chưa góp vào đâu" },
	],
};

const FACETS: DataTableFacet[] = [
	{
		id: "phu-trach",
		label: "Phụ trách",
		options: [NGUOI.thao, NGUOI.nga, NGUOI.son, NGUOI.lan].map((n) => ({
			value: n.id,
			label: n.ten,
		})),
	},
	{
		id: "loai",
		label: "Loại",
		options: [
			{ value: "cam-ket", label: "Cam kết" },
			{ value: "tham-vong", label: "Tham vọng" },
		],
	},
	{
		id: "trang-thai",
		label: "Trạng thái",
		options: [
			{ value: "nhap", label: "Nháp" },
			{ value: "cong-bo", label: "Đã công bố" },
		],
	},
	{
		id: "tu-tin",
		label: "Mức tự tin",
		options: [
			{ value: "cao", label: "Cao" },
			{ value: "vua", label: "Vừa" },
			{ value: "thap", label: "Thấp" },
		],
	},
	{
		id: "gop-y",
		label: "Góp ý",
		options: [
			{ value: "chua-doc", label: "Có góp ý chưa đọc" },
			{ value: "khong", label: "Không có góp ý" },
		],
	},
];

function useTruyVan(tabDau: string): TableQueryState {
	const [tab, setTab] = useState(tabDau);
	const [sort, setSort] = useState("");
	const [dir, setDir] = useState<"asc" | "desc">("asc");
	const [filters, setFilters] = useState<Record<string, string[]>>({});
	return {
		sort,
		dir,
		page: 1,
		pageSize: 50,
		tab,
		tabId: TAB_LOC.id,
		filters,
		toggleSort: (id) => {
			if (sort === id) setDir(dir === "asc" ? "desc" : "asc");
			else {
				setSort(id);
				setDir("asc");
			}
		},
		setSort,
		setDir,
		setPage: async () => {},
		setTab,
		setFilter: (id, values) => setFilters((f) => ({ ...f, [id]: values })),
	};
}

/* ——— Cột ——— */

function gopVaoChu(don: Don, mt: MucTieuMau): string {
	if (mt.gopVao.length > 0) {
		return `Góp vào ${mt.gopVao
			.map((g) => `${g.donVi} › ${g.kr ?? g.mucTieu}`)
			.join(" · ")}`;
	}
	return chuaGop(don.laCongTy, mt)
		? "Chưa góp vào đâu"
		: "Mục tiêu cấp công ty";
}

type ChiTiet = { loai: "Mục tiêu" | "KR"; ten: string; kr: KrMau[] };

function cotMucTieu(
	don: Don,
	hoi2: boolean,
	mo: (c: ChiTiet) => void,
): DataTableColumn<MucTieuMau>[] {
	const cot: DataTableColumn<MucTieuMau>[] = [
		{
			id: "ten",
			header: "Mục tiêu",
			hideable: false,
			cell: (mt) => {
				const cham = soKrCham(mt);
				return (
					<span
						className="flex min-w-0 flex-col gap-1 whitespace-normal"
						data-muc-tieu={mt.id}
					>
						<span className="flex flex-wrap items-center gap-x-2 gap-y-1">
							{hoi2 ? (
								<span className="font-medium" translate="no">
									{mt.ten}
								</span>
							) : (
								<button
									className="min-w-0 cursor-pointer text-left font-medium underline-offset-4 hover:underline"
									data-ten-muc-tieu
									onClick={(e) => {
										e.stopPropagation();
										mo({ loai: "Mục tiêu", ten: mt.ten, kr: mt.kr });
									}}
									translate="no"
									type="button"
								>
									{mt.ten}
								</button>
							)}
							<LoaiMucTieuNhan loai={mt.loai} />
							{NHAP.has(mt.id) ? (
								<StatusIndicator label="Nháp" size="sm" tone="neutral" />
							) : null}
						</span>
						<span
							className="truncate text-muted-foreground text-xs"
							translate="no"
						>
							<span className="tabular-nums">{mt.kr.length} KR</span>
							{cham > 0 ? ` · ${cham} KR chậm` : ""} · {gopVaoChu(don, mt)}
						</span>
					</span>
				);
			},
		},
		{
			id: "tien-do",
			header: "Tiến độ",
			sortable: true,
			width: "w-64",
			hideBelow: "md",
			cell: (mt) => {
				const p = tienDoMucTieu(mt);
				return mt.kr.length === 0 ? (
					<span className="text-muted-foreground text-xs">Chưa có KR</span>
				) : (
					<TienDoO giaTriChu={`${p}%`} nhan={mt.ten} p={p} />
				);
			},
		},
		{
			id: "tinh-trang",
			header: "Tình trạng",
			sortable: true,
			width: "w-36",
			cell: (mt) =>
				mt.kr.length === 0 ? (
					<StatusIndicator label="Chưa có kỳ vọng" size="sm" tone="neutral" />
				) : (
					<TinhTrangKr loai={mt.loai} phanTram={tienDoMucTieu(mt)} size="sm" />
				),
		},
		{
			id: "phu-trach",
			header: "Phụ trách",
			width: "w-48",
			hideBelow: "lg",
			cell: (mt) => <TenNguoi ten={mt.phuTrach.ten} />,
		},
	];
	if (!hoi2) return cot;
	return [
		...cot,
		{
			id: "chi-tiet",
			header: <span className="sr-only">Chi tiết</span>,
			label: "Chi tiết",
			hideable: false,
			width: "w-24",
			align: "right",
			cell: (mt) => (
				<Button
					data-nut-chi-tiet
					onClick={(e) => {
						e.stopPropagation();
						mo({ loai: "Mục tiêu", ten: mt.ten, kr: mt.kr });
					}}
					size="sm"
					variant="ghost"
				>
					Chi tiết
				</Button>
			),
		},
	];
}

function oKr(k: KrMau, cot: string, mt: MucTieuMau) {
	const p = tienDo(k);
	switch (cot) {
		case "ten":
			return (
				<span
					className="block whitespace-normal pl-4"
					data-kr={k.id}
					translate="no"
				>
					KR · {k.ten}
				</span>
			);
		case "tien-do":
			return <TienDoO giaTriChu={giaTri(k)} nhan={k.ten} p={p} />;
		case "tinh-trang":
			return (
				<TinhTrangKr
					laMoc={k.kieu === "moc"}
					loai={mt.loai}
					phanTram={p}
					size="sm"
				/>
			);
		case "phu-trach":
			return <TenNguoi avatar={false} ten={k.phuTrach.ten} />;
		default:
			return null;
	}
}

function sapXep(ds: MucTieuMau[], sort: string, dir: "asc" | "desc") {
	const khoa =
		sort === "tien-do"
			? tienDoMucTieu
			: sort === "tinh-trang"
				? bacTinhTrang
				: null;
	if (!khoa) return ds;
	const dau = dir === "asc" ? 1 : -1;
	return [...ds].sort((a, b) => (khoa(a) - khoa(b)) * dau);
}

/* ——— Chân bảng ——— */

function ChanBang({ don }: { don: Don }) {
	const soKr = don.mucTieu.reduce((t, mt) => t + mt.kr.length, 0);
	const dem = (
		<span className="tabular-nums">
			{don.mucTieu.length} mục tiêu · {soKr} KR
		</span>
	);
	if (don.nguoi) {
		return (
			<span
				className="flex flex-wrap items-center gap-x-4 gap-y-1"
				data-chan-bang-don
			>
				<span translate="no">Phòng ban chính {don.nguoi.phongBan}</span>
				<span translate="no">Quản lý {don.nguoi.quanLy}</span>
				{dem}
			</span>
		);
	}
	const dv = don.dv;
	return (
		<span
			className="flex flex-wrap items-center gap-x-4 gap-y-1"
			data-chan-bang-don
		>
			{dv?.truong ? (
				<span className="flex items-center gap-1.5">
					Trưởng
					<PersonAvatar name={dv.truong.ten} size="sm" />
					<span translate="no">{dv.truong.ten}</span>
				</span>
			) : (
				<StatusIndicator label="Chưa có trưởng" size="sm" tone="warning" />
			)}
			{dem}
			{dv && dv.duong.length > 0 ? (
				<span translate="no">{thuoc(dv)}</span>
			) : null}
		</span>
	);
}

/* ——— Khối dưới bảng ——— */

function DonViCon({ dv }: { dv: DonViPhang }) {
	if (dv.con.length === 0 || dv.loai === "pb") return null;
	return (
		<section className="flex flex-col gap-3" data-don-vi-con>
			<SectionHeading>Đơn vị trực thuộc</SectionHeading>
			<div className="grid gap-2 md:grid-cols-2">
				{dv.con.map((id) => {
					const c = donVi(id);
					return (
						<Item asChild key={id} size="sm" variant="outline">
							<Link href={duongTrang("ST-dvb-danh-sach", maDon(c))}>
								<ItemContent>
									<ItemTitle translate="no">{c.ten}</ItemTitle>
									<ItemDescription>
										{c.tt.mucTieu.length === 0
											? "Chưa đặt OKR"
											: `${c.tt.mucTieu.length} mục tiêu · ${c.tt.soKr} KR`}
										{c.chuaXep ? " · chưa xếp vào bộ phận" : ""}
									</ItemDescription>
								</ItemContent>
								<ItemActions>
									{c.truong ? null : (
										<StatusIndicator
											label="Chưa có trưởng"
											size="sm"
											tone="warning"
										/>
									)}
								</ItemActions>
							</Link>
						</Item>
					);
				})}
			</div>
		</section>
	);
}

function NhomDaBo({ id }: { id: string }) {
	const ds = DA_BO.get(id) ?? [];
	if (ds.length === 0) return null;
	return (
		<section className="flex flex-col gap-3" data-nhom-da-bo>
			<SectionHeading level={4}>Đã bỏ · {ds.length}</SectionHeading>
			{ds.map((ten) => (
				<Item key={ten} size="sm" variant="outline">
					<ItemContent>
						<ItemTitle translate="no">{ten}</ItemTitle>
						<ItemDescription>
							Bỏ ngày 12/11 · không tính vào tiến độ
						</ItemDescription>
					</ItemContent>
				</Item>
			))}
		</section>
	);
}

function KhoiKrNguoi({ ng }: { ng: NguoiPhang }) {
	const ds = krCuaNguoi(ng.nguoi.id);
	return (
		<section className="flex flex-col gap-3" data-khoi-kr-nguoi>
			<SectionHeading>KR {ng.nguoi.ten} phụ trách</SectionHeading>
			<div className="grid gap-2 md:grid-cols-2">
				{ds.map(({ kr, mucTieu }) => (
					<Item key={kr.id} size="sm" variant="outline">
						<ItemContent>
							<ItemTitle translate="no">{kr.ten}</ItemTitle>
							<ItemDescription translate="no">
								{mucTieu.donVi} · {giaTri(kr)}
							</ItemDescription>
						</ItemContent>
						<ItemActions>
							<TinhTrangKr
								laMoc={kr.kieu === "moc"}
								loai={mucTieu.loai}
								phanTram={tienDo(kr)}
								size="sm"
							/>
						</ItemActions>
					</Item>
				))}
			</div>
		</section>
	);
}

function NganChiTiet({
	chiTiet,
	dong,
}: {
	chiTiet: ChiTiet | null;
	dong: () => void;
}) {
	return (
		<Sheet onOpenChange={(o) => (o ? null : dong())} open={chiTiet !== null}>
			<SheetContent>
				<SheetHeader>
					<SheetTitle translate="no">{chiTiet?.ten}</SheetTitle>
					<SheetDescription>
						Ngăn chi tiết {chiTiet?.loai.toLowerCase()} như hôm nay — bản mẫu
						không dựng lại ngăn này.
					</SheetDescription>
				</SheetHeader>
				<SheetBody>
					<div className="flex flex-col gap-2">
						{(chiTiet?.kr ?? []).map((k) => (
							<Item key={k.id} size="sm" variant="outline">
								<ItemContent>
									<ItemTitle translate="no">{k.ten}</ItemTitle>
									<ItemDescription>{giaTri(k)}</ItemDescription>
								</ItemContent>
							</Item>
						))}
					</div>
				</SheetBody>
			</SheetContent>
		</Sheet>
	);
}

/* ——— Danh sách ——— */

function MoKrSan({ ids }: { ids: string[] }) {
	const [, setExpand] = useQueryState("expand", parseAsArrayOf(parseAsString));
	const daDat = useRef(false);
	useEffect(() => {
		if (daDat.current) return;
		daDat.current = true;
		void setExpand(ids);
	}, [ids, setExpand]);
	return null;
}

function DanhSach({ don, canh }: { don: Don; canh: Canh }) {
	const query = useTruyVan(canh.tab ?? "all");
	const [chiTiet, setChiTiet] = useState<ChiTiet | null>(null);
	const ds = don.mucTieu;
	const hoi2 = canh.hoi2 === true;
	const cot = useMemo(() => cotMucTieu(don, hoi2, setChiTiet), [don, hoi2]);

	const loai = query.filters.loai ?? [];
	const phuTrach = query.filters["phu-trach"] ?? [];
	const quaLoc = ds.filter(
		(mt) =>
			(loai.length === 0 || loai.includes(mt.loai)) &&
			(phuTrach.length === 0 || phuTrach.includes(mt.phuTrach.id)),
	);
	const hien = sapXep(
		quaLoc.filter((mt) =>
			query.tab === "can-ban"
				? canBan(mt)
				: query.tab === "chua-gop"
					? chuaGop(don.laCongTy, mt)
					: true,
		),
		query.sort,
		query.dir,
	);
	const dem = {
		loc: {
			"can-ban": quaLoc.filter(canBan).length,
			"chua-gop": quaLoc.filter((mt) => chuaGop(don.laCongTy, mt)).length,
		},
		loai: {
			"cam-ket": ds.filter((mt) => mt.loai === "cam-ket").length,
			"tham-vong": ds.filter((mt) => mt.loai === "tham-vong").length,
		},
	};
	const boLoc = () => query.setTab("all");
	const truong = don.dv?.truong ?? null;

	return (
		<>
			{canh.moKr ? <MoKrSan ids={canh.moKr} /> : null}
			<DataTable
				columns={cot}
				empty={
					<Empty data-don-vi-trong>
						<EmptyHeader>
							<EmptyTitle translate="no">
								{don.ten} chưa đặt OKR cho Quý 4 · 2026
							</EmptyTitle>
							<EmptyDescription>
								{don.nguoi || truong
									? "Trưởng đơn vị thêm từng mục tiêu bằng nút «Thêm mục tiêu» ở đầu trang, hoặc nhập cả bộ từ bảng tính."
									: "Đơn vị này chưa có trưởng. Gán trưởng ở Cài đặt › Tổ chức để đơn vị tự đặt OKR của mình."}
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				}
				expandable={{
					isExpandable: (mt) => mt.kr.length > 0,
					getSubRows: (mt) => mt.kr,
					getSubRowId: (k) => k.id,
					renderSubCell: (k, c, mt) => oKr(k, c, mt),
					onSubRowClick: (k) => setChiTiet({ loai: "KR", ten: k.ten, kr: [k] }),
				}}
				facetCounts={dem}
				facets={FACETS}
				filteredEmpty={
					<Empty data-khong-khop>
						<EmptyHeader>
							<EmptyTitle>Không có mục tiêu nào khớp</EmptyTitle>
							<EmptyDescription>
								0 trên {ds.length} mục tiêu khớp ô lọc nhanh.
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							<Button onClick={boLoc} size="sm" variant="outline">
								Bỏ lọc
							</Button>
						</EmptyContent>
					</Empty>
				}
				getRowId={(mt) => mt.id}
				layout="content"
				meta={<ChanBang don={don} />}
				onClearFilters={boLoc}
				query={query}
				rows={hien}
				search={
					<HangCongCuDonVi
						cachXem="danh-sach"
						ma={don.ma}
						moChon={canh.moChon}
					/>
				}
				tabs={TAB_LOC}
				total={hien.length}
			/>
			<NganChiTiet chiTiet={chiTiet} dong={() => setChiTiet(null)} />
		</>
	);
}

/* ——— Đang tải, lỗi ——— */

const DONG_KHUNG = ["mot", "hai", "ba", "bon", "nam"] as const;

function DangTai() {
	return (
		<div
			aria-busy="true"
			aria-live="polite"
			className="flex flex-col gap-3"
			data-dang-tai
		>
			<span className="sr-only">Đang tải OKR…</span>
			<HangCongCuKhungXuong />
			<div className="flex flex-col gap-1 overflow-hidden rounded-lg border bg-card">
				<Skeleton
					className="h-11 w-full rounded-none"
					data-khung-hang="dau-bang"
				/>
				{DONG_KHUNG.map((k) => (
					<div
						className="flex items-center gap-4 px-4 py-3"
						data-khung-hang="hang"
						key={k}
					>
						<div className="flex min-w-0 flex-1 flex-col gap-2">
							<Skeleton className="h-4 w-2/3" />
							<Skeleton className="h-3 w-1/2" />
						</div>
						<Skeleton className="hidden h-3 w-56 md:block" />
						<Skeleton className="h-4 w-24" />
					</div>
				))}
			</div>
		</div>
	);
}

/* ——— Trang ——— */

function ThanTrang({
	state,
	canh,
	don,
}: {
	state: string;
	canh: Canh;
	don: Don;
}) {
	const router = useRouter();
	if (canh.kieu === "dang-tai") return <DangTai />;
	if (canh.kieu === "loi")
		return (
			<div className="flex flex-col gap-3">
				<KhungHangCongCu>
					<HangCongCuDonVi cachXem="danh-sach" ma={don.ma} />
				</KhungHangCongCu>
				<VungTaiLoi
					moTa="Máy chủ không trả lời. Thử lại, hoặc chọn đơn vị khác."
					onThuLai={() => router.replace(duongTrang("ST-dvb-dang-tai", don.ma))}
					tieuDe="Không tải được OKR"
				/>
			</div>
		);
	if (canh.xem !== "danh-sach") {
		/* DataTable của Họp tuần luôn vẽ khung hàng công cụ (rỗng) kèm gap-3 của
		   nó, nên khung ngoài không thêm khoảng nữa: đỉnh bảng trùng Danh sách. */
		return (
			<div
				className={
					canh.xem === "hop-tuan" ? "flex flex-col" : "flex flex-col gap-3"
				}
				data-cach-xem={canh.xem}
			>
				<KhungHangCongCu>
					<HangCongCuDonVi cachXem={canh.xem} ma={don.ma} />
				</KhungHangCongCu>
				{canh.xem === "hop-tuan" ? (
					<HopTuan donId={don.id} />
				) : canh.xem === "cham" ? (
					<ChamDiem donId={don.id} />
				) : (
					<CayCanChinh donId={don.id} />
				)}
			</div>
		);
	}
	return (
		<div className="flex flex-col gap-6" data-trang-don-vi={state}>
			<DanhSach canh={canh} don={don} />
			{don.nguoi ? <KhoiKrNguoi ng={don.nguoi} /> : null}
			<NhomDaBo id={don.id} />
			{don.dv ? <DonViCon dv={don.dv} /> : null}
			{canh.ghim ? (
				<p className="text-muted-foreground text-xs" data-ghim-hoi>
					{canh.ghim}
				</p>
			) : null}
		</div>
	);
}

function NoiDung({ state }: { state: string }) {
	const tham = useSearchParams();
	const canh: Canh =
		state in CANH ? CANH[state as keyof typeof CANH] : CANH["ST-dvb-danh-sach"];
	const tuDuong = tham.get("donOkr");
	const don =
		(tuDuong ? giaiDon(tuDuong) : null) ?? giaiDon(canh.don) ?? giaiDon("cty");
	if (!don) return null;
	return (
		<TrangMucTieu
			d={{
				tab: "theo-don-vi",
				donVi: don.dv?.id ?? null,
				tenDonVi: don.ten,
				duoc: true,
				lyDo: null,
				phaLapKeHoach: true,
				soanKhoa: null,
				cachSoan: "nut-vien",
				nguoi: "Võ Phương Thảo",
			}}
			key={`${state}-${don.ma}`}
		>
			<ThanTrang canh={canh} don={don} state={state} />
		</TrangMucTieu>
	);
}

export function TrangDonViMotBangMau({ state }: { state: string }) {
	return (
		<Suspense fallback={<DangTai />}>
			<NoiDung state={state} />
		</Suspense>
	);
}
