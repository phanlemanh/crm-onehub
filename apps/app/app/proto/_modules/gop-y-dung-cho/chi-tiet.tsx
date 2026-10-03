"use client";

import Add from "@carbon/icons-react/es/Add";
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
import { Fragment, useEffect, useState } from "react";
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
import {
	NHAN_TRANG_THAI,
	nhipCua,
	tienDoMucTieu,
} from "../muc-tieu-va-kr/du-lieu";
import { moTaKr, TienDoKrMau } from "../muc-tieu-va-kr/o-tien-do";
import { DONG_HN, GOP_Y, STATE, type TrangThaiKara } from "./du-lieu";
import {
	GopYNeo,
	type QuyetCua,
	type QuyetMau,
	useQuyetMau,
} from "./gop-y-neo";
import { HopSuaKr } from "./hop-sua";
import { DauTheoKara } from "./kara";
import { NhomKara } from "./nhom-kara";

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

const DAU_BIEN_NHAN = {
	"g-ten-k1": { ket: "nhan" },
	"g-viec-k3": { ket: "bo-qua" },
} satisfies Readonly<Record<string, QuyetMau>>;

const CO_NEO: readonly TrangThaiKara[] = ["co-gop-y", "bien-nhan"];

function BangKrChiTiet({
	qc,
	coNeo,
	moKr,
}: {
	qc: QuyetCua;
	coNeo: boolean;
	moKr: (den: "kr-moi" | "sua-kr") => void;
}) {
	const mt = DONG_HN;
	return (
		<SimpleTable columns={COT_KR}>
			{mt.kr.map((kr, i) => {
				const g = coNeo ? GOP_Y.find((x) => x.krId === kr.id) : undefined;
				const tenMoi = coNeo ? qc.tenSau(kr.id) : null;
				return (
					<Fragment key={kr.id}>
						<SimpleTableRow
							className={cn(g && "border-b-0")}
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
											<span translate="no">{tenMoi ?? kr.ten}</span>
											{tenMoi ? <DauTheoKara /> : null}
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
						{g ? (
							<SimpleTableRow data-duoi-kr={kr.id}>
								<SimpleTableCell
									className="whitespace-normal pt-0 pb-3"
									colSpan={4}
								>
									<GopYNeo g={g} moKr={moKr} qc={qc} />
								</SimpleTableCell>
							</SimpleTableRow>
						) : null}
					</Fragment>
				);
			})}
		</SimpleTable>
	);
}

function cuonToiGopYDau() {
	const dau = document.querySelector<HTMLElement>("[data-nhom-kara]");
	if (!dau) return;
	const giam = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	dau.scrollIntoView({ block: "start", behavior: giam ? "auto" : "smooth" });
}

function TabKr({
	trangThai,
	qc,
	moKr,
}: {
	trangThai: TrangThaiKara;
	qc: QuyetCua;
	moKr: (den: "kr-moi" | "sua-kr") => void;
}) {
	const mt = DONG_HN;
	const phanTram = tienDoMucTieu(mt) ?? 0;
	return (
		<DetailSheetBody>
			<DetailSheetSection title="Vì sao lúc này">
				<DetailSheetProse>
					<span translate="no">{mt.viSao}</span>
				</DetailSheetProse>
			</DetailSheetSection>
			<DetailSheetSection
				action={
					<Button size="sm" variant="outline" onClick={() => moKr("kr-moi")}>
						<Icon data-icon="inline-start" icon={Add} />
						Thêm KR
					</Button>
				}
				title={`${mt.kr.length} KR đo mục tiêu này`}
			>
				<div className="flex flex-col gap-3">
					<div className="scroll-mt-4" data-duoi-muc-tieu={mt.id}>
						<NhomKara moKr={moKr} qc={qc} trangThai={trangThai} />
					</div>
					<BangKrChiTiet
						coNeo={CO_NEO.includes(trangThai)}
						moKr={moKr}
						qc={qc}
					/>
					<p className="text-muted-foreground text-xs">
						Tiến độ mục tiêu {phanTram}% tính từ {mt.kr.length} KR. Vạch đứng:
						lẽ ra đã tới {KY.kyVong}% vào {KY.homNay}.
					</p>
				</div>
			</DetailSheetSection>
		</DetailSheetBody>
	);
}

function TabGiuCho() {
	return (
		<DetailSheetBody>
			<DetailSheetSection>
				<p className="text-muted-foreground text-sm">
					Giữ nguyên như bản hiện tại.
				</p>
			</DetailSheetSection>
		</DetailSheetBody>
	);
}

export function ChiTietMucTieu({ trangThai }: { trangThai: TrangThaiKara }) {
	const mt = DONG_HN;
	const router = useRouter();
	const [tab, setTab] = useState("kr");
	const [hopKr, setHopKr] = useState(false);
	const qc = useQuyetMau(trangThai === "bien-nhan" ? DAU_BIEN_NHAN : {});
	const phanTram = tienDoMucTieu(mt) ?? 0;
	const moKr = (den: "kr-moi" | "sua-kr") => {
		if (den === "sua-kr") router.push(`?state=${STATE.bHopSuaKr}`);
		else setHopKr(true);
	};
	useEffect(() => {
		if (trangThai === "co-gop-y") cuonToiGopYDau();
	}, [trangThai]);
	const tabs: DetailSheetTab[] = [
		{
			value: "kr",
			label: "KR",
			count: mt.kr.length,
			content: <TabKr moKr={moKr} qc={qc} trangThai={trangThai} />,
		},
		{
			value: "can-chinh",
			label: "Căn chỉnh",
			count: 0,
			content: <TabGiuCho />,
		},
		{ value: "vet", label: "Vết", count: 4, content: <TabGiuCho /> },
		{ value: "trao-doi", label: "Trao đổi", count: 1, content: <TabGiuCho /> },
	];
	return (
		<>
			<DetailSheet
				onOpenChange={() => router.push(`?state=${STATE.aDanhSach}`)}
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
			{hopKr ? <HopSuaKr kieu="moi" onDong={() => setHopKr(false)} /> : null}
		</>
	);
}
