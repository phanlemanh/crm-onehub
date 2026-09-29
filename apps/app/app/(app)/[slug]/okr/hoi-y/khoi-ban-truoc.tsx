"use client";

import Add from "@carbon/icons-react/es/Add";
import Subtract from "@carbon/icons-react/es/Subtract";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@crm/ui/components/input-group";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	chuanCau,
	KET_LUAN_CHON,
	niemPhongInput,
	noiTuSoCau,
	OKR_HOI_Y,
} from "@crm/validation/okr-hoi-y";
import { useMutation } from "@tanstack/react-query";
import { useId, useState } from "react";
import { toast } from "sonner";
import { okrHoiYMessages } from "@/lib/messages/okr-hoi-y";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { ChuNguoi, DoanChu, dien, ghep } from "./chu";
import { type ChuDe, HOI_Y_MAN, type HoiY } from "./man-hoi-y";

type CauNhap = { id: number; chu: string };

type HopHoi = "niem-phong" | "bo-qua" | null;

const cauHopLe = (chu: string) =>
	niemPhongInput.shape.cau.unwrap().element.safeParse(chu).success;

export function BanVietTruoc({ h }: { h: HoiY }) {
	const m = okrHoiYMessages(useLocale()).vietTruoc;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const id = useId();
	const [cau, setCau] = useState<CauNhap[]>(() =>
		Array.from({ length: OKR_HOI_Y.banTruoc.min }, (_, i) => ({
			id: i + 1,
			chu: "",
		})),
	);
	const [hoi, setHoi] = useState<HopHoi>(null);
	const [thu, setThu] = useState(false);
	const hopLe = cau.every((c) => cauHopLe(c.chu));
	const niem = useMutation(
		trpc.okr.niemPhong.mutationOptions({
			onSuccess: async () => {
				setHoi(null);
				toast.success(m.daNiemPhong);
				await cache.hoiY();
			},
			onError: (error) => toast.error(error.message),
		}),
	);
	const soMoi = Math.max(0, ...cau.map((c) => c.id)) + 1;

	return (
		<Card data-khoi="ban-viet-truoc" id={HOI_Y_MAN.neo.banVietTruoc}>
			<CardHeader>
				<CardTitle>{m.tieuDe}</CardTitle>
				<CardDescription>{m.moTa}</CardDescription>
			</CardHeader>
			<CardContent>
				<FieldGroup>
					{cau.map((c, i) => {
						const sai = thu && !cauHopLe(c.chu);
						return (
							<Field data-invalid={sai ? true : undefined} key={c.id}>
								<FieldLabel htmlFor={`${id}-${c.id}`}>
									{dien(m.cau, { n: i + 1 })}
								</FieldLabel>
								<InputGroup>
									<InputGroupInput
										aria-invalid={sai ? true : undefined}
										id={`${id}-${c.id}`}
										maxLength={OKR_HOI_Y.banTruoc.cau.max}
										onChange={(e) =>
											setCau((cu) =>
												cu.map((x) =>
													x.id === c.id ? { ...x, chu: e.target.value } : x,
												),
											)
										}
										placeholder={m.goiY}
										translate="no"
										value={c.chu}
									/>
									{cau.length > OKR_HOI_Y.banTruoc.min ? (
										<InputGroupAddon align="inline-end">
											<InputGroupButton
												aria-label={dien(m.boCau, { n: i + 1 })}
												onClick={() =>
													setCau((cu) => cu.filter((x) => x.id !== c.id))
												}
												size="icon-xs"
											>
												<Icon icon={Subtract} />
											</InputGroupButton>
										</InputGroupAddon>
									) : null}
								</InputGroup>
								{sai ? (
									<FieldError>
										{dien(m.loiCau, {
											n: i + 1,
											tu: OKR_HOI_Y.banTruoc.cau.min,
											den: OKR_HOI_Y.banTruoc.cau.max,
										})}
									</FieldError>
								) : null}
							</Field>
						);
					})}
					<Field orientation="horizontal">
						<Button
							disabled={cau.length >= OKR_HOI_Y.banTruoc.max}
							onClick={() => setCau((cu) => [...cu, { id: soMoi, chu: "" }])}
							size="sm"
							type="button"
							variant="ghost"
						>
							<Icon data-icon="inline-start" icon={Add} />
							{m.themCau}
						</Button>
					</Field>
					<FieldDescription>
						{dien(m.luat, {
							min: OKR_HOI_Y.banTruoc.min,
							max: OKR_HOI_Y.banTruoc.max,
							tu: OKR_HOI_Y.banTruoc.cau.min,
							den: OKR_HOI_Y.banTruoc.cau.max,
						})}
					</FieldDescription>
					<Field orientation="horizontal">
						<Button
							onClick={() => setHoi("bo-qua")}
							type="button"
							variant="link"
						>
							{m.khongViet}
						</Button>
						<Button
							onClick={() => {
								setThu(true);
								if (hopLe) setHoi("niem-phong");
							}}
							type="button"
						>
							{m.niemPhong}
						</Button>
					</Field>
				</FieldGroup>
			</CardContent>
			<ConfirmDialog
				nut={m.niemPhong}
				onConfirm={() =>
					niem.mutate({ hoiYId: h.hoiY.id, cau: cau.map((c) => c.chu.trim()) })
				}
				onOpenChange={(mo) => {
					if (!mo) setHoi(null);
				}}
				open={hoi === "niem-phong"}
				pending={niem.isPending}
				than={dien(m.hoiThan, { n: cau.length })}
				thoi={m.vietTiep}
				tieuDe={dien(m.hoiTieuDe, { n: cau.length })}
				tone="default"
			/>
			<ConfirmDialog
				nut={m.khongViet}
				onConfirm={() => niem.mutate({ hoiYId: h.hoiY.id, boQua: true })}
				onOpenChange={(mo) => {
					if (!mo) setHoi(null);
				}}
				open={hoi === "bo-qua"}
				pending={niem.isPending}
				than={m.boQuaThan}
				thoi={m.quayLai}
				tieuDe={m.boQuaTieuDe}
				tone="default"
			/>
		</Card>
	);
}

type NhanNoi = "giu" | "doi" | "bo";

type DanhGiaCau = { nhan: NhanNoi; noi: ChuDe | null };

function danhGia(so: number, cau: string, chuDe: ChuDe[]): DanhGiaCau {
	const ma = noiTuSoCau(so);
	const noi =
		chuDe.find((c) => c.ketLuan === KET_LUAN_CHON && c.noiBanTruoc === ma) ??
		null;
	if (!noi) return { nhan: "bo", noi };
	return {
		nhan: chuanCau(noi.cauMucTieu ?? "") === chuanCau(cau) ? "giu" : "doi",
		noi,
	};
}

export function BanVietTruocDaNiem({
	h,
	chuDe,
}: {
	h: HoiY;
	chuDe: ChuDe[] | null;
}) {
	const t = okrHoiYMessages(useLocale());
	const m = t.vietTruoc;
	const ban = h.banTruoc;
	if (!ban) return null;
	return (
		<Card data-khoi="ban-viet-truoc-cua-ban">
			<CardHeader>
				<CardTitle>{m.cuaBan}</CardTitle>
				<CardDescription>{m.cuaBanMoTa}</CardDescription>
			</CardHeader>
			<CardContent>
				{ban.boQua ? (
					<ItemDescription>{m.daBoQua}</ItemDescription>
				) : (
					<ItemGroup>
						{ban.cau.map((cau, i) => {
							const so = i + 1;
							const dg = chuDe ? danhGia(so, cau, chuDe) : null;
							return (
								<Item data-cau={so} key={so} size="xs">
									<ItemContent>
										<DoanChu>{`${so}. ${cau}`}</DoanChu>
										{dg ? (
											<ItemDescription data-noi={dg.nhan}>
												{dg.noi
													? ghep(m.noi, {
															nhan: t.ketQua.nhan[dg.nhan],
															ten: <ChuNguoi>{dg.noi.ten}</ChuNguoi>,
														})
													: m.chuaNoi}
											</ItemDescription>
										) : null}
									</ItemContent>
								</Item>
							);
						})}
					</ItemGroup>
				)}
			</CardContent>
		</Card>
	);
}
