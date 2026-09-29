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
import type { ReactNode } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { okrMessages } from "@/lib/messages/okr";
import { okrCanhKrMessages } from "@/lib/messages/okr-canh-kr";
import { okrKhepMessages } from "@/lib/messages/okr-khep";
import { type OkrSoMessages, okrSoMessages } from "@/lib/messages/okr-so";
import { CELL, type KetQua } from "./kieu";
import {
	chuSo,
	KHOA_DAU,
	type NguonMay,
	useXemDuocBanGhi,
	type XemBanGhi,
} from "./nguon-so";
import { TienDoKr } from "./tien-do-kr";

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

function SoCuaKr({ kr, xem }: { kr: KetQua; xem: XemBanGhi }) {
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
					<Badge variant="outline" data-dau-nguon={may}>
						{s.dau[KHOA_DAU[may]]}
					</Badge>
				) : null}
				<span>
					{xem === "chua-biet" ? (
						<span data-so-kr-cho={kr.id}>{hienSo}</span>
					) : xem === "duoc" ? (
						<Tooltip>
							<TooltipTrigger asChild>
								<Button
									variant="link"
									size="xs"
									data-so-kr={kr.id}
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
								<span data-so-kr-tran={kr.id}>{hienSo}</span>
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
				<SimpleTableNote data-chua-chup>{chuaCoSo}</SimpleTableNote>
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

export function BangKr({
	keyResults,
	kind,
	expected,
	danhDauCuaToi,
	hanhDong,
	nhanHanhDong,
	hoiDoiTrong,
	canh,
}: {
	keyResults: KetQua[];
	kind: LoaiMucTieu;
	expected: number | null;
	danhDauCuaToi: boolean;
	hanhDong?: (kr: KetQua) => ReactNode;
	nhanHanhDong?: string;
	hoiDoiTrong?: boolean;
	canh?: ReadonlyMap<string, DemCanhKr>;
}) {
	const locale = useLocale();
	const m = okrMessages(locale);
	const mc = okrCanhKrMessages(locale).bangKr;
	const canhBao = hoiDoiTrong === true && thieuDoiTrong(keyResults);
	const xem = useXemDuocBanGhi();
	const cot: SimpleTableColumn[] = [
		{ id: "ten", header: m.cot.kr },
		{ id: "phuTrach", header: m.cot.phuTrach, width: "w-40" },
		{ id: "tienDo", header: m.cot.tienDo, width: "w-48" },
		{ id: "dich", header: m.cot.dich, width: "w-40", align: "right" },
		...(canh ? [{ id: "viec", header: mc.cotViec, width: "w-36" }] : []),
		...(hanhDong
			? [{ id: "hanhDong", srLabel: nhanHanhDong, width: "w-12" }]
			: []),
	];

	return (
		<>
			{canhBao ? <CanhBaoDoiTrong /> : null}
			<SimpleTable columns={cot}>
				{keyResults.map((kr) => (
					<SimpleTableRow key={kr.id} data-kr={kr.id} data-kr-hang={kr.id}>
						<TableCell className={CELL}>
							<span className="flex min-w-0 flex-col gap-1">
								<span className="whitespace-normal" translate="no">
									{kr.title}
								</span>
								<span className="flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
									{m.kieu[kr.kind]}
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
							</span>
						</TableCell>
						<TableCell className={CELL}>
							<span translate="no">{kr.owner.name}</span>
						</TableCell>
						<TableCell className={CELL}>
							<TienDoKr
								ten={kr.title}
								progress={kr.progress}
								expected={expected}
								kind={kind}
								laMoc={kr.kind === "moc"}
							/>
						</TableCell>
						<TableCell
							className={`${CELL} text-right tabular-nums`}
							data-nguon={kr.source}
							data-do-canh={kr.doCanh ? "" : undefined}
						>
							<SoCuaKr kr={kr} xem={xem} />
						</TableCell>
						{canh ? (
							<TableCell className={CELL} data-cot-viec={kr.id}>
								<SoViecKr kr={kr} dem={canh.get(kr.id) ?? DEM_TRONG} />
							</TableCell>
						) : null}
						{hanhDong ? (
							<TableCell className={CELL}>{hanhDong(kr)}</TableCell>
						) : null}
					</SimpleTableRow>
				))}
				{keyResults.length === 0 ? (
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
