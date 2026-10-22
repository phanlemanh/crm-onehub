"use client";

import Edit from "@carbon/icons-react/es/Edit";
import { Button } from "@crm/ui/components/button";
import { Checkbox } from "@crm/ui/components/checkbox";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { FieldError } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SOURCED_VALUE, SourcedValue } from "@crm/ui/components/sourced-value";
import { Spinner } from "@crm/ui/components/spinner";
import { formatMoney } from "@crm/ui/lib/format";
import type { Locale } from "@crm/ui/lib/locale";
import { cn } from "@crm/ui/lib/utils";
import { type ReactNode, useId, useState } from "react";
import {
	InlineDateField,
	InlineMoneyField,
	InlineSelectField,
	InlineTextArea,
} from "@/components/crm/inline-field";
import { type Owner, OwnerCell } from "@/components/crm/owner-cell";
import { SoDienThoai } from "@/components/crm/so-dien-thoai";
import {
	DetailSheetProperty,
	PROPERTY_LABEL,
	PROPERTY_ROW,
} from "@/components/detail-sheet";
import { LocalDay } from "@/components/local-date-time";
import { crmMessages } from "@/lib/messages/crm";
import {
	docNhapTheoKieu,
	hienThiSo,
	hrefLienKet,
	type KieuTruong,
	type MaTuChoi,
} from "./doc-nhap";
import { type DichOTep, OTep, type TepOTep } from "./o-tep";

export type { KieuTruong } from "./doc-nhap";

export type GiaTriTruong = string | number | boolean | null;

export type LuaChonTruong = { value: string; label: string };

export type MoTaTruong = {
	khoa: string;
	nhan: string;
	kieu: KieuTruong;
	giaTri: GiaTriTruong;
	batBuoc?: boolean;
	luaChon?: LuaChonTruong[];
	nhanRong?: string;
	tienTe?: string;
	nguoiDung?: Owner[];
	nguoi?: Owner | null;
	trinhBay?: (giaTri: string) => ReactNode;
	goiY?: string;
	khongNhan?: boolean;
	nguon?: ReactNode;
	deXuat?: ReactNode;
	luu: (giaTri: GiaTriTruong) => void;
	dangLuu?: boolean;
	tep?: TepOTep[];
	dichTep?: DichOTep;
};

export type GiaTriHienThi = {
	kieu: KieuTruong;
	giaTri: GiaTriTruong;
	tienTe?: string;
	luaChon?: LuaChonTruong[];
	nguoiDung?: Owner[];
	nguoi?: Owner | null;
	trinhBay?: (giaTri: string) => ReactNode;
	xuongDongDienThoai?: boolean;
};

const RONG = "__none__";
const ROW = cn(PROPERTY_ROW, "items-center");
const CONTROL =
	"h-8 w-full justify-start px-2 font-normal hover:border-input hover:bg-muted/40 border border-transparent";

function laRong(giaTri: GiaTriTruong): boolean {
	return giaTri === null || giaTri === "";
}

function timNguoi(gia: GiaTriHienThi): Owner | null {
	if (gia.nguoi !== undefined) return gia.nguoi;
	if (laRong(gia.giaTri)) return null;
	const id = String(gia.giaTri);
	return gia.nguoiDung?.find((nguoi) => nguoi.id === id) ?? null;
}

function chanLan(event: { stopPropagation: () => void }) {
	event.stopPropagation();
}

function HienThiLienKet({
	kieu,
	chuoi,
	trinhBay,
}: {
	kieu: "URL" | "EMAIL" | "PHONE";
	chuoi: string;
	trinhBay?: (giaTri: string) => ReactNode;
}) {
	const href = hrefLienKet(kieu, chuoi);
	if (kieu === "PHONE") {
		if (!href) return <SoDienThoai so={chuoi} />;
		return (
			<span className="contents" onClickCapture={chanLan}>
				<SoDienThoai so={chuoi} goi />
			</span>
		);
	}
	const chu = trinhBay ? trinhBay(chuoi) : chuoi;
	if (!href) return <span className="truncate">{chu}</span>;
	return (
		<a
			href={href}
			className="truncate underline-offset-2 hover:underline"
			translate="no"
			onClick={chanLan}
			{...(kieu === "URL"
				? { target: "_blank", rel: "noreferrer noopener" }
				: {})}
		>
			{chu}
		</a>
	);
}

function veGiaTri(gia: GiaTriHienThi, locale: Locale): ReactNode {
	const m = crmMessages(locale);

	if (gia.kieu === "USER") {
		const nguoi = timNguoi(gia);
		return nguoi ? (
			<OwnerCell owner={nguoi} xuongDongDienThoai={gia.xuongDongDienThoai} />
		) : (
			<EmptyCellValue />
		);
	}

	if (laRong(gia.giaTri)) return <EmptyCellValue />;
	const chuoi = String(gia.giaTri);

	switch (gia.kieu) {
		case "CHECKBOX":
			return gia.giaTri === true ? m.misc.yes : m.misc.no;
		case "NUMBER":
			return (
				<span className="tabular-nums" translate="no">
					{hienThiSo(Number(gia.giaTri), locale)}
				</span>
			);
		case "MONEY":
			return (
				<span className="tabular-nums" translate="no">
					{formatMoney(Number(gia.giaTri), gia.tienTe ?? "USD", locale)}
				</span>
			);
		case "DATE":
			return <LocalDay date={chuoi} />;
		case "SELECT": {
			const luaChon = gia.luaChon?.find((muc) => muc.value === chuoi);
			return luaChon ? luaChon.label : <EmptyCellValue />;
		}
		case "URL":
		case "EMAIL":
		case "PHONE":
			return (
				<HienThiLienKet kieu={gia.kieu} chuoi={chuoi} trinhBay={gia.trinhBay} />
			);
		case "FILE":
			return Number(gia.giaTri) > 0 ? (
				<span className="tabular-nums">
					{m.tepTruong.soTep(Number(gia.giaTri))}
				</span>
			) : (
				<EmptyCellValue />
			);
		default:
			return gia.trinhBay ? gia.trinhBay(chuoi) : chuoi;
	}
}

export function HienThiTruong(props: GiaTriHienThi) {
	const locale = useLocale();
	return <>{veGiaTri(props, locale)}</>;
}

export function OTruongBang(props: GiaTriHienThi) {
	const locale = useLocale();
	const trong =
		props.kieu === "USER"
			? timNguoi(props) === null
			: props.kieu === "FILE"
				? !(Number(props.giaTri) > 0)
				: laRong(props.giaTri);
	if (trong) return <EmptyCellValue />;
	return (
		<span className="block min-w-0 truncate">{veGiaTri(props, locale)}</span>
	);
}

function cauTuChoi(ma: MaTuChoi, nhan: string, locale: Locale): string {
	const m = crmMessages(locale).truongKieu;
	return ma === "trong" ? m.trong(nhan) : m.tuChoi[ma];
}

function kieuNhap(kieu: KieuTruong): "text" | "url" | "email" | "tel" {
	if (kieu === "URL") return "url";
	if (kieu === "EMAIL") return "email";
	if (kieu === "PHONE") return "tel";
	return "text";
}

function chuoiSua(moTa: MoTaTruong, locale: Locale): string {
	if (laRong(moTa.giaTri)) return "";
	if (moTa.kieu === "NUMBER") return hienThiSo(Number(moTa.giaTri), locale);
	return String(moTa.giaTri);
}

function OSuaCoKiem({ moTa }: { moTa: MoTaTruong }) {
	const id = useId();
	const loiId = useId();
	const locale = useLocale();
	const m = crmMessages(locale).truongKieu;
	const [dangSua, datDangSua] = useState(false);
	const [nhap, datNhap] = useState("");
	const [loi, datLoi] = useState<string | null>(null);

	const moSua = () => {
		datNhap(chuoiSua(moTa, locale));
		datLoi(null);
		datDangSua(true);
	};

	const dong = () => {
		datLoi(null);
		datDangSua(false);
	};

	const chot = () => {
		const doc = docNhapTheoKieu(moTa.kieu, nhap, locale);
		if (doc.kind === "rong") {
			if (moTa.batBuoc) {
				datLoi(cauTuChoi("trong", moTa.nhan, locale));
				return;
			}
			dong();
			if (!laRong(moTa.giaTri)) moTa.luu(null);
			return;
		}
		if (doc.kind === "tu-choi") {
			datLoi(cauTuChoi(doc.ma, moTa.nhan, locale));
			return;
		}
		dong();
		if (doc.giaTri !== moTa.giaTri) moTa.luu(doc.giaTri);
	};

	const coLienKet =
		(moTa.kieu === "URL" || moTa.kieu === "EMAIL" || moTa.kieu === "PHONE") &&
		!laRong(moTa.giaTri);

	const daNguon = Boolean(moTa.nguon) && !laRong(moTa.giaTri);

	let dieuKhien: ReactNode;
	if (dangSua) {
		dieuKhien = (
			<div className="min-w-0">
				<Input
					id={id}
					type={kieuNhap(moTa.kieu)}
					inputMode={moTa.kieu === "NUMBER" ? "decimal" : undefined}
					autoFocus
					value={nhap}
					placeholder={moTa.goiY}
					aria-invalid={loi ? true : undefined}
					aria-describedby={loi ? loiId : undefined}
					onChange={(event) => {
						datNhap(event.target.value);
						datLoi(null);
					}}
					onBlur={() => {
						if (!loi) chot();
					}}
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							chot();
						}
						if (event.key === "Escape") {
							event.preventDefault();
							dong();
						}
					}}
				/>
				{loi ? <FieldError id={loiId}>{loi}</FieldError> : null}
			</div>
		);
	} else if (coLienKet) {
		dieuKhien = (
			<div className="flex h-8 min-w-0 items-center gap-1 px-2">
				{moTa.dangLuu ? <Spinner /> : null}
				<span className={cn("min-w-0 truncate", daNguon && SOURCED_VALUE)}>
					{veGiaTri(moTa, locale)}
				</span>
				<Button
					id={id}
					variant="ghost"
					size="icon-sm"
					aria-label={m.sua(moTa.nhan)}
					disabled={moTa.dangLuu}
					onClick={moSua}
				>
					<Icon icon={Edit} />
				</Button>
			</div>
		);
	} else {
		dieuKhien = (
			<Button
				id={id}
				variant="ghost"
				size="sm"
				className={CONTROL}
				disabled={moTa.dangLuu}
				onClick={moSua}
			>
				{moTa.dangLuu ? <Spinner /> : null}
				{laRong(moTa.giaTri) ? (
					<span className="truncate text-muted-foreground">
						{moTa.goiY ?? <EmptyCellValue />}
					</span>
				) : (
					<span className={cn("truncate", daNguon && SOURCED_VALUE)}>
						{veGiaTri(moTa, locale)}
					</span>
				)}
			</Button>
		);
	}

	const than =
		daNguon && moTa.nguon && !dangSua ? (
			<SourcedValue source={moTa.nguon}>{dieuKhien}</SourcedValue>
		) : (
			dieuKhien
		);

	if (moTa.deXuat) {
		return (
			<div className={cn(ROW, "items-start")}>
				<label htmlFor={id} className={cn(PROPERTY_LABEL, "pt-2")}>
					{moTa.nhan}
				</label>
				<div className="min-w-0">
					{than}
					{moTa.deXuat}
				</div>
			</div>
		);
	}

	return (
		<div className={cn(ROW, dangSua && "items-start")}>
			<label htmlFor={id} className={cn(PROPERTY_LABEL, dangSua && "pt-2")}>
				{moTa.nhan}
			</label>
			{than}
		</div>
	);
}

function OTich({ moTa }: { moTa: MoTaTruong }) {
	const id = useId();
	return (
		<div className={ROW}>
			<label htmlFor={id} className={PROPERTY_LABEL}>
				{moTa.nhan}
			</label>
			<div className="flex h-8 items-center gap-1.5 px-2">
				<Checkbox
					id={id}
					checked={moTa.giaTri === true}
					disabled={moTa.dangLuu}
					onCheckedChange={(checked) => moTa.luu(checked === true)}
				/>
				{moTa.dangLuu ? <Spinner /> : null}
			</div>
		</div>
	);
}

function luaChonNguoi(moTa: MoTaTruong, locale: Locale): LuaChonTruong[] {
	const m = crmMessages(locale);
	const nguoiDung = moTa.nguoiDung ?? [];
	const ds = [
		...(moTa.batBuoc
			? []
			: [{ value: RONG, label: moTa.nhanRong ?? m.owner.unassigned }]),
		...nguoiDung.map((nguoi) => ({ value: nguoi.id, label: nguoi.name })),
	];
	const hienTai = laRong(moTa.giaTri) ? null : String(moTa.giaTri);
	if (hienTai && moTa.nguoiDung && !ds.some((muc) => muc.value === hienTai)) {
		ds.push({
			value: hienTai,
			label: moTa.nguoi?.name ?? m.owner.formerMember,
		});
	}
	return ds;
}

function OChon({ moTa }: { moTa: MoTaTruong }) {
	const locale = useLocale();
	const m = crmMessages(locale);
	const luaChon =
		moTa.kieu === "USER"
			? luaChonNguoi(moTa, locale)
			: [
					...(moTa.batBuoc
						? []
						: [{ value: RONG, label: moTa.nhanRong ?? m.fieldValue.none }]),
					...(moTa.luaChon ?? []),
				];
	const giaTri = laRong(moTa.giaTri) ? RONG : String(moTa.giaTri);

	return (
		<InlineSelectField
			label={moTa.nhan}
			value={giaTri}
			options={luaChon}
			placeholder={moTa.kieu === "USER" ? m.owner.unassigned : undefined}
			emptyValue={moTa.batBuoc ? undefined : RONG}
			saving={moTa.dangLuu}
			onSave={(next) => moTa.luu(next === RONG ? null : next)}
		/>
	);
}

function OChuDai({ moTa }: { moTa: MoTaTruong }) {
	const o = (
		<InlineTextArea
			label={moTa.nhan}
			value={laRong(moTa.giaTri) ? null : String(moTa.giaTri)}
			placeholder={moTa.goiY}
			saving={moTa.dangLuu}
			onSave={(next) => moTa.luu(next === "" ? null : next)}
		/>
	);
	if (moTa.khongNhan) return o;
	return (
		<DetailSheetProperty label={moTa.nhan} wide>
			{o}
		</DetailSheetProperty>
	);
}

function ONgay({ moTa }: { moTa: MoTaTruong }) {
	return (
		<InlineDateField
			label={moTa.nhan}
			value={laRong(moTa.giaTri) ? null : String(moTa.giaTri)}
			saving={moTa.dangLuu}
			onSave={(next) => moTa.luu(next === "" ? null : next)}
		/>
	);
}

function OTien({ moTa }: { moTa: MoTaTruong }) {
	return (
		<InlineMoneyField
			label={moTa.nhan}
			cents={laRong(moTa.giaTri) ? null : Number(moTa.giaTri)}
			currency={moTa.tienTe ?? "USD"}
			saving={moTa.dangLuu}
			onSave={(next) => moTa.luu(next)}
		/>
	);
}

export type KhoAn = "sm" | "md" | "lg";

export type HangCoTruong = {
	fields: Record<string, GiaTriTruong>;
	soTepTheoTruong?: Record<string, number>;
};

type DongKieu = {
	hienThi: (gia: GiaTriHienThi) => ReactNode;
	suaTaiCho: (moTa: MoTaTruong) => ReactNode;
	oBang: (gia: GiaTriHienThi) => ReactNode;
	giaTriHang: (hang: HangCoTruong, khoa: string) => GiaTriTruong;
	anDuoi: KhoAn;
	canh: "left" | "right";
};

const giaTriHang = (hang: HangCoTruong, khoa: string): GiaTriTruong =>
	hang.fields[khoa] ?? null;

const soTepHang = (hang: HangCoTruong, khoa: string): GiaTriTruong => {
	const so = hang.soTepTheoTruong?.[khoa] ?? 0;
	return so > 0 ? so : null;
};

const hienThi = (gia: GiaTriHienThi) => <HienThiTruong {...gia} />;
const oBang = (gia: GiaTriHienThi) => <OTruongBang {...gia} />;
const suaChu = (moTa: MoTaTruong) => <OSuaCoKiem moTa={moTa} />;
const suaChon = (moTa: MoTaTruong) => <OChon moTa={moTa} />;

export const KIEU_TRUONG = {
	TEXT: {
		hienThi,
		suaTaiCho: suaChu,
		oBang,
		giaTriHang,
		anDuoi: "lg",
		canh: "left",
	},
	LONG_TEXT: {
		hienThi,
		suaTaiCho: (moTa) => <OChuDai moTa={moTa} />,
		oBang,
		giaTriHang,
		anDuoi: "lg",
		canh: "left",
	},
	NUMBER: {
		hienThi,
		suaTaiCho: suaChu,
		oBang,
		giaTriHang,
		anDuoi: "sm",
		canh: "right",
	},
	DATE: {
		hienThi,
		suaTaiCho: (moTa) => <ONgay moTa={moTa} />,
		oBang,
		giaTriHang,
		anDuoi: "lg",
		canh: "left",
	},
	CHECKBOX: {
		hienThi,
		suaTaiCho: (moTa) => <OTich moTa={moTa} />,
		oBang,
		giaTriHang,
		anDuoi: "lg",
		canh: "left",
	},
	SELECT: {
		hienThi,
		suaTaiCho: suaChon,
		oBang,
		giaTriHang,
		anDuoi: "lg",
		canh: "left",
	},
	URL: {
		hienThi,
		suaTaiCho: suaChu,
		oBang,
		giaTriHang,
		anDuoi: "md",
		canh: "left",
	},
	EMAIL: {
		hienThi,
		suaTaiCho: suaChu,
		oBang,
		giaTriHang,
		anDuoi: "md",
		canh: "left",
	},
	PHONE: {
		hienThi,
		suaTaiCho: suaChu,
		oBang,
		giaTriHang,
		anDuoi: "md",
		canh: "left",
	},
	USER: {
		hienThi,
		suaTaiCho: suaChon,
		oBang,
		giaTriHang,
		anDuoi: "md",
		canh: "left",
	},
	FILE: {
		hienThi,
		suaTaiCho: (moTa) =>
			moTa.dichTep ? (
				<OTep
					nhan={moTa.nhan}
					khoa={moTa.khoa}
					tep={moTa.tep ?? []}
					dich={moTa.dichTep}
				/>
			) : null,
		oBang,
		giaTriHang: soTepHang,
		anDuoi: "md",
		canh: "left",
	},
	MONEY: {
		hienThi,
		suaTaiCho: (moTa) => <OTien moTa={moTa} />,
		oBang,
		giaTriHang,
		anDuoi: "sm",
		canh: "right",
	},
} as const satisfies Record<KieuTruong, DongKieu>;

export function anDuoiTheoKieu(kieu: KieuTruong): KhoAn {
	return KIEU_TRUONG[kieu].anDuoi;
}

export function canhTheoKieu(kieu: KieuTruong): "left" | "right" {
	return KIEU_TRUONG[kieu].canh;
}

export function giaTriTrongHang(
	kieu: KieuTruong,
	hang: HangCoTruong,
	khoa: string,
): GiaTriTruong {
	return KIEU_TRUONG[kieu].giaTriHang(hang, khoa);
}

export function OTruongPhieu({ moTa }: { moTa: MoTaTruong }) {
	return <>{KIEU_TRUONG[moTa.kieu].suaTaiCho(moTa)}</>;
}

const MA_LOI_MAY_CHU = {
	SELECT: "lua-chon",
	USER: "nguoi",
} as const satisfies Partial<Record<KieuTruong, MaTuChoi>>;

function maLoiMayChu(kieu: KieuTruong): MaTuChoi {
	if (kieu === "SELECT" || kieu === "USER") return MA_LOI_MAY_CHU[kieu];
	return "khac";
}

export function loiLuuTruong(
	moTa: Pick<MoTaTruong, "nhan" | "kieu">,
	locale: Locale,
): string {
	const m = crmMessages(locale).truongKieu;
	return `${m.chuaLuu(moTa.nhan)} ${m.tuChoi[maLoiMayChu(moTa.kieu)]}`;
}

export function cauLoiTheoKhoa(
	khoa: string | undefined,
	dsMoTa: Pick<MoTaTruong, "khoa" | "nhan" | "kieu">[],
	locale: Locale,
): string | null {
	const moTa = khoa ? dsMoTa.find((mt) => mt.khoa === khoa) : undefined;
	return moTa ? loiLuuTruong(moTa, locale) : null;
}

export type KhoaLoi = { khoa: string; tuTao: boolean };

export function khoaCuaLuot(
	cacKhoa: string[],
	cacKhoaTuTao: string[] | undefined,
	doiKhoa: Readonly<Record<string, string>>,
): KhoaLoi | null {
	if (cacKhoaTuTao) {
		const [khoa] = cacKhoaTuTao;
		return cacKhoaTuTao.length === 1 && khoa ? { khoa, tuTao: true } : null;
	}
	const [khoa] = cacKhoa;
	if (cacKhoa.length !== 1 || !khoa) return null;
	return { khoa: doiKhoa[khoa] ?? khoa, tuTao: false };
}
