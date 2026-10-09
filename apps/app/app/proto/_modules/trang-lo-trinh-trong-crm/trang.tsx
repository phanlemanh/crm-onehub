"use client";

import Search from "@carbon/icons-react/es/Search";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Board, type BoardColumn } from "@crm/ui/components/board";
import { Button } from "@crm/ui/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import {
	DataTable,
	type DataTableColumn,
	type DataTableFacet,
	DataTableFacetMenu,
} from "@crm/ui/components/data-table";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@crm/ui/components/input-group";
import {
	Item,
	ItemContent,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { SectionHeading } from "@crm/ui/components/section-heading";
import {
	Sheet,
	SheetBody,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import { SimpleTable, SimpleTableRow } from "@crm/ui/components/simple-table";
import { Skeleton } from "@crm/ui/components/skeleton";
import {
	StatusIndicator,
	type StatusTone,
} from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import type { TableQueryState } from "@crm/ui/lib/table-query";
import { type ComponentProps, type ReactNode, useMemo, useState } from "react";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import type {
	DauVao,
	DuLieu,
	Hang,
	LoTrinh,
	Moc,
	NhomTrangThai,
} from "./du-lieu";

const TONE = {
	"da-giao": "success",
	"dang-lam": "info",
	"chua-bat-dau": "neutral",
	khac: "neutral",
} as const satisfies Record<NhomTrangThai, StatusTone>;

const NHAN_NHOM = {
	"chua-bat-dau": "Chưa bắt đầu",
	"dang-lam": "Đang làm",
	"da-giao": "Đã giao",
	khac: "Khác",
} as const satisfies Record<NhomTrangThai, string>;

const THU_TU_TRANG_THAI = [
	"chua-bat-dau",
	"dang-lam",
	"da-giao",
	"khac",
] as const;
const TAB_VONG_DOI = [
	{ value: "chua-xong", label: "Chưa xong" },
	{ value: "da-giao", label: "Đã giao" },
	{ value: "khac", label: "Xếp lại sau" },
];

function thuocTab(v: Hang, tab: string) {
	if (tab === "chua-xong")
		return (
			v.nhom_trang_thai === "chua-bat-dau" || v.nhom_trang_thai === "dang-lam"
		);
	if (tab === "da-giao" || tab === "khac") return v.nhom_trang_thai === tab;
	return true;
}

const CHU_TRUNG_NHOM = new Set(["Chưa mở", "Đã giao", "Đang làm"]);
const CO_TRANG = 25;
const TRAN_THE_COT = 8;
const KHONG_NHOM = "__khong-nhom";
const KHONG_MOC = "__khong-moc";
const TRE = "__tre";

export type CachXem = "bang" | "bang-cot";
export type ChiaCot = "trang-thai" | "nhom" | "moc" | "lo-trinh";

export type BanDau = {
	xem: CachXem;
	chia: ChiaCot;
	tab: string;
	loc: Record<string, string[]>;
	chon: string | null;
	daBac: boolean;
};

export const BAN_DAU_MAC_DINH: BanDau = {
	xem: "bang",
	chia: "trang-thai",
	tab: "chua-xong",
	loc: {},
	chon: null,
	daBac: false,
};

type Viec = Hang & {
	loTep: string;
	loTen: string;
	moc: Moc | undefined;
	tre: boolean;
	khoa: string;
};

function viecTre(loTrinh: LoTrinh, homNay: string) {
	const theoMa = new Map(loTrinh.hang.map((h) => [h.ma, h]));
	const ra: string[] = [];
	for (const m of loTrinh.moc) {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(m.ngay) || !(m.ngay < homNay)) continue;
		for (const ma of m.hang) {
			const h = theoMa.get(ma);
			if (h && h.nhom_trang_thai !== "da-giao" && !ra.includes(ma)) ra.push(ma);
		}
	}
	return ra;
}

const dinhNgay = new Intl.DateTimeFormat("vi-VN", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
});

function ngayDep(ngay: string) {
	const [y, m, d] = ngay.split("-").map(Number);
	if (!y || !m || !d) return ngay;
	return dinhNgay.format(new Date(y, m - 1, d));
}

function phangViec(duLieu: DuLieu, homNay: string | null): Viec[] {
	return duLieu.lo_trinh.flatMap((lo) => {
		const theoMoc = new Map<string, Moc>();
		for (const m of lo.moc)
			for (const ma of m.hang) if (!theoMoc.has(ma)) theoMoc.set(ma, m);
		const tre = new Set(homNay === null ? [] : viecTre(lo, homNay));
		return lo.hang.map((h) => ({
			...h,
			loTep: lo.tep,
			loTen: lo.ten ?? lo.tep,
			moc: theoMoc.get(h.ma),
			tre: tre.has(h.ma),
			khoa: `${lo.tep}#${h.ma}`,
		}));
	});
}

function khoaMoc(v: Viec) {
	return v.moc ? `${v.loTep}@${v.moc.ngay}@${v.moc.ten}` : KHONG_MOC;
}

function hopLoc(v: Viec, loc: Record<string, string[]>, boQua?: string) {
	const co = (id: string, gt: string) =>
		id === boQua || !loc[id]?.length || loc[id].includes(gt);
	const mocOk =
		boQua === "moc" ||
		!loc.moc?.length ||
		loc.moc.includes(khoaMoc(v)) ||
		(loc.moc.includes(TRE) && v.tre);
	return co("loTrinh", v.loTep) && co("nhom", v.nhom || KHONG_NHOM) && mocOk;
}

function useTruyVan(banDau: BanDau): TableQueryState {
	const [tab, setTab] = useState(banDau.tab);
	const [filters, setFilters] = useState(banDau.loc);
	const [sort, setSort] = useState("moc");
	const [dir, setDir] = useState<"asc" | "desc">("asc");
	const [page, setPageState] = useState(1);
	return {
		sort,
		dir,
		page,
		pageSize: CO_TRANG,
		tab,
		tabId: "trangThai",
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
		setPage: async (p) => setPageState(p),
		setTab: (v) => {
			setTab(v);
			setPageState(1);
		},
		setFilter: (id, values) => {
			setFilters((f) => ({ ...f, [id]: values }));
			setPageState(1);
		},
	};
}

function ChiTietDoi({ chu }: { chu: string }) {
	return (
		<Collapsible data-lo-trinh-chi-tiet>
			<CollapsibleTrigger asChild>
				<Button size="sm" variant="ghost">
					Chi tiết cho đội sản phẩm
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<p className="px-3 py-2 text-muted-foreground text-xs" translate="no">
					{chu}
				</p>
			</CollapsibleContent>
		</Collapsible>
	);
}

function KhungTrong({
	ca,
	tieuDe,
	moTa,
	cauMay,
}: {
	ca: string;
	tieuDe: string;
	moTa: string;
	cauMay?: string;
}) {
	return (
		<Empty data-lo-trinh-trang={ca}>
			<EmptyHeader>
				<EmptyTitle>{tieuDe}</EmptyTitle>
				<EmptyDescription>{moTa}</EmptyDescription>
			</EmptyHeader>
			{cauMay ? (
				<EmptyContent>
					<ChiTietDoi chu={cauMay} />
				</EmptyContent>
			) : null}
		</Empty>
	);
}

function ChamTrangThai({ v }: { v: Hang }) {
	return (
		<StatusIndicator
			label={NHAN_NHOM[v.nhom_trang_thai]}
			size="sm"
			tone={TONE[v.nhom_trang_thai]}
		/>
	);
}

function TrangThai({ v }: { v: Hang }) {
	return (
		<span className="flex flex-col gap-0.5">
			<ChamTrangThai v={v} />
			{v.trang_thai !== NHAN_NHOM[v.nhom_trang_thai] &&
			!CHU_TRUNG_NHOM.has(v.trang_thai) ? (
				<span className="text-muted-foreground text-xs" translate="no">
					{v.trang_thai}
				</span>
			) : null}
		</span>
	);
}

function OMoc({ v }: { v: Viec }) {
	if (!v.moc) return <EmptyCellValue />;
	return (
		<span
			className="inline-flex items-center gap-2"
			data-lo-trinh-moc-viec={v.moc.ngay}
		>
			{ngayDep(v.moc.ngay)}
			{v.tre ? <Badge variant="outline">Trễ</Badge> : null}
		</span>
	);
}

function cotBang(): DataTableColumn<Viec>[] {
	return [
		{
			id: "viec",
			header: "Việc",
			cell: (v) => (
				<span className="flex min-w-0 flex-col gap-0.5 whitespace-normal">
					<span className="font-medium" translate="no">
						{v.cau_giao}
					</span>
					<span className="text-muted-foreground text-xs" translate="no">
						{v.ma}
						{v.nhom ? ` · ${v.nhom}` : ""}
						{v.co.length ? ` · ${v.co.length} chỗ lệch kế hoạch` : ""}
					</span>
					<span className="sm:hidden">
						<ChamTrangThai v={v} />
					</span>
				</span>
			),
		},
		{
			id: "loTrinh",
			header: "Lộ trình",
			cell: (v) => <span translate="no">{v.loTen}</span>,
			hideBelow: "md",
			width: "w-[14%]",
		},
		{
			id: "trangThai",
			header: "Trạng thái",
			cell: (v) => <TrangThai v={v} />,
			sortable: true,
			hideBelow: "sm",
			width: "w-[22%]",
		},
		{
			id: "moc",
			header: "Mốc",
			cell: (v) => <OMoc v={v} />,
			sortable: true,
			align: "right",
			width: "w-[16%]",
			cellClassName: "text-muted-foreground tabular-nums",
		},
	];
}

function TimViec({ q, doiQ }: { q: string; doiQ: (q: string) => void }) {
	return (
		<InputGroup className="w-full sm:w-64">
			<InputGroupAddon>
				<Search />
			</InputGroupAddon>
			<InputGroupInput
				autoComplete="off"
				onChange={(e) => doiQ(e.target.value)}
				placeholder="Tìm việc theo câu mô tả hoặc mã…"
				value={q}
			/>
		</InputGroup>
	);
}

function NutCachXem({
	xem,
	doiXem,
}: {
	xem: CachXem;
	doiXem: (x: CachXem) => void;
}) {
	return (
		<ToggleGroup
			aria-label="Cách xem"
			onValueChange={(v) => {
				if (v === "bang" || v === "bang-cot") doiXem(v);
			}}
			size="sm"
			spacing={0}
			type="single"
			value={xem}
			variant="outline"
		>
			<ToggleGroupItem value="bang">Bảng</ToggleGroupItem>
			<ToggleGroupItem value="bang-cot">Bảng cột</ToggleGroupItem>
		</ToggleGroup>
	);
}

const CACH_CHIA: { v: ChiaCot; nhan: string }[] = [
	{ v: "trang-thai", nhan: "Trạng thái" },
	{ v: "nhom", nhan: "Nhóm" },
	{ v: "moc", nhan: "Mốc" },
	{ v: "lo-trinh", nhan: "Lộ trình" },
];

function NutChiaCot({
	chia,
	doiChia,
}: {
	chia: ChiaCot;
	doiChia: (c: ChiaCot) => void;
}) {
	return (
		<ToggleGroup
			aria-label="Chia cột theo"
			className="flex-wrap"
			onValueChange={(v) => {
				const c = CACH_CHIA.find((m) => m.v === v);
				if (c) doiChia(c.v);
			}}
			size="sm"
			spacing={0}
			type="single"
			value={chia}
			variant="outline"
		>
			{CACH_CHIA.map((m) => (
				<ToggleGroupItem key={m.v} value={m.v}>
					{m.nhan}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}

function cotBangCot(viec: Viec[], chia: ChiaCot): BoardColumn[] {
	const the = (v: Viec) => ({
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
	});
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
				NHAN_NHOM[v.nhom_trang_thai],
				String(THU_TU_TRANG_THAI.indexOf(v.nhom_trang_thai)),
				v,
			);
		else if (chia === "nhom")
			them(v.nhom || KHONG_NHOM, v.nhom || "Không nhóm", v.nhom || "~", v);
		else if (chia === "lo-trinh") them(v.loTep, v.loTen, v.loTep, v);
		else if (v.moc)
			them(khoaMoc(v), `${ngayDep(v.moc.ngay)} · ${v.moc.ten}`, v.moc.ngay, v);
		else them(KHONG_MOC, "Chưa hẹn mốc", "9999", v);
	}
	return [...nhom.entries()]
		.sort((a, b) => a[1].thuTu.localeCompare(b[1].thuTu))
		.map(([id, g]) => ({
			id,
			label: g.label,
			userLabel: chia !== "trang-thai",
			count: g.ds.length,
			cards: g.ds.slice(0, TRAN_THE_COT).map(the),
		}));
}

function DongLienQuan({ x, moViec }: { x: Viec; moViec: (k: string) => void }) {
	return (
		<Item asChild size="xs" variant="outline">
			<button
				className="text-start"
				onClick={() => moViec(x.khoa)}
				type="button"
			>
				<ItemContent>
					<ItemTitle className="font-normal" translate="no">
						{x.cau_giao}
					</ItemTitle>
				</ItemContent>
				<ChamTrangThai v={x} />
			</button>
		</Item>
	);
}

function ChiTietViec({
	viec,
	khoa,
	moViec,
	dong,
}: {
	viec: Viec[];
	khoa: string | null;
	moViec: (k: string) => void;
	dong: () => void;
}) {
	const v = viec.find((x) => x.khoa === khoa);
	const cungLo = v ? viec.filter((x) => x.loTep === v.loTep) : [];
	const theoMa = new Map(cungLo.map((x) => [x.ma, x]));
	const choViecNay = v ? cungLo.filter((x) => x.dung_tren.includes(v.ma)) : [];
	const o: { nhan: string; gt: ReactNode }[] = v
		? [
				{ nhan: "Trạng thái", gt: <TrangThai v={v} /> },
				{
					nhan: "Mốc",
					gt: v.moc ? (
						<span className="flex flex-col gap-0.5">
							<OMoc v={v} />
							<span className="text-muted-foreground text-xs" translate="no">
								{v.moc.ten}
							</span>
						</span>
					) : (
						<span className="text-muted-foreground">Chưa hẹn mốc</span>
					),
				},
				{ nhan: "Lộ trình", gt: <span translate="no">{v.loTen}</span> },
				{
					nhan: "Nhóm",
					gt: <span translate="no">{v.nhom || "Không nhóm"}</span>,
				},
			]
		: [];
	return (
		<Sheet onOpenChange={(mo) => (mo ? null : dong())} open={v !== undefined}>
			<SheetContent data-lo-trinh-chi-tiet-viec={v?.ma} size="lg">
				{v ? (
					<>
						<SheetHeader>
							<SheetTitle translate="no">{v.cau_giao}</SheetTitle>
							<SheetDescription translate="no">
								{v.ma} · {v.loTen}
								{v.nhom ? ` · ${v.nhom}` : ""}
							</SheetDescription>
						</SheetHeader>
						<SheetBody className="flex flex-col gap-6 text-sm">
							<dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-4">
								{o.map((x) => (
									<div className="flex flex-col gap-1 bg-card p-3" key={x.nhan}>
										<dt className="text-muted-foreground text-xs">{x.nhan}</dt>
										<dd>{x.gt}</dd>
									</div>
								))}
							</dl>
							{v.theo_loi ? (
								<Alert>
									<AlertDescription>
										Trạng thái này lấy từ ghi chú của kế hoạch, chưa có hồ sơ
										làm việc xác nhận.
									</AlertDescription>
								</Alert>
							) : null}
							{v.co.length ? (
								<Alert variant="warning">
									<AlertTitle>Kế hoạch và thực tế đang lệch</AlertTitle>
									<AlertDescription translate="no">
										{v.co.join(" · ")}
									</AlertDescription>
								</Alert>
							) : null}
							{v.bat_khi || v.vi_sao ? (
								<div className="flex flex-col gap-3">
									<SectionHeading level={4}>Chi tiết</SectionHeading>
									<dl className="grid grid-cols-[10rem_1fr] gap-x-4 gap-y-2">
										{v.bat_khi ? (
											<>
												<dt className="text-muted-foreground">
													Coi là thành công khi
												</dt>
												<dd translate="no">{v.bat_khi}</dd>
											</>
										) : null}
										{v.vi_sao ? (
											<>
												<dt className="text-muted-foreground">Vì sao</dt>
												<dd translate="no">{v.vi_sao}</dd>
											</>
										) : null}
									</dl>
								</div>
							) : null}
							{v.dung_tren.length ? (
								<div className="flex flex-col gap-2">
									<SectionHeading level={4}>Cần xong trước</SectionHeading>
									<ItemGroup className="gap-1">
										{v.dung_tren
											.map((m) => theoMa.get(m))
											.filter((x): x is Viec => x !== undefined)
											.map((x) => (
												<DongLienQuan key={x.khoa} moViec={moViec} x={x} />
											))}
									</ItemGroup>
								</div>
							) : null}
							{choViecNay.length ? (
								<div className="flex flex-col gap-2">
									<SectionHeading level={4}>
										Việc đang chờ việc này
									</SectionHeading>
									<ItemGroup className="gap-1">
										{choViecNay.map((x) => (
											<DongLienQuan key={x.khoa} moViec={moViec} x={x} />
										))}
									</ItemGroup>
								</div>
							) : null}
						</SheetBody>
					</>
				) : null}
			</SheetContent>
		</Sheet>
	);
}

function BangDaBac({ duLieu }: { duLieu: DuLieu }) {
	const dong = duLieu.lo_trinh.flatMap((lo) =>
		lo.da_bac.map((b) => ({ ...b, loTen: lo.ten ?? lo.tep })),
	);
	if (!dong.length)
		return (
			<KhungTrong
				ca="khong-da-bac"
				moTa="Kế hoạch chưa ghi việc nào bị bác."
				tieuDe="Chưa có việc đã bác"
			/>
		);
	return (
		<SimpleTable
			columns={[
				{ id: "viec", header: "Việc đã bác" },
				{ id: "lo", header: "Lộ trình", width: "10rem" },
			]}
			surface="page"
		>
			{dong.map((b) => (
				<SimpleTableRow data-lo-trinh-da-bac={b.ma} key={`${b.loTen}-${b.ma}`}>
					<TableCell className="whitespace-normal" translate="no">
						<span className="flex flex-col gap-0.5">
							<span className="font-medium">{b.ly_do}</span>
							<span className="text-muted-foreground text-xs">{b.ma}</span>
						</span>
					</TableCell>
					<TableCell translate="no">{b.loTen}</TableCell>
				</SimpleTableRow>
			))}
		</SimpleTable>
	);
}

function DanhSach({
	duLieu,
	canhBao,
	homNay,
	banDau,
}: {
	duLieu: DuLieu;
	canhBao: string[];
	homNay: string | null;
	banDau: BanDau;
}) {
	const query = useTruyVan(banDau);
	const [q, doiQ] = useState("");
	const [xem, doiXem] = useState<CachXem>(banDau.xem);
	const [chia, doiChia] = useState<ChiaCot>(banDau.chia);
	const [chon, doiChon] = useState<string | null>(banDau.chon);
	const [daBac, doiDaBac] = useState(banDau.daBac);
	const viec = useMemo(() => phangViec(duLieu, homNay), [duLieu, homNay]);
	const loLoi = duLieu.lo_trinh.filter((l) => l.loi);
	const tim = q.trim().toLowerCase();
	const hopTim = (v: Viec) =>
		!tim ||
		v.cau_giao.toLowerCase().includes(tim) ||
		v.ma.toLowerCase().includes(tim);
	const quaLoc = viec.filter((v) => hopTim(v) && hopLoc(v, query.filters));
	const quaTab = quaLoc.filter((v) => thuocTab(v, query.tab));
	const thuTu = [...quaTab].sort((a, b) => {
		const k =
			query.sort === "trangThai"
				? THU_TU_TRANG_THAI.indexOf(a.nhom_trang_thai) -
					THU_TU_TRANG_THAI.indexOf(b.nhom_trang_thai)
				: (a.moc?.ngay ?? "9999").localeCompare(b.moc?.ngay ?? "9999");
		return query.dir === "asc" ? k : -k;
	});
	const trang = thuTu.slice((query.page - 1) * CO_TRANG, query.page * CO_TRANG);
	const demTab = Object.fromEntries(
		["all", ...TAB_VONG_DOI.map((t) => t.value)].map((t) => [
			t,
			quaLoc.filter((v) => thuocTab(v, t)).length,
		]),
	);
	const demLoc = (id: string, ra: (v: Viec) => string[]) => {
		const d: Record<string, number> = {};
		for (const v of viec.filter(
			(x) => hopTim(x) && hopLoc(x, query.filters, id),
		))
			for (const k of ra(v)) d[k] = (d[k] ?? 0) + 1;
		return d;
	};
	const facetCounts = {
		trangThai: demTab,
		loTrinh: demLoc("loTrinh", (v) => [v.loTep]),
		nhom: demLoc("nhom", (v) => [v.nhom || KHONG_NHOM]),
		moc: demLoc("moc", (v) => [khoaMoc(v), ...(v.tre ? [TRE] : [])]),
	};
	const tenNhom = [...new Set(viec.map((v) => v.nhom))].filter(Boolean);
	const mocCoViec = duLieu.lo_trinh.flatMap((lo) =>
		lo.moc
			.filter((m) => m.hang.length)
			.map((m) => ({
				value: `${lo.tep}@${m.ngay}@${m.ten}`,
				label: `${ngayDep(m.ngay)} · ${m.ten}`,
			})),
	);
	const facets: DataTableFacet[] = [
		{
			id: "loTrinh",
			label: "Lộ trình",
			options: duLieu.lo_trinh.map((l) => ({
				value: l.tep,
				label: l.ten ?? l.tep,
			})),
		},
		{
			id: "nhom",
			label: "Nhóm",
			options: [
				...tenNhom.map((n) => ({ value: n, label: n })),
				{ value: KHONG_NHOM, label: "Không nhóm" },
			],
		},
		{
			id: "moc",
			label: "Mốc",
			searchable: true,
			options: [
				{ value: TRE, label: "Trễ mốc" },
				...mocCoViec,
				{ value: KHONG_MOC, label: "Chưa hẹn mốc" },
			],
		},
	];
	const daGiao = quaLoc.filter((v) => v.nhom_trang_thai === "da-giao").length;
	const soTre = quaLoc.filter((v) => v.tre).length;
	const meta = (
		<span>
			{thuTu.length} việc · {daGiao}/{quaLoc.length} đã giao trong phạm vi lọc
			{soTre ? ` · ${soTre} trễ mốc` : ""}
		</span>
	);
	const nutDaBac = (
		<Button
			className="justify-start sm:justify-center"
			data-lo-trinh-nut-da-bac
			onClick={() => doiDaBac(!daBac)}
			size="sm"
			variant={daBac ? "contrast" : "outline"}
		>
			Đã bác
		</Button>
	);
	const NutThe = useMemo(
		() =>
			function NutThe({ href, children, className }: ComponentProps<"a">) {
				return (
					<button
						className={`${className ?? ""} text-start`}
						onClick={() => doiChon(String(href).slice(1))}
						type="button"
					>
						{children}
					</button>
				);
			},
		[],
	);
	return (
		<div className="flex min-w-0 flex-col gap-4">
			{canhBao.length ? (
				<Alert data-lo-trinh-canh-bao variant="warning">
					<AlertTitle>Trang có thể thiếu một phần</AlertTitle>
					<AlertDescription>
						Dữ liệu lộ trình mới hơn trang này; phần trang hiểu được vẫn đúng.
					</AlertDescription>
					<ChiTietDoi chu={canhBao.join(" · ")} />
				</Alert>
			) : null}
			{loLoi.map((l) => (
				<Alert data-lo-trinh-trang="lo-loi" key={l.tep} variant="destructive">
					<AlertTitle>
						Không tải được lộ trình <span translate="no">{l.ten ?? l.tep}</span>
					</AlertTitle>
					<AlertDescription>
						Các lộ trình khác vẫn hiện bên dưới. Hãy báo đội sản phẩm.
					</AlertDescription>
					<ChiTietDoi chu={l.loi ?? ""} />
				</Alert>
			))}
			{daBac ? (
				<div className="flex flex-col gap-3">
					<div className="flex flex-wrap items-center justify-between gap-2">
						<span className="text-muted-foreground text-sm">
							Việc kế hoạch đã cân nhắc và quyết không làm, kèm lý do.
						</span>
						{nutDaBac}
					</div>
					<BangDaBac duLieu={duLieu} />
				</div>
			) : xem === "bang-cot" ? (
				<div className="flex min-w-0 flex-col gap-3">
					<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
						<TimViec doiQ={doiQ} q={q} />
						<DataTableFacetMenu
							counts={facetCounts}
							facets={facets}
							filters={query.filters}
							onFilterChange={query.setFilter}
						/>
						<NutChiaCot chia={chia} doiChia={doiChia} />
						<div className="flex gap-2 sm:ml-auto">
							<NutCachXem doiXem={doiXem} xem={xem} />
							{nutDaBac}
						</div>
					</div>
					<Board
						columns={cotBangCot(quaLoc, chia)}
						label="Việc theo cột"
						linkComponent={NutThe}
					/>
					<span className="text-muted-foreground text-sm">{meta}</span>
				</div>
			) : (
				<DataTable
					actions={nutDaBac}
					columns={cotBang()}
					facetCounts={facetCounts}
					facets={facets}
					getRowId={(v) => v.khoa}
					leadingActions={<NutCachXem doiXem={doiXem} xem={xem} />}
					meta={meta}
					onClearFilters={() => {
						doiQ("");
						query.setTab("all");
						for (const f of facets) query.setFilter(f.id, []);
					}}
					onRowClick={(v) => doiChon(v.khoa)}
					query={query}
					rows={trang}
					search={<TimViec doiQ={doiQ} q={q} />}
					searchActive={tim !== ""}
					tabs={{
						id: "trangThai",
						allLabel: "Tất cả",
						options: TAB_VONG_DOI,
					}}
					total={thuTu.length}
				/>
			)}
			<ChiTietViec
				dong={() => doiChon(null)}
				khoa={chon}
				moViec={doiChon}
				viec={viec}
			/>
		</div>
	);
}

function NoiDung({
	dauVao,
	homNay,
	banDau,
}: {
	dauVao: DauVao;
	homNay: string | null;
	banDau: BanDau;
}) {
	if (dauVao.kieu === "dang-tai")
		return (
			<div className="flex flex-col gap-3" data-lo-trinh-trang="dang-tai">
				<div className="flex gap-2">
					<Skeleton className="h-8 w-64" />
					<Skeleton className="h-8 w-40" />
					<Skeleton className="h-8 w-32" />
				</div>
				<Skeleton className="h-96 w-full" />
			</div>
		);
	if (dauVao.kieu === "tep-vang")
		return (
			<KhungTrong
				ca="tep-vang"
				moTa="Bản CRM đang chạy không mang theo lộ trình. Hãy báo đội sản phẩm."
				tieuDe="Không tải được lộ trình"
			/>
		);
	if (dauVao.kieu === "chua-co-khoi")
		return (
			<KhungTrong
				ca="chua-co-khoi"
				cauMay={dauVao.canhBao.join(" · ")}
				moTa="Lộ trình chưa được xuất cho trang này. Đội sản phẩm sẽ bật khi cập nhật công cụ."
				tieuDe="Chưa có lộ trình ở đây"
			/>
		);
	if (dauVao.kieu === "khoi-hong")
		return (
			<KhungTrong
				ca="khoi-hong"
				cauMay={dauVao.canhBao.join(" · ")}
				moTa="Dữ liệu lộ trình bị hỏng nên trang không hiện, để khỏi hiện sai. Hãy báo đội sản phẩm."
				tieuDe="Không tải được lộ trình"
			/>
		);
	return (
		<DanhSach
			banDau={banDau}
			canhBao={dauVao.canhBao}
			duLieu={dauVao.duLieu}
			homNay={homNay}
		/>
	);
}

export function TrangLoTrinh({
	dauVao,
	homNay,
	banDau = BAN_DAU_MAC_DINH,
}: {
	dauVao: DauVao;
	homNay: string | null;
	banDau?: BanDau;
}) {
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>Lộ trình</PageShellTitle>
					<PageShellDescription>
						Việc đội sản phẩm đang làm cho CRM, đang ở đâu và hẹn mốc nào. Trang
						chỉ để xem — muốn đổi kế hoạch, hãy báo đội sản phẩm.
					</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<NoiDung banDau={banDau} dauVao={dauVao} homNay={homNay} />
			</PageShellContent>
		</PageShell>
	);
}
