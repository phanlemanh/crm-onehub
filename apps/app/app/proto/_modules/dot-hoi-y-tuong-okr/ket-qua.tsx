"use client";

import Checkmark from "@carbon/icons-react/es/Checkmark";
import CheckmarkFilled from "@carbon/icons-react/es/CheckmarkFilled";
import Launch from "@carbon/icons-react/es/Launch";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { FieldDescription } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
} from "@crm/ui/components/item";
import { type ReactNode, useState } from "react";
import {
	BAN_VIET_TRUOC,
	CHU_DE_GOM,
	type ChuDeMau,
	HANH_TRINH_Y_CUA_TOI,
	HOI_Y,
	KET_LUAN_LUC,
	Y_CUA_TOI,
	Y_LA,
	Y_RUT_GON,
} from "./du-lieu";
import {
	apBoSung,
	DaiPha,
	danhGiaCau,
	LoiNguoiNoi,
	NHAN_CAU,
	NhanKetLuan,
	VanBan,
} from "./khung";

export type HinhKetQua = "chua-hieu" | "da-hieu";

const CHU_DE_CONG_BO: ChuDeMau[] = [...CHU_DE_GOM, Y_LA].map(apBoSung);

function LyDoNguyenVan({ lyDo }: { lyDo: string }) {
	return (
		<LoiNguoiNoi loi={lyDo} nguoi={HOI_Y.nguoiChon.ten} vai="người chọn" />
	);
}

function XemNhap({ ten }: { ten: string }) {
	return (
		<Button asChild size="sm" variant="link">
			<a aria-label={`Xem mục tiêu nháp «${ten}»`} href="#muc-tieu-nhap">
				Xem mục tiêu nháp
				<Icon data-icon="inline-end" icon={Launch} />
			</a>
		</Button>
	);
}

type BuocHanhTrinh = {
	khoa: string;
	tieuDe: ReactNode;
	luc: string;
	than?: ReactNode;
};

function HanhTrinh({ buoc }: { buoc: BuocHanhTrinh[] }) {
	return (
		<ol
			aria-label="Ý này đã đi qua"
			className="flex flex-col pt-2"
			data-khoi="hanh-trinh"
		>
			{buoc.map((b, i) => {
				const cuoi = i === buoc.length - 1;
				return (
					<li className="flex gap-3" data-buoc={b.khoa} key={b.khoa}>
						<span className="flex flex-col items-center gap-1">
							<Icon icon={CheckmarkFilled} />
							{cuoi ? null : (
								<span
									aria-hidden="true"
									className="w-0 flex-1 border-foreground border-l"
								/>
							)}
						</span>
						<div
							className={
								cuoi
									? "flex min-w-0 flex-1 flex-col gap-1"
									: "flex min-w-0 flex-1 flex-col gap-1 pb-4"
							}
						>
							<span className="text-sm">{b.tieuDe}</span>
							<ItemDescription>
								{b.luc}
								<span className="sr-only">, đã xong</span>
							</ItemDescription>
							{b.than}
						</div>
					</li>
				);
			})}
		</ol>
	);
}

function YCuaBanKetQua({ hinh }: { hinh: HinhKetQua }) {
	const [daHieu, setDaHieu] = useState(hinh === "da-hieu");

	return (
		<Card data-khoi="y-cua-ban-ket-qua">
			<CardHeader>
				<CardTitle>Ý của bạn đi đâu</CardTitle>
				<CardDescription>
					<span translate="no">{HOI_Y.nguoiChon.ten}</span> công bố lúc{" "}
					{HOI_Y.congBoLuc}.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ItemGroup>
					{Y_CUA_TOI.map((y) => {
						const c = CHU_DE_CONG_BO.find((x) => x.yIds.includes(y.id));
						const ht = HANH_TRINH_Y_CUA_TOI.find((h) => h.yId === y.id);
						const buoc: BuocHanhTrinh[] = [
							{ khoa: "gop", tieuDe: "Bạn góp", luc: ht?.gopLuc ?? "" },
							...(c
								? [
										{
											khoa: "vao-chu-de",
											tieuDe: (
												<>
													Vào chủ đề «<span translate="no">{c.ten}</span>»
												</>
											),
											luc: ht?.vaoChuDeLuc ?? "",
										},
									]
								: []),
							...(c?.ketLuan
								? [
										{
											khoa: "ket-luan",
											tieuDe: (
												<span className="flex flex-wrap items-center gap-2">
													<span>
														<span translate="no">{HOI_Y.nguoiChon.ten}</span>{" "}
														kết luận:
													</span>
													<NhanKetLuan ketLuan={c.ketLuan} />
												</span>
											),
											luc: KET_LUAN_LUC,
											than: <LyDoNguyenVan lyDo={c.lyDo} />,
										},
									]
								: []),
							...(c?.ketLuan === "chon"
								? [
										{
											khoa: "muc-tieu-nhap",
											tieuDe: "Thành mục tiêu nháp",
											luc: KET_LUAN_LUC,
											than: (
												<div>
													<VanBan>{c.cauMucTieu}</VanBan>
													<XemNhap ten={c.cauMucTieu} />
												</div>
											),
										},
									]
								: []),
						];
						return (
							<Item data-y={y.id} key={y.id} variant="outline">
								<ItemContent>
									<VanBan>{y.noiDung}</VanBan>
									<HanhTrinh buoc={buoc} />
								</ItemContent>
							</Item>
						);
					})}
				</ItemGroup>
				<CardFooter>
					{daHieu ? (
						<FieldDescription data-khoi="da-hieu">
							<Icon data-icon="inline-start" icon={Checkmark} /> Bạn đã xác nhận
							hiểu lúc {HOI_Y.daHieuLuc}.
						</FieldDescription>
					) : (
						<>
							<Button data-nut="hieu-vi-sao" onClick={() => setDaHieu(true)}>
								Tôi hiểu vì sao
							</Button>
							<FieldDescription>
								Chỉ để <span translate="no">{HOI_Y.nguoiChon.ten}</span> biết lý
								do đã tới được bạn. Bấm một lần.
							</FieldDescription>
						</>
					)}
				</CardFooter>
			</CardContent>
		</Card>
	);
}

function VietTruocRoiChon() {
	const chonMoi = CHU_DE_CONG_BO.filter(
		(c) => c.ketLuan === "chon" && c.noiBanTruoc === "moi",
	);

	return (
		<Card data-khoi="viet-truoc-roi-chon">
			<CardHeader>
				<CardTitle>
					<span translate="no">{HOI_Y.nguoiChon.ten}</span> viết trước, rồi chọn
				</CardTitle>
				<CardDescription>
					<span translate="no">{HOI_Y.nguoiChon.ten}</span> niêm phong{" "}
					{BAN_VIET_TRUOC.length} câu lúc {HOI_Y.niemPhongLuc}, trước khi đọc ý
					nào. Sau khi đọc ý của mọi người: câu nào giữ nguyên, đổi, bỏ, và mục
					tiêu nào thêm.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ItemGroup>
					{BAN_VIET_TRUOC.map((b) => {
						const { nhan, noi } = danhGiaCau(b.so, b.cau, CHU_DE_CONG_BO);
						return (
							<Item data-cau={b.so} key={b.so} variant="outline">
								<ItemContent>
									{nhan === "doi" && noi ? (
										<>
											<VanBan>{noi.cauMucTieu}</VanBan>
											<ItemDescription>
												Viết trước: <del translate="no">{b.cau}</del>
											</ItemDescription>
										</>
									) : (
										<VanBan>{b.cau}</VanBan>
									)}
									{nhan === "bo" ? (
										<ItemDescription>
											Không chủ đề chọn nào nối tới câu này.
										</ItemDescription>
									) : null}
								</ItemContent>
								<ItemActions>
									<Badge
										data-giu-bo={nhan}
										variant={nhan === "bo" ? "outline" : "secondary"}
									>
										{NHAN_CAU[nhan]}
									</Badge>
								</ItemActions>
								{noi ? (
									<div className="w-full">
										<XemNhap ten={noi.cauMucTieu} />
									</div>
								) : null}
							</Item>
						);
					})}
					{chonMoi.map((c) => (
						<Item data-chu-de={c.id} key={c.id} variant="outline">
							<ItemContent>
								<VanBan>{c.cauMucTieu}</VanBan>
								<ItemDescription>
									Từ chủ đề «<span translate="no">{c.ten}</span>» — không có
									trong bản viết trước.
								</ItemDescription>
							</ItemContent>
							<ItemActions>
								<Badge data-giu-bo="them" variant="secondary">
									Thêm
								</Badge>
							</ItemActions>
							<div className="w-full">
								<XemNhap ten={c.cauMucTieu} />
							</div>
						</Item>
					))}
				</ItemGroup>
			</CardContent>
		</Card>
	);
}

function KhoY() {
	const deSau = CHU_DE_CONG_BO.filter((c) => c.ketLuan === "de-sau");

	return (
		<Card data-khoi="kho-y">
			<CardHeader>
				<CardTitle>Kho ý — để sau</CardTitle>
				<CardDescription>
					Chủ đề chưa làm năm nay nhưng chưa bỏ. Ai cũng đọc được, không kèm tên
					người góp.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ItemGroup>
					{deSau.map((c) => (
						<Item data-chu-de={c.id} key={c.id} variant="outline">
							<ItemContent>
								<VanBan>{c.ten}</VanBan>
								<LyDoNguyenVan lyDo={c.lyDo} />
								{c.yIds.map((id) => {
									const y = Y_RUT_GON.get(id);
									return y ? (
										<ItemDescription key={id}>
											Ý: <span translate="no">{y.noiDung}</span>
										</ItemDescription>
									) : null;
								})}
							</ItemContent>
						</Item>
					))}
				</ItemGroup>
			</CardContent>
		</Card>
	);
}

export function KetQuaMan({ hinh }: { hinh: HinhKetQua }) {
	return (
		<div className="flex flex-col gap-6" data-hinh-ket-qua={hinh}>
			<DaiPha pha="da-cong-bo" />
			<YCuaBanKetQua hinh={hinh} />
			<VietTruocRoiChon />
			<KhoY />
		</div>
	);
}
