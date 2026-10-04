"use client";

import CheckmarkFilled from "@carbon/icons-react/es/CheckmarkFilled";
import CircleDash from "@carbon/icons-react/es/CircleDash";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Scrollspy } from "@crm/ui/components/reui/scrollspy";
import { SaveBar } from "@crm/ui/components/save-bar";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { Spinner } from "@crm/ui/components/spinner";
import { Textarea } from "@crm/ui/components/textarea";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import {
	KET_LUAN,
	KET_LUAN_CHON,
	type KetLuan,
	NOI_BAN_TRUOC,
	NOI_MOI,
	type NoiBanTruoc,
	noiTuSoCau,
	OKR_HOI_Y,
} from "@crm/validation/okr-hoi-y";
import { mucTieuInput } from "@crm/validation/okr-muc-tieu";
import { useMutation } from "@tanstack/react-query";
import { type RefObject, useId, useRef, useState } from "react";
import { toast } from "sonner";
import {
	type OkrHoiYMessages,
	okrHoiYMessages,
} from "@/lib/messages/okr-hoi-y";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { ChuNguoi, DoanChu, demSo, dien, ghep } from "./chu";
import { DaiMoc } from "./dai-moc";
import { BanVietTruocDaNiem } from "./khoi-ban-truoc";
import {
	DanhSachYChuaGom,
	MenuChuDe,
	moTaBangChung,
	YTrongChuDe,
} from "./khoi-gom";
import {
	type ChuDe,
	daKetLuan,
	dichThieu,
	HOI_Y_MAN,
	type HoiY,
	neoChuDe,
	soChon,
} from "./man-hoi-y";

function laKetLuan(v: string): v is KetLuan {
	return KET_LUAN.some((k) => k === v);
}

function laNoi(v: string): v is NoiBanTruoc {
	return NOI_BAN_TRUOC.some((k) => k === v);
}

type Nhap = {
	ketLuan: KetLuan | null;
	lyDo: string;
	cau: string;
	noi: NoiBanTruoc | null;
};

type LoiNhap = {
	ketLuan: string | null;
	lyDo: string | null;
	cau: string | null;
	noi: string | null;
};

function kiem(n: Nhap, boQua: boolean, t: OkrHoiYMessages): LoiNhap {
	const chon = n.ketLuan === KET_LUAN_CHON;
	const dai = n.lyDo.trim().length;
	const cauSai = chon && !mucTieuInput.shape.title.safeParse(n.cau).success;
	return {
		ketLuan: n.ketLuan === null ? t.ketLuan.loiKetLuan : null,
		lyDo:
			dai < OKR_HOI_Y.lyDo.min
				? dien(t.ketLuan.loiLyDoNgan, { min: OKR_HOI_Y.lyDo.min })
				: chon && dai > OKR_HOI_Y.ketLuan.lyDoChonMax
					? dien(t.ketLuan.loiLyDoChonDai, {
							max: OKR_HOI_Y.ketLuan.lyDoChonMax,
						})
					: null,
		cau: cauSai ? t.ketLuan.loiCau : null,
		noi: chon && !boQua && n.noi === null ? t.ketLuan.loiNoi : null,
	};
}

function TheKetLuan({ h, c }: { h: HoiY; c: ChuDe }) {
	const t = okrHoiYMessages(useLocale());
	const m = t.ketLuan;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const id = useId();
	const boQua = h.banTruoc?.boQua ?? false;
	const [nhap, setNhap] = useState<Nhap>({
		ketLuan: c.ketLuan,
		lyDo: c.lyDo,
		cau: c.cauMucTieu ?? "",
		noi: c.noiBanTruoc,
	});
	const [thu, setThu] = useState(false);
	const [moY, setMoY] = useState(false);
	const loi = kiem(nhap, boQua, t);
	const hien = (l: string | null) => (thu ? l : null);
	const chon = nhap.ketLuan === KET_LUAN_CHON;
	const khacDaLuu =
		nhap.ketLuan !== c.ketLuan ||
		nhap.lyDo.trim() !== c.lyDo ||
		(chon ? nhap.cau.trim() : "") !== (c.cauMucTieu ?? "") ||
		(chon && !boQua ? nhap.noi : null) !== c.noiBanTruoc;
	const luu = useMutation(
		trpc.okr.ketLuanChuDe.mutationOptions({
			onSuccess: async () => {
				toast.success(m.daLuu);
				await cache.hoiY();
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	return (
		<Card
			data-chu-de={c.id}
			data-ket-luan={c.ketLuan ?? "chua"}
			id={neoChuDe(c.id)}
			tabIndex={-1}
		>
			<CardHeader>
				<CardTitle translate="no">{c.ten}</CardTitle>
				<CardAction>
					{c.loai === "y-la" ? <Badge variant="outline">{m.yLa}</Badge> : null}
					<MenuChuDe c={c} />
				</CardAction>
			</CardHeader>
			<CardContent>
				<FieldGroup>
					<ItemDescription data-bang-chung>
						{moTaBangChung(c, t)}
					</ItemDescription>
					{c.bangChung.trich.length > 0 ? (
						<ItemGroup>
							{c.bangChung.trich.map((cau) => (
								<Item key={cau} size="xs" variant="muted">
									<ItemContent>
										<DoanChu>{`«${cau}»`}</DoanChu>
									</ItemContent>
								</Item>
							))}
						</ItemGroup>
					) : null}
					<Collapsible onOpenChange={setMoY} open={moY}>
						<CollapsibleTrigger asChild>
							<Button size="sm" type="button" variant="link">
								{moY ? t.gom.anY : dien(m.tatCaY, { n: c.y.length })}
							</Button>
						</CollapsibleTrigger>
						<CollapsibleContent>
							<YTrongChuDe c={c} h={h} />
						</CollapsibleContent>
					</Collapsible>
					<Field data-invalid={hien(loi.ketLuan) ? true : undefined}>
						<FieldLabel id={`${id}-ket-luan`}>{m.ketLuan}</FieldLabel>
						<ToggleGroup
							aria-labelledby={`${id}-ket-luan`}
							onValueChange={(v) => {
								if (laKetLuan(v)) setNhap({ ...nhap, ketLuan: v });
							}}
							size="sm"
							type="single"
							value={nhap.ketLuan ?? ""}
							variant="outline-check"
						>
							{KET_LUAN.map((k) => (
								<ToggleGroupItem key={k} value={k}>
									{m.gia[k]}
								</ToggleGroupItem>
							))}
						</ToggleGroup>
						{hien(loi.ketLuan) ? <FieldError>{loi.ketLuan}</FieldError> : null}
					</Field>
					<Field data-invalid={hien(loi.lyDo) ? true : undefined}>
						<FieldLabel htmlFor={`${id}-ly-do`}>{m.lyDo}</FieldLabel>
						<Textarea
							aria-invalid={hien(loi.lyDo) ? true : undefined}
							id={`${id}-ly-do`}
							maxLength={OKR_HOI_Y.lyDo.max}
							onChange={(e) => setNhap({ ...nhap, lyDo: e.target.value })}
							placeholder={m.lyDoGoiY}
							translate="no"
							value={nhap.lyDo}
						/>
						{hien(loi.lyDo) ? (
							<FieldError>{loi.lyDo}</FieldError>
						) : (
							<FieldDescription>
								{dien(m.lyDoDem, {
									n: nhap.lyDo.length,
									max: chon
										? OKR_HOI_Y.ketLuan.lyDoChonMax
										: OKR_HOI_Y.lyDo.max,
								})}
							</FieldDescription>
						)}
					</Field>
					{chon ? (
						<Field data-invalid={hien(loi.cau) ? true : undefined}>
							<FieldLabel htmlFor={`${id}-cau`}>{m.cauMucTieu}</FieldLabel>
							<Input
								aria-invalid={hien(loi.cau) ? true : undefined}
								id={`${id}-cau`}
								onChange={(e) => setNhap({ ...nhap, cau: e.target.value })}
								translate="no"
								value={nhap.cau}
							/>
							{hien(loi.cau) ? (
								<FieldError>{loi.cau}</FieldError>
							) : (
								<FieldDescription>{m.cauMucTieuMoTa}</FieldDescription>
							)}
						</Field>
					) : null}
					{chon && !boQua ? (
						<Field data-invalid={hien(loi.noi) ? true : undefined}>
							<FieldLabel htmlFor={`${id}-noi`}>{m.noi}</FieldLabel>
							<Select
								onValueChange={(v) => {
									if (laNoi(v)) setNhap({ ...nhap, noi: v });
								}}
								value={nhap.noi ?? ""}
							>
								<SelectTrigger
									aria-invalid={hien(loi.noi) ? true : undefined}
									id={`${id}-noi`}
								>
									<SelectValue placeholder={m.noiGoiY} />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{(h.banTruoc?.cau ?? []).map((cau, i) => {
											const ma = noiTuSoCau(i + 1);
											return ma ? (
												<SelectItem key={ma} value={ma}>
													{ghep(m.noiCau, {
														n: i + 1,
														chu: <ChuNguoi>{cau}</ChuNguoi>,
													})}
												</SelectItem>
											) : null;
										})}
										<SelectItem value={NOI_MOI}>{m.noiMoi}</SelectItem>
									</SelectGroup>
								</SelectContent>
							</Select>
							{hien(loi.noi) ? (
								<FieldError>{loi.noi}</FieldError>
							) : (
								<FieldDescription>{m.noiMoTa}</FieldDescription>
							)}
						</Field>
					) : null}
					<Field orientation="horizontal">
						<Button
							data-nut="luu-ket-luan"
							disabled={!khacDaLuu || luu.isPending}
							onClick={() => {
								setThu(true);
								if (
									nhap.ketLuan === null ||
									Object.values(kiem(nhap, boQua, t)).some((l) => l !== null)
								)
									return;
								luu.mutate({
									chuDeId: c.id,
									ketLuan: nhap.ketLuan,
									lyDo: nhap.lyDo.trim(),
									cauMucTieu: chon ? nhap.cau.trim() : "",
									noiBanTruoc: chon && !boQua ? nhap.noi : null,
								});
							}}
							type="button"
							variant="outline"
						>
							{luu.isPending ? <Spinner data-icon="inline-start" /> : null}
							{m.luu}
						</Button>
					</Field>
				</FieldGroup>
			</CardContent>
		</Card>
	);
}

function MucLuc({
	chuDe,
	vung,
}: {
	chuDe: ChuDe[];
	vung: RefObject<HTMLElement | null>;
}) {
	const m = okrHoiYMessages(useLocale()).ketLuan;
	const [dangDoc, setDangDoc] = useState<string | null>(
		chuDe[0] ? neoChuDe(chuDe[0].id) : null,
	);
	return (
		<nav
			aria-label={m.mucLuc}
			className="hidden min-w-0 lg:sticky lg:top-4 lg:col-span-3 lg:flex lg:flex-col lg:gap-3 lg:self-start"
			data-khoi="muc-luc"
		>
			<CardTitle>
				{dien(m.dem, {
					n: chuDe.filter(daKetLuan).length,
					m: chuDe.length,
				})}
			</CardTitle>
			<Scrollspy
				history={false}
				offset={HOI_Y_MAN.cuon.lechPx}
				onUpdate={setDangDoc}
				targetRef={vung}
				throttleTime={HOI_Y_MAN.cuon.nhipMs}
			>
				<ul className="flex flex-col gap-1">
					{chuDe.map((c) => {
						const da = daKetLuan(c);
						const neo = neoChuDe(c.id);
						const dangXem = dangDoc === neo;
						return (
							<li key={c.id}>
								<Button
									aria-current={dangXem ? "location" : undefined}
									className="w-full justify-start"
									data-muc-luc={c.id}
									data-scrollspy-anchor={neo}
									size="sm"
									type="button"
									variant={dangXem ? "secondary" : "ghost"}
								>
									<Icon
										data-icon="inline-start"
										icon={da ? CheckmarkFilled : CircleDash}
									/>
									<span className="min-w-0 truncate" translate="no">
										{c.ten}
									</span>
									<span className="sr-only">
										{da ? m.daKetLuan : m.chuaKetLuan}
									</span>
								</Button>
							</li>
						);
					})}
				</ul>
			</Scrollspy>
		</nav>
	);
}

function ThanhCongBo({ h, tenKy }: { h: HoiY; tenKy: string }) {
	const t = okrHoiYMessages(useLocale());
	const m = t.congBo;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const [hoi, setHoi] = useState(false);
	const chuDe = h.chuDe ?? [];
	const thieu = h.quyen.lyDoChuaCongBo;
	const so = soChon(chuDe);
	const tenCua = (id: string | null) =>
		chuDe.find((c) => c.id === id)?.ten ?? "";
	const congBo = useMutation(
		trpc.okr.congBo.mutationOptions({
			onSuccess: async (kq) => {
				setHoi(false);
				toast.success(demSo(m.xong.mot, m.xong.nhieu, kq.mucTieuIds.length));
				if (kq.canhBao) toast.warning(kq.canhBao);
				await cache.okr();
			},
			onError: async (error) => {
				setHoi(false);
				toast.error(error.message);
				await cache.hoiY();
			},
		}),
	);
	return (
		<>
			<SaveBar
				data-khoi="thanh-cong-bo"
				layout="checklist"
				reserveSpace
				description={thieu.length === 0 ? m.sanSangMoTa : undefined}
				items={
					thieu.length === 0
						? undefined
						: thieu.map((d) => ({
								id: `${d.ma}-${d.chuDeId ?? "chung"}`,
								href: `#${dichThieu(d)}`,
								label:
									d.chuDeId === null
										? dien(m.thieu[d.ma], { ten: "" })
										: ghep(m.thieu[d.ma], {
												ten: <ChuNguoi>{tenCua(d.chuDeId)}</ChuNguoi>,
											}),
							}))
				}
				open
				title={
					thieu.length === 0
						? demSo(m.sanSang.mot, m.sanSang.nhieu, so)
						: demSo(m.chuaDuoc.mot, m.chuaDuoc.nhieu, thieu.length)
				}
			>
				<Button
					disabled={thieu.length > 0 || !h.quyen.congBoDuoc || congBo.isPending}
					onClick={() => setHoi(true)}
					size="sm"
				>
					{m.nut}
				</Button>
			</SaveBar>
			<ConfirmDialog
				nut={m.nut}
				onConfirm={() => congBo.mutate({ hoiYId: h.hoiY.id })}
				onOpenChange={setHoi}
				open={hoi}
				pending={congBo.isPending}
				than={dien(m.hoiThan, { n: so })}
				thoi={m.chua}
				tieuDe={dien(m.hoiTieuDe, { ky: tenKy })}
				tone="default"
			/>
		</>
	);
}

export function KhoiKetLuan({
	h,
	bayGio,
	tenKy,
}: {
	h: HoiY;
	bayGio: number;
	tenKy: string;
}) {
	const m = okrHoiYMessages(useLocale()).ketLuan;
	const chuDe = h.chuDe ?? [];
	const vung = useRef<HTMLElement | null>(null);
	const neoVung = (el: HTMLDivElement | null) => {
		vung.current =
			el?.closest<HTMLElement>('[data-slot="page-shell-scroll"]') ?? null;
	};
	return (
		<div className="flex flex-col gap-6" data-khoi="ket-luan-man" ref={neoVung}>
			<DaiMoc bayGio={bayGio} h={h} />
			<Card id={HOI_Y_MAN.neo.ketLuan} tabIndex={-1}>
				<CardHeader>
					<CardTitle>{m.tieuDe}</CardTitle>
					<CardAction>
						<Badge data-khoi="dem-ket-luan" variant="outline">
							{dien(m.dem, {
								n: chuDe.filter(daKetLuan).length,
								m: chuDe.length,
							})}
						</Badge>
					</CardAction>
					<FieldDescription data-mo-ta>{m.moTa}</FieldDescription>
				</CardHeader>
			</Card>
			<DanhSachYChuaGom h={h} />
			<div className="grid gap-6 lg:grid-cols-12">
				<MucLuc chuDe={chuDe} vung={vung} />
				<div className="flex min-w-0 flex-col gap-6 lg:col-span-6">
					{chuDe.map((c) => (
						<TheKetLuan c={c} h={h} key={c.id} />
					))}
				</div>
				<div className="min-w-0 lg:sticky lg:top-4 lg:col-span-3 lg:self-start">
					<BanVietTruocDaNiem chuDe={chuDe} h={h} />
				</div>
			</div>
			<ThanhCongBo h={h} tenKy={tenKy} />
		</div>
	);
}
