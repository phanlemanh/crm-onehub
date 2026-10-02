"use client";

import Add from "@carbon/icons-react/es/Add";
import ArrowUpRight from "@carbon/icons-react/es/ArrowUpRight";
import Notification from "@carbon/icons-react/es/Notification";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { EntityLogo } from "@crm/ui/components/entity-logo";
import { Icon } from "@crm/ui/components/icon";
import { PaceIndicator } from "@crm/ui/components/okr-status";
import {
	SimpleTable,
	SimpleTableCell,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { cn } from "@crm/ui/lib/utils";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import {
	DetailSheet,
	DetailSheetBody,
	DetailSheetHeader,
	DetailSheetProse,
	DetailSheetSection,
	DetailSheetStat,
	DetailSheetStats,
	type DetailSheetTab,
	DetailSheetTabs,
} from "@/components/detail-sheet";
import { KY } from "../ban-mau-okr/du-lieu";
import { LoaiMucTieuNhan, TenNguoi } from "../ban-mau-okr/phan-chung";
import { coNoiDung, type DiemCam } from "./diem-cam";
import {
	CSKH_1,
	type MucTieuDu,
	NHAN_TRANG_THAI,
	nhipCua,
	STATE,
	tienDoMucTieu,
} from "./du-lieu";
import { moTaKr, TienDoKrMau } from "./o-tien-do";

const COT_KR: SimpleTableColumn[] = [
	{ id: "ten", header: "KR" },
	{
		id: "phuTrach",
		header: "Phụ trách",
		width: "w-40",
		className: "hidden sm:table-cell",
	},
	{
		id: "tienDo",
		header: "Tiến độ",
		width: "w-52",
		className: "hidden sm:table-cell",
	},
	{ id: "menu", srLabel: "Thao tác", width: "w-12" },
];

function GopVao({ mt }: { mt: MucTieuDu }) {
	if (mt.gopVao.length === 0) return null;
	return (
		<DetailSheetSection title="Góp vào">
			<ul className="flex flex-col gap-2">
				{mt.gopVao.map((g) => (
					<li
						className="flex min-w-0 items-start gap-2 text-sm"
						key={`${g.donVi}-${g.mucTieu}`}
					>
						<span className="mt-0.5 shrink-0 text-muted-foreground">
							<Icon icon={ArrowUpRight} />
						</span>
						<span className="min-w-0">
							<span translate="no">{g.mucTieu}</span>
							<span className="text-muted-foreground">
								{" · "}
								<span translate="no">{g.donVi}</span>
								{g.kr ? (
									<>
										{" · qua KR «"}
										<span translate="no">{g.kr}</span>
										{"»"}
									</>
								) : null}
							</span>
						</span>
					</li>
				))}
			</ul>
		</DetailSheetSection>
	);
}

function BangKrChiTiet({ mt, diemCam }: { mt: MucTieuDu; diemCam: DiemCam }) {
	return (
		<SimpleTable columns={COT_KR}>
			{mt.kr.map((kr, i) => {
				const duoi = diemCam.duoiKr?.(kr, mt);
				const coDuoi = coNoiDung(duoi);
				const sauTen = diemCam.sauTenKr?.(kr, mt);
				return (
					<Fragment key={kr.id}>
						<SimpleTableRow
							className={cn(coDuoi && "border-b-0")}
							data-hang-kr={kr.id}
							data-kr={kr.id}
						>
							<SimpleTableCell className="whitespace-normal py-2.5 align-top">
								<div className="flex min-w-0 gap-3">
									<span className="w-8 shrink-0 pt-px text-muted-foreground text-xs tabular-nums">
										KR{i + 1}
									</span>
									<div className="flex min-w-0 flex-col gap-1">
										<span className="flex flex-wrap items-center gap-x-2 gap-y-1">
											<span translate="no">{kr.ten}</span>
											{coNoiDung(sauTen) ? sauTen : null}
										</span>
										<span className="text-muted-foreground text-xs">
											{moTaKr(kr)}
											<span className="sm:hidden">
												{" · "}
												<span translate="no">{kr.phuTrach.ten}</span>
											</span>
										</span>
										<div className="pt-1 sm:hidden">
											<TienDoKrMau kr={kr} loai={mt.loai} />
										</div>
									</div>
								</div>
							</SimpleTableCell>
							<SimpleTableCell className="hidden py-2.5 align-top sm:table-cell">
								<TenNguoi ten={kr.phuTrach.ten} />
							</SimpleTableCell>
							<SimpleTableCell className="hidden py-2.5 align-top sm:table-cell">
								<TienDoKrMau kr={kr} loai={mt.loai} />
							</SimpleTableCell>
							<SimpleTableCell className="py-2 align-top">
								<Button
									aria-label={`Thao tác cho «${kr.ten}»`}
									size="icon-sm"
									variant="ghost"
								>
									<Icon icon={OverflowMenuHorizontal} />
								</Button>
							</SimpleTableCell>
						</SimpleTableRow>
						{coDuoi ? (
							<SimpleTableRow data-duoi-kr={kr.id}>
								<SimpleTableCell
									className="whitespace-normal pt-0 pb-3"
									colSpan={4}
								>
									{duoi}
								</SimpleTableCell>
							</SimpleTableRow>
						) : null}
					</Fragment>
				);
			})}
		</SimpleTable>
	);
}

function TabKr({
	mt,
	phanTram,
	diemCam,
}: {
	mt: MucTieuDu;
	phanTram: number;
	diemCam: DiemCam;
}) {
	const dauDs = diemCam.duoiMucTieu?.(mt);
	return (
		<DetailSheetBody>
			<DetailSheetSection title="Vì sao lúc này">
				<DetailSheetProse>
					<span translate="no">{mt.viSao}</span>
				</DetailSheetProse>
			</DetailSheetSection>
			<GopVao mt={mt} />
			<DetailSheetSection
				action={
					<Button size="sm" variant="outline">
						<Icon data-icon="inline-start" icon={Add} />
						Thêm KR
					</Button>
				}
				title={`${mt.kr.length} KR đo mục tiêu này`}
			>
				<div className="flex flex-col gap-2">
					{coNoiDung(dauDs) ? (
						<div data-duoi-muc-tieu={mt.id}>{dauDs}</div>
					) : null}
					<BangKrChiTiet diemCam={diemCam} mt={mt} />
					<p className="text-muted-foreground text-xs">
						Tiến độ mục tiêu {phanTram}% tính từ {mt.kr.length} KR. Vạch đứng:
						lẽ ra đã tới {KY.kyVong}% vào {KY.homNay}.
					</p>
				</div>
			</DetailSheetSection>
		</DetailSheetBody>
	);
}

function TabGiuCho({ cau }: { cau: string }) {
	return (
		<DetailSheetBody>
			<DetailSheetSection>
				<p className="text-muted-foreground text-sm">{cau}</p>
			</DetailSheetSection>
		</DetailSheetBody>
	);
}

export function ChiTietMucTieu({ diemCam = {} }: { diemCam?: DiemCam }) {
	const mt = CSKH_1;
	const router = useRouter();
	const [tab, setTab] = useState("kr");
	const phanTram = tienDoMucTieu(mt) ?? 0;
	const tabs: DetailSheetTab[] = [
		{
			value: "kr",
			label: "KR",
			count: mt.kr.length,
			content: <TabKr diemCam={diemCam} mt={mt} phanTram={phanTram} />,
		},
		{
			value: "can-chinh",
			label: "Căn chỉnh",
			count: mt.gopVao.length,
			content: <TabGiuCho cau="Giữ nguyên như bản hiện tại." />,
		},
		{
			value: "vet",
			label: "Vết",
			count: 6,
			content: <TabGiuCho cau="Giữ nguyên như bản hiện tại." />,
		},
		{
			value: "trao-doi",
			label: "Trao đổi",
			count: 2,
			content: <TabGiuCho cau="Giữ nguyên như bản hiện tại." />,
		},
	];
	return (
		<DetailSheet
			onOpenChange={() => router.push(`?state=${STATE.cuaToi}`)}
			open
		>
			<DetailSheetHeader
				actions={
					<>
						<Button size="sm" variant="outline">
							<Icon data-icon="inline-start" icon={Notification} />
							<span className="max-sm:sr-only">Theo dõi</span>
						</Button>
						<Button
							aria-label="Thao tác với mục tiêu"
							size="icon-sm"
							variant="ghost"
						>
							<Icon icon={OverflowMenuHorizontal} />
						</Button>
					</>
				}
				description={
					<>
						<span translate="no">{mt.donVi}</span> · {KY.ten}
					</>
				}
				media={<EntityLogo name={mt.ten} size="lg" />}
				note={
					<>
						<LoaiMucTieuNhan loai={mt.loai} />
						<Badge variant="secondary">{NHAN_TRANG_THAI[mt.trangThai]}</Badge>
					</>
				}
				title={<span translate="no">{mt.ten}</span>}
			/>
			<DetailSheetStats>
				<DetailSheetStat label="Tiến độ">
					<span className="tabular-nums">{phanTram}%</span>
					<span className="text-muted-foreground tabular-nums">
						{" · "}lẽ ra {KY.kyVong}%
					</span>
				</DetailSheetStat>
				<DetailSheetStat label="Tình trạng">
					<PaceIndicator pace={nhipCua(phanTram, mt.loai)} size="sm" />
				</DetailSheetStat>
				<DetailSheetStat label="Phụ trách">
					<TenNguoi ten={mt.phuTrach.ten} />
				</DetailSheetStat>
			</DetailSheetStats>
			<DetailSheetTabs onValueChange={setTab} tabs={tabs} value={tab} />
		</DetailSheet>
	);
}
