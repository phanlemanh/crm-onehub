"use client";

import Add from "@carbon/icons-react/es/Add";
import ArrowLeft from "@carbon/icons-react/es/ArrowLeft";
import Bullhorn from "@carbon/icons-react/es/Bullhorn";
import Launch from "@carbon/icons-react/es/Launch";
import ListChecked from "@carbon/icons-react/es/ListChecked";
import Locked from "@carbon/icons-react/es/Locked";
import OverflowMenuHorizontal from "@carbon/icons-react/es/OverflowMenuHorizontal";
import Portfolio from "@carbon/icons-react/es/Portfolio";
import Renew from "@carbon/icons-react/es/Renew";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { Alert, AlertDescription } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { Checkbox } from "@crm/ui/components/checkbox";
import { Combobox } from "@crm/ui/components/combobox";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { DatePicker } from "@crm/ui/components/date-picker";
import {
	DropdownMenu,
	DropdownMenuContent,
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
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { formatDay } from "@crm/ui/lib/format";
import { type NghiaTrangThai, toneTheoNghia } from "@crm/ui/lib/status-tone";
import { TU_XU_LY_ESC } from "@crm/ui/lib/tu-xu-ly-esc";
import { OKR_CANH_KR, themViecInput } from "@crm/validation/okr-canh-kr";
import { useId, useState } from "react";
import {
	DetailSheetBody,
	DetailSheetEmpty,
	DetailSheetSection,
} from "@/components/detail-sheet";
import {
	type OkrCanhKrMessages,
	okrCanhKrMessages,
} from "@/lib/messages/okr-canh-kr";
import { okrGioiHanMessages } from "@/lib/messages/okr-gioi-han";
import type { RouterOutputs } from "@/lib/trpc/types";
import { dien } from "./plan-copy";

export type CanhKr = RouterOutputs["okr"]["canhKr"];
type DongCanh = CanhKr["dong"][number];
type DongViec = Extract<DongCanh, { loai: "viec" }>;
type DongSangKien = Exclude<DongCanh, { loai: "viec" }>;
type LienKet = DongSangKien["lienKet"];
export type LoaiSangKien = DongSangKien["loai"];

export type TrangThaiCanh =
	| { loai: "dang-tai" }
	| { loai: "loi"; thongDiep: string; khongCo: boolean }
	| { loai: "xong"; canh: CanhKr };

export type NguoiLamChon = { value: string; label: string; hint?: string };

export type ViecVao = {
	tieuDe: string;
	nguoiLamUserId: string;
	hanNgay: string | null;
};

export type KrViecHanhDong = {
	onThem: (vao: ViecVao) => Promise<void>;
	onSua: (id: string, vao: ViecVao) => Promise<void>;
	onDanhDau: (id: string, xong: boolean) => void;
	onGo: (id: string) => Promise<void>;
	onGan: (loai: LoaiSangKien) => void;
	onMo: (loai: LoaiSangKien, id: string) => void;
	onThuLai: () => void;
	ve: DuongVe;
};

export type DuongVe = { onVe: () => void; coMucTieuDuoi: boolean };

export class NguoiLamKhongConThanhVien extends Error {}

export async function loiTheoNguoiLam(
	loi: Error,
	nguoiLamUserId: string,
	docThanhVien: () => Promise<readonly { id: string }[] | undefined>,
): Promise<never> {
	const thanhVien = await docThanhVien();
	if (thanhVien && !thanhVien.some((u) => u.id === nguoiLamUserId))
		throw new NguoiLamKhongConThanhVien();
	throw loi;
}

type ChonNguoi = {
	nguoi: NguoiLamChon[];
	nguoiDangTai: boolean;
};

const TRANG_THAI_MAN = {
	dangTai: "ST-khungkr-dang-tai",
	rong: "ST-khungkr-rong",
	loi: "ST-khungkr-loi",
	coViec: "ST-khungkr-co-viec",
	khoa: "ST-khungkr-khoa",
	nguoiRoi: "ST-khungkr-nguoi-roi",
} as const;

const KHUNG_TAI = ["mot", "hai", "ba"] as const;

type TrangThaiGoc = Extract<LienKet, { coQuyen: true }>["trangThai"];

export const NGHIA_VIEC_GOC = {
	"chua-chay": "nhap",
	"dang-chay": "dangChay",
	"da-dong": "ketThuc",
	"da-luu-tru": "ketThuc",
	"da-xoa": "ketThuc",
} as const satisfies Record<TrangThaiGoc, NghiaTrangThai>;

function trangThaiMan(du: TrangThaiCanh): string {
	if (du.loai === "dang-tai") return TRANG_THAI_MAN.dangTai;
	if (du.loai === "loi") return TRANG_THAI_MAN.loi;
	const { canh } = du;
	if (canh.khoa) return TRANG_THAI_MAN.khoa;
	if (canh.dong.length === 0) return TRANG_THAI_MAN.rong;
	const coRoi = canh.dong.some(
		(d) => d.loai === "viec" && d.nguoiLam?.daRoi === true,
	);
	return coRoi ? TRANG_THAI_MAN.nguoiRoi : TRANG_THAI_MAN.coViec;
}

function DongNhap({
	dau,
	chon,
	onLuu,
	onHuy,
}: {
	dau: ViecVao;
	chon: ChonNguoi;
	onLuu: (vao: ViecVao) => Promise<void>;
	onHuy: () => void;
}) {
	const m = okrCanhKrMessages(useLocale()).nhap;
	const ma = useId();
	const [tieuDe, setTieuDe] = useState(dau.tieuDe);
	const [nguoiLam, setNguoiLam] = useState(dau.nguoiLamUserId);
	const [han, setHan] = useState<string | null>(dau.hanNgay);
	const [loiTieuDe, setLoiTieuDe] = useState<string | null>(null);
	const [loiNguoi, setLoiNguoi] = useState<string | null>(null);
	const [dangLuu, setDangLuu] = useState(false);

	const luu = async () => {
		if (dangLuu) return;
		const kq = themViecInput.shape.tieuDe.safeParse(tieuDe);
		setLoiTieuDe(kq.success ? null : dien(m.loiTieuDe, OKR_CANH_KR.tieuDe));
		setLoiNguoi(nguoiLam === "" ? m.loiNguoiLam : null);
		if (!kq.success || nguoiLam === "") return;
		setDangLuu(true);
		try {
			await onLuu({ tieuDe: kq.data, nguoiLamUserId: nguoiLam, hanNgay: han });
		} catch (loi) {
			if (loi instanceof NguoiLamKhongConThanhVien)
				setLoiNguoi(m.nguoiLamDaRoi);
			else setLoiTieuDe(loi instanceof Error ? loi.message : String(loi));
		} finally {
			setDangLuu(false);
		}
	};

	return (
		<Item size="sm" variant="outline" data-dong-nhap>
			<ItemContent>
				<FieldGroup>
					<Field data-invalid={loiTieuDe ? true : undefined}>
						<FieldLabel htmlFor={`${ma}-tieu-de`}>{m.tieuDe}</FieldLabel>
						<Input
							id={`${ma}-tieu-de`}
							name="tieu-de-viec"
							{...TU_XU_LY_ESC}
							autoComplete="off"
							autoFocus
							translate="no"
							placeholder={m.goiY}
							value={tieuDe}
							disabled={dangLuu}
							aria-invalid={loiTieuDe ? true : undefined}
							onChange={(e) => setTieuDe(e.target.value)}
							onKeyDown={(e) => {
								if (e.nativeEvent.isComposing) return;
								if (e.key === "Enter") {
									e.preventDefault();
									void luu();
								}
								if (e.key === "Escape") {
									e.preventDefault();
									onHuy();
								}
							}}
						/>
						{loiTieuDe ? (
							<FieldError>{loiTieuDe}</FieldError>
						) : (
							<FieldDescription>{m.phim}</FieldDescription>
						)}
					</Field>
					<div className="grid gap-4 sm:grid-cols-2">
						<Field data-invalid={loiNguoi ? true : undefined}>
							<FieldLabel htmlFor={`${ma}-nguoi`}>{m.nguoiLam}</FieldLabel>
							<Combobox
								id={`${ma}-nguoi`}
								translate="no"
								disabled={dangLuu || chon.nguoiDangTai}
								options={chon.nguoi}
								value={nguoiLam}
								onValueChange={setNguoiLam}
								placeholder={chon.nguoiDangTai ? m.dangTaiNguoi : m.chonNguoi}
								searchPlaceholder={m.timNguoi}
								empty={m.khongAi}
								aria-invalid={loiNguoi ? true : undefined}
							/>
							{loiNguoi ? (
								<FieldError data-loi-nguoi-lam>{loiNguoi}</FieldError>
							) : null}
						</Field>
						<Field>
							<FieldLabel htmlFor={`${ma}-han`}>{m.han}</FieldLabel>
							<DatePicker
								id={`${ma}-han`}
								value={han}
								onChange={(v) => setHan(v === "" ? null : v)}
							/>
						</Field>
					</div>
					<div className="flex justify-end gap-2">
						<Button
							size="sm"
							variant="ghost"
							data-nut="huy-viec"
							disabled={dangLuu}
							onClick={onHuy}
						>
							{m.huy}
						</Button>
						<Button
							size="sm"
							data-nut="luu-viec"
							disabled={dangLuu}
							onClick={() => void luu()}
						>
							{m.luu}
						</Button>
					</div>
				</FieldGroup>
			</ItemContent>
		</Item>
	);
}

function MoTaViec({ v, m }: { v: DongViec; m: OkrCanhKrMessages }) {
	const locale = useLocale();
	const han = v.hanNgay
		? dien(m.viec.han, { ngay: formatDay(v.hanNgay, locale) })
		: null;
	return (
		<ItemDescription>
			{v.nguoiLam ? (
				<span translate="no">{v.nguoiLam.name}</span>
			) : (
				m.viec.khongNguoiLam
			)}
			{v.nguoiLam?.daRoi ? (
				<>
					{" "}
					<Badge variant="outline" data-da-roi>
						{m.viec.daRoi}
					</Badge>
				</>
			) : null}
			{han ? (
				<>
					{" · "}
					{v.quaHan ? (
						<StatusIndicator
							size="sm"
							tone="error"
							label={`${han} · ${m.viec.quaHan}`}
							data-qua-han
						/>
					) : (
						han
					)}
				</>
			) : null}
		</ItemDescription>
	);
}

function DongViecHang({
	v,
	canh,
	onDanhDau,
	onSua,
	onGo,
}: {
	v: DongViec;
	canh: CanhKr;
	onDanhDau: (id: string, xong: boolean) => void;
	onSua: () => void;
	onGo: () => void;
}) {
	const m = okrCanhKrMessages(useLocale());
	const danhDuoc = !canh.khoa && (canh.quyen.suaDuoc || v.laNguoiLam);
	const suaDuoc = !canh.khoa && !canh.choDuyet && canh.quyen.suaDuoc;
	return (
		<Item
			size="sm"
			variant="outline"
			data-viec={v.id}
			data-xong={v.xong ? "" : undefined}
			role="listitem"
		>
			<ItemMedia>
				<Checkbox
					aria-label={dien(m.viec.danhDau, { ten: v.tieuDe })}
					checked={v.xong}
					disabled={!danhDuoc}
					onCheckedChange={(c) => onDanhDau(v.id, c === true)}
				/>
			</ItemMedia>
			<ItemContent>
				<ItemTitle>
					<span translate="no" data-tieu-de-viec>
						{v.xong ? <s>{v.tieuDe}</s> : v.tieuDe}
					</span>
				</ItemTitle>
				<MoTaViec v={v} m={m} />
			</ItemContent>
			{suaDuoc ? (
				<ItemActions>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								aria-label={dien(m.viec.thaoTac, { ten: v.tieuDe })}
								data-nut="thao-tac-viec"
								size="icon-sm"
								variant="ghost"
							>
								<Icon icon={OverflowMenuHorizontal} />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DropdownMenuItem data-muc="sua-viec" onSelect={onSua}>
								{v.nguoiLam?.daRoi ? m.viec.giaoLai : m.viec.sua}
							</DropdownMenuItem>
							<DropdownMenuItem
								data-muc="go-viec"
								variant="destructive"
								onSelect={onGo}
							>
								{m.viec.go}
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</ItemActions>
			) : null}
		</Item>
	);
}

function NoiDungSangKien({ s, m }: { s: DongSangKien; m: OkrCanhKrMessages }) {
	const lk = s.lienKet;
	if (!lk.coQuyen)
		return (
			<ItemTitle>
				{dien(m.sangKien.khongQuyen, { loai: m.sangKien.loai[s.loai] })}
				<Icon icon={Locked} aria-hidden="true" />
			</ItemTitle>
		);
	if (lk.ten === null) return <ItemTitle>{m.sangKien.daXoa[s.loai]}</ItemTitle>;
	return (
		<>
			<ItemTitle>
				<span translate="no">{lk.ten}</span>
			</ItemTitle>
			<ItemDescription>
				<StatusIndicator
					size="sm"
					tone={toneTheoNghia(NGHIA_VIEC_GOC[lk.trangThai])}
					label={m.sangKien.trangThai[lk.trangThai]}
				/>
			</ItemDescription>
		</>
	);
}

function DongSangKienHang({
	s,
	canh,
	onMo,
	onGo,
}: {
	s: DongSangKien;
	canh: CanhKr;
	onMo: (loai: LoaiSangKien, id: string) => void;
	onGo: () => void;
}) {
	const m = okrCanhKrMessages(useLocale());
	const lk = s.lienKet;
	const ten = lk.coQuyen ? (lk.ten ?? m.sangKien.daXoa[s.loai]) : "";
	const moDuoc = lk.coQuyen && lk.id !== null && lk.trangThai !== "da-xoa";
	const goDuoc =
		lk.coQuyen && !canh.khoa && !canh.choDuyet && canh.quyen.suaDuoc;
	return (
		<Item
			size="sm"
			variant="outline"
			data-sang-kien={s.id}
			data-loai-sang-kien={s.loai}
			data-trang-thai-goc={lk.coQuyen ? lk.trangThai : undefined}
			data-chi-okr={lk.coQuyen ? undefined : ""}
			role="listitem"
		>
			<ItemMedia variant="icon">
				<Icon icon={s.loai === "chien-dich" ? Bullhorn : Portfolio} />
			</ItemMedia>
			<ItemContent>
				<NoiDungSangKien s={s} m={m} />
			</ItemContent>
			{moDuoc || goDuoc ? (
				<ItemActions>
					{moDuoc && lk.coQuyen && lk.id !== null ? (
						<Button
							aria-label={dien(m.sangKien.mo, { ten })}
							data-nut="mo-sang-kien"
							size="icon-sm"
							variant="ghost"
							onClick={() => {
								if (lk.id !== null) onMo(s.loai, lk.id);
							}}
						>
							<Icon icon={Launch} />
						</Button>
					) : null}
					{goDuoc ? (
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									aria-label={dien(m.sangKien.thaoTac, { ten })}
									data-nut="thao-tac-sang-kien"
									size="icon-sm"
									variant="ghost"
								>
									<Icon icon={OverflowMenuHorizontal} />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem
									data-muc="go-sang-kien"
									variant="destructive"
									onSelect={onGo}
								>
									{m.sangKien.goKhoiKr}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					) : null}
				</ItemActions>
			) : null}
		</Item>
	);
}

function NutGhi({
	canh,
	them,
	onThem,
	onGan,
}: {
	canh: CanhKr;
	them: boolean;
	onThem: () => void;
	onGan: (loai: LoaiSangKien) => void;
}) {
	const m = okrCanhKrMessages(useLocale()).khung;
	if (!canh.quyen.suaDuoc) return null;
	return (
		<div className="flex flex-wrap gap-2">
			<Button
				size="sm"
				variant="outline"
				data-nut="them-viec"
				disabled={canh.khoa || canh.choDuyet || them}
				onClick={onThem}
			>
				<Icon icon={Add} data-icon="inline-start" />
				{m.themViec}
			</Button>
			{canh.quyen.ganDuoc ? (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							size="sm"
							variant="outline"
							data-nut="gan-sang-kien"
							disabled={canh.khoa || canh.choDuyet}
						>
							{m.gan}
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start">
						<DropdownMenuItem
							data-muc="gan-ke-hoach"
							onSelect={() => onGan("ke-hoach")}
						>
							{m.ganKeHoach}
						</DropdownMenuItem>
						<DropdownMenuItem
							data-muc="gan-chien-dich"
							onSelect={() => onGan("chien-dich")}
						>
							{m.ganChienDich}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			) : null}
		</div>
	);
}

function DangTai() {
	const m = okrCanhKrMessages(useLocale()).khung;
	return (
		<DetailSheetSection>
			<div aria-busy="true" className="flex flex-col gap-2">
				<span className="sr-only" role="status">
					{m.dangTai}
				</span>
				{KHUNG_TAI.map((id) => (
					<Skeleton className="h-12 w-full" key={id} />
				))}
			</div>
		</DetailSheetSection>
	);
}

function Loi({
	du,
	hanhDong,
}: {
	du: Extract<TrangThaiCanh, { loai: "loi" }>;
	hanhDong: KrViecHanhDong;
}) {
	const m = okrCanhKrMessages(useLocale()).khung;
	if (du.khongCo)
		return (
			<DetailSheetEmpty
				icon={WarningAlt}
				title={m.khongCo.tieuDe}
				description={m.khongCo.moTa}
				action={
					<Button
						variant="outline"
						data-nut="ve-muc-tieu"
						onClick={hanhDong.ve.onVe}
					>
						<Icon data-icon="inline-start" icon={ArrowLeft} />
						{hanhDong.ve.coMucTieuDuoi
							? m.khongCo.veMucTieu
							: m.khongCo.dongKhung}
					</Button>
				}
			/>
		);
	return (
		<DetailSheetEmpty
			icon={WarningAlt}
			title={m.loi.tieuDe}
			description={m.loi.moTa}
			action={
				<Button
					variant="outline"
					data-nut="thu-lai"
					onClick={hanhDong.onThuLai}
				>
					<Icon data-icon="inline-start" icon={Renew} />
					{m.loi.thuLai}
				</Button>
			}
		/>
	);
}

type HoiGo = { id: string; loai: "viec" | "sang-kien"; ten: string };

function DanhSach({
	canh,
	chon,
	nguoiMacDinh,
	hanhDong,
}: {
	canh: CanhKr;
	chon: ChonNguoi;
	nguoiMacDinh: string;
	hanhDong: KrViecHanhDong;
}) {
	const locale = useLocale();
	const m = okrCanhKrMessages(locale);
	const g = okrGioiHanMessages(locale).canhKrChoDuyet;
	const [them, setThem] = useState(false);
	const [sua, setSua] = useState<string | null>(null);
	const [hoiGo, setHoiGo] = useState<HoiGo | null>(null);
	const [dangGo, setDangGo] = useState(false);

	const go = () => {
		if (!hoiGo || dangGo) return;
		setDangGo(true);
		hanhDong.onGo(hoiGo.id).then(
			() => {
				setDangGo(false);
				setHoiGo(null);
			},
			() => setDangGo(false),
		);
	};

	const nut = (
		<NutGhi
			canh={canh}
			them={them}
			onThem={() => {
				setSua(null);
				setThem(true);
			}}
			onGan={hanhDong.onGan}
		/>
	);

	const hoi =
		hoiGo?.loai === "viec"
			? {
					tieuDe: dien(m.hoiGo.viec.tieuDe, { ten: hoiGo.ten }),
					than: m.hoiGo.viec.than,
				}
			: { tieuDe: m.hoiGo.sangKien.tieuDe, than: m.hoiGo.sangKien.than };

	return (
		<>
			{canh.dong.length === 0 && !them ? (
				<DetailSheetEmpty
					icon={ListChecked}
					title={m.khung.rong.tieuDe}
					description={
						canh.khoa
							? m.khung.khoa
							: canh.choDuyet
								? g
								: canh.quyen.suaDuoc
									? m.khung.rong.moTa
									: m.khung.rong.moTaChiDoc
					}
					action={canh.quyen.suaDuoc ? nut : undefined}
				/>
			) : (
				<DetailSheetSection>
					<div className="flex flex-col gap-3">
						{canh.khoa ? (
							<Alert data-khoa-viec>
								<Icon icon={Locked} />
								<AlertDescription>{m.khung.khoa}</AlertDescription>
							</Alert>
						) : canh.choDuyet ? (
							<Alert data-khoa-viec="cho-duyet">
								<Icon icon={Locked} />
								<AlertDescription>{g}</AlertDescription>
							</Alert>
						) : null}
						<ItemGroup>
							{canh.dong.map((d) => {
								if (d.loai !== "viec")
									return (
										<DongSangKienHang
											key={d.id}
											s={d}
											canh={canh}
											onMo={hanhDong.onMo}
											onGo={() =>
												setHoiGo({ id: d.id, loai: "sang-kien", ten: "" })
											}
										/>
									);
								if (sua === d.id)
									return (
										<DongNhap
											key={d.id}
											dau={{
												tieuDe: d.tieuDe,
												nguoiLamUserId:
													d.nguoiLam && !d.nguoiLam.daRoi ? d.nguoiLam.id : "",
												hanNgay: d.hanNgay,
											}}
											chon={chon}
											onLuu={async (vao) => {
												await hanhDong.onSua(d.id, vao);
												setSua(null);
											}}
											onHuy={() => setSua(null)}
										/>
									);
								return (
									<DongViecHang
										key={d.id}
										v={d}
										canh={canh}
										onDanhDau={hanhDong.onDanhDau}
										onSua={() => {
											setThem(false);
											setSua(d.id);
										}}
										onGo={() =>
											setHoiGo({ id: d.id, loai: "viec", ten: d.tieuDe })
										}
									/>
								);
							})}
							{them ? (
								<DongNhap
									dau={{
										tieuDe: "",
										nguoiLamUserId: nguoiMacDinh,
										hanNgay: null,
									}}
									chon={chon}
									onLuu={async (vao) => {
										await hanhDong.onThem(vao);
										setThem(false);
									}}
									onHuy={() => setThem(false)}
								/>
							) : null}
						</ItemGroup>
						{nut}
					</div>
				</DetailSheetSection>
			)}
			<ConfirmDialog
				tone="destructive"
				tieuDe={hoi.tieuDe}
				than={hoi.than}
				nut={m.hoiGo.nut}
				thoi={m.hoiGo.thoi}
				open={hoiGo !== null}
				pending={dangGo}
				onOpenChange={(mo) => {
					if (!mo && !dangGo) setHoiGo(null);
				}}
				onConfirm={go}
			/>
		</>
	);
}

export function KrViecDanhSach({
	duLieu,
	nguoi,
	nguoiDangTai,
	nguoiMacDinh,
	hanhDong,
}: {
	duLieu: TrangThaiCanh;
	nguoi: NguoiLamChon[];
	nguoiDangTai: boolean;
	nguoiMacDinh: string;
	hanhDong: KrViecHanhDong;
}) {
	return (
		<div className="contents" data-trang-thai={trangThaiMan(duLieu)}>
			<DetailSheetBody>
				{duLieu.loai === "dang-tai" ? (
					<DangTai />
				) : duLieu.loai === "loi" ? (
					<Loi du={duLieu} hanhDong={hanhDong} />
				) : (
					<DanhSach
						canh={duLieu.canh}
						chon={{ nguoi, nguoiDangTai }}
						nguoiMacDinh={nguoiMacDinh}
						hanhDong={hanhDong}
					/>
				)}
			</DetailSheetBody>
		</div>
	);
}
