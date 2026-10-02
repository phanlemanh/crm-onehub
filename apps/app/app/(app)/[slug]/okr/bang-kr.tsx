"use client";

import Add from "@carbon/icons-react/es/Add";
import Attachment from "@carbon/icons-react/es/Attachment";
import Help from "@carbon/icons-react/es/Help";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import { CardTableEmpty } from "@crm/ui/components/card-table";
import { EmptyCellValue } from "@crm/ui/components/empty-cell";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	SimpleTable,
	SimpleTableCell,
	type SimpleTableColumn,
	SimpleTableNote,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { TableCell } from "@crm/ui/components/table";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@crm/ui/components/tooltip";
import type { Locale } from "@crm/ui/lib/locale";
import { kiemOkr } from "@crm/validation/okr-kiem";
import type { LoaiMucTieu } from "@crm/validation/okr-muc-tieu";
import { Fragment, type ReactNode } from "react";
import { OwnerCell } from "@/components/crm/owner-cell";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { okrMessages } from "@/lib/messages/okr";
import { okrCanhKrMessages } from "@/lib/messages/okr-canh-kr";
import { okrKhepMessages } from "@/lib/messages/okr-khep";
import { type OkrSoMessages, okrSoMessages } from "@/lib/messages/okr-so";
import { coNoiDung, type DiemCam } from "./diem-cam";
import { type KetQua, type MucTieu, nhanKr } from "./kieu";
import {
	chuSo,
	KHOA_DAU,
	type NguonMay,
	useXemDuocBanGhi,
	type XemBanGhi,
} from "./nguon-so";
import { TienDoGon, TienDoKr } from "./tien-do-kr";

export function giaTri(
	kr: Pick<KetQua, "kind" | "unit">,
	so: number,
	locale: Locale,
): string {
	const m = okrMessages(locale);
	if (kr.kind === "moc") return so >= 1 ? m.moc.xong : m.moc.chuaXong;
	const chu = chuSo(so, locale);
	return kr.unit === "%" ? `${chu}%` : `${chu} ${kr.unit}`.trim();
}

function soTran(
	kr: Pick<KetQua, "kind" | "unit">,
	so: number,
	locale: Locale,
): string {
	if (kr.kind === "moc") return giaTri(kr, so, locale);
	const chu = chuSo(so, locale);
	return kr.unit === "%" ? `${chu}%` : chu;
}

function nguonMayCua(kr: KetQua): NguonMay | null {
	if (kr.source !== "tay") return kr.source;
	return kr.doCanh ? (kr.nguonMay?.loai ?? null) : null;
}

const CHUP_THEO_NHIP: readonly NguonMay[] = ["crm", "bang-tinh"];

function chuChuaCoSo(may: NguonMay | null, s: OkrSoMessages): string | null {
	if (may === null) return null;
	if (may === "api") return s.trangThai.bangKr.chuaGhiApi;
	return CHUP_THEO_NHIP.includes(may) ? s.trangThai.bangKr.chuaChup : null;
}

function SoCuaKr({
	kr,
	xem,
	moc = true,
}: {
	kr: KetQua;
	xem: XemBanGhi;
	moc?: boolean;
}) {
	const neo = (ten: string, gia: string) => (moc ? { [ten]: gia } : {});
	const locale = useLocale();
	const s = okrSoMessages(locale);
	const moSo = useOpenRecord();
	const coMay = kr.source !== "tay" || kr.doCanh;
	const dich = giaTri(kr, kr.targetValue, locale);

	if (!coMay)
		return kr.kind === "moc" ? (
			giaTri(kr, kr.currentValue, locale)
		) : (
			<span translate="no">
				{giaTri(kr, kr.currentValue, locale)} / {dich}
			</span>
		);

	const may = nguonMayCua(kr);
	const chuaCoSo = kr.soMay === null ? chuChuaCoSo(may, s) : null;
	const so =
		kr.doCanh && kr.soMay
			? s.trangThai.bangKr.doCanh(
					soTran(kr, kr.currentValue, locale),
					soTran(kr, kr.soMay.giaTri, locale),
				)
			: giaTri(kr, kr.currentValue, locale);
	const hienSo = kr.doCanh && kr.soMay ? so : <span translate="no">{so}</span>;

	return (
		<span className="inline-flex flex-col items-end gap-1">
			<span className="inline-flex flex-wrap items-center justify-end gap-2">
				{may ? (
					<Badge variant="outline" {...neo("data-dau-nguon", may)}>
						{s.dau[KHOA_DAU[may]]}
					</Badge>
				) : null}
				<span>
					{xem === "chua-biet" ? (
						<span {...neo("data-so-kr-cho", kr.id)}>{hienSo}</span>
					) : xem === "duoc" ? (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="link"
									size="xs"
									{...neo("data-so-kr", kr.id)}
									onClick={() => moSo({ kind: "so-kr", id: kr.id })}
								>
									{hienSo}
								</Button>
							</TooltipTrigger>
							<TooltipContent>
								{s.trangThai.bangKr.moSo(kr.title)}
							</TooltipContent>
						</Tooltip>
					) : (
						<Tooltip>
							<TooltipTrigger asChild>
								<span {...neo("data-so-kr-tran", kr.id)}>{hienSo}</span>
							</TooltipTrigger>
							<TooltipContent>{s.trangThai.bangKr.chiOkr}</TooltipContent>
						</Tooltip>
					)}
					{kr.kind === "moc" ? null : (
						<span translate="no">
							{" / "}
							{dich}
						</span>
					)}
				</span>
			</span>
			{chuaCoSo ? (
				<SimpleTableNote {...neo("data-chua-chup", "")}>
					{chuaCoSo}
				</SimpleTableNote>
			) : null}
		</span>
	);
}

export type DemCanhKr = {
	xong: number;
	tong: number;
	sangKien: number;
	coBangChung: boolean;
	suaDuoc: boolean;
};

const DEM_TRONG: DemCanhKr = {
	xong: 0,
	tong: 0,
	sangKien: 0,
	coBangChung: false,
	suaDuoc: false,
};

export function SoViecKr({
	kr,
	dem,
}: {
	kr: Pick<KetQua, "id" | "title">;
	dem: DemCanhKr;
}) {
	const m = okrCanhKrMessages(useLocale()).bangKr;
	const mo = useOpenRecord();
	const moKr = () => mo({ kind: "kr", id: kr.id });
	if (dem.tong + dem.sangKien === 0)
		return (
			<Button
				size="sm"
				variant="ghost"
				data-mo-khung-kr={kr.id}
				aria-label={dien(m.moViec, { ten: kr.title })}
				onClick={moKr}
			>
				{dem.suaDuoc ? (
					<>
						<Icon icon={Add} data-icon="inline-start" />
						{m.them}
					</>
				) : (
					<EmptyCellValue />
				)}
			</Button>
		);
	return (
		<Button
			size="sm"
			variant="ghost"
			data-mo-khung-kr={kr.id}
			aria-label={dien(m.moViec, { ten: kr.title })}
			onClick={moKr}
		>
			{dem.tong > 0 ? (
				<span className="tabular-nums" data-so-viec={`${dem.xong}/${dem.tong}`}>
					{dem.xong}/{dem.tong}
				</span>
			) : null}
			{dem.sangKien > 0 ? (
				<span
					className="text-muted-foreground"
					data-so-sang-kien={dem.sangKien}
				>
					{dem.tong > 0 ? "· " : null}
					{dien(m.soSangKien, { n: dem.sangKien })}
				</span>
			) : null}
		</Button>
	);
}

function thieuDoiTrong(keyResults: KetQua[]): boolean {
	return kiemOkr({
		title: "",
		whyNow: "",
		keyResults: keyResults.map((k) => ({
			title: k.title,
			kind: k.kind,
			startValue: k.startValue,
			targetValue: k.targetValue,
		})),
	}).some((h) => h.ma === "thieu-doi-trong");
}

function CanhBaoDoiTrong() {
	const mk = okrKhepMessages(useLocale());
	return (
		<div className="px-5 py-3" data-canh-bao-doi-trong>
			<Alert variant="warning">
				<Icon icon={Help} />
				<AlertTitle>{mk.doiTrong.tieuDe}</AlertTitle>
				<AlertDescription>
					{mk.luat["thieu-doi-trong"]} {mk.doiTrong.khongChan}
				</AlertDescription>
			</Alert>
		</div>
	);
}

const AN_DUOI_MD = "hidden md:table-cell";

const KIEU_TU_KHOI_DIEM: readonly KetQua["kind"][] = [
	"tang-toi",
	"giam-xuong",
	"phan-tram",
];

function dongPhu(kr: KetQua, locale: Locale): string {
	const m = okrMessages(locale);
	const kieu = m.kieu[kr.kind];
	if (!KIEU_TU_KHOI_DIEM.includes(kr.kind) || kr.startValue === 0) return kieu;
	return m.khoiMucTieu.tuKhoiDiem(kieu, giaTri(kr, kr.startValue, locale));
}

function OTienDoKr({
	kr,
	kind,
	expected,
	xem,
}: {
	kr: KetQua;
	kind: LoaiMucTieu;
	expected: number | null;
	xem: XemBanGhi;
}) {
	return (
		<div className="flex min-w-0 flex-col gap-1.5" data-o-tien-do>
			<SoCuaKr kr={kr} xem={xem} />
			<TienDoKr
				expected={expected}
				kind={kind}
				laMoc={kr.kind === "moc"}
				progress={kr.progress}
				ten={kr.title}
			/>
		</div>
	);
}

function HangKr({
	kr,
	thuTu,
	kind,
	expected,
	danhDauCuaToi,
	xem,
	canh,
	hanhDong,
	cotMo,
	nested,
	joined,
	sauTen,
}: {
	kr: KetQua;
	thuTu: number;
	kind: LoaiMucTieu;
	expected: number | null;
	danhDauCuaToi: boolean;
	xem: XemBanGhi;
	canh?: ReadonlyMap<string, DemCanhKr>;
	hanhDong?: (kr: KetQua) => ReactNode;
	cotMo: boolean;
	nested: boolean;
	joined: boolean;
	sauTen: ReactNode;
}) {
	const locale = useLocale();
	const m = okrMessages(locale);
	const mc = okrCanhKrMessages(locale).bangKr;
	return (
		<SimpleTableRow
			data-kr={kr.id}
			data-kr-hang={kr.id}
			joined={joined}
			nested={nested}
		>
			{cotMo ? <SimpleTableCell /> : null}
			<SimpleTableCell className="whitespace-normal align-top">
				<span className="flex min-w-0 gap-3">
					<span className="w-8 shrink-0 pt-px text-muted-foreground text-xs tabular-nums">
						{nhanKr(thuTu)}
					</span>
					<span className="flex min-w-0 flex-1 flex-col gap-1">
						<span className="flex flex-wrap items-center gap-x-2 gap-y-1">
							<span className="wrap-anywhere whitespace-normal" translate="no">
								{kr.title}
							</span>
							{coNoiDung(sauTen) ? sauTen : null}
						</span>
						<span className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
							{dongPhu(kr, locale)}
							<span className="md:hidden" translate="no">
								{kr.owner.name}
							</span>
							{danhDauCuaToi && kr.laCuaToi ? (
								<Badge variant="outline" data-cua-toi>
									{m.cuaToi}
								</Badge>
							) : null}
							{canh?.get(kr.id)?.coBangChung ? (
								<Badge variant="outline" data-co-bang-chung>
									<Icon icon={Attachment} data-icon="inline-start" />
									{mc.coBangChung}
								</Badge>
							) : null}
						</span>
						<span className="w-full pt-1 md:hidden">
							<TienDoGon
								dong=""
								expected={expected}
								kind={kind}
								laMoc={kr.kind === "moc"}
								progress={kr.progress}
								ten={kr.title}
								tren={<SoCuaKr kr={kr} moc={false} xem={xem} />}
							/>
						</span>
					</span>
				</span>
			</SimpleTableCell>
			<SimpleTableCell className={`${AN_DUOI_MD} align-top`}>
				<span translate="no">
					<OwnerCell owner={{ ...kr.owner, image: null }} />
				</span>
			</SimpleTableCell>
			<SimpleTableCell
				className={`${AN_DUOI_MD} align-top`}
				data-nguon={kr.source}
				data-do-canh={kr.doCanh ? "" : undefined}
			>
				<OTienDoKr expected={expected} kind={kind} kr={kr} xem={xem} />
			</SimpleTableCell>
			{canh ? (
				<SimpleTableCell data-cot-viec={kr.id}>
					<SoViecKr kr={kr} dem={canh.get(kr.id) ?? DEM_TRONG} />
				</SimpleTableCell>
			) : null}
			{hanhDong ? <SimpleTableCell>{hanhDong(kr)}</SimpleTableCell> : null}
		</SimpleTableRow>
	);
}

function HangTraiCot({
	children,
	soCot,
	cotMo,
	nested,
	neo,
}: {
	children: ReactNode;
	soCot: number;
	cotMo: boolean;
	nested: boolean;
	neo: { "data-duoi-muc-tieu": string } | { "data-duoi-kr": string };
}) {
	return (
		<SimpleTableRow nested={nested} {...neo}>
			{cotMo ? <SimpleTableCell /> : null}
			<SimpleTableCell
				className="whitespace-normal"
				colSpan={cotMo ? soCot - 1 : soCot}
			>
				{children}
			</SimpleTableCell>
		</SimpleTableRow>
	);
}

export function BangKr({
	keyResults,
	kind,
	expected,
	danhDauCuaToi,
	hanhDong,
	nhanHanhDong,
	hoiDoiTrong,
	canh,
	dau,
	cotMo = false,
	header,
	an = false,
	nested = false,
	diemCam,
	mucTieu = null,
	tenCotDau,
	duoiDau,
}: {
	keyResults: KetQua[];
	kind: LoaiMucTieu;
	expected: number | null;
	danhDauCuaToi: boolean;
	hanhDong?: (kr: KetQua) => ReactNode;
	nhanHanhDong?: string;
	hoiDoiTrong?: boolean;
	canh?: ReadonlyMap<string, DemCanhKr>;
	dau?: ReactNode;
	cotMo?: boolean;
	header?: "visible" | "sr-only";
	an?: boolean;
	nested?: boolean;
	diemCam?: DiemCam;
	mucTieu?: MucTieu | null;
	tenCotDau?: string;
	duoiDau?: ReactNode;
}) {
	const locale = useLocale();
	const m = okrMessages(locale);
	const mc = okrCanhKrMessages(locale).bangKr;
	const canhBao = hoiDoiTrong === true && thieuDoiTrong(keyResults);
	const xem = useXemDuocBanGhi();
	const cot: SimpleTableColumn[] = [
		...(cotMo ? [{ id: "mo", srLabel: m.cot.thuMo, width: "w-12" }] : []),
		{ id: "ten", header: tenCotDau ?? m.cot.kr },
		{
			id: "phuTrach",
			header: m.cot.phuTrach,
			width: "w-48",
			className: AN_DUOI_MD,
		},
		{
			id: "tienDo",
			header: m.cot.tienDo,
			width: "w-64",
			className: AN_DUOI_MD,
		},
		...(canh ? [{ id: "viec", header: mc.cotViec, width: "w-36" }] : []),
		...(hanhDong
			? [{ id: "hanhDong", srLabel: nhanHanhDong, width: "w-12" }]
			: []),
	];
	const duoiMt = mucTieu && !an ? diemCam?.duoiMucTieu?.(mucTieu) : null;

	return (
		<>
			{canhBao ? <CanhBaoDoiTrong /> : null}
			<SimpleTable columns={cot} header={header}>
				{dau}
				{coNoiDung(duoiMt) && mucTieu ? (
					<HangTraiCot
						cotMo={cotMo}
						neo={{ "data-duoi-muc-tieu": mucTieu.id }}
						nested={nested}
						soCot={cot.length}
					>
						{duoiMt}
					</HangTraiCot>
				) : null}
				{duoiDau}
				{an
					? null
					: keyResults.map((kr, i) => {
							const duoi = diemCam?.duoiKr?.(kr, mucTieu);
							const coDuoi = coNoiDung(duoi);
							return (
								<Fragment key={kr.id}>
									<HangKr
										canh={canh}
										cotMo={cotMo}
										danhDauCuaToi={danhDauCuaToi}
										expected={expected}
										hanhDong={hanhDong}
										joined={coDuoi}
										kind={kind}
										kr={kr}
										nested={nested}
										sauTen={diemCam?.sauTenKr?.(kr, mucTieu)}
										thuTu={i + 1}
										xem={xem}
									/>
									{coDuoi ? (
										<HangTraiCot
											cotMo={cotMo}
											neo={{ "data-duoi-kr": kr.id }}
											nested={nested}
											soCot={cot.length}
										>
											{duoi}
										</HangTraiCot>
									) : null}
								</Fragment>
							);
						})}
				{!an && keyResults.length === 0 && !dau ? (
					<SimpleTableRow>
						<TableCell colSpan={cot.length} className="p-0">
							<CardTableEmpty>{m.chuaCoKr}</CardTableEmpty>
						</TableCell>
					</SimpleTableRow>
				) : null}
			</SimpleTable>
		</>
	);
}
