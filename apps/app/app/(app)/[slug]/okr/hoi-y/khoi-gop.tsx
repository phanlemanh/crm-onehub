"use client";

import Edit from "@carbon/icons-react/es/Edit";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import TrashCan from "@carbon/icons-react/es/TrashCan";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import {
	Card,
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
import { StatGroup } from "@crm/ui/components/dashboard";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@crm/ui/components/dropdown-menu";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { HangHanhDongBamDay } from "@crm/ui/components/hang-hanh-dong-bam-day";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { StatCard } from "@crm/ui/components/stat-card";
import { Textarea } from "@crm/ui/components/textarea";
import { gopYInput, OKR_HOI_Y } from "@crm/validation/okr-hoi-y";
import { useMutation } from "@tanstack/react-query";
import {
	type FormEvent,
	type ReactNode,
	type RefObject,
	useId,
	useRef,
	useState,
} from "react";
import { flushSync } from "react-dom";
import { toast } from "sonner";
import {
	type OkrHoiYMessages,
	okrHoiYMessages,
} from "@/lib/messages/okr-hoi-y";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { ChuNguoi, DoanChu, demSo, dien, ghep } from "./chu";
import type { HoiY, YCuaToi } from "./man-hoi-y";

type NoiDungY = { noiDung: string; viSao: string; doBangGi: string };

const Y_TRONG: NoiDungY = { noiDung: "", viSao: "", doBangGi: "" };

function LoiMo({ h }: { h: HoiY }) {
	const m = okrHoiYMessages(useLocale()).moDau;
	const [mo, setMo] = useState(false);
	return (
		<div className="flex flex-col gap-3 max-sm:order-1" data-khoi="loi-mo">
			{h.hoiY.loiMo ? (
				<Collapsible onOpenChange={setMo} open={mo}>
					{mo ? null : (
						<p className="line-clamp-3 text-sm wrap-anywhere" translate="no">
							{h.hoiY.loiMo}
						</p>
					)}
					<CollapsibleContent>
						<DoanChu>{h.hoiY.loiMo}</DoanChu>
					</CollapsibleContent>
					<div className="flex flex-wrap items-center gap-x-2">
						<ItemDescription>
							{ghep(m.loiMoCua, {
								ten: <ChuNguoi>{h.nguoiChon.name}</ChuNguoi>,
							})}
						</ItemDescription>
						<CollapsibleTrigger asChild>
							<Button size="xs" variant="link">
								{mo ? m.thuGon : m.docThem}
							</Button>
						</CollapsibleTrigger>
					</div>
				</Collapsible>
			) : null}
			<StatGroup aria-label={m.conSo} data-khoi="the-con-so" role="group">
				{h.hoiY.soLieu.map((s) => (
					<StatCard
						delta={
							s.ghiChu ? { value: s.ghiChu, direction: "neutral" } : undefined
						}
						key={`${s.nhan}-${s.giaTri}`}
						label={s.nhan}
						translate="no"
						value={s.giaTri}
					/>
				))}
			</StatGroup>
		</div>
	);
}

export function KhoiMoDau({
	h,
	ghiChu,
	children,
}: {
	h: HoiY;
	ghiChu: string;
	children?: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-3" data-khoi="mo-dau">
			<Card>
				<CardHeader data-khoi="cau-hoi">
					<CardTitle translate="no">{h.hoiY.cauHoi}</CardTitle>
					<FieldDescription data-mo-ta>{ghiChu}</FieldDescription>
				</CardHeader>
			</Card>
			<LoiMo h={h} />
			{children}
		</div>
	);
}

function TruongY({
	gia,
	onDoi,
	loi,
	khoiY,
	oY,
}: {
	gia: NoiDungY;
	onDoi: (moi: NoiDungY) => void;
	loi: string | null;
	khoiY?: RefObject<HTMLDivElement | null>;
	oY?: RefObject<HTMLTextAreaElement | null>;
}) {
	const m = okrHoiYMessages(useLocale()).gop;
	const id = useId();
	return (
		<>
			<Field data-invalid={loi ? true : undefined} ref={khoiY}>
				<FieldLabel htmlFor={`${id}-y`}>{m.y}</FieldLabel>
				<Textarea
					aria-invalid={loi ? true : undefined}
					id={`${id}-y`}
					ref={oY}
					maxLength={OKR_HOI_Y.noiDung.max}
					onChange={(e) => onDoi({ ...gia, noiDung: e.target.value })}
					placeholder={m.yGoiY}
					translate="no"
					value={gia.noiDung}
				/>
				{loi ? (
					<FieldError>{loi}</FieldError>
				) : (
					<FieldDescription>
						{dien(m.kyTuItNhat, {
							n: gia.noiDung.length,
							max: OKR_HOI_Y.noiDung.max,
							min: OKR_HOI_Y.noiDung.min,
						})}
					</FieldDescription>
				)}
			</Field>
			<Field>
				<FieldLabel htmlFor={`${id}-vi-sao`}>{m.viSao}</FieldLabel>
				<Textarea
					id={`${id}-vi-sao`}
					maxLength={OKR_HOI_Y.viSao.max}
					onChange={(e) => onDoi({ ...gia, viSao: e.target.value })}
					translate="no"
					value={gia.viSao}
				/>
				{gia.viSao.length > 0 ? (
					<FieldDescription>
						{dien(m.kyTu, { n: gia.viSao.length, max: OKR_HOI_Y.viSao.max })}
					</FieldDescription>
				) : null}
			</Field>
			<Field>
				<FieldLabel htmlFor={`${id}-do-bang`}>{m.doBangGi}</FieldLabel>
				<Input
					id={`${id}-do-bang`}
					maxLength={OKR_HOI_Y.doBangGi.max}
					onChange={(e) => onDoi({ ...gia, doBangGi: e.target.value })}
					translate="no"
					value={gia.doBangGi}
				/>
				{gia.doBangGi.length > 0 ? (
					<FieldDescription>
						{dien(m.kyTu, {
							n: gia.doBangGi.length,
							max: OKR_HOI_Y.doBangGi.max,
						})}
					</FieldDescription>
				) : null}
			</Field>
		</>
	);
}

function loiNoiDung(noiDung: string, t: OkrHoiYMessages): string | null {
	if (gopYInput.shape.noiDung.safeParse(noiDung).success) return null;
	return dien(t.gop.loiNgan, {
		min: OKR_HOI_Y.noiDung.min,
		n: noiDung.trim().length,
	});
}

export function OSoanY({ h }: { h: HoiY }) {
	const t = okrHoiYMessages(useLocale());
	const m = t.gop;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const [gia, setGia] = useState<NoiDungY>(Y_TRONG);
	const [loi, setLoi] = useState<string | null>(null);
	const khoiY = useRef<HTMLDivElement>(null);
	const oY = useRef<HTMLTextAreaElement>(null);
	const conLai = OKR_HOI_Y.yMoiNguoi - h.cuaToi.y.length;
	const gop = useMutation(
		trpc.okr.gopY.mutationOptions({
			onSuccess: async () => {
				setGia(Y_TRONG);
				toast.success(m.daGui);
				await cache.hoiY();
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const gui = (e: FormEvent) => {
		e.preventDefault();
		const sai = loiNoiDung(gia.noiDung, t);
		flushSync(() => setLoi(sai));
		if (sai) {
			khoiY.current?.scrollIntoView({ block: "nearest" });
			oY.current?.focus({ preventScroll: true });
			return;
		}
		gop.mutate({
			hoiYId: h.hoiY.id,
			noiDung: gia.noiDung.trim(),
			viSao: gia.viSao.trim(),
			doBangGi: gia.doBangGi.trim(),
		});
	};

	return (
		<Card>
			<CardContent data-khoi="o-soan">
				<form noValidate onSubmit={gui}>
					<FieldGroup>
						<TruongY
							gia={gia}
							khoiY={khoiY}
							loi={loi}
							oY={oY}
							onDoi={(moi) => {
								setGia(moi);
								if (loi) setLoi(loiNoiDung(moi.noiDung, t));
							}}
						/>
						<HangHanhDongBamDay>
							<FieldDescription>
								{demSo(m.conDuoc.mot, m.conDuoc.nhieu, conLai)}
							</FieldDescription>
							<Button disabled={gop.isPending} type="submit">
								{gop.isPending ? <Spinner data-icon="inline-start" /> : null}
								{m.gui}
							</Button>
						</HangHanhDongBamDay>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
}

export function DuY() {
	const m = okrHoiYMessages(useLocale()).gop;
	return (
		<Alert data-khoi="du-y">
			<AlertTitle>{dien(m.duY, { n: OKR_HOI_Y.yMoiNguoi })}</AlertTitle>
		</Alert>
	);
}

export function ChiTietY({
	y,
}: {
	y: { noiDung: string; viSao: string; doBangGi: string };
}) {
	const m = okrHoiYMessages(useLocale()).cuaBan;
	return (
		<>
			<DoanChu>{y.noiDung}</DoanChu>
			{y.viSao ? (
				<ItemDescription>
					{ghep(m.viSao, { chu: <ChuNguoi>{y.viSao}</ChuNguoi> })}
				</ItemDescription>
			) : null}
			{y.doBangGi ? (
				<ItemDescription>
					{ghep(m.doBang, { chu: <ChuNguoi>{y.doBangGi}</ChuNguoi> })}
				</ItemDescription>
			) : null}
		</>
	);
}

function HopSuaY({ y, onDong }: { y: YCuaToi | null; onDong: () => void }) {
	const m = okrHoiYMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();
	const [gia, setGia] = useState<NoiDungY>(
		y ? { noiDung: y.noiDung, viSao: y.viSao, doBangGi: y.doBangGi } : Y_TRONG,
	);
	const [loi, setLoi] = useState<string | null>(null);
	const sua = useMutation(
		trpc.okr.suaY.mutationOptions({
			onSuccess: async () => {
				toast.success(m.cuaBan.daLuu);
				onDong();
				await cache.hoiY();
			},
			onError: (error) => toast.error(error.message),
		}),
	);
	return (
		<Dialog
			onOpenChange={(mo) => (mo ? undefined : onDong())}
			open={y !== null}
		>
			<DialogContent>
				<form
					noValidate
					onSubmit={(e) => {
						e.preventDefault();
						if (!y) return;
						const sai = loiNoiDung(gia.noiDung, m);
						setLoi(sai);
						if (sai) return;
						sua.mutate({
							yId: y.id,
							noiDung: gia.noiDung.trim(),
							viSao: gia.viSao.trim(),
							doBangGi: gia.doBangGi.trim(),
						});
					}}
				>
					<DialogHeader>
						<DialogTitle>{m.cuaBan.suaTieuDe}</DialogTitle>
						<DialogDescription>{m.cuaBan.suaMoTa}</DialogDescription>
					</DialogHeader>
					<FieldGroup>
						<TruongY gia={gia} loi={loi} onDoi={setGia} />
					</FieldGroup>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline">
								{m.cuaBan.huy}
							</Button>
						</DialogClose>
						<Button disabled={sua.isPending} type="submit">
							{m.cuaBan.luu}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export function YCuaBan({ h, chiDoc }: { h: HoiY; chiDoc: boolean }) {
	const m = okrHoiYMessages(useLocale()).cuaBan;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const [sua, setSua] = useState<YCuaToi | null>(null);
	const [goY, setGoY] = useState<YCuaToi | null>(null);
	const go = useMutation(
		trpc.okr.goY.mutationOptions({
			onSuccess: async () => {
				setGoY(null);
				await cache.hoiY();
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	return (
		<Card data-khoi="y-cua-ban">
			<CardHeader>
				<CardTitle>
					{dien(m.tieuDe, {
						n: h.cuaToi.y.length,
						max: OKR_HOI_Y.yMoiNguoi,
					})}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<FieldDescription data-mo-ta>
					{chiDoc ? m.chiDoc : m.moTa}
				</FieldDescription>
				<ItemGroup>
					{h.cuaToi.y.map((y) => (
						<Item data-y={y.id} key={y.id} variant="outline">
							<ItemContent>
								<ChiTietY y={y} />
							</ItemContent>
							{chiDoc ? null : (
								<ItemActions>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												aria-label={dien(m.viec, { chu: y.noiDung })}
												size="icon-sm"
												variant="ghost"
											>
												<Icon icon={OverflowMenuHorizontal} />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuGroup>
												<DropdownMenuItem onSelect={() => setSua(y)}>
													<Icon icon={Edit} />
													{m.sua}
												</DropdownMenuItem>
												<DropdownMenuItem
													onSelect={() => setGoY(y)}
													variant="destructive"
												>
													<Icon icon={TrashCan} />
													{m.go}
												</DropdownMenuItem>
											</DropdownMenuGroup>
										</DropdownMenuContent>
									</DropdownMenu>
								</ItemActions>
							)}
						</Item>
					))}
				</ItemGroup>
			</CardContent>
			<HopSuaY key={sua?.id ?? "dong"} onDong={() => setSua(null)} y={sua} />
			<ConfirmDialog
				nut={m.goNut}
				onConfirm={() => {
					if (goY) go.mutate({ yId: goY.id });
				}}
				onOpenChange={(mo) => {
					if (!mo) setGoY(null);
				}}
				open={goY !== null}
				pending={go.isPending}
				than={m.goThan}
				thoi={m.giu}
				tieuDe={m.goTieuDe}
			/>
		</Card>
	);
}

export function HetHan({ h }: { h: HoiY }) {
	const m = okrHoiYMessages(useLocale()).hetHan;
	return (
		<Alert data-khoi="het-han">
			<AlertTitle>{m.tieuDe}</AlertTitle>
			<AlertDescription>
				{ghep(m.moTa, { ten: <ChuNguoi>{h.nguoiChon.name}</ChuNguoi> })}
			</AlertDescription>
		</Alert>
	);
}
