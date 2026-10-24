"use client";

import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import {
	AreaSidebar,
	AreaSidebarGroup,
	AreaSidebarItem,
} from "@crm/ui/components/area-sidebar";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { ConfidenceIndicator } from "@crm/ui/components/okr-status";
import { SectionHeading } from "@crm/ui/components/section-heading";
import {
	SimpleTable,
	SimpleTableCell,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import { TreeNav, type TreeNavNode } from "@crm/ui/components/tree-nav";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type ReactNode, Suspense, useState } from "react";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import {
	CAP_CHU,
	CHU_GIU,
	CHU_KY,
	KR_CUA_TOI,
	MUC_TIEU,
	timKr,
	timMucTieu,
	VIEC,
} from "./du-lieu";
import { HopCapNhatMau, NganKrMau, NganMucTieuMau } from "./ngan";

const DUONG = "/proto/bam-kr-mo-chi-tiet-kr";

const ST = {
	cuaToi: "ST-bkr-cua-toi",
	soDo: "ST-bkr-so-do",
	nganMucTieu: "ST-bkr-ngan-muc-tieu",
	nganKr: "ST-bkr-ngan-kr",
	hopCapNhat: "ST-bkr-hop-cap-nhat",
	homNay: "ST-bkr-hom-nay",
	chu: "ST-bkr-chu",
} as const;

type Nen = "cua-toi" | "so-do";

const den = (state: string, thamSo: Record<string, string> = {}) => {
	const q = new URLSearchParams({ state, ...thamSo });
	return `${DUONG}?${q}`;
};

const veNen = (nen: Nen) => den(nen === "so-do" ? ST.soDo : ST.cuaToi);

function ThanhBen({ mo }: { mo: "cua-toi" | "bo-okr" }) {
	return (
		<AreaSidebar
			header={
				<Button className="justify-between" size="sm" variant="outline">
					{CHU_KY.ten}
					<Icon icon={ChevronDown} data-icon="inline-end" />
				</Button>
			}
			label="Mục tiêu"
		>
			<AreaSidebarGroup>
				<AreaSidebarItem active={mo === "cua-toi"} asChild>
					<Link href={den(ST.cuaToi)}>Của tôi</Link>
				</AreaSidebarItem>
			</AreaSidebarGroup>
			<AreaSidebarGroup label="OKR">
				<AreaSidebarItem active={mo === "bo-okr"} asChild>
					<Link href={den(ST.soDo)}>Bộ OKR</Link>
				</AreaSidebarItem>
				<AreaSidebarItem disabled>Lấy ý kiến</AreaSidebarItem>
			</AreaSidebarGroup>
		</AreaSidebar>
	);
}

function Khung({
	mo,
	moTa,
	children,
}: {
	mo: "cua-toi" | "bo-okr";
	moTa: string;
	children: ReactNode;
}) {
	return (
		<div className="flex min-h-0 flex-col gap-4 md:flex-row">
			<ThanhBen mo={mo} />
			<div className="min-w-0 flex-1">
				<PageShell>
					<PageShellHeader>
						<PageShellHeading>
							<PageShellTitle>Mục tiêu</PageShellTitle>
							<PageShellDescription>{moTa}</PageShellDescription>
						</PageShellHeading>
					</PageShellHeader>
					<PageShellContent>{children}</PageShellContent>
				</PageShell>
			</div>
		</div>
	);
}

const COT_KR_CUA_TOI: SimpleTableColumn[] = [
	{ id: "kr", header: "KR" },
	{ id: "hien-tai", header: "Hiện tại", className: "hidden md:table-cell" },
	{ id: "tu-tin", header: "Tự tin" },
];

function ManCuaToi({ homNay }: { homNay: boolean }) {
	return (
		<Khung
			mo="cua-toi"
			moTa="Việc của bạn, đơn vị bạn dẫn và các KR bạn phụ trách."
		>
			<div className="flex flex-col gap-8">
				<section className="flex flex-col gap-3" data-viec-okr-mau="">
					<SectionHeading level={2}>Việc OKR</SectionHeading>
					<ItemGroup className="gap-2">
						{VIEC.map((v) => {
							const mt = timMucTieu(v.mucTieuId);
							const moKr = v.krId !== null && !homNay;
							const kr = v.krId ? timKr(v.krId).kr : null;
							return (
								<Item data-viec={v.id} key={v.id} size="sm" variant="outline">
									<ItemContent>
										<ItemTitle>{v.tieuDe}</ItemTitle>
										<ItemDescription>
											<span translate="no">{kr ? kr.tieuDe : mt.tieuDe}</span> ·{" "}
											{v.han}
										</ItemDescription>
									</ItemContent>
									<ItemActions>
										<Button asChild size="sm" variant="outline">
											{moKr && kr ? (
												<Link
													data-mo-kr={kr.id}
													href={den(ST.nganKr, { kr: kr.id, tu: "cua-toi" })}
												>
													Mở KR
												</Link>
											) : (
												<Link
													data-mo-muc-tieu={mt.id}
													href={den(homNay ? ST.homNay : ST.nganMucTieu, {
														mt: mt.id,
														tu: "cua-toi",
													})}
												>
													Mở mục tiêu
												</Link>
											)}
										</Button>
									</ItemActions>
								</Item>
							);
						})}
					</ItemGroup>
				</section>
				<section className="flex flex-col gap-3" data-kr-phu-trach-mau="">
					<SectionHeading level={2}>KR bạn phụ trách</SectionHeading>
					<p className="text-muted-foreground text-sm">
						{KR_CUA_TOI.length} KR trong {CHU_KY.ten}
					</p>
					<SimpleTable columns={COT_KR_CUA_TOI} surface="page">
						{KR_CUA_TOI.map(({ kr, mucTieu }) => (
							<SimpleTableRow data-kr={kr.id} key={kr.id}>
								<SimpleTableCell>
									<span className="flex flex-col items-start gap-0.5">
										<Button asChild size="xs-wrap" variant="link">
											<Link
												data-mo={homNay ? "muc-tieu" : "kr"}
												href={
													homNay
														? den(ST.homNay, { mt: mucTieu.id, tu: "cua-toi" })
														: den(ST.nganKr, { kr: kr.id, tu: "cua-toi" })
												}
											>
												<span translate="no">{kr.tieuDe}</span>
											</Link>
										</Button>
										<span
											className="text-muted-foreground text-xs"
											translate="no"
										>
											{mucTieu.donVi} · {mucTieu.tieuDe}
										</span>
									</span>
								</SimpleTableCell>
								<SimpleTableCell className="hidden tabular-nums md:table-cell">
									{kr.hienTai}
								</SimpleTableCell>
								<SimpleTableCell>
									<ConfidenceIndicator level={kr.tuTin} size="sm" />
								</SimpleTableCell>
							</SimpleTableRow>
						))}
					</SimpleTable>
				</section>
			</div>
		</Khung>
	);
}

type NutCay = { loai: "muc-tieu" | "kr"; id: string; tienDo: number };

const CAY: TreeNavNode<NutCay>[] = MUC_TIEU.map((mt) => ({
	id: mt.id,
	name: mt.tieuDe,
	data: { loai: "muc-tieu", id: mt.id, tienDo: mt.tienDo },
	children: mt.kr.map((kr) => ({
		id: kr.id,
		name: kr.tieuDe,
		data: { loai: "kr", id: kr.id, tienDo: kr.tienDo },
	})),
}));

function ManSoDo() {
	const router = useRouter();
	const [mo, setMo] = useState<string[]>(MUC_TIEU.map((m) => m.id));
	return (
		<Khung mo="bo-okr" moTa="Mỗi đơn vị một bộ OKR trong chu kỳ.">
			<div className="flex flex-col gap-4">
				<Tabs value="so-do">
					<TabsList aria-label="Phần của bộ OKR" variant="line">
						<TabsTrigger value="okr">OKR</TabsTrigger>
						<TabsTrigger value="hop-tuan">Họp tuần</TabsTrigger>
						<TabsTrigger value="viec">Việc</TabsTrigger>
						<TabsTrigger aria-current="page" value="so-do">
							Sơ đồ
						</TabsTrigger>
					</TabsList>
				</Tabs>
				<div data-cay-mau="">
					<TreeNav
						expanded={mo}
						itemAttrs={(n) => ({ "data-cap-nut": n.data.loai })}
						label="Cây căn chỉnh"
						nodes={CAY}
						onExpandedChange={setMo}
						onSelect={(id) => {
							const kr = MUC_TIEU.some((m) => m.kr.some((k) => k.id === id));
							router.push(
								kr
									? den(ST.nganKr, { kr: id, tu: "so-do" })
									: den(ST.nganMucTieu, { mt: id, tu: "so-do" }),
							);
						}}
						renderLabel={(n) => (
							<span className="flex w-full min-w-0 items-center gap-3">
								<span
									className={
										n.data.loai === "kr"
											? "min-w-0 flex-1 truncate text-sm"
											: "min-w-0 flex-1 truncate font-medium text-sm"
									}
									translate="no"
								>
									{n.name}
								</span>
								<span className="text-muted-foreground text-xs tabular-nums">
									{n.data.tienDo}%
								</span>
							</span>
						)}
					/>
				</div>
			</div>
		</Khung>
	);
}

const COT_CHU: SimpleTableColumn[] = [
	{ id: "cu", header: "Hôm nay" },
	{ id: "moi", header: "Sau vòng" },
	{ id: "noi", header: "Ở đâu", className: "hidden md:table-cell" },
];

function ManChu() {
	return (
		<Khung
			mo="cua-toi"
			moTa="Chữ «Cập nhật» thay «Cập nhật tuần» khi là tên việc check-in."
		>
			<div className="flex flex-col gap-6" data-chu-mau="">
				<SimpleTable columns={COT_CHU} surface="page">
					{CAP_CHU.map((c) => (
						<SimpleTableRow key={c.cu}>
							<SimpleTableCell className="whitespace-normal">
								{c.cu}
							</SimpleTableCell>
							<SimpleTableCell className="whitespace-normal font-medium">
								{c.moi}
							</SimpleTableCell>
							<SimpleTableCell className="hidden whitespace-normal md:table-cell">
								{c.noi}
							</SimpleTableCell>
						</SimpleTableRow>
					))}
				</SimpleTable>
				<section className="flex flex-col gap-2">
					<SectionHeading level={3}>
						Giữ nguyên — chỉ khoảng thời gian
					</SectionHeading>
					<ItemGroup className="gap-2">
						{CHU_GIU.map((c) => (
							<Item key={c} size="sm" variant="muted">
								<ItemContent>
									<ItemTitle>{c}</ItemTitle>
								</ItemContent>
							</Item>
						))}
					</ItemGroup>
				</section>
			</div>
		</Khung>
	);
}

function NoiDung({ state }: { state: string }) {
	const q = useSearchParams();
	const nen: Nen = q.get("tu") === "so-do" ? "so-do" : "cua-toi";
	const krId = q.get("kr");
	const mtId = q.get("mt");
	const manNen = nen === "so-do" ? <ManSoDo /> : <ManCuaToi homNay={false} />;

	if (state === ST.soDo) return <ManSoDo />;
	if (state === ST.chu) return <ManChu />;
	if (state === ST.homNay) {
		return (
			<>
				<ManCuaToi homNay />
				<NganMucTieuMau
					dongVe={den(ST.homNay)}
					ghiChu="Hôm nay (onehub 09d7d1dcf): bấm tên KR ở Của tôi mở chi tiết mục tiêu, và tên KR trong bảng dưới chỉ là chữ."
					moKr={() => null}
					mucTieu={timMucTieu(mtId)}
				/>
			</>
		);
	}
	if (state === ST.nganMucTieu) {
		const mt = timMucTieu(mtId);
		return (
			<>
				{manNen}
				<NganMucTieuMau
					dongVe={veNen(nen)}
					moKr={(kr) => den(ST.nganKr, { kr: kr.id, mt: mt.id, tu: nen })}
					mucTieu={mt}
				/>
			</>
		);
	}
	if (state === ST.nganKr) {
		const { kr, mucTieu } = timKr(krId);
		const tuMucTieu = mtId !== null;
		return (
			<>
				{manNen}
				<NganKrMau
					capNhat={den(ST.hopCapNhat, { kr: kr.id, tu: nen })}
					dongVe={
						tuMucTieu
							? den(ST.nganMucTieu, { mt: mucTieu.id, tu: nen })
							: veNen(nen)
					}
					kr={kr}
					mucTieu={mucTieu}
					veMucTieu={
						tuMucTieu ? den(ST.nganMucTieu, { mt: mucTieu.id, tu: nen }) : null
					}
				/>
			</>
		);
	}
	if (state === ST.hopCapNhat) {
		const { kr } = timKr(krId);
		return (
			<>
				{manNen}
				<HopCapNhatMau
					dongVe={den(ST.nganKr, { kr: kr.id, tu: nen })}
					kr={kr}
				/>
			</>
		);
	}
	return <ManCuaToi homNay={false} />;
}

export function BamKrMoChiTietKrMau({ state }: { state: string }) {
	return (
		<LocaleProvider locale="vi">
			<Suspense fallback={null}>
				<NoiDung state={state} />
			</Suspense>
		</LocaleProvider>
	);
}
