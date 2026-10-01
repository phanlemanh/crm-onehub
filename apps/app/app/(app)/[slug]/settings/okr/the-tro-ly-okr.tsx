"use client";

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
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	PickListDialog,
	type PickListItem,
} from "@crm/ui/components/pick-list-dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { Skeleton } from "@crm/ui/components/skeleton";
import { Spinner } from "@crm/ui/components/spinner";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { Switch } from "@crm/ui/components/switch";
import {
	DON_VI_ONEHUB,
	docTranDatOkrUsd,
	okrProgram,
} from "@crm/validation/okr-chuong-trinh";
import {
	AI_PHAM_VI,
	type AiPhamVi,
	MINUTE_MS,
	TRO_LY_OKR_KHOA,
	TRO_LY_OKR_TRAN,
} from "@crm/validation/okr-tro-ly";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import {
	type TroLyOkrMessages,
	troLyOkrMessages,
} from "@/lib/messages/tro-ly-okr";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { thangHien } from "./the-so-chi-phi";
import { LoiThe } from "./trang-thai-cai-dat";

const FORM = "okr-tro-ly";

type Viec = "de-xuat" | "tom-tat-tuan" | "soan";
type Nac = "bat" | "an";

const VIEC: readonly Viec[] = ["de-xuat", "tom-tat-tuan", "soan"];
const NAC: readonly Nac[] = ["bat", "an"];

type Dong = { phamVi: AiPhamVi; donVi: string[] };
type DongViecNac = Record<Viec, Record<Nac, Dong>>;

type Nhap = {
	aiOn: boolean;
	dong: DongViecNac;
	tran: string;
	tranDatOkr: string;
};

type Luu = {
	aiOn: boolean;
	aiDeXuatPhamVi: AiPhamVi;
	aiDeXuatDonVi: string[];
	aiTomTatPhamVi: AiPhamVi;
	aiTomTatDonVi: string[];
	aiDeXuatAnPhamVi: AiPhamVi;
	aiDeXuatAnDonVi: string[];
	aiTomTatAnPhamVi: AiPhamVi;
	aiTomTatAnDonVi: string[];
	aiSoanPhamVi: AiPhamVi;
	aiSoanDonVi: string[];
	aiSoanAnPhamVi: AiPhamVi;
	aiSoanAnDonVi: string[];
	aiTranThangUsd: number;
	aiTranThangDatOkrUsd: number | null;
};

type PhuBoi = (id: string) => boolean;
type PhuTheoViec = Record<Viec, PhuBoi>;

export type SanSangHien =
	| { bat: true; conLaiUsd: number }
	| { bat: false; lyDo: keyof TroLyOkrMessages["troLy"]["sanSang"]["lyDo"] };

const SO_TRAN = /^\d+(?:[.,]\d{1,2})?$/;

function docTran(chu: string): number | null {
	const gon = chu.trim();
	if (!SO_TRAN.test(gon)) return null;
	const so = Number(gon.replace(",", "."));
	return okrProgram.shape.aiTranThangUsd.safeParse(so).success ? so : null;
}

const dong = (phamVi: AiPhamVi, donVi: readonly string[]): Dong => ({
	phamVi,
	donVi: [...donVi],
});

const chuSo = (so: number, locale: string) =>
	new Intl.NumberFormat(locale, {
		maximumFractionDigits: 2,
		useGrouping: false,
	}).format(so);

function nhapTu(ct: Luu, locale: string): Nhap {
	return {
		aiOn: ct.aiOn,
		dong: {
			"de-xuat": {
				bat: dong(ct.aiDeXuatPhamVi, ct.aiDeXuatDonVi),
				an: dong(ct.aiDeXuatAnPhamVi, ct.aiDeXuatAnDonVi),
			},
			"tom-tat-tuan": {
				bat: dong(ct.aiTomTatPhamVi, ct.aiTomTatDonVi),
				an: dong(ct.aiTomTatAnPhamVi, ct.aiTomTatAnDonVi),
			},
			soan: {
				bat: dong(ct.aiSoanPhamVi, ct.aiSoanDonVi),
				an: dong(ct.aiSoanAnPhamVi, ct.aiSoanAnDonVi),
			},
		},
		tran: chuSo(ct.aiTranThangUsd, locale),
		tranDatOkr:
			ct.aiTranThangDatOkrUsd === null
				? ""
				: chuSo(ct.aiTranThangDatOkrUsd, locale),
	};
}

function phuBoiBat(bat: Dong, boPhanCua: ReadonlyMap<string, string>): PhuBoi {
	if (bat.phamVi === "tat") return () => false;
	if (bat.phamVi === "toan-cong-ty") return () => true;
	return (id) => {
		const boPhan = boPhanCua.get(id);
		return (
			bat.donVi.includes(id) ||
			(boPhan !== undefined && bat.donVi.includes(boPhan))
		);
	};
}

function anHieuLuc(d: Record<Nac, Dong>, phu: PhuBoi): Dong {
	if (d.bat.phamVi === "toan-cong-ty") return { phamVi: "tat", donVi: [] };
	return {
		phamVi: d.an.phamVi,
		donVi: d.an.donVi.filter((id) => !phu(id)),
	};
}

function goiLuu(
	nhap: Nhap,
	tran: number,
	tranDatOkr: number | null,
	phu: PhuTheoViec,
): Luu {
	const deXuat = nhap.dong["de-xuat"];
	const tomTat = nhap.dong["tom-tat-tuan"];
	const soan = nhap.dong.soan;
	const anDeXuat = anHieuLuc(deXuat, phu["de-xuat"]);
	const anTomTat = anHieuLuc(tomTat, phu["tom-tat-tuan"]);
	const anSoan = anHieuLuc(soan, phu.soan);
	return {
		aiOn: nhap.aiOn,
		aiDeXuatPhamVi: deXuat.bat.phamVi,
		aiDeXuatDonVi: deXuat.bat.donVi,
		aiTomTatPhamVi: tomTat.bat.phamVi,
		aiTomTatDonVi: tomTat.bat.donVi,
		aiDeXuatAnPhamVi: anDeXuat.phamVi,
		aiDeXuatAnDonVi: anDeXuat.donVi,
		aiTomTatAnPhamVi: anTomTat.phamVi,
		aiTomTatAnDonVi: anTomTat.donVi,
		aiSoanPhamVi: soan.bat.phamVi,
		aiSoanDonVi: soan.bat.donVi,
		aiSoanAnPhamVi: anSoan.phamVi,
		aiSoanAnDonVi: anSoan.donVi,
		aiTranThangUsd: tran,
		aiTranThangDatOkrUsd: tranDatOkr,
	};
}

const cungTap = (a: readonly string[], b: readonly string[]) =>
	a.length === b.length && a.every((x) => b.includes(x));

function daDoi(gui: Luu, ct: Luu): boolean {
	return (
		gui.aiOn !== ct.aiOn ||
		gui.aiDeXuatPhamVi !== ct.aiDeXuatPhamVi ||
		gui.aiTomTatPhamVi !== ct.aiTomTatPhamVi ||
		gui.aiDeXuatAnPhamVi !== ct.aiDeXuatAnPhamVi ||
		gui.aiTomTatAnPhamVi !== ct.aiTomTatAnPhamVi ||
		gui.aiSoanPhamVi !== ct.aiSoanPhamVi ||
		gui.aiSoanAnPhamVi !== ct.aiSoanAnPhamVi ||
		!cungTap(gui.aiDeXuatDonVi, ct.aiDeXuatDonVi) ||
		!cungTap(gui.aiTomTatDonVi, ct.aiTomTatDonVi) ||
		!cungTap(gui.aiDeXuatAnDonVi, ct.aiDeXuatAnDonVi) ||
		!cungTap(gui.aiTomTatAnDonVi, ct.aiTomTatAnDonVi) ||
		!cungTap(gui.aiSoanDonVi, ct.aiSoanDonVi) ||
		!cungTap(gui.aiSoanAnDonVi, ct.aiSoanAnDonVi) ||
		gui.aiTranThangUsd !== ct.aiTranThangUsd ||
		gui.aiTranThangDatOkrUsd !== ct.aiTranThangDatOkrUsd
	);
}

function thangSau(thang: string): string {
	const [nam, so] = thang.split("-").map(Number) as [number, number];
	return so === 12
		? `${nam + 1}-01`
		: `${nam}-${String(so + 1).padStart(2, "0")}`;
}

export type NguonKhoaHienThi =
	| "khoa-rieng"
	| "khoa-chung"
	| "oidc"
	| "chua-ro"
	| null;

export function ChiBaoSanSang({
	aiOn,
	dangKiem,
	sanSang,
	nguonKhoa,
	thang,
}: {
	aiOn: boolean;
	dangKiem: boolean;
	sanSang: SanSangHien;
	nguonKhoa: NguonKhoaHienThi;
	thang: string;
}) {
	const s = troLyOkrMessages(useLocale()).troLy.sanSang;
	if (!aiOn) {
		return <StatusIndicator size="sm" tone="neutral" label={s.dangTat} />;
	}
	if (dangKiem) {
		return (
			<StatusIndicator
				size="sm"
				tone="warning"
				busy
				label={s.chuaSanSang(s.dangKiem)}
			/>
		);
	}
	if (sanSang.bat) {
		const nhan =
			nguonKhoa === null || nguonKhoa === "chua-ro"
				? s.sanSang
				: s.sanSangNguon[nguonKhoa];
		return <StatusIndicator size="sm" tone="success" label={nhan} />;
	}
	if (sanSang.lyDo === "het-tran-thang") {
		const ngay = `01/${thangHien(thangSau(thang)).slice(0, 2)}`;
		return <StatusIndicator size="sm" tone="error" label={s.hetTran(ngay)} />;
	}
	const chiBao = (
		<StatusIndicator
			size="sm"
			tone="warning"
			label={s.chuaSanSang(s.lyDo[sanSang.lyDo])}
		/>
	);
	if (sanSang.lyDo !== "chua-co-khoa-mo-hinh") return chiBao;
	return (
		<Field>
			{chiBao}
			<FieldDescription data-thieu-khoa>
				{s.thieuKhoaMoTa(
					TRO_LY_OKR_KHOA.rieng,
					TRO_LY_OKR_KHOA.chung,
					String(TRO_LY_OKR_TRAN.hanKiemKhoaMs / MINUTE_MS),
				)}
			</FieldDescription>
		</Field>
	);
}

function DongNac({
	viec,
	nac,
	phamVi,
	donVi,
	tenDonVi,
	khoa,
	khoaChu,
	doiPhamVi,
	moChon,
}: {
	viec: Viec;
	nac: Nac;
	phamVi: AiPhamVi;
	donVi: string[];
	tenDonVi: Map<string, string>;
	khoa: boolean;
	khoaChu: string | null;
	doiPhamVi: (p: AiPhamVi) => void;
	moChon: () => void;
}) {
	const t = troLyOkrMessages(useLocale()).troLy;
	const ma = useId();
	const nhan = t.nac[nac];
	const tenViec = t.viec[viec];
	const daChon = donVi.filter((id) => tenDonVi.has(id));
	const tat = khoa || khoaChu !== null;
	const moTa =
		khoaChu ??
		(phamVi === "danh-sach" && daChon.length === 0
			? nac === "bat"
				? t.chuaChonDonVi
				: t.chuaChonDonViAn
			: nac === "bat"
				? tenViec.moTa
				: tenViec.moTaAn);
	return (
		<Field data-nac={nac} data-disabled={tat}>
			<FieldLabel htmlFor={`${ma}-pham-vi`}>{nhan}</FieldLabel>
			<Select
				value={phamVi}
				disabled={tat}
				onValueChange={(v) => {
					const moi = AI_PHAM_VI.find((p) => p === v);
					if (moi) doiPhamVi(moi);
				}}
			>
				<SelectTrigger
					id={`${ma}-pham-vi`}
					className="w-full sm:w-56"
					data-pham-vi={nac === "bat" ? viec : undefined}
					data-pham-vi-an={nac === "an" ? viec : undefined}
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					{AI_PHAM_VI.map((p) => (
						<SelectItem key={p} value={p}>
							{t.phamVi[p]}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{phamVi === "danh-sach" && khoaChu === null ? (
				<div className="flex flex-wrap items-center gap-2">
					{daChon.length > 0 ? (
						<ul
							aria-label={t.donViCua(nhan, tenViec.nhan)}
							className="flex flex-wrap gap-1.5"
						>
							{daChon.map((id) => (
								<li key={id}>
									<Badge variant="token" translate="no">
										{tenDonVi.get(id)}
									</Badge>
								</li>
							))}
						</ul>
					) : null}
					<Button
						type="button"
						variant="outline"
						size="sm"
						disabled={khoa}
						data-nut={
							nac === "bat" ? `chon-don-vi-${viec}` : `chon-don-vi-an-${viec}`
						}
						onClick={moChon}
					>
						{t.chonDonVi}
					</Button>
				</div>
			) : null}
			<FieldDescription>{moTa}</FieldDescription>
		</Field>
	);
}

type CayDonVi = {
	tenDonVi: Map<string, string>;
	mucChon: PickListItem[];
	boPhanCua: Map<string, string>;
};

function useCayDonVi(): CayDonVi {
	const t = troLyOkrMessages(useLocale()).troLy;
	const trpc = useTRPC();
	const cay = useQuery(trpc.org.tree.queryOptions());
	const tenDonVi = new Map<string, string>([[DON_VI_ONEHUB, t.hop.onehub]]);
	const boPhanCua = new Map<string, string>();
	const mucChon: PickListItem[] = [
		{ id: DON_VI_ONEHUB, label: t.hop.onehub, hint: t.hop.goiYOnehub },
	];
	for (const bp of cay.data?.divisions ?? []) {
		tenDonVi.set(bp.id, bp.name);
		mucChon.push({ id: bp.id, label: bp.name, hint: t.hop.goiYBoPhan });
		for (const pb of bp.departments) {
			tenDonVi.set(pb.id, pb.name);
			boPhanCua.set(pb.id, bp.id);
			mucChon.push({
				id: pb.id,
				label: pb.name,
				hint: t.hop.goiYPhongBan(bp.name),
			});
		}
	}
	for (const pb of cay.data?.chuaXep ?? []) {
		tenDonVi.set(pb.id, pb.name);
		mucChon.push({ id: pb.id, label: pb.name, hint: t.hop.goiYPhongBan(null) });
	}
	return { tenDonVi, mucChon, boPhanCua };
}

export function TheTroLyOkr() {
	const locale = useLocale();
	const t = troLyOkrMessages(locale).troLy;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const ma = useId();
	const program = useQuery(trpc.okr.program.queryOptions());
	const so = useQuery(trpc.okr.aiChiTieu.queryOptions());
	const { tenDonVi, mucChon, boPhanCua } = useCayDonVi();
	const [nhap, setNhap] = useState<Nhap | null>(null);
	const [dangChon, setDangChon] = useState<{ viec: Viec; nac: Nac } | null>(
		null,
	);
	const [chonTam, setChonTam] = useState<string[]>([]);
	const [loiLuu, setLoiLuu] = useState(false);

	useEffect(() => {
		if (program.data) setNhap(nhapTu(program.data, locale));
	}, [program.data, locale]);

	const luu = useMutation(
		trpc.okr.setProgram.mutationOptions({
			onSuccess: async () => {
				setLoiLuu(false);
				await cache.okr();
				toast.success(t.daLuu);
			},
			onError: (error) => {
				setLoiLuu(true);
				toast.error(error.message);
			},
		}),
	);

	if (program.isError) {
		return (
			<Card data-the="tro-ly-okr">
				<CardHeader>
					<CardTitle>{t.tieuDe}</CardTitle>
				</CardHeader>
				<LoiThe thuLai={() => void program.refetch()} />
			</Card>
		);
	}

	if (!program.data || !nhap || so.isPending) {
		return (
			<Card data-the="tro-ly-okr" aria-busy="true">
				<CardHeader>
					<CardTitle>{t.tieuDe}</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<Skeleton className="h-5 w-40" />
					<Skeleton className="h-9 w-full" />
					<Skeleton className="h-9 w-full" />
					<Skeleton className="h-9 w-full" />
					<Skeleton className="h-9 w-full" />
					<Skeleton className="h-9 w-32" />
				</CardContent>
			</Card>
		);
	}

	const daLuu = program.data;
	const phu: PhuTheoViec = {
		"de-xuat": phuBoiBat(nhap.dong["de-xuat"].bat, boPhanCua),
		"tom-tat-tuan": phuBoiBat(nhap.dong["tom-tat-tuan"].bat, boPhanCua),
		soan: phuBoiBat(nhap.dong.soan.bat, boPhanCua),
	};
	const tran = docTran(nhap.tran);
	const tranHong = tran === null;
	const tranDatOkr = docTranDatOkrUsd(nhap.tranDatOkr);
	const tranDatOkrHong = tranDatOkr === undefined;
	const gui =
		tran === null || tranDatOkr === undefined
			? null
			: goiLuu(nhap, tran, tranDatOkr, phu);
	const doi = gui !== null && daDoi(gui, daLuu);
	const khoa = luu.isPending;
	const sua = (thay: Partial<Nhap>) =>
		setNhap((cu) => (cu ? { ...cu, ...thay } : cu));
	const suaDong = (viec: Viec, nac: Nac, thay: Partial<Dong>) =>
		setNhap((cu) =>
			cu
				? {
						...cu,
						dong: {
							...cu.dong,
							[viec]: {
								...cu.dong[viec],
								[nac]: { ...cu.dong[viec][nac], ...thay },
							},
						},
					}
				: cu,
		);
	const hienDong = (viec: Viec, nac: Nac): Dong =>
		nac === "bat" ? nhap.dong[viec].bat : anHieuLuc(nhap.dong[viec], phu[viec]);
	const moChon = (viec: Viec, nac: Nac) => {
		setChonTam(hienDong(viec, nac).donVi);
		setDangChon({ viec, nac });
	};

	return (
		<Card data-the="tro-ly-okr">
			<CardHeader>
				<CardTitle>{t.tieuDe}</CardTitle>
				<CardAction>
					<Button
						type="submit"
						form={FORM}
						size="sm"
						disabled={khoa || !doi || tranHong || tranDatOkrHong}
						data-nut="luu-tro-ly"
					>
						{luu.isPending ? <Spinner data-icon="inline-start" /> : null}
						{t.luu}
					</Button>
				</CardAction>
			</CardHeader>
			<CardContent className="flex flex-col gap-6">
				{so.data ? (
					<div data-san-sang>
						<ChiBaoSanSang
							aiOn={daLuu.aiOn}
							dangKiem={so.data.dangKiem}
							sanSang={so.data.sanSang}
							nguonKhoa={so.data.nguonKhoa}
							thang={so.data.thang}
						/>
					</div>
				) : null}
				<form
					id={FORM}
					onSubmit={(event) => {
						event.preventDefault();
						if (gui === null || khoa) return;
						luu.mutate(gui);
					}}
				>
					<FieldGroup>
						<Field orientation="horizontal">
							<FieldContent>
								<FieldLabel htmlFor={`${ma}-bat`}>{t.bat}</FieldLabel>
								<FieldDescription>{t.batMoTa}</FieldDescription>
							</FieldContent>
							<Switch
								id={`${ma}-bat`}
								checked={nhap.aiOn}
								disabled={khoa}
								data-cong-tac="tro-ly-okr"
								onCheckedChange={(on) => sua({ aiOn: on })}
							/>
						</Field>
						{VIEC.map((viec) => (
							<FieldSet key={viec} data-viec={viec}>
								<FieldLegend>{t.viec[viec].nhan}</FieldLegend>
								{NAC.map((nac) => (
									<DongNac
										key={nac}
										viec={viec}
										nac={nac}
										phamVi={hienDong(viec, nac).phamVi}
										donVi={hienDong(viec, nac).donVi}
										tenDonVi={tenDonVi}
										khoa={khoa || !nhap.aiOn}
										khoaChu={
											nac === "an" &&
											nhap.dong[viec].bat.phamVi === "toan-cong-ty"
												? t.khoaAn
												: null
										}
										doiPhamVi={(p) => suaDong(viec, nac, { phamVi: p })}
										moChon={() => moChon(viec, nac)}
									/>
								))}
							</FieldSet>
						))}
						<Field data-invalid={tranHong}>
							<FieldLabel htmlFor={`${ma}-tran`}>{t.tran}</FieldLabel>
							<Input
								id={`${ma}-tran`}
								inputMode="decimal"
								autoComplete="off"
								className="w-full sm:w-32"
								value={nhap.tran}
								disabled={khoa}
								aria-invalid={tranHong}
								data-o-tran-ai
								onChange={(event) => sua({ tran: event.target.value })}
							/>
							{tranHong ? (
								<FieldError>{t.tranHong}</FieldError>
							) : (
								<FieldDescription>{t.tranMoTa}</FieldDescription>
							)}
						</Field>
						<Field data-invalid={tranDatOkrHong}>
							<FieldLabel htmlFor={`${ma}-tran-dat-okr`}>
								{t.tranDatOkr}
							</FieldLabel>
							<Input
								id={`${ma}-tran-dat-okr`}
								inputMode="decimal"
								autoComplete="off"
								className="w-full sm:w-32"
								value={nhap.tranDatOkr}
								disabled={khoa}
								aria-invalid={tranDatOkrHong}
								data-o-tran-dat-okr
								onChange={(event) => sua({ tranDatOkr: event.target.value })}
							/>
							{tranDatOkrHong ? (
								<FieldError>{t.tranDatOkrHong}</FieldError>
							) : (
								<FieldDescription>{t.tranDatOkrMoTa}</FieldDescription>
							)}
						</Field>
						{loiLuu ? <FieldError data-loi-luu>{t.loiLuu}</FieldError> : null}
					</FieldGroup>
				</form>
			</CardContent>
			{dangChon ? (
				<PickListDialog
					open
					onOpenChange={(mo) => {
						if (!mo) setDangChon(null);
					}}
					title={t.hop.tieuDe(t.nac[dangChon.nac], t.viec[dangChon.viec].nhan)}
					description={dangChon.nac === "an" ? t.hop.moTaAn : t.hop.moTa}
					searchPlaceholder={t.hop.tim}
					items={
						dangChon.nac === "an"
							? mucChon.filter((muc) => !phu[dangChon.viec](muc.id))
							: mucChon
					}
					selected={chonTam}
					onSelectedChange={setChonTam}
					confirmLabel={t.hop.xacNhan}
					cancelLabel={t.hop.huy}
					emptyLabel={t.hop.rong}
					onConfirm={() => {
						suaDong(dangChon.viec, dangChon.nac, { donVi: chonTam });
						setDangChon(null);
					}}
				/>
			) : null}
		</Card>
	);
}
