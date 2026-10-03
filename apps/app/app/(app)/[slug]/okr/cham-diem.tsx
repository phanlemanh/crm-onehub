"use client";

import Information from "@carbon/icons-react/es/Information";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import {
	SimpleTable,
	SimpleTableCell,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { TableCell } from "@crm/ui/components/table";
import { Textarea } from "@crm/ui/components/textarea";
import { formatDay } from "@crm/ui/lib/format";
import type { Locale } from "@crm/ui/lib/locale";
import { PHA_GHI_DUOC } from "@crm/validation/okr-chu-ky";
import { THANG_CHAM } from "@crm/validation/okr-chuong-trinh";
import { luoiDiem, OKR_KHEP, type ThangCham } from "@crm/validation/okr-khep";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useId, useState } from "react";
import { toast } from "sonner";
import { okrKhepMessages } from "@/lib/messages/okr-khep";
import { homNayVn } from "@/lib/okr-chu-ky-nhan";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { giaTri } from "./bang-kr";
import { useChuKy } from "./chon-chu-ky";
import { HopThoaiMangSang } from "./hop-thoai-mang-sang";
import { nhanKr } from "./kieu";
import { chuSo } from "./nguon-so";
import type { DonChonOkr } from "./okr-search-params";
import { LoiXem } from "./toan-canh/toan-canh";
import { DangTai } from "./trang-thai-okr";

type BangCham = RouterOutputs["okr"]["bangCham"];
type MucTieuCham = BangCham["mucTieu"][number];
type KrCham = MucTieuCham["krs"][number];
type ChuKy = RouterOutputs["okr"]["cycles"]["cycles"][number];

export type ChamVao = { keyResultId: string; diem: number; lyDo?: string };
export type HocVao = { objectiveId: string; noiDung: string };

export type ChamDiemBangProps = {
	bang: BangCham;
	tenKy: string;
	kyKe: string | null;
	daDong: boolean;
	onCham: (vao: ChamVao) => Promise<boolean>;
	onGhiHoc: (vao: HocVao) => Promise<boolean>;
	onMangSang: (objectiveId: string) => Promise<boolean>;
};

const THANG_MAC_DINH: ThangCham = THANG_CHAM[0];

function NhanDoiDich({ k, locale }: { k: KrCham; locale: Locale }) {
	const mk = okrKhepMessages(locale).cham;
	if (k.doiDichNgoaiRa.length === 0) return null;
	return (
		<span className="flex flex-col gap-1" data-dich-ngoai-ra>
			<span>
				<Badge variant="outline">{mk.dichNgoaiRa}</Badge>
			</span>
			{k.doiDichNgoaiRa.map((d) => (
				<span className="text-muted-foreground text-xs" key={d.luc}>
					{formatDay(homNayVn(new Date(d.luc)), locale)}:{" "}
					{giaTri(k, d.truoc, locale)} → {giaTri(k, d.sau, locale)} ·{" "}
					<span translate="no">«{d.lyDo}»</span>
				</span>
			))}
		</span>
	);
}

type TrangThaiDong = {
	chon: string;
	lyDo: string;
	loi: boolean;
	dangLuu: boolean;
};

function DiemDoc({
	k,
	daDong,
	locale,
}: {
	k: KrCham;
	daDong: boolean;
	locale: Locale;
}) {
	const mk = okrKhepMessages(locale).cham;
	return (
		<span className="flex flex-col gap-1 text-sm" data-diem-doc>
			<span className="tabular-nums">
				{k.diem === null ? mk.chuaCham : chuSo(k.diem, locale)}
			</span>
			{k.lyDo ? (
				<span className="text-muted-foreground text-xs" translate="no">
					«{k.lyDo}»
				</span>
			) : null}
			{daDong ? null : (
				<span className="text-muted-foreground text-xs">{mk.nguoiSuaCham}</span>
			)}
		</span>
	);
}

function OChonDiem({
	k,
	kho,
	luoi,
	tt,
	doi,
	luu,
	locale,
}: {
	k: KrCham;
	kho: "nho" | "lon";
	luoi: number[];
	tt: TrangThaiDong;
	doi: (thay: Partial<TrangThaiDong>) => void;
	luu: () => void;
	locale: Locale;
}) {
	const mk = okrKhepMessages(locale).cham;
	const ma = useId();
	const khacGoiY = Number(tt.chon) !== k.diemGoiY;
	const chuaDoi =
		k.diem !== null &&
		Number(tt.chon) === k.diem &&
		tt.lyDo.trim() === (k.lyDo ?? "");
	return (
		<div className="flex flex-col gap-2" data-o-diem={kho}>
			<Select
				value={tt.chon}
				onValueChange={(v) => doi({ chon: v, loi: false })}
			>
				<SelectTrigger
					aria-label={`${mk.cot.diem}: ${k.title}`}
					id={`${ma}-diem`}
					size="sm"
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{luoi.map((d) => (
						<SelectItem key={d} value={String(d)}>
							{chuSo(d, locale)}
							{d === k.diemGoiY
								? ` · ${mk.cot.goiY.toLocaleLowerCase(locale)}`
								: ""}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{khacGoiY ? (
				<Field data-invalid={tt.loi || undefined} data-o-ly-do>
					<FieldLabel htmlFor={`${ma}-ly-do`}>{mk.lyDo}</FieldLabel>
					<Textarea
						aria-invalid={tt.loi || undefined}
						id={`${ma}-ly-do`}
						maxLength={OKR_KHEP.lyDo.toiDa}
						rows={2}
						translate="no"
						value={tt.lyDo}
						onChange={(e) => doi({ lyDo: e.target.value, loi: false })}
					/>
					{tt.loi ? <FieldError>{mk.canLyDo}</FieldError> : null}
				</Field>
			) : null}
			<Button
				className="self-start"
				data-nut="luu-diem"
				disabled={tt.dangLuu || chuaDoi}
				size="sm"
				variant="outline"
				onClick={luu}
			>
				{k.diem === null ? mk.luu : mk.luuLai}
			</Button>
		</div>
	);
}

function DongKr({
	k,
	suaDuoc,
	daDong,
	luoi,
	onCham,
	locale,
	thuTu,
}: {
	k: KrCham;
	suaDuoc: boolean;
	daDong: boolean;
	luoi: number[];
	onCham: ChamDiemBangProps["onCham"];
	locale: Locale;
	thuTu: number;
}) {
	const mk = okrKhepMessages(locale).cham;
	const [tt, setTt] = useState<TrangThaiDong>(() => ({
		chon: String(k.diem ?? k.diemGoiY),
		lyDo: k.lyDo ?? "",
		loi: false,
		dangLuu: false,
	}));
	const doi = (thay: Partial<TrangThaiDong>) =>
		setTt((cu) => ({ ...cu, ...thay }));
	const luu = async () => {
		const diem = Number(tt.chon);
		const khacGoiY = diem !== k.diemGoiY;
		const lyDo = tt.lyDo.trim();
		if (khacGoiY && lyDo.length < OKR_KHEP.lyDo.toiThieu) {
			doi({ loi: true });
			return;
		}
		doi({ loi: false, dangLuu: true });
		await onCham(
			khacGoiY
				? { keyResultId: k.id, diem, lyDo }
				: { keyResultId: k.id, diem },
		);
		doi({ dangLuu: false });
	};
	const oDiem = (kho: "nho" | "lon") =>
		suaDuoc ? (
			<OChonDiem
				doi={doi}
				k={k}
				kho={kho}
				locale={locale}
				luoi={luoi}
				luu={() => void luu()}
				tt={tt}
			/>
		) : (
			<DiemDoc daDong={daDong} k={k} locale={locale} />
		);
	const so = (
		<span className="flex flex-col gap-0.5 text-sm tabular-nums">
			<span>
				{giaTri(k, k.startValue, locale)} → {giaTri(k, k.targetValue, locale)}
			</span>
			<span className="text-muted-foreground text-xs">
				{mk.soChot} {giaTri(k, k.soChot, locale)}
			</span>
		</span>
	);
	return (
		<SimpleTableRow data-kr-cham={k.id} nested>
			<TableCell className="px-3 py-3 align-top whitespace-normal">
				<div className="flex min-w-0 gap-3">
					<span className="w-8 shrink-0 pt-px text-muted-foreground text-xs tabular-nums">
						{nhanKr(thuTu)}
					</span>
					<div className="flex min-w-0 flex-1 flex-col gap-1.5">
						<span className="text-sm" translate="no">
							{k.title}
						</span>
						<span className="text-muted-foreground text-xs">
							{mk.phuTrach} <span translate="no">{k.ownerName}</span>
						</span>
						<span className="md:hidden">{so}</span>
						<span className="text-muted-foreground text-xs md:hidden">
							{mk.cot.goiY} {chuSo(k.diemGoiY, locale)}
						</span>
						<NhanDoiDich k={k} locale={locale} />
						<span className="md:hidden">{oDiem("nho")}</span>
					</div>
				</div>
			</TableCell>
			<TableCell className="hidden px-3 py-3 align-top md:table-cell">
				{so}
			</TableCell>
			<TableCell className="hidden px-3 py-3 align-top text-sm tabular-nums md:table-cell">
				{chuSo(k.diemGoiY, locale)}
			</TableCell>
			<TableCell className="hidden px-3 py-3 align-top whitespace-normal md:table-cell">
				{oDiem("lon")}
			</TableCell>
		</SimpleTableRow>
	);
}

function DieuHocDuoc({
	mt,
	suaDuoc,
	onGhiHoc,
	locale,
}: {
	mt: MucTieuCham;
	suaDuoc: boolean;
	onGhiHoc: ChamDiemBangProps["onGhiHoc"];
	locale: Locale;
}) {
	const mk = okrKhepMessages(locale).cham.hoc;
	const ma = useId();
	const [chu, setChu] = useState(mt.dieuHocDuoc);
	const [dangLuu, setDangLuu] = useState(false);
	const luu = async () => {
		setDangLuu(true);
		await onGhiHoc({ objectiveId: mt.id, noiDung: chu.trim() });
		setDangLuu(false);
	};
	if (!suaDuoc)
		return (
			<Field data-o-hoc>
				<FieldLabel htmlFor={ma}>{mk.nhan}</FieldLabel>
				<p className="text-sm" id={ma} translate="no">
					{mt.dieuHocDuoc || mk.chuaGhi}
				</p>
			</Field>
		);
	return (
		<Field data-o-hoc>
			<FieldLabel htmlFor={ma}>{mk.nhan}</FieldLabel>
			<Textarea
				id={ma}
				maxLength={OKR_KHEP.dieuHocDuoc.toiDa}
				placeholder={mk.goiY}
				rows={3}
				translate="no"
				value={chu}
				onChange={(e) => setChu(e.target.value)}
			/>
			<FieldDescription>{mk.moTa}</FieldDescription>
			<Button
				className="self-start"
				data-nut="luu-hoc"
				disabled={dangLuu || chu.trim() === mt.dieuHocDuoc}
				size="sm"
				variant="outline"
				onClick={() => void luu()}
			>
				{mk.luu}
			</Button>
		</Field>
	);
}

function DiemMucTieuCham({ mt, locale }: { mt: MucTieuCham; locale: Locale }) {
	const m = okrKhepMessages(locale);
	const mk = m.cham;
	const daCham = mt.krs.filter((k) => k.diem !== null).length;
	return mt.diem === null || mt.cachDoc === null ? (
		<StatusIndicator
			label={mk.daCham(String(daCham), String(mt.krs.length))}
			size="sm"
			tone="warning"
		/>
	) : (
		<StatusIndicator
			label={`${mk.cot.diem} ${chuSo(mt.diem, locale)} · ${m.cachDoc[mt.cachDoc]}`}
			size="sm"
			tone="neutral"
		/>
	);
}

function KhoiMucTieuCham({
	mt,
	p,
	luoi,
	locale,
	moMangSang,
}: {
	mt: MucTieuCham;
	p: ChamDiemBangProps;
	luoi: number[];
	locale: Locale;
	moMangSang: (id: string) => void;
}) {
	const m = okrKhepMessages(locale);
	const mk = m.cham;
	const cot: SimpleTableColumn[] = [
		{ id: "kr", header: mk.cot.kr },
		{
			id: "so",
			header: mk.cot.so,
			width: "w-[22%]",
			className: "hidden md:table-cell",
		},
		{
			id: "goi-y",
			header: mk.cot.goiY,
			width: "w-[10%]",
			className: "hidden md:table-cell",
		},
		{
			id: "diem",
			header: mk.cot.diem,
			width: "w-[30%]",
			className: "hidden md:table-cell",
		},
	];
	const coChan = mt.mangSangToi !== null || (mt.suaDuoc && p.kyKe !== null);
	return (
		<div data-muc-tieu-cham={mt.id}>
			<SimpleTable columns={cot}>
				<SimpleTableRow data-hang-muc-tieu-cham={mt.id}>
					<SimpleTableCell className="whitespace-normal align-top">
						<div className="flex min-w-0 flex-col gap-1">
							<span className="font-medium text-sm" translate="no">
								{mt.title}
							</span>
							<span className="text-muted-foreground text-xs">
								{mk.phuTrach} <span translate="no">{mt.ownerName}</span>
							</span>
							<span className="pt-1 md:hidden">
								<DiemMucTieuCham locale={locale} mt={mt} />
							</span>
						</div>
					</SimpleTableCell>
					<SimpleTableCell className="hidden md:table-cell" />
					<SimpleTableCell className="hidden md:table-cell" />
					<SimpleTableCell className="hidden align-top md:table-cell">
						<DiemMucTieuCham locale={locale} mt={mt} />
					</SimpleTableCell>
				</SimpleTableRow>
				{mt.krs.map((k, i) => (
					<DongKr
						daDong={p.daDong}
						k={k}
						key={k.id}
						locale={locale}
						luoi={luoi}
						onCham={p.onCham}
						suaDuoc={k.suaDuoc && !p.daDong}
						thuTu={i + 1}
					/>
				))}
				<SimpleTableRow data-hang-hoc={mt.id} nested>
					<SimpleTableCell
						className="whitespace-normal align-top"
						colSpan={cot.length}
					>
						<div className="flex flex-col gap-4">
							<DieuHocDuoc
								locale={locale}
								mt={mt}
								onGhiHoc={p.onGhiHoc}
								suaDuoc={mt.suaDuoc && !p.daDong}
							/>
							{coChan ? (
								<div className="flex flex-wrap gap-2">
									{mt.mangSangToi ? (
										<p className="text-sm" data-da-mang-sang>
											{mk.daMangSang}{" "}
											<span translate="no">{mt.mangSangToi.cycleName}</span>
										</p>
									) : (
										<Button
											aria-haspopup="dialog"
											data-nut="mang-sang"
											size="sm"
											variant="outline"
											onClick={() => moMangSang(mt.id)}
										>
											{mk.mangSang} <span translate="no">{p.kyKe}</span>
										</Button>
									)}
								</div>
							) : null}
						</div>
					</SimpleTableCell>
				</SimpleTableRow>
			</SimpleTable>
		</div>
	);
}

export function ChamDiemBang(p: ChamDiemBangProps) {
	const locale = useLocale();
	const m = okrKhepMessages(locale);
	const mk = m.cham;
	const [mangSangMo, setMangSangMo] = useState<string | null>(null);
	const thang = p.bang.thang ?? THANG_MAC_DINH;
	const luoi = luoiDiem(thang);
	const ds = p.bang.mucTieu;
	if (ds.length === 0)
		return (
			<Empty data-trang-thai="ST-cham-rong">
				<EmptyHeader>
					<EmptyTitle>{mk.rong.tieuDe}</EmptyTitle>
					<EmptyDescription>{mk.rong.moTa}</EmptyDescription>
				</EmptyHeader>
			</Empty>
		);
	const tong = ds.reduce((s, mt) => s + mt.krs.length, 0);
	const daCham = ds.reduce(
		(s, mt) => s + mt.krs.filter((k) => k.diem !== null).length,
		0,
	);
	const coSua = ds.some((mt) => mt.krs.some((k) => k.suaDuoc));
	const dangMo = ds.find((mt) => mt.id === mangSangMo) ?? null;
	return (
		<div
			className="flex flex-col gap-6"
			data-cham-diem
			data-trang-thai={p.daDong ? "ST-cham-dadong" : "ST-cham-donvi"}
		>
			{p.daDong ? null : (
				<Alert data-khong-phai-danh-gia>
					<Icon icon={Information} />
					<AlertTitle>{m.khongPhaiDanhGia.tieuDe}</AlertTitle>
					<AlertDescription>{m.khongPhaiDanhGia.moTa}</AlertDescription>
				</Alert>
			)}
			<p className="text-sm" data-tien-do-cham>
				{daCham === tong
					? mk.daChamHet(String(tong))
					: mk.daCham(String(daCham), String(tong))}
			</p>
			{!p.daDong && !coSua ? (
				<p className="text-muted-foreground text-sm">{mk.chiDoc}</p>
			) : null}
			{ds.map((mt) => (
				<KhoiMucTieuCham
					key={mt.id}
					locale={locale}
					luoi={luoi}
					moMangSang={setMangSangMo}
					mt={mt}
					p={p}
				/>
			))}
			{dangMo ? (
				<HopThoaiMangSang
					dong={() => setMangSangMo(null)}
					kyKe={p.kyKe}
					mucTieu={dangMo}
					tenKy={p.tenKy}
					thang={thang}
					xacNhan={() => p.onMangSang(dangMo.id)}
				/>
			) : null}
		</div>
	);
}

export function kyKeCua(ky: ChuKy, ds: ChuKy[]): ChuKy | null {
	return (
		ds
			.filter(
				(c) =>
					c.kind === ky.kind &&
					c.anLuc === null &&
					c.startsOn > ky.endsOn &&
					PHA_GHI_DUOC.includes(c.phase),
			)
			.sort((a, b) => a.startsOn.localeCompare(b.startsOn))[0] ?? null
	);
}

export function ChamDiem({
	cycleId,
	unit,
}: {
	cycleId: string;
	unit: DonChonOkr;
}) {
	const locale = useLocale();
	const mk = okrKhepMessages(locale);
	const trpc = useTRPC();
	const cache = useCrmCache();
	const { cycles } = useChuKy();
	const bang = useQuery(
		trpc.okr.bangCham.queryOptions({ cycleId, donVi: unit }),
	);
	const cham = useMutation(trpc.okr.chamKr.mutationOptions());
	const hoc = useMutation(trpc.okr.ghiDieuHocDuoc.mutationOptions());
	const mang = useMutation(trpc.okr.mangSang.mutationOptions());

	if (bang.isPending) return <DangTai />;
	if (bang.isError)
		return (
			<LoiXem
				cau={mk.cham.loi}
				thuLai={() => void bang.refetch()}
				trangThai="ST-cham-loi"
			/>
		);

	const ds = cycles.data?.cycles ?? [];
	const ky = ds.find((c) => c.id === cycleId) ?? null;
	const ke = ky ? kyKeCua(ky, ds) : null;
	const lam = async <T,>(
		viec: Promise<T>,
		xong: string,
		objectiveId?: string,
	): Promise<T | null> => {
		try {
			const kq = await viec;
			toast.success(xong);
			await cache.okr(objectiveId);
			return kq;
		} catch (e) {
			toast.error(e instanceof Error ? e.message : String(e));
			return null;
		}
	};

	return (
		<ChamDiemBang
			bang={bang.data}
			daDong={ky?.phase === "da-dong"}
			kyKe={ke?.name ?? null}
			tenKy={ky?.name ?? ""}
			onCham={async (vao) =>
				(await lam(cham.mutateAsync(vao), mk.cham.daLuu)) !== null
			}
			onGhiHoc={async (vao) =>
				(await lam(
					hoc.mutateAsync(vao),
					mk.cham.hoc.daLuu,
					vao.objectiveId,
				)) !== null
			}
			onMangSang={async (objectiveId) => {
				const kq = await lam(
					mang.mutateAsync({ objectiveId }),
					mk.mangSang.daXong,
					objectiveId,
				);
				if (kq?.canhBao) toast.warning(kq.canhBao);
				return kq !== null;
			}}
		/>
	);
}
