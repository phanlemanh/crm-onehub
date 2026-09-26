"use client";

import { Button } from "@crm/ui/components/button";
import { Combobox, type ComboboxOption } from "@crm/ui/components/combobox";
import { CopyValue } from "@crm/ui/components/copy-value";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@crm/ui/components/input-group";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import type { Locale } from "@crm/ui/lib/locale";
import {
	BAC_GHI_DANH,
	CHI_SO_OKR,
	MA_CHI_SO,
	type MaChiSo,
	PHAM_VI_CHI_SO,
} from "@crm/validation/okr-chi-so";
import { NGUON_KR, type NguonKr } from "@crm/validation/okr-kr";
import { oSheet, sheetIdTuUrl } from "@crm/validation/okr-nguon";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useId, useState } from "react";
import { useApiOrigin } from "@/components/api-origin";
import { okrSoMessages } from "@/lib/messages/okr-so";
import { OKR_SO_MAN } from "@/lib/okr-so-man";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import type { KetQua } from "./kieu";
import {
	bacCua,
	type ChoDoc,
	type MucTieuNguon,
	type NhapNguon,
	nguonDaDoi,
	nhapNguonDau,
	phamViCua,
	type TrangThaiDoc,
	trangThaiDoc,
	vaoDatNguon,
} from "./nguon-so-luat";

export type { MucTieuNguon } from "./nguon-so-luat";

export type LuaChonPhamVi = {
	boPhan: ComboboxOption[];
	phongBan: ComboboxOption[];
	nguoi: ComboboxOption[];
	dangTai: boolean;
};

export const NHAN_NGUON = {
	tay: "tay",
	crm: "crm",
	api: "api",
	"bang-tinh": "bangTinh",
} as const satisfies Record<NguonKr, string>;

const DINH_DANG = { vi: "vi-VN", en: "en-GB" } satisfies Record<Locale, string>;

function luaChonPhamVi(
	cay: RouterOutputs["org"]["tree"] | undefined,
	thanhVien: RouterOutputs["okr"]["thanhVien"] | undefined,
	dangTai: boolean,
): LuaChonPhamVi {
	const divisions = cay?.divisions ?? [];
	return {
		boPhan: divisions.map((d) => ({ value: d.id, label: d.name })),
		phongBan: [
			...divisions.flatMap((d) => d.departments),
			...(cay?.chuaXep ?? []),
		].map((p) => ({ value: p.id, label: p.name })),
		nguoi: (thanhVien ?? []).map((u) => ({
			value: u.id,
			label: u.name,
			hint: u.email,
			keywords: [u.email],
		})),
		dangTai,
	};
}

export function useNguonSo({
	objectiveId,
	kr,
	mucTieu,
	baoLoi,
}: {
	objectiveId: string;
	kr: KetQua | null;
	mucTieu: MucTieuNguon;
	baoLoi: (loi: string | null) => void;
}) {
	const trpc = useTRPC();
	const cache = useCrmCache();
	const [krId, setKrId] = useState<string | null>(kr?.id ?? null);
	const [gia, setGia] = useState<NhapNguon>(() => nhapNguonDau(kr, mucTieu));
	const [cho, setCho] = useState<ChoDoc>(() => ({
		docTruoc: undefined,
		tu: Date.now(),
	}));
	const moiNhat = (du: { keyResults: KetQua[] } | undefined) =>
		du?.keyResults.find((k) => k.id === krId) ?? null;
	const mt = useQuery({
		...trpc.okr.objective.queryOptions({ id: objectiveId }),
		refetchInterval: (q) =>
			trangThaiDoc(moiNhat(q.state.data), gia, cho, Date.now())?.loai ===
			"dang-doc"
				? OKR_SO_MAN.docThuLamMoiMs
				: false,
	});
	const bayGio = Math.max(mt.dataUpdatedAt, Date.now());
	const canPhamVi = gia.loai === "crm";
	const cay = useQuery({ ...trpc.org.tree.queryOptions(), enabled: canPhamVi });
	const thanhVien = useQuery({
		...trpc.okr.thanhVien.queryOptions(),
		enabled: canPhamVi,
	});
	const datNguon = useMutation(trpc.okr.datNguonKr.mutationOptions());
	const goc =
		moiNhat(mt.data) ?? (krId !== null && krId === kr?.id ? kr : null);
	const doiNguon = nguonDaDoi(goc, gia);
	const docThu = trangThaiDoc(goc, gia, cho, bayGio);
	const docTruoc = goc?.nguonMay?.docLuc ?? null;

	const luu = async (id: string): Promise<boolean> => {
		const vao = doiNguon ? vaoDatNguon(id, gia) : null;
		if (!vao) return false;
		await datNguon.mutateAsync(vao);
		if (vao.loai !== "bang-tinh") return false;
		setCho({ docTruoc, tu: Date.now() });
		return true;
	};

	const docLai = () => {
		const vao = goc ? vaoDatNguon(goc.id, gia) : null;
		if (!vao || datNguon.isPending) return;
		baoLoi(null);
		datNguon.mutate(vao, {
			onSuccess: () => {
				setCho({ docTruoc, tu: Date.now() });
				void cache.okr(objectiveId);
			},
			onError: (e) => baoLoi(e.message),
		});
	};

	return {
		krId,
		datKrId: setKrId,
		goc,
		dangCho: krId !== null && goc === null,
		mucTieu: mt.data ?? mucTieu,
		gia,
		datGia: setGia,
		doiNguon,
		hopLe: vaoDatNguon(krId ?? "moi", gia) !== null,
		docThu,
		luu,
		docLai:
			docThu?.loai === "loi" || docThu?.loai === "qua-han" ? docLai : null,
		dangGui: datNguon.isPending,
		phamVi: luaChonPhamVi(
			cay.data,
			thanhVien.data,
			cay.isPending || thanhVien.isPending,
		),
	};
}

export type NguonSoProps = {
	kr: KetQua | null;
	objective: MucTieuNguon;
	khoa: boolean;
	gia: NhapNguon;
	datGia: (g: NhapNguon) => void;
	phamVi: LuaChonPhamVi;
	docThu: TrangThaiDoc | null;
	docLai: (() => void) | null;
	dangDocLai: boolean;
};

export function NguonSo({
	kr,
	objective,
	khoa,
	gia,
	datGia,
	phamVi,
	docThu,
	docLai,
	dangDocLai,
}: NguonSoProps) {
	const locale = useLocale();
	const s = okrSoMessages(locale);
	const t = s.trangThai.hopThoai;
	const trpc = useTRPC();
	const ma = useId();
	const chiSo = useQuery(trpc.okr.chiSo.queryOptions());
	const [moDoCanh, setMoDoCanh] = useState(false);

	const krTay = (kr?.source ?? "tay") === "tay";
	const doCanh = krTay && (moDoCanh || (kr?.nguonMay ?? null) !== null);
	const khoaChon = khoa && !doCanh;
	const khoaO = khoa && !krTay;
	const sheetsBat = chiSo.data?.sheetsBat === true;
	const luaChon = NGUON_KR.filter(
		(n) => n !== "bang-tinh" || sheetsBat || gia.loai === "bang-tinh",
	);

	return (
		<>
			<Field
				data-nguon-so={gia.loai}
				data-khoa={khoaChon || undefined}
				data-disabled={khoaChon || undefined}
			>
				<FieldLabel id={`${ma}-nguon`}>{t.oNguon}</FieldLabel>
				<ToggleGroup
					aria-labelledby={`${ma}-nguon`}
					layout="grid-2"
					disabled={khoaChon}
					onValueChange={(v) => {
						const moi = NGUON_KR.find((n) => n === v);
						if (moi) datGia({ ...gia, loai: moi });
					}}
					type="single"
					value={gia.loai}
					variant="outline"
				>
					{luaChon.map((n) => (
						<ToggleGroupItem key={n} value={n} data-lua-chon-nguon={n}>
							{s.nguon[NHAN_NGUON[n]].nhan}
						</ToggleGroupItem>
					))}
				</ToggleGroup>
				{chiSo.data && !sheetsBat ? (
					<FieldDescription data-sheets-tat>{t.sheets.tat}</FieldDescription>
				) : null}
				{khoa ? (
					<FieldDescription data-nguon-khoa>{t.khoa.chuThich}</FieldDescription>
				) : null}
				{khoa && krTay && !doCanh ? (
					<div>
						<Button
							data-nut="them-do-canh"
							onClick={() => {
								setMoDoCanh(true);
								datGia({ ...gia, loai: "crm" });
							}}
							size="sm"
							type="button"
							variant="outline"
						>
							{t.khoa.themDoCanh}
						</Button>
					</div>
				) : null}
			</Field>
			{gia.loai === "crm" ? (
				<NhanhCrm
					cycleId={objective.cycleId}
					gia={gia}
					datGia={datGia}
					khoa={khoaO}
					phamVi={phamVi}
					chiSoCo={chiSo.data?.chiSo ?? MA_CHI_SO}
				/>
			) : null}
			{gia.loai === "api" ? <NhanhApi krId={kr?.id ?? null} /> : null}
			{gia.loai === "bang-tinh" ? (
				<NhanhSheets
					gia={gia}
					datGia={datGia}
					khoa={khoaO}
					email={chiSo.data?.emailSheets ?? null}
					docThu={docThu}
					docLai={khoaO ? null : docLai}
					dangDocLai={dangDocLai}
				/>
			) : null}
		</>
	);
}

function NhanhCrm({
	cycleId,
	gia,
	datGia,
	khoa,
	phamVi,
	chiSoCo,
}: {
	cycleId: string;
	gia: NhapNguon;
	datGia: (g: NhapNguon) => void;
	khoa: boolean;
	phamVi: LuaChonPhamVi;
	chiSoCo: readonly MaChiSo[];
}) {
	const locale = useLocale();
	const s = okrSoMessages(locale);
	const t = s.trangThai.hopThoai;
	const ma = useId();
	const luaChon =
		gia.kieuPhamVi === "bo-phan"
			? phamVi.boPhan
			: gia.kieuPhamVi === "phong-ban"
				? phamVi.phongBan
				: phamVi.nguoi;

	return (
		<>
			<Field data-disabled={khoa || undefined}>
				<FieldLabel htmlFor={`${ma}-chi-so`}>{t.oChiSo}</FieldLabel>
				<Select
					disabled={khoa}
					onValueChange={(v) => {
						const moi = MA_CHI_SO.find((c) => c === v);
						if (moi) datGia({ ...gia, chiSo: moi });
					}}
					value={gia.chiSo}
				>
					<SelectTrigger id={`${ma}-chi-so`} data-o-chi-so={gia.chiSo}>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{chiSoCo.map((c) => (
							<SelectItem key={c} value={c}>
								{s.chiSo[c].nhan}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<FieldDescription data-dinh-nghia-chi-so>
					{s.chiSo[gia.chiSo].dinhNghia}
				</FieldDescription>
			</Field>
			{gia.chiSo === "ghi-danh-dat-bac" ? (
				<Field data-disabled={khoa || undefined}>
					<FieldLabel htmlFor={`${ma}-bac`}>{t.oBac}</FieldLabel>
					<Select
						disabled={khoa}
						onValueChange={(v) => {
							const moi = BAC_GHI_DANH.find((b) => b === v);
							if (moi) datGia({ ...gia, bac: moi });
						}}
						value={gia.bac}
					>
						<SelectTrigger id={`${ma}-bac`} data-o-bac={gia.bac}>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{BAC_GHI_DANH.map((b) => (
								<SelectItem key={b} value={b}>
									{s.bac[b].nhan}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<FieldDescription>{s.bac[gia.bac].dinhNghia}</FieldDescription>
				</Field>
			) : null}
			<div className="grid items-start gap-3 sm:grid-cols-2">
				<Field data-disabled={khoa || undefined}>
					<FieldLabel htmlFor={`${ma}-kieu-pham-vi`}>
						{s.phamVi.nhan}
					</FieldLabel>
					<Select
						disabled={khoa}
						onValueChange={(v) => {
							const moi = PHAM_VI_CHI_SO.find((k) => k === v);
							if (moi) datGia({ ...gia, kieuPhamVi: moi, idPhamVi: "" });
						}}
						value={gia.kieuPhamVi}
					>
						<SelectTrigger
							id={`${ma}-kieu-pham-vi`}
							data-o-kieu-pham-vi={gia.kieuPhamVi}
						>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							{PHAM_VI_CHI_SO.map((k) => (
								<SelectItem key={k} value={k}>
									{s.phamVi[k]}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</Field>
				{gia.kieuPhamVi === "toan-cong-ty" ? null : (
					<Field data-disabled={khoa || undefined}>
						<FieldLabel htmlFor={`${ma}-pham-vi`}>
							{s.phamVi[gia.kieuPhamVi]}
						</FieldLabel>
						<Combobox
							id={`${ma}-pham-vi`}
							translate="no"
							data-o-pham-vi={gia.idPhamVi}
							disabled={khoa || phamVi.dangTai}
							options={luaChon}
							value={gia.idPhamVi}
							onValueChange={(v) => datGia({ ...gia, idPhamVi: v })}
							placeholder={s.phamVi.tim}
							searchPlaceholder={s.phamVi.tim}
							empty={s.phamVi.khongKhop}
						/>
					</Field>
				)}
			</div>
			<XemTruoc cycleId={cycleId} gia={gia} />
		</>
	);
}

function XemTruoc({ cycleId, gia }: { cycleId: string; gia: NhapNguon }) {
	const locale = useLocale();
	const s = okrSoMessages(locale);
	const t = s.trangThai.hopThoai.xemTruoc;
	const trpc = useTRPC();
	const vao = {
		chiSo: gia.chiSo,
		phamVi: phamViCua(gia),
		cycleId,
		bac: bacCua(gia),
	};
	const du = gia.kieuPhamVi === "toan-cong-ty" || gia.idPhamVi !== "";
	const dem = useQuery({
		...trpc.okr.xemTruocChiSo.queryOptions(vao),
		enabled: du,
	});

	if (!du) return null;
	if (dem.isPending || dem.isFetching)
		return (
			<FieldDescription data-xem-truoc="dang-dem">{t.dangDem}</FieldDescription>
		);
	if (dem.isError)
		return (
			<FieldDescription data-xem-truoc="loi">
				{t.loi}{" "}
				<Button
					data-nut="thu-lai-xem-truoc"
					onClick={() => void dem.refetch()}
					size="xs"
					type="button"
					variant="outline"
				>
					{s.thuLai}
				</Button>
			</FieldDescription>
		);
	const so = new Intl.NumberFormat(DINH_DANG[locale]).format(dem.data.giaTri);
	return (
		<FieldDescription data-xem-truoc="co" data-gia-tri={dem.data.giaTri}>
			{t.toiHomNay(s.donVi[CHI_SO_OKR[gia.chiSo].donVi](so))}
		</FieldDescription>
	);
}

function NhanhApi({ krId }: { krId: string | null }) {
	const t = okrSoMessages(useLocale()).trangThai.hopThoai.api;
	const url = useWorkspaceUrl();
	const ma = useId();
	const origin = useApiOrigin();
	const lenh = origin
		? `curl -X POST ${origin}/rest/okr/key-results/${krId ?? "<id>"}/value -H "x-api-key: …" -H "content-type: application/json" -d '{"giaTri": ${OKR_SO_MAN.giaTriMau}}'`
		: null;

	return (
		<>
			{krId ? (
				<Field>
					<FieldLabel htmlFor={`${ma}-ma-kr`}>{t.maKr}</FieldLabel>
					<InputGroup>
						<InputGroupInput
							className="font-mono"
							data-ma-kr={krId}
							id={`${ma}-ma-kr`}
							readOnly
							translate="no"
							value={krId}
						/>
						<InputGroupAddon align="inline-end">
							<CopyValue label={t.maKr} value={krId} />
						</InputGroupAddon>
					</InputGroup>
				</Field>
			) : null}
			<Field>
				{lenh ? (
					<>
						<FieldLabel htmlFor={`${ma}-lenh`}>{t.lenhMau}</FieldLabel>
						<InputGroup>
							<InputGroupInput
								className="font-mono"
								data-lenh-mau
								id={`${ma}-lenh`}
								readOnly
								translate="no"
								value={lenh}
							/>
							<InputGroupAddon align="inline-end">
								<CopyValue label={t.lenhMau} value={lenh} />
							</InputGroupAddon>
						</InputGroup>
					</>
				) : null}
				<FieldDescription>
					{t.moTa}{" "}
					<Link data-lien-ket-khoa-api href={url("/settings/api-keys")}>
						{t.caiDat}
					</Link>
				</FieldDescription>
			</Field>
		</>
	);
}

function NhanhSheets({
	gia,
	datGia,
	khoa,
	email,
	docThu,
	docLai,
	dangDocLai,
}: {
	gia: NhapNguon;
	datGia: (g: NhapNguon) => void;
	khoa: boolean;
	email: string | null;
	docThu: TrangThaiDoc | null;
	docLai: (() => void) | null;
	dangDocLai: boolean;
}) {
	const locale = useLocale();
	const t = okrSoMessages(locale).trangThai.hopThoai.sheets;
	const ma = useId();
	const urlSai = gia.url.trim() !== "" && sheetIdTuUrl(gia.url) === null;
	const oSai = gia.o.trim() !== "" && !oSheet.safeParse(gia.o).success;

	return (
		<>
			<Field
				data-invalid={urlSai || undefined}
				data-disabled={khoa || undefined}
			>
				<FieldLabel htmlFor={`${ma}-url`}>{t.oDuongDan}</FieldLabel>
				<Input
					aria-invalid={urlSai}
					autoComplete="off"
					data-o-duong-dan
					disabled={khoa}
					id={`${ma}-url`}
					inputMode="url"
					onChange={(e) => datGia({ ...gia, url: e.target.value })}
					translate="no"
					value={gia.url}
				/>
				{urlSai ? <FieldError>{t.saiDuongDan}</FieldError> : null}
			</Field>
			<Field data-invalid={oSai || undefined} data-disabled={khoa || undefined}>
				<FieldLabel htmlFor={`${ma}-o`}>{t.oO}</FieldLabel>
				<Input
					aria-describedby={`${ma}-o-mo-ta`}
					aria-invalid={oSai}
					autoComplete="off"
					data-o-sheet
					disabled={khoa}
					id={`${ma}-o`}
					onChange={(e) => datGia({ ...gia, o: e.target.value })}
					translate="no"
					value={gia.o}
				/>
				{oSai ? (
					<FieldError id={`${ma}-o-mo-ta`}>{t.saiO}</FieldError>
				) : (
					<FieldDescription id={`${ma}-o-mo-ta`}>{t.goiYO}</FieldDescription>
				)}
			</Field>
			{email ? (
				<div className="flex items-center gap-2">
					<FieldDescription
						className="min-w-0 flex-1 wrap-anywhere"
						data-email-sheets={email}
						translate="no"
					>
						{t.chiaSe(email)}
					</FieldDescription>
					<CopyValue label={t.diaChiChiaSe} value={email} />
				</div>
			) : null}
			{docThu?.loai === "dang-doc" ? (
				<FieldDescription data-doc-thu="dang-doc">{t.dangDoc}</FieldDescription>
			) : null}
			{docThu?.loai === "doc-duoc" ? (
				<FieldDescription data-doc-thu="doc-duoc" data-gia-tri={docThu.giaTri}>
					{t.docDuoc(
						new Intl.NumberFormat(DINH_DANG[locale]).format(docThu.giaTri),
						new Intl.DateTimeFormat(DINH_DANG[locale], {
							hour: "2-digit",
							minute: "2-digit",
						}).format(new Date(docThu.luc)),
					)}
				</FieldDescription>
			) : null}
			{docThu?.loai === "loi" || docThu?.loai === "qua-han" ? (
				<div className="flex flex-wrap items-center gap-2">
					{docThu.loai === "loi" ? (
						<FieldError data-doc-thu="loi" data-ly-do={docThu.lyDo}>
							{t.lyDo[docThu.lyDo]}
						</FieldError>
					) : (
						<FieldDescription data-doc-thu="qua-han">
							{t.chuaDocXong}
						</FieldDescription>
					)}
					{docLai ? (
						<Button
							data-nut="doc-lai"
							disabled={dangDocLai}
							onClick={docLai}
							size="xs"
							type="button"
							variant="outline"
						>
							{t.docLai}
						</Button>
					) : null}
				</div>
			) : null}
		</>
	);
}
