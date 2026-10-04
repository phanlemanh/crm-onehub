"use client";

import Add from "@carbon/icons-react/es/Add";
import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import {
	SimpleTable,
	SimpleTableCell,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { cn } from "@crm/ui/lib/utils";
import Link from "next/link";
import { Fragment, type ReactNode, useState } from "react";
import type { KrMau } from "../ban-mau-okr/du-lieu";
import { LoaiMucTieuNhan, TenNguoi } from "../ban-mau-okr/phan-chung";
import { coNoiDung, type DiemCam } from "./diem-cam";
import {
	demCham,
	type MucTieuDu,
	NHAN_TRANG_THAI,
	nhipCua,
	STATE,
	tienDoMucTieu,
} from "./du-lieu";
import { moTaKr, OTienDo, TienDoKrMau } from "./o-tien-do";

const AN_DUOI_MD = "hidden md:table-cell";

const COT: SimpleTableColumn[] = [
	{ id: "mo", srLabel: "Mở hoặc thu gọn", width: "w-12" },
	{ id: "ten", header: "Mục tiêu và KR" },
	{ id: "phuTrach", header: "Phụ trách", width: "w-48", className: AN_DUOI_MD },
	{ id: "tienDo", header: "Tiến độ", width: "w-64", className: AN_DUOI_MD },
];

function moTaMucTieu(mt: MucTieuDu): string {
	const phan = [mt.donVi, `${mt.kr.length} KR`];
	if (mt.gopVao.length > 0) phan.push(`góp vào ${mt.gopVao.length} chỗ`);
	const cham = demCham(mt);
	if (cham > 0) phan.push(`${cham} KR chậm`);
	return phan.join(" · ");
}

function TienDoMucTieuO({ mt }: { mt: MucTieuDu }) {
	const phanTram = tienDoMucTieu(mt);
	if (phanTram === null)
		return (
			<span className="text-muted-foreground text-xs">Chưa có KR để tính</span>
		);
	return (
		<OTienDo
			coVach
			dong={`Tính từ ${mt.kr.length} KR`}
			nhan
			nhip={nhipCua(phanTram, mt.loai)}
			phanTram={phanTram}
			ten={mt.ten}
		/>
	);
}

function HangMucTieu({
	mt,
	mo,
	doiMo,
	nhan,
}: {
	mt: MucTieuDu;
	mo: boolean;
	doiMo: () => void;
	nhan: ReactNode;
}) {
	return (
		<SimpleTableRow
			clickable
			data-hang-muc-tieu={mt.id}
			expandable
			onClick={doiMo}
		>
			<SimpleTableCell className="w-12 py-3 align-top">
				<Button
					aria-expanded={mo}
					aria-label={`${mo ? "Thu gọn" : "Mở"} KR của «${mt.ten}»`}
					onClick={(e) => {
						e.stopPropagation();
						doiMo();
					}}
					size="icon-sm"
					variant="ghost"
				>
					<Icon
						className={cn(
							"transition-transform motion-reduce:transition-none",
							mo && "rotate-90",
						)}
						icon={ChevronRight}
					/>
				</Button>
			</SimpleTableCell>
			<SimpleTableCell className="whitespace-normal py-3 align-top">
				<div className="flex min-w-0 flex-1 flex-col gap-1">
					<div className="flex flex-wrap items-center gap-x-2 gap-y-1">
						<Link
							className="font-medium underline-offset-2 hover:underline focus-visible:underline"
							href={`?state=${STATE.chiTiet}`}
							onClick={(e) => e.stopPropagation()}
							translate="no"
						>
							{mt.ten}
						</Link>
						<LoaiMucTieuNhan loai={mt.loai} />
						<Badge
							variant={mt.trangThai === "cong-bo" ? "secondary" : "outline"}
						>
							{NHAN_TRANG_THAI[mt.trangThai]}
						</Badge>
						{coNoiDung(nhan) ? nhan : null}
					</div>
					<span className="text-muted-foreground text-xs">
						<span translate="no">{moTaMucTieu(mt)}</span>
						<span className="md:hidden">
							{" · "}
							<span translate="no">{mt.phuTrach.ten}</span>
						</span>
					</span>
					<div className="w-full pt-1 md:hidden">
						<TienDoMucTieuO mt={mt} />
					</div>
				</div>
			</SimpleTableCell>
			<SimpleTableCell className={cn(AN_DUOI_MD, "w-48 py-3 align-top")}>
				<TenNguoi ten={mt.phuTrach.ten} />
			</SimpleTableCell>
			<SimpleTableCell className={cn(AN_DUOI_MD, "w-64 py-3 align-top")}>
				<TienDoMucTieuO mt={mt} />
			</SimpleTableCell>
		</SimpleTableRow>
	);
}

function HangKr({
	kr,
	thuTu,
	mt,
	sauTen,
	dinhDuoi,
}: {
	kr: KrMau;
	thuTu: number;
	mt: MucTieuDu;
	sauTen: ReactNode;
	dinhDuoi: boolean;
}) {
	return (
		<SimpleTableRow
			joined={dinhDuoi}
			nested
			data-hang-kr={kr.id}
			data-kr={kr.id}
		>
			<SimpleTableCell />
			<SimpleTableCell className="whitespace-normal py-2.5 align-top">
				<div className="flex min-w-0 gap-3">
					<span className="w-8 shrink-0 pt-px text-muted-foreground text-xs tabular-nums">
						KR{thuTu}
					</span>
					<div className="flex min-w-0 flex-1 flex-col gap-1">
						<span className="flex flex-wrap items-center gap-x-2 gap-y-1">
							<span translate="no">{kr.ten}</span>
							{coNoiDung(sauTen) ? sauTen : null}
						</span>
						<span className="text-muted-foreground text-xs">
							{moTaKr(kr)}
							<span className="md:hidden">
								{" · "}
								<span translate="no">{kr.phuTrach.ten}</span>
							</span>
						</span>
						<div className="w-full pt-1 md:hidden">
							<TienDoKrMau kr={kr} loai={mt.loai} />
						</div>
					</div>
				</div>
			</SimpleTableCell>
			<SimpleTableCell className={cn(AN_DUOI_MD, "py-2.5 align-top")}>
				<TenNguoi ten={kr.phuTrach.ten} />
			</SimpleTableCell>
			<SimpleTableCell className={cn(AN_DUOI_MD, "py-2.5 align-top")}>
				<TienDoKrMau kr={kr} loai={mt.loai} />
			</SimpleTableCell>
		</SimpleTableRow>
	);
}

function HangTraiCot({
	children,
	neo,
	dinhTren,
}: {
	children: ReactNode;
	neo: { "data-duoi-muc-tieu": string } | { "data-duoi-kr": string };
	dinhTren: boolean;
}) {
	return (
		<SimpleTableRow nested {...neo}>
			<SimpleTableCell />
			<SimpleTableCell
				className={cn("whitespace-normal pb-3", dinhTren ? "pt-0" : "pt-3")}
				colSpan={3}
			>
				{children}
			</SimpleTableCell>
		</SimpleTableRow>
	);
}

function HangChuaCoKr({ mt }: { mt: MucTieuDu }) {
	return (
		<SimpleTableRow data-chua-co-kr={mt.id} nested>
			<SimpleTableCell />
			<SimpleTableCell className="whitespace-normal py-3" colSpan={3}>
				<div className="flex flex-wrap items-center gap-3">
					<span className="text-muted-foreground">
						Mục tiêu này chưa có KR. Cần ít nhất một KR để gửi duyệt.
					</span>
					<Button size="sm" variant="outline">
						<Icon data-icon="inline-start" icon={Add} />
						Thêm KR
					</Button>
				</div>
			</SimpleTableCell>
		</SimpleTableRow>
	);
}

export function BangMucTieu({
	ds,
	moSan,
	diemCam = {},
	dangMo,
	onDoiMo,
}: {
	ds: MucTieuDu[];
	moSan: "tat-ca" | "dau-tien";
	diemCam?: DiemCam;
	dangMo?: ReadonlySet<string>;
	onDoiMo?: (id: string) => void;
}) {
	const [moTrong, setMo] = useState<ReadonlySet<string>>(
		() =>
			new Set(
				moSan === "tat-ca"
					? ds.map((m) => m.id)
					: ds.slice(0, 1).map((m) => m.id),
			),
	);
	const mo = dangMo ?? moTrong;
	const doiMoTrong = (id: string) =>
		setMo((cu) => {
			const moi = new Set(cu);
			if (moi.has(id)) moi.delete(id);
			else moi.add(id);
			return moi;
		});
	const doiMo = onDoiMo ?? doiMoTrong;
	return (
		<div className="flex flex-col gap-3">
			{ds.map((mt) => {
				const moHang = mo.has(mt.id);
				const duoiMt = moHang ? diemCam.duoiMucTieu?.(mt) : null;
				return (
					<div data-muc-tieu={mt.id} key={mt.id}>
						<SimpleTable columns={COT} header="sr-only">
							<HangMucTieu
								doiMo={() => doiMo(mt.id)}
								mo={moHang}
								mt={mt}
								nhan={diemCam.nhanMucTieu?.(mt)}
							/>
							{coNoiDung(duoiMt) ? (
								<HangTraiCot
									dinhTren={false}
									neo={{ "data-duoi-muc-tieu": mt.id }}
								>
									{duoiMt}
								</HangTraiCot>
							) : null}
							{moHang && mt.kr.length === 0 ? <HangChuaCoKr mt={mt} /> : null}
							{moHang
								? mt.kr.map((kr, i) => {
										const duoi = diemCam.duoiKr?.(kr, mt);
										const coDuoi = coNoiDung(duoi);
										return (
											<Fragment key={kr.id}>
												<HangKr
													dinhDuoi={coDuoi}
													kr={kr}
													mt={mt}
													sauTen={diemCam.sauTenKr?.(kr, mt)}
													thuTu={i + 1}
												/>
												{coDuoi ? (
													<HangTraiCot dinhTren neo={{ "data-duoi-kr": kr.id }}>
														{duoi}
													</HangTraiCot>
												) : null}
											</Fragment>
										);
									})
								: null}
						</SimpleTable>
					</div>
				);
			})}
		</div>
	);
}
