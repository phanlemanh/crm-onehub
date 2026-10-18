"use client";

import Add from "@carbon/icons-react/es/Add";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@crm/ui/components/breadcrumb";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { StatGroup } from "@crm/ui/components/dashboard";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import {
	ConfidenceIndicator,
	PaceIndicator,
} from "@crm/ui/components/okr-status";
import { Progress } from "@crm/ui/components/progress";
import { SectionHeading } from "@crm/ui/components/section-heading";
import {
	SimpleTable,
	SimpleTableCell,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { StatCard } from "@crm/ui/components/stat-card";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import Link from "next/link";
import type { ReactNode } from "react";
import {
	PageShell,
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import type { MucTieuMau } from "../ban-mau-okr/du-lieu";
import { KY } from "../ban-mau-okr/du-lieu";
import {
	DONG_TIN,
	duong,
	giaTri,
	HANG_DON_VI,
	MOI_KR,
	MUC_TIEU_DON_VI,
	nhip,
	phanTram,
	STATE,
	type StateVo,
	TOI,
	tienDoMucTieu,
} from "./du-lieu";
import { SoDoNho } from "./so-do";

function DauTrang({
	tieuDe,
	moTa,
	vet,
	hanhDong,
}: {
	tieuDe: string;
	moTa: string;
	vet?: ReactNode;
	hanhDong?: ReactNode;
}) {
	return (
		<PageShellHeader breadcrumb={vet}>
			<PageShellHeading>
				<PageShellTitle>{tieuDe}</PageShellTitle>
				<PageShellDescription>{moTa}</PageShellDescription>
			</PageShellHeading>
			{hanhDong ? <PageShellActions>{hanhDong}</PageShellActions> : null}
		</PageShellHeader>
	);
}

function NutThemMucTieu() {
	return (
		<Button size="sm">
			<Icon data-icon="inline-start" icon={Add} />
			Thêm mục tiêu
		</Button>
	);
}

const KR_CUA_TOI = MUC_TIEU_DON_VI.flatMap((mt) =>
	mt.kr.map((kr) => ({ kr, mucTieu: mt })),
);

const CAN_CAP_NHAT = KR_CUA_TOI.filter((h) => h.kr.capNhatLuc !== "30/11");

export function ManCuaToi() {
	return (
		<PageShell>
			<DauTrang
				hanhDong={<NutThemMucTieu />}
				moTa="Việc cần cập nhật tuần này, đơn vị bạn dẫn và người trong đơn vị."
				tieuDe="Của tôi"
			/>
			<PageShellContent>
				<StatGroup>
					<StatCard
						description={`${KY.tuan} · kỳ vọng ${KY.kyVong}%`}
						label="KR bạn phụ trách"
						value={String(KR_CUA_TOI.length)}
					/>
					<StatCard
						description={`Hạn ${KY.hanCapNhat}`}
						label="Cần cập nhật tuần này"
						value={String(CAN_CAP_NHAT.length)}
					/>
					<StatCard
						description="Trong đơn vị bạn dẫn"
						label="KR tự tin thấp"
						value={String(
							KR_CUA_TOI.filter((h) => h.kr.tuTin === "thap").length,
						)}
					/>
					<StatCard
						description="Chăm sóc khách hàng"
						label="Đơn vị bạn dẫn"
						value="1"
					/>
				</StatGroup>
				<section className="flex flex-col gap-3">
					<SectionHeading
						actions={
							<Button size="sm">Cập nhật {CAN_CAP_NHAT.length} KR</Button>
						}
						level={2}
					>
						Cần cập nhật tuần này
					</SectionHeading>
					<ItemGroup>
						{CAN_CAP_NHAT.map((h) => (
							<Item key={h.kr.id} size="sm" variant="outline">
								<ItemContent>
									<ItemTitle>
										<Link href={duong(STATE.nganKr)}>{h.kr.ten}</Link>
									</ItemTitle>
									<ItemDescription>
										{h.mucTieu.ten} · lần cuối {h.kr.capNhatLuc ?? "chưa có"}
									</ItemDescription>
								</ItemContent>
								<ItemActions>
									<PaceIndicator pace={nhip(h.kr)} size="sm" />
								</ItemActions>
							</Item>
						))}
					</ItemGroup>
				</section>
				<section className="flex flex-col gap-3">
					<SectionHeading level={2}>Đơn vị bạn dẫn</SectionHeading>
					<Item asChild variant="outline">
						<Link href={duong(STATE.trangDonVi)}>
							<ItemContent>
								<ItemTitle>Chăm sóc khách hàng</ItemTitle>
								<ItemDescription>
									{MUC_TIEU_DON_VI.length} mục tiêu · {KR_CUA_TOI.length} KR ·
									tiến độ{" "}
									{Math.round(
										MUC_TIEU_DON_VI.reduce((s, m) => s + tienDoMucTieu(m), 0) /
											MUC_TIEU_DON_VI.length,
									)}
									%
								</ItemDescription>
							</ItemContent>
						</Link>
					</Item>
				</section>
				<section className="flex flex-col gap-3">
					<SectionHeading level={2}>Người trong đơn vị bạn dẫn</SectionHeading>
					<SimpleTable
						columns={[
							{ id: "nguoi", header: "Người" },
							{ id: "kr", header: "KR phụ trách", align: "right" },
							{ id: "tuan", header: "Tuần này" },
						]}
					>
						{[...new Map(KR_CUA_TOI.map((h) => [h.kr.phuTrach.id, h]))].map(
							([id, h]) => {
								const cua = KR_CUA_TOI.filter((x) => x.kr.phuTrach.id === id);
								const du = cua.every((x) => x.kr.capNhatLuc === "30/11");
								return (
									<SimpleTableRow key={id}>
										<SimpleTableCell>{h.kr.phuTrach.ten}</SimpleTableCell>
										<SimpleTableCell numeric>{cua.length}</SimpleTableCell>
										<SimpleTableCell>
											{du ? "Đã cập nhật đủ" : "Còn thiếu"}
										</SimpleTableCell>
									</SimpleTableRow>
								);
							},
						)}
					</SimpleTable>
				</section>
			</PageShellContent>
		</PageShell>
	);
}

export function ManTatCaDonVi() {
	return (
		<PageShell>
			<DauTrang
				moTa="Mỗi đơn vị một trang OKR trong chu kỳ. Bấm tên để mở."
				tieuDe="Đơn vị"
			/>
			<PageShellContent>
				<SimpleTable
					columns={[
						{ id: "ten", header: "Đơn vị" },
						{ id: "truong", header: "Trưởng" },
						{ id: "mt", header: "Mục tiêu", align: "right" },
						{ id: "td", header: "Tiến độ", width: "w-48" },
						{ id: "thap", header: "KR tự tin thấp", align: "right" },
					]}
				>
					{HANG_DON_VI.map((h) => (
						<SimpleTableRow key={h.id}>
							<SimpleTableCell>
								<span
									className={
										h.sau === 0 ? "font-medium" : h.sau === 1 ? "pl-4" : "pl-8"
									}
								>
									<Link
										className="hover:underline"
										href={duong(STATE.trangDonVi)}
									>
										{h.ten}
									</Link>
								</span>
							</SimpleTableCell>
							<SimpleTableCell>{h.truong ?? "Chưa có trưởng"}</SimpleTableCell>
							<SimpleTableCell numeric>{h.soMucTieu}</SimpleTableCell>
							<SimpleTableCell>
								{h.soMucTieu === 0 ? (
									<span className="text-muted-foreground">Chưa đặt OKR</span>
								) : (
									<Progress expected={KY.kyVong} value={h.tienDo} />
								)}
							</SimpleTableCell>
							<SimpleTableCell numeric>{h.krThap}</SimpleTableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			</PageShellContent>
		</PageShell>
	);
}

export type TheDonVi = "okr" | "hop-tuan" | "viec" | "so-do";

const THE: { gt: TheDonVi; nhan: string; state: StateVo }[] = [
	{ gt: "okr", nhan: "OKR", state: STATE.trangDonVi },
	{ gt: "hop-tuan", nhan: "Họp tuần", state: STATE.hopTuan },
	{ gt: "viec", nhan: "Việc", state: STATE.viec },
	{ gt: "so-do", nhan: "Sơ đồ", state: STATE.soDoDonVi },
];

function BangKr({ mt }: { mt: MucTieuMau }) {
	return (
		<SimpleTable
			columns={[
				{ id: "kr", header: "KR" },
				{ id: "pt", header: "Phụ trách", width: "w-40" },
				{ id: "gt", header: "Hiện tại", align: "right", width: "w-24" },
				{ id: "tt", header: "Tình trạng", width: "w-36" },
				{ id: "hd", srLabel: "Cập nhật", align: "right", width: "w-28" },
			]}
			variant="panel"
		>
			{mt.kr.map((kr) => (
				<SimpleTableRow key={kr.id}>
					<SimpleTableCell>
						<Link className="hover:underline" href={duong(STATE.nganKr)}>
							{kr.ten}
						</Link>
					</SimpleTableCell>
					<SimpleTableCell>{kr.phuTrach.ten}</SimpleTableCell>
					<SimpleTableCell numeric>{giaTri(kr)}</SimpleTableCell>
					<SimpleTableCell>
						<PaceIndicator pace={nhip(kr)} size="sm" />
					</SimpleTableCell>
					<SimpleTableCell align="right">
						<Button asChild size="sm" variant="outline">
							<Link href={duong(STATE.nganKr)}>Cập nhật</Link>
						</Button>
					</SimpleTableCell>
				</SimpleTableRow>
			))}
		</SimpleTable>
	);
}

function TheOkr() {
	const kr = MUC_TIEU_DON_VI.flatMap((m) => m.kr);
	return (
		<div className="flex flex-col gap-6">
			<StatGroup>
				<StatCard description="Hết 31/12" label="Còn lại" value="31 ngày" />
				<StatCard
					description={`Kỳ vọng ${KY.kyVong}% tới hôm nay`}
					label="Tiến độ KR"
					value={`${Math.round(kr.reduce((s, k) => s + phanTram(k), 0) / kr.length)}%`}
				/>
				<StatCard
					description="Hạn hết hôm nay"
					label="Cập nhật tuần này"
					value={`${kr.filter((k) => k.capNhatLuc === "30/11").length}/${kr.length}`}
				/>
				<StatCard
					description="Đáng bàn ở họp tuần"
					label="Tự tin thấp"
					value={String(kr.filter((k) => k.tuTin === "thap").length)}
				/>
			</StatGroup>
			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
				<div className="flex min-w-0 flex-col gap-4">
					{MUC_TIEU_DON_VI.map((mt) => (
						<Card key={mt.id}>
							<CardHeader>
								<CardTitle>
									<Link
										className="hover:underline"
										href={duong(STATE.nganMucTieu)}
									>
										{mt.ten}
									</Link>
								</CardTitle>
								<CardDescription>
									{mt.phuTrach.ten} · tiến độ {tienDoMucTieu(mt)}% · góp vào{" "}
									{mt.gopVao.length} chỗ
								</CardDescription>
							</CardHeader>
							<CardContent>
								<BangKr mt={mt} />
							</CardContent>
						</Card>
					))}
				</div>
				<div className="flex flex-col gap-4">
					<Card>
						<CardHeader>
							<CardTitle>Góp vào</CardTitle>
							<CardDescription>Đơn vị này góp vào đâu.</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col gap-2 text-sm">
							{[
								...new Set(
									MUC_TIEU_DON_VI.flatMap((m) =>
										m.gopVao.map((g) => g.mucTieu),
									),
								),
							].map((t) => (
								<span key={t}>↑ {t}</span>
							))}
							<Link
								className="text-muted-foreground hover:underline"
								href={duong(STATE.soDoDonVi)}
							>
								Xem trên sơ đồ
							</Link>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Hỏi nhanh Kara</CardTitle>
						</CardHeader>
						<CardContent className="flex flex-col gap-1">
							{[
								"KR nào đáng bàn tuần này?",
								"Tóm tắt tuần để gửi cấp trên",
								"Có gì đáng ghi nhận tuần này?",
							].map((c) => (
								<Button
									className="justify-start"
									key={c}
									size="sm"
									variant="ghost"
								>
									{c}
								</Button>
							))}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}

function TheHopTuan() {
	const dangBan = MUC_TIEU_DON_VI.flatMap((m) => m.kr).filter(
		(k) => k.tuTin !== "cao" || k.imNgay >= 14,
	);
	return (
		<section className="flex flex-col gap-3">
			<SectionHeading level={2}>Đáng bàn tuần này</SectionHeading>
			<ItemGroup>
				{dangBan.map((k) => (
					<Item key={k.id} variant="outline">
						<ItemContent>
							<ItemTitle>
								<Link href={duong(STATE.nganKr)}>{k.ten}</Link>
							</ItemTitle>
							<ItemDescription>
								{k.imNgay >= 14 ? `Im ${k.imNgay} ngày` : "Tự tin tụt"} ·{" "}
								{k.ghiChu ?? "Chưa có ghi chú"}
							</ItemDescription>
						</ItemContent>
						<ItemActions>
							<ConfidenceIndicator level={k.tuTin} size="sm" />
						</ItemActions>
					</Item>
				))}
			</ItemGroup>
		</section>
	);
}

function TheViec() {
	return (
		<section className="flex flex-col gap-3">
			<SectionHeading level={2}>Việc theo KR</SectionHeading>
			<ItemGroup>
				{MUC_TIEU_DON_VI.flatMap((m) => m.kr)
					.slice(0, 4)
					.map((k, i) => (
						<Item key={k.id} size="sm" variant="outline">
							<ItemContent>
								<ItemTitle>
									{
										[
											"Trực ca tối cho đối tác mới",
											"Gọi lại công ty chấm dưới 4/5",
											"Gửi pháp chế bản điều khoản",
											"Lịch gặp tuần đầu cho 6 công ty",
										][i]
									}
								</ItemTitle>
								<ItemDescription>{k.ten}</ItemDescription>
							</ItemContent>
							<ItemActions>
								<span className="text-muted-foreground text-xs">
									{k.phuTrach.ten}
								</span>
							</ItemActions>
						</Item>
					))}
			</ItemGroup>
		</section>
	);
}

function TheSoDo() {
	return (
		<section className="flex flex-col gap-3">
			<SectionHeading
				actions={
					<Button asChild size="sm" variant="outline">
						<Link href={duong(STATE.soDo)}>Mở sơ đồ cả công ty</Link>
					</Button>
				}
				level={2}
			>
				Đơn vị này góp vào đâu
			</SectionHeading>
			<SoDoNho />
		</section>
	);
}

export function ManTrangDonVi({ the }: { the: TheDonVi }) {
	return (
		<PageShell>
			<DauTrang
				hanhDong={
					<>
						<Button size="sm" variant="outline">
							Soạn OKR
						</Button>
						<NutThemMucTieu />
					</>
				}
				moTa={`Trưởng: ${TOI.ten} · ${KY.ten} · Đang chạy`}
				tieuDe="Chăm sóc khách hàng"
				vet={
					<Breadcrumb>
						<BreadcrumbList>
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<Link href={duong(STATE.donVi)}>Đơn vị</Link>
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbLink asChild>
									<Link href={duong(STATE.donVi)}>Vận hành</Link>
								</BreadcrumbLink>
							</BreadcrumbItem>
							<BreadcrumbSeparator />
							<BreadcrumbItem>
								<BreadcrumbPage>Chăm sóc khách hàng</BreadcrumbPage>
							</BreadcrumbItem>
						</BreadcrumbList>
					</Breadcrumb>
				}
			/>
			<Tabs value={the}>
				<TabsList aria-label="Phần của đơn vị" variant="line">
					{THE.map((t) => (
						<TabsTrigger asChild key={t.gt} value={t.gt}>
							<Link
								aria-current={t.gt === the ? "page" : undefined}
								href={duong(t.state)}
							>
								{t.nhan}
							</Link>
						</TabsTrigger>
					))}
				</TabsList>
			</Tabs>
			<PageShellContent>
				{the === "okr" ? <TheOkr /> : null}
				{the === "hop-tuan" ? <TheHopTuan /> : null}
				{the === "viec" ? <TheViec /> : null}
				{the === "so-do" ? <TheSoDo /> : null}
			</PageShellContent>
		</PageShell>
	);
}

export function ManSucKhoe() {
	const truot = MOI_KR.filter((h) => nhip(h.kr) === "truot").length;
	const cham = MOI_KR.filter((h) => nhip(h.kr) === "cham-nhip").length;
	const dung = MOI_KR.filter((h) => nhip(h.kr) === "dung-nhip").length;
	const o = [
		{ nhan: "Đúng nhịp", so: dung, mo: "Bấm để xem danh sách" },
		{ nhan: "Chậm nhịp", so: cham, mo: "Bấm để xem danh sách" },
		{ nhan: "Trượt", so: truot, mo: "Bấm để xem danh sách" },
		{
			nhan: "Cập nhật tuần này",
			so: MOI_KR.filter((h) => h.kr.capNhatLuc === "30/11").length,
			mo: `trên ${MOI_KR.length} KR`,
		},
	];
	return (
		<PageShell>
			<DauTrang
				moTa="Cả công ty trong chu kỳ: nhịp, mức tự tin và đơn vị nào cần kèm."
				tieuDe="Sức khoẻ"
			/>
			<PageShellContent>
				<StatGroup>
					{o.map((x) => (
						<Link
							className="block transition-colors hover:bg-muted/40"
							href={duong(STATE.moiKr)}
							key={x.nhan}
						>
							<StatCard
								description={x.mo}
								label={x.nhan}
								value={String(x.so)}
							/>
						</Link>
					))}
				</StatGroup>
				<section className="flex flex-col gap-3">
					<SectionHeading level={2}>Các đơn vị</SectionHeading>
					<SimpleTable
						columns={[
							{ id: "ten", header: "Đơn vị" },
							{ id: "td", header: "Tiến độ", width: "w-56" },
							{ id: "thap", header: "KR tự tin thấp", align: "right" },
						]}
					>
						{HANG_DON_VI.filter((h) => h.sau <= 1).map((h) => (
							<SimpleTableRow key={h.id}>
								<SimpleTableCell>
									<Link
										className="hover:underline"
										href={duong(STATE.trangDonVi)}
									>
										{h.ten}
									</Link>
								</SimpleTableCell>
								<SimpleTableCell>
									<Progress expected={KY.kyVong} value={h.tienDo} />
								</SimpleTableCell>
								<SimpleTableCell numeric>{h.krThap}</SimpleTableCell>
							</SimpleTableRow>
						))}
					</SimpleTable>
				</section>
			</PageShellContent>
		</PageShell>
	);
}

export function ManMoiKr() {
	return (
		<PageShell>
			<DauTrang
				moTa="Mọi KR của cả công ty trong chu kỳ, lọc theo tình trạng."
				tieuDe="Mọi KR"
			/>
			<PageShellContent>
				<ToggleGroup
					aria-label="Lọc theo tình trạng"
					defaultValue="truot"
					size="sm"
					spacing={0}
					type="single"
					variant="outline"
				>
					<ToggleGroupItem value="tat-ca">Tất cả</ToggleGroupItem>
					<ToggleGroupItem value="truot">Trượt</ToggleGroupItem>
					<ToggleGroupItem value="cham">Chậm nhịp</ToggleGroupItem>
					<ToggleGroupItem value="dung">Đúng nhịp</ToggleGroupItem>
				</ToggleGroup>
				<SimpleTable
					columns={[
						{ id: "kr", header: "KR" },
						{ id: "dv", header: "Đơn vị" },
						{ id: "pt", header: "Phụ trách" },
						{ id: "gt", header: "Hiện tại", align: "right" },
						{ id: "tt", header: "Tình trạng" },
					]}
				>
					{MOI_KR.filter((h) => nhip(h.kr) === "truot").map((h) => (
						<SimpleTableRow key={h.kr.id}>
							<SimpleTableCell>
								<Link className="hover:underline" href={duong(STATE.nganKr)}>
									{h.kr.ten}
								</Link>
							</SimpleTableCell>
							<SimpleTableCell>{h.tenDonVi}</SimpleTableCell>
							<SimpleTableCell>{h.kr.phuTrach.ten}</SimpleTableCell>
							<SimpleTableCell numeric>{giaTri(h.kr)}</SimpleTableCell>
							<SimpleTableCell>
								<PaceIndicator pace={nhip(h.kr)} size="sm" />
							</SimpleTableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
			</PageShellContent>
		</PageShell>
	);
}

export function ManCapNhat() {
	return (
		<PageShell width="page">
			<DauTrang
				moTa="Mọi lần cập nhật tuần, mới nhất trước. Đọc trước họp, trả lời ngay tại đây."
				tieuDe="Cập nhật"
			/>
			<PageShellContent>
				<ToggleGroup
					aria-label="Lọc dòng tin"
					defaultValue="tat-ca"
					size="sm"
					spacing={0}
					type="single"
					variant="outline"
				>
					<ToggleGroupItem value="tat-ca">Tất cả</ToggleGroupItem>
					<ToggleGroupItem value="don-vi">Đơn vị bạn dẫn</ToggleGroupItem>
					<ToggleGroupItem value="theo-doi">Bạn theo dõi</ToggleGroupItem>
				</ToggleGroup>
				<ItemGroup>
					{DONG_TIN.map((d) => (
						<Item key={d.id} variant="outline">
							<ItemContent>
								<ItemTitle>
									{d.nguoi} · {d.giaTri}
								</ItemTitle>
								<ItemDescription>
									{d.kr} · {d.donVi} · {d.luc}
								</ItemDescription>
								<p className="text-sm">{d.ghiChu}</p>
							</ItemContent>
							<ItemActions>
								<Button size="sm" variant="ghost">
									Trả lời
								</Button>
							</ItemActions>
						</Item>
					))}
				</ItemGroup>
			</PageShellContent>
		</PageShell>
	);
}

export function ManLayYKien() {
	return (
		<PageShell width="page">
			<DauTrang
				moTa="Cả công ty góp ý cho mục tiêu kỳ tới, trước khi đặt OKR."
				tieuDe="Lấy ý kiến"
			/>
			<PageShellContent>
				<Card>
					<CardHeader>
						<CardTitle>Chưa lấy ý kiến cho Quý 1 · 2027</CardTitle>
						<CardDescription>
							Mục này chỉ nằm trong thanh bên ở pha Lập kế hoạch, hoặc khi một
							lần lấy ý kiến đã có kết quả. Ngoài hai lúc đó nó ẩn đi.
						</CardDescription>
					</CardHeader>
				</Card>
			</PageShellContent>
		</PageShell>
	);
}
