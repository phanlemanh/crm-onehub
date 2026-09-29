"use client";

import Checkmark from "@carbon/icons-react/es/Checkmark";
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
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Timeline,
	TimelineDate,
	TimelineHeader,
	TimelineItem,
	TimelineSeparator,
	TimelineTitle,
} from "@crm/ui/components/reui/timeline";
import {
	KET_LUAN_CHON,
	type KetLuan,
	NOI_MOI,
	noiTuSoCau,
} from "@crm/validation/okr-hoi-y";
import { useMutation } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import {
	type OkrHoiYMessages,
	okrHoiYMessages,
} from "@/lib/messages/okr-hoi-y";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { ChuNguoi, DoanChu, ghep } from "./chu";
import { DaiMoc, DauMoc } from "./dai-moc";
import { type HoiY, lucVN, type YCuaToi } from "./man-hoi-y";

function NhanKetLuan({ ketLuan }: { ketLuan: KetLuan }) {
	const m = okrHoiYMessages(useLocale()).ketLuan;
	return (
		<Badge
			data-ket-luan={ketLuan}
			variant={ketLuan === KET_LUAN_CHON ? "secondary" : "outline"}
		>
			{m.gia[ketLuan]}
		</Badge>
	);
}

function XemNhap({ objectiveId }: { objectiveId: string | null }) {
	const m = okrHoiYMessages(useLocale()).ketQua;
	const mo = useOpenRecord();
	if (!objectiveId) return null;
	return (
		<Button
			data-mo-muc-tieu={objectiveId}
			onClick={() => mo({ kind: "objective", id: objectiveId })}
			size="sm"
			type="button"
			variant="link"
		>
			{m.xemNhap}
			<Icon data-icon="inline-end" icon={Launch} />
		</Button>
	);
}

function LoiNguoiChon({ h, loi }: { h: HoiY; loi: string }) {
	const m = okrHoiYMessages(useLocale()).ketQua;
	return (
		<Item data-khoi="ly-do" size="sm" variant="muted">
			<ItemContent>
				<DoanChu>{loi}</DoanChu>
				<ItemDescription>
					<ChuNguoi>{h.nguoiChon.name}</ChuNguoi> · {m.vaiNguoiChon}
				</ItemDescription>
			</ItemContent>
		</Item>
	);
}

type Buoc = {
	khoa: string;
	tieuDe: ReactNode;
	luc: string | null;
	than?: ReactNode;
};

function HanhTrinh({ buoc }: { buoc: Buoc[] }) {
	const locale = useLocale();
	const m = okrHoiYMessages(locale).ketQua;
	return (
		<Timeline
			aria-label={m.hanhTrinh}
			data-khoi="hanh-trinh"
			role="list"
			value={buoc.length}
		>
			{buoc.map((b, i) => (
				<TimelineItem
					data-buoc={b.khoa}
					key={b.khoa}
					role="listitem"
					step={i + 1}
				>
					<TimelineHeader>
						<TimelineSeparator />
						{b.luc ? (
							<TimelineDate dateTime={b.luc}>
								{lucVN(b.luc, locale)}
							</TimelineDate>
						) : null}
						<TimelineTitle>
							{b.tieuDe}
							<span className="sr-only">{m.daXong}</span>
						</TimelineTitle>
						<DauMoc tt="qua" />
					</TimelineHeader>
					{b.than}
				</TimelineItem>
			))}
		</Timeline>
	);
}

function buocCua(h: HoiY, y: YCuaToi, m: OkrHoiYMessages): Buoc[] {
	const cauMucTieu =
		h.chuDe?.find((c) => c.id === y.chuDe?.id)?.cauMucTieu ?? null;
	const buoc: Buoc[] = [
		{ khoa: "gop", tieuDe: m.ketQua.gop, luc: y.hanhTrinh.gopLuc },
	];
	if (y.chuDe) {
		buoc.push({
			khoa: "vao-chu-de",
			tieuDe: ghep(m.ketQua.vaoChuDe, {
				ten: <ChuNguoi>{y.chuDe.ten}</ChuNguoi>,
			}),
			luc: y.hanhTrinh.vaoChuDeLuc,
		});
	}
	if (y.ketLuan) {
		buoc.push({
			khoa: "ket-luan",
			tieuDe: (
				<>
					{ghep(m.ketQua.ketLuanCua, {
						ten: <ChuNguoi>{h.nguoiChon.name}</ChuNguoi>,
					})}{" "}
					<NhanKetLuan ketLuan={y.ketLuan} />
				</>
			),
			luc: y.hanhTrinh.ketLuanLuc,
			than: y.lyDo ? <LoiNguoiChon h={h} loi={y.lyDo} /> : undefined,
		});
	}
	if (y.ketLuan === KET_LUAN_CHON) {
		buoc.push({
			khoa: "muc-tieu-nhap",
			tieuDe: m.ketQua.thanhNhap,
			luc: y.hanhTrinh.ketLuanLuc,
			than: (
				<div className="flex flex-col items-start gap-1">
					{cauMucTieu ? <DoanChu>{cauMucTieu}</DoanChu> : null}
					<XemNhap objectiveId={y.objectiveId} />
				</div>
			),
		});
	}
	return buoc;
}

function YCuaBanKetQua({ h }: { h: HoiY }) {
	const locale = useLocale();
	const t = okrHoiYMessages(locale);
	const m = t.ketQua;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const hieu = useMutation(
		trpc.okr.hieuViSao.mutationOptions({
			onSuccess: () => cache.hoiY(),
			onError: (error) => toast.error(error.message),
		}),
	);
	return (
		<Card data-khoi="y-cua-ban-ket-qua">
			<CardHeader>
				<CardTitle>{m.cuaBan}</CardTitle>
				<CardDescription>
					{ghep(m.cuaBanMoTa, {
						ten: <ChuNguoi>{h.nguoiChon.name}</ChuNguoi>,
						luc: h.hoiY.congBoLuc ? lucVN(h.hoiY.congBoLuc, locale) : "",
					})}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ItemGroup>
					{h.cuaToi.y.map((y) => (
						<Item data-y={y.id} key={y.id} variant="outline">
							<ItemContent>
								<DoanChu>{y.noiDung}</DoanChu>
								{y.chuDe ? null : (
									<ItemDescription>{m.chuaVao}</ItemDescription>
								)}
								<HanhTrinh buoc={buocCua(h, y, t)} />
							</ItemContent>
						</Item>
					))}
				</ItemGroup>
			</CardContent>
			<CardFooter>
				{h.cuaToi.daHieu ? (
					<FieldDescription data-khoi="da-hieu">
						<Icon data-icon="inline-start" icon={Checkmark} /> {m.daHieu}
					</FieldDescription>
				) : (
					<div className="flex flex-col items-start gap-2">
						<Button
							data-nut="hieu-vi-sao"
							disabled={hieu.isPending}
							onClick={() => hieu.mutate({ hoiYId: h.hoiY.id })}
						>
							{m.hieu}
						</Button>
						<FieldDescription>
							{ghep(m.hieuMoTa, {
								ten: <ChuNguoi>{h.nguoiChon.name}</ChuNguoi>,
							})}
						</FieldDescription>
					</div>
				)}
			</CardFooter>
		</Card>
	);
}

function VietTruocRoiChon({ h }: { h: HoiY }) {
	const m = okrHoiYMessages(useLocale()).ketQua;
	const kq = h.ketQua;
	if (!kq) return null;
	const cau = h.banTruoc?.cau ?? [];
	const them = kq.chon.filter((c) => kq.boQua || c.noiBanTruoc === NOI_MOI);
	return (
		<Card data-khoi="viet-truoc-roi-chon">
			<CardHeader>
				<CardTitle>
					{ghep(m.vietTruoc, { ten: <ChuNguoi>{kq.vietBoi}</ChuNguoi> })}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<FieldDescription>
					{kq.boQua
						? ghep(m.khongVietTruoc, { ten: <ChuNguoi>{kq.vietBoi}</ChuNguoi> })
						: ghep(m.vietTruocMoTa, {
								ten: <ChuNguoi>{kq.vietBoi}</ChuNguoi>,
								n: cau.length,
							})}
				</FieldDescription>
				<ItemGroup>
					{kq.boQua
						? null
						: cau.map((chu, i) => {
								const so = i + 1;
								const nhan = kq.cau[i] ?? "bo";
								const noi = kq.chon.find(
									(c) => c.noiBanTruoc === noiTuSoCau(so),
								);
								return (
									<Item data-cau={so} key={so} variant="outline">
										<ItemContent>
											{nhan === "doi" && noi ? (
												<>
													<DoanChu>{noi.cauMucTieu}</DoanChu>
													<ItemDescription>
														{ghep(m.vietTruocCu, {
															chu: <del translate="no">{chu}</del>,
														})}
													</ItemDescription>
												</>
											) : (
												<DoanChu>{chu}</DoanChu>
											)}
											{nhan === "bo" ? (
												<ItemDescription>{m.khongNoi}</ItemDescription>
											) : null}
											{noi ? <XemNhap objectiveId={noi.objectiveId} /> : null}
										</ItemContent>
										<ItemActions>
											<Badge
												data-giu-bo={nhan}
												variant={nhan === "bo" ? "outline" : "secondary"}
											>
												{m.nhan[nhan]}
											</Badge>
										</ItemActions>
									</Item>
								);
							})}
					{them.map((c) => (
						<Item data-chu-de={c.chuDeId} key={c.chuDeId} variant="outline">
							<ItemContent>
								<DoanChu>{c.cauMucTieu}</DoanChu>
								<ItemDescription>
									{ghep(m.tuChuDe, { ten: <ChuNguoi>{c.ten}</ChuNguoi> })}
								</ItemDescription>
								<XemNhap objectiveId={c.objectiveId} />
							</ItemContent>
							<ItemActions>
								<Badge data-giu-bo="them" variant="secondary">
									{m.nhan.them}
								</Badge>
							</ItemActions>
						</Item>
					))}
				</ItemGroup>
			</CardContent>
		</Card>
	);
}

function KhoY({ h }: { h: HoiY }) {
	const m = okrHoiYMessages(useLocale()).ketQua;
	const deSau = (h.chuDe ?? []).filter((c) => c.ketLuan === "de-sau");
	return (
		<Card data-khoi="kho-y">
			<CardHeader>
				<CardTitle>{m.khoY}</CardTitle>
			</CardHeader>
			<CardContent>
				<FieldDescription>{m.khoYMoTa}</FieldDescription>
				{deSau.length === 0 ? (
					<FieldDescription>{m.khoYRong}</FieldDescription>
				) : (
					<ItemGroup>
						{deSau.map((c) => (
							<Item data-chu-de={c.id} key={c.id} variant="outline">
								<ItemContent>
									<DoanChu>{c.ten}</DoanChu>
									<LoiNguoiChon h={h} loi={c.lyDo} />
									{c.y.map((y) => (
										<ItemDescription key={y.id}>
											{ghep(m.yTrongKho, {
												chu: <ChuNguoi>{y.noiDung}</ChuNguoi>,
											})}
										</ItemDescription>
									))}
								</ItemContent>
							</Item>
						))}
					</ItemGroup>
				)}
			</CardContent>
		</Card>
	);
}

export function KhoiKetQua({ h, bayGio }: { h: HoiY; bayGio: number }) {
	return (
		<div className="flex flex-col gap-6" data-khoi="ket-qua">
			<DaiMoc bayGio={bayGio} h={h} />
			{h.cuaToi.y.length > 0 ? <YCuaBanKetQua h={h} /> : null}
			<VietTruocRoiChon h={h} />
			<KhoY h={h} />
		</div>
	);
}
