"use client";

import ChevronLeft from "@carbon/icons-react/es/ChevronLeft";
import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { StatGroup } from "@crm/ui/components/dashboard";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
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
	Sheet,
	SheetBody,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import {
	SimpleTable,
	SimpleTableCell,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { StatCard } from "@crm/ui/components/stat-card";
import { Tabs, TabsList, TabsTrigger } from "@crm/ui/components/tabs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KY, MT_CSKH_1 } from "../ban-mau-okr/du-lieu";
import {
	duong,
	giaTri,
	KR_DANG_MO,
	nhip,
	phanTram,
	STATE,
	tienDoMucTieu,
} from "./du-lieu";

function useDong() {
	const router = useRouter();
	return (mo: boolean) => {
		if (!mo) router.push(duong(STATE.trangDonVi));
	};
}

export function NganMucTieu() {
	const dong = useDong();
	const mt = MT_CSKH_1;
	return (
		<Sheet onOpenChange={dong} open>
			<SheetContent size="lg">
				<SheetHeader>
					<SheetTitle>{mt.ten}</SheetTitle>
					<SheetDescription>
						Chăm sóc khách hàng · {KY.ten} · {mt.phuTrach.ten}
					</SheetDescription>
					<div className="flex flex-wrap items-center gap-2">
						<Badge variant="secondary">Kara · 1 góp ý</Badge>
						<Button asChild size="sm" variant="outline">
							<Link href={duong(STATE.soDoDonVi)}>Xem trên sơ đồ</Link>
						</Button>
					</div>
				</SheetHeader>
				<SheetBody className="flex flex-col gap-4">
					<StatGroup>
						<StatCard
							description={`kỳ vọng ${KY.kyVong}%`}
							label="Tiến độ"
							value={`${tienDoMucTieu(mt)}%`}
						/>
						<StatCard label="KR" value={String(mt.kr.length)} />
					</StatGroup>
					<Tabs value="kr">
						<TabsList aria-label="Phần của mục tiêu" variant="line">
							<TabsTrigger value="kr">KR</TabsTrigger>
							<TabsTrigger value="gop">Góp vào</TabsTrigger>
							<TabsTrigger value="trao-doi">Trao đổi</TabsTrigger>
							<TabsTrigger value="lich-su">Lịch sử</TabsTrigger>
						</TabsList>
					</Tabs>
					<SimpleTable
						columns={[
							{ id: "kr", header: "KR" },
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
				</SheetBody>
			</SheetContent>
		</Sheet>
	);
}

export function NganKr() {
	const dong = useDong();
	const kr = KR_DANG_MO;
	return (
		<Sheet onOpenChange={dong} open>
			<SheetContent size="md">
				<SheetHeader>
					<SheetDescription>
						<Link className="hover:underline" href={duong(STATE.nganMucTieu)}>
							{MT_CSKH_1.ten}
						</Link>
					</SheetDescription>
					<SheetTitle>{kr.ten}</SheetTitle>
					<div className="flex flex-wrap items-center gap-2">
						<span className="text-muted-foreground text-xs tabular-nums">
							2/4
						</span>
						<Button aria-label="KR trước" size="icon-sm" variant="outline">
							<Icon icon={ChevronLeft} />
						</Button>
						<Button aria-label="KR kế" size="icon-sm" variant="outline">
							<Icon icon={ChevronRight} />
						</Button>
						<Button className="ml-auto" size="sm">
							Cập nhật
						</Button>
					</div>
				</SheetHeader>
				<SheetBody className="flex flex-col gap-5">
					<StatGroup>
						<StatCard
							description={`đích ${kr.dich}${kr.donVi}`}
							label="Hiện tại"
							value={giaTri(kr)}
						/>
						<StatCard
							description={<PaceIndicator pace={nhip(kr)} size="sm" />}
							label={`Tiến độ · kỳ vọng ${KY.kyVong}%`}
							value={`${phanTram(kr)}%`}
						/>
					</StatGroup>
					<Progress expected={KY.kyVong} value={phanTram(kr)} />
					<section className="flex flex-col gap-2">
						<SectionHeading level={3}>Lịch sử cập nhật</SectionHeading>
						<ItemGroup>
							<Item size="sm" variant="outline">
								<ItemContent>
									<ItemTitle>
										{kr.capNhatLuc} · {giaTri(kr)}
									</ItemTitle>
									<ItemDescription>{kr.ghiChu}</ItemDescription>
								</ItemContent>
								<ConfidenceIndicator level={kr.tuTin} size="sm" />
							</Item>
							<Item size="sm" variant="outline">
								<ItemContent>
									<ItemTitle>16/11 · 68 %</ItemTitle>
									<ItemDescription>1 trao đổi</ItemDescription>
								</ItemContent>
							</Item>
						</ItemGroup>
					</section>
					<section className="flex flex-col gap-2">
						<SectionHeading level={3}>Việc và bằng chứng</SectionHeading>
						<p className="text-muted-foreground text-sm">
							3 việc · 2 xong · 1 bằng chứng
						</p>
					</section>
					<section className="flex flex-col gap-2">
						<SectionHeading level={3}>Số và nguồn</SectionHeading>
						<p className="text-muted-foreground text-sm">
							Nhập tay ở cập nhật tuần
						</p>
					</section>
					<section className="flex flex-col gap-2">
						<SectionHeading level={3}>Chi tiết</SectionHeading>
						<p className="text-muted-foreground text-sm">
							Phụ trách {kr.phuTrach.ten} · hạn 31/12 · kiểu Tăng tới
						</p>
					</section>
				</SheetBody>
			</SheetContent>
		</Sheet>
	);
}
