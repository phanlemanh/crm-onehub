"use client";

import { Combobox } from "@crm/ui/components/combobox";
import {
	Empty,
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
	SimpleTable,
	SimpleTableCell,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { ViewSwitch } from "@crm/ui/components/view-switch";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useRef, useState } from "react";
import type { MucTieuMau } from "../ban-mau-okr/du-lieu";
import {
	giaTri,
	LoaiMucTieuNhan,
	NHAN_TU_TIN,
	TenNguoi,
	ThanhTienDo,
	TinhTrangKr,
	TuTin,
	tienDo,
	tinhTrang,
} from "../ban-mau-okr/phan-chung";
import {
	DON_VI,
	type DonViPhang,
	donVi,
	duongTrang,
	mucTieuCua,
	tienDoMucTieu,
} from "./du-lieu";

export type CachXem = "danh-sach" | "hop-tuan";
type Loc = "tat-ca" | "can-ban" | "chua-gop";

const CACH_XEM = [
	{ value: "danh-sach", label: "Danh sách" },
	{ value: "hop-tuan", label: "Họp tuần" },
];

const COT: SimpleTableColumn[] = [
	{ id: "ten", header: "Mục tiêu và KR" },
	{ id: "tien-do", header: "Tiến độ", width: "w-56" },
	{ id: "tinh-trang", header: "Tình trạng", width: "w-36" },
	{ id: "phu-trach", header: "Phụ trách", width: "w-48" },
];

const COT_HOP: SimpleTableColumn[] = [
	{ id: "ten", header: "KR đáng bàn" },
	{ id: "tien-do", header: "Tiến độ", width: "w-56" },
	{ id: "tu-tin", header: "Tự tin", width: "w-28" },
	{ id: "vi-sao", header: "Vì sao lên bàn", width: "w-56" },
];

function canBan(mt: MucTieuMau): boolean {
	return mt.kr.some(
		(k) =>
			k.tuTin === "thap" || tinhTrang(tienDo(k), mt.loai).tone !== "success",
	);
}

function chuaGop(dv: DonViPhang, mt: MucTieuMau): boolean {
	return dv.chaId !== null && mt.gopVao.length === 0;
}

function ChonDonVi({ dv, moSan }: { dv: DonViPhang; moSan: boolean }) {
	const router = useRouter();
	const daMo = useRef(false);
	const moMotLan = useCallback(
		(el: HTMLButtonElement | null) => {
			if (!moSan || !el || daMo.current) return;
			daMo.current = true;
			el.click();
		},
		[moSan],
	);
	return (
		<Combobox
			aria-label="Đơn vị"
			className="w-full sm:w-72"
			data-chon-don-vi
			empty="Không có đơn vị nào khớp."
			onValueChange={(id) => router.replace(duongTrang("ST-dh-don-vi", id))}
			options={DON_VI.map((d) => ({
				value: d.id,
				label: d.ten,
				hint: [
					d.duong.length > 0 ? d.duong.join(" › ") : "cả công ty",
					d.tt.mucTieu.length === 0 ? "chưa đặt" : null,
				]
					.filter((x) => x !== null)
					.join(" · "),
				keywords: d.duong,
			}))}
			ref={moMotLan}
			searchPlaceholder="Tìm đơn vị…"
			translate="no"
			value={dv.id}
		/>
	);
}

function DongDonVi({ dv }: { dv: DonViPhang }) {
	const t = dv.tt;
	return (
		<div
			className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground text-sm"
			data-dong-don-vi
		>
			{dv.truong ? (
				<span className="flex items-center gap-1.5">
					<span className="text-muted-foreground">Trưởng</span>
					<PersonAvatar name={dv.truong.ten} size="sm" />
					<span translate="no">{dv.truong.ten}</span>
				</span>
			) : (
				<StatusIndicator label="Chưa có trưởng" size="sm" tone="warning" />
			)}
			<span className="text-muted-foreground tabular-nums">
				{t.mucTieu.length} mục tiêu · {t.soKr} KR
				{t.tienDoTb === null ? "" : ` · trung bình ${t.tienDoTb}%`}
			</span>
			{dv.duong.length > 0 ? (
				<span className="text-muted-foreground" translate="no">
					Thuộc {dv.duong.join(" › ")}
				</span>
			) : null}
		</div>
	);
}

function BangDanhSach({ dv, ds }: { dv: DonViPhang; ds: MucTieuMau[] }) {
	return (
		<>
			<div className="hidden md:block">
				<SimpleTable columns={COT} surface="page">
					{ds.map((mt) => {
						const p = tienDoMucTieu(mt);
						return (
							<Fragment key={mt.id}>
								<SimpleTableRow data-muc-tieu={mt.id}>
									<SimpleTableCell>
										<span className="flex flex-col gap-1">
											<span className="flex flex-wrap items-center gap-2">
												<span className="font-medium" translate="no">
													{mt.ten}
												</span>
												<LoaiMucTieuNhan loai={mt.loai} />
											</span>
											<span
												className="text-muted-foreground text-xs"
												translate="no"
											>
												{mt.gopVao.length > 0
													? `Góp vào ${mt.gopVao
															.map((g) =>
																g.kr
																	? `${g.donVi} › ${g.kr}`
																	: `${g.donVi} › ${g.mucTieu}`,
															)
															.join(" · ")}`
													: chuaGop(dv, mt)
														? "Chưa góp vào mục tiêu nào"
														: "Mục tiêu cấp công ty"}
											</span>
										</span>
									</SimpleTableCell>
									<SimpleTableCell>
										<span className="flex items-center gap-2">
											<ThanhTienDo nhan={mt.ten} phanTram={p} />
											<span className="w-10 text-right text-xs tabular-nums">
												{p}%
											</span>
										</span>
									</SimpleTableCell>
									<SimpleTableCell>
										<TinhTrangKr loai={mt.loai} phanTram={p} size="sm" />
									</SimpleTableCell>
									<SimpleTableCell>
										<TenNguoi ten={mt.phuTrach.ten} />
									</SimpleTableCell>
								</SimpleTableRow>
								{mt.kr.map((k) => {
									const pk = tienDo(k);
									return (
										<SimpleTableRow data-kr={k.id} key={k.id} sub>
											<SimpleTableCell>
												<span translate="no">KR · {k.ten}</span>
											</SimpleTableCell>
											<SimpleTableCell>
												<span className="flex items-center gap-2">
													<ThanhTienDo
														kyVong={k.kieu === "moc" ? null : undefined}
														nhan={k.ten}
														phanTram={pk}
													/>
													<span className="w-24 shrink-0 text-right text-xs tabular-nums">
														{giaTri(k)}
													</span>
												</span>
											</SimpleTableCell>
											<SimpleTableCell>
												<TinhTrangKr
													laMoc={k.kieu === "moc"}
													loai={mt.loai}
													phanTram={pk}
													size="sm"
												/>
											</SimpleTableCell>
											<SimpleTableCell>
												<TenNguoi avatar={false} ten={k.phuTrach.ten} />
											</SimpleTableCell>
										</SimpleTableRow>
									);
								})}
							</Fragment>
						);
					})}
				</SimpleTable>
			</div>
			<div className="flex flex-col gap-2 md:hidden">
				{ds.map((mt) => {
					const p = tienDoMucTieu(mt);
					return (
						<Item data-muc-tieu={mt.id} key={mt.id} variant="outline">
							<ItemContent>
								<ItemTitle translate="no">{mt.ten}</ItemTitle>
								<ItemDescription>
									{mt.kr.length} KR · {p}% · phụ trách {mt.phuTrach.ten}
								</ItemDescription>
							</ItemContent>
							<ItemActions>
								<TinhTrangKr loai={mt.loai} phanTram={p} size="sm" />
							</ItemActions>
						</Item>
					);
				})}
			</div>
		</>
	);
}

function BangHopTuan({ ds }: { ds: MucTieuMau[] }) {
	const dong = ds.flatMap((mt) =>
		mt.kr
			.filter(
				(k) =>
					k.tuTin === "thap" ||
					tinhTrang(tienDo(k), mt.loai).tone !== "success" ||
					k.imNgay > 7,
			)
			.map((k) => ({ k, mt })),
	);
	if (dong.length === 0) {
		return (
			<Empty border="solid">
				<EmptyHeader>
					<EmptyTitle>Tuần này không có KR nào đáng bàn</EmptyTitle>
					<EmptyDescription>
						Mọi KR đều đúng nhịp, tự tin không tụt, và có cập nhật trong tuần.
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	}
	return (
		<SimpleTable columns={COT_HOP} surface="page">
			{dong.map(({ k, mt }) => {
				const pk = tienDo(k);
				const viSao = [
					k.tuTin === "thap" ? "tự tin thấp" : null,
					tinhTrang(pk, mt.loai).tone !== "success"
						? tinhTrang(pk, mt.loai).nhan.toLowerCase()
						: null,
					k.imNgay > 7 ? `im ${k.imNgay} ngày` : null,
				]
					.filter((x) => x !== null)
					.join(" · ");
				return (
					<SimpleTableRow data-kr={k.id} key={k.id}>
						<SimpleTableCell>
							<span className="flex flex-col gap-0.5">
								<span translate="no">{k.ten}</span>
								<span className="text-muted-foreground text-xs" translate="no">
									{mt.ten} · {k.phuTrach.ten}
								</span>
							</span>
						</SimpleTableCell>
						<SimpleTableCell>
							<span className="flex items-center gap-2">
								<ThanhTienDo nhan={k.ten} phanTram={pk} />
								<span className="w-24 shrink-0 text-right text-xs tabular-nums">
									{giaTri(k)}
								</span>
							</span>
						</SimpleTableCell>
						<SimpleTableCell>
							<TuTin coNhan={false} muc={k.tuTin} size="sm" />
						</SimpleTableCell>
						<SimpleTableCell>
							<span className="text-muted-foreground text-xs">
								{viSao || `tự tin ${NHAN_TU_TIN[k.tuTin].toLowerCase()}`}
							</span>
						</SimpleTableCell>
					</SimpleTableRow>
				);
			})}
		</SimpleTable>
	);
}

function DonViCon({ dv }: { dv: DonViPhang }) {
	if (dv.con.length === 0) return null;
	return (
		<section className="flex flex-col gap-3" data-don-vi-con>
			<SectionHeading>Đơn vị trực thuộc</SectionHeading>
			<div className="grid gap-2 md:grid-cols-2">
				{dv.con.map((id) => {
					const c = donVi(id);
					return (
						<Item asChild key={id} size="sm" variant="outline">
							<Link href={duongTrang("ST-dh-don-vi", id)}>
								<ItemContent>
									<ItemTitle translate="no">{c.ten}</ItemTitle>
									<ItemDescription>
										{c.tt.mucTieu.length === 0
											? "Chưa đặt OKR"
											: `${c.tt.mucTieu.length} mục tiêu · ${c.tt.soKr} KR · ${c.tt.tienDoTb}%`}
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

export function TrangDonVi({
	donViId,
	cachXem,
	moChon,
}: {
	donViId: string;
	cachXem: CachXem;
	moChon: boolean;
}) {
	const router = useRouter();
	const dv = donVi(donViId);
	const ds = mucTieuCua(dv.id);
	const [loc, setLoc] = useState<Loc>("tat-ca");
	const soCanBan = ds.filter(canBan).length;
	const soChuaGop = ds.filter((mt) => chuaGop(dv, mt)).length;
	const hien = ds.filter((mt) =>
		loc === "can-ban"
			? canBan(mt)
			: loc === "chua-gop"
				? chuaGop(dv, mt)
				: true,
	);

	return (
		<>
			<div
				className="flex flex-wrap items-center justify-between gap-2"
				data-hang-cong-cu
			>
				<ChonDonVi dv={dv} moSan={moChon} />
				{ds.length === 0 ? null : (
					<div className="flex flex-wrap items-center gap-2">
						<ToggleGroup
							aria-label="Lọc mục tiêu"
							onValueChange={(v) => {
								if (v === "tat-ca" || v === "can-ban" || v === "chua-gop")
									setLoc(v);
							}}
							size="sm"
							type="single"
							value={loc}
							variant="outline"
						>
							<ToggleGroupItem value="tat-ca">
								Tất cả{" "}
								<span className="text-muted-foreground tabular-nums">
									{ds.length}
								</span>
							</ToggleGroupItem>
							<ToggleGroupItem value="can-ban">
								Cần bàn{" "}
								<span className="text-muted-foreground tabular-nums">
									{soCanBan}
								</span>
							</ToggleGroupItem>
							<ToggleGroupItem value="chua-gop">
								Chưa góp vào đâu{" "}
								<span className="text-muted-foreground tabular-nums">
									{soChuaGop}
								</span>
							</ToggleGroupItem>
						</ToggleGroup>
						<ViewSwitch
							items={CACH_XEM}
							label="Cách xem"
							onValueChange={(v) =>
								router.replace(
									duongTrang(
										v === "hop-tuan" ? "ST-dh-hop-tuan" : "ST-dh-don-vi",
										dv.id,
									),
								)
							}
							value={cachXem}
						/>
					</div>
				)}
			</div>
			<div className="flex flex-col gap-2">
				{ds.length === 0 ? (
					<Empty border="solid" data-don-vi-trong>
						<EmptyHeader>
							<EmptyTitle>{dv.ten} chưa đặt OKR cho Quý 4 · 2026</EmptyTitle>
							<EmptyDescription>
								{dv.truong
									? `${dv.truong.ten} là trưởng đơn vị và đặt được mục tiêu bằng nút «Thêm mục tiêu» ở đầu trang.`
									: "Đơn vị chưa có trưởng nên chưa ai được giao đặt mục tiêu. Gán trưởng ở Cài đặt › Tổ chức, hoặc để đơn vị cấp trên đặt hộ."}
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : cachXem === "hop-tuan" ? (
					<BangHopTuan ds={hien} />
				) : (
					<BangDanhSach ds={hien} dv={dv} />
				)}
				<DongDonVi dv={dv} />
			</div>
			<DonViCon dv={dv} />
		</>
	);
}
