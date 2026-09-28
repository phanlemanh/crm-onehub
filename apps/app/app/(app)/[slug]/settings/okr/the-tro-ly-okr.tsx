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
import { DON_VI_ONEHUB, okrProgram } from "@crm/validation/okr-chuong-trinh";
import { AI_PHAM_VI, type AiPhamVi } from "@crm/validation/okr-tro-ly";
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

type Viec = "de-xuat" | "tom-tat-tuan";

type Nhap = {
	aiOn: boolean;
	deXuat: AiPhamVi;
	deXuatDonVi: string[];
	tomTat: AiPhamVi;
	tomTatDonVi: string[];
	tran: string;
};

type Luu = {
	aiOn: boolean;
	aiDeXuatPhamVi: AiPhamVi;
	aiDeXuatDonVi: readonly string[];
	aiTomTatPhamVi: AiPhamVi;
	aiTomTatDonVi: readonly string[];
	aiTranThangUsd: number;
};

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

function nhapTu(ct: Luu, locale: string): Nhap {
	return {
		aiOn: ct.aiOn,
		deXuat: ct.aiDeXuatPhamVi,
		deXuatDonVi: [...ct.aiDeXuatDonVi],
		tomTat: ct.aiTomTatPhamVi,
		tomTatDonVi: [...ct.aiTomTatDonVi],
		tran: new Intl.NumberFormat(locale, {
			maximumFractionDigits: 2,
			useGrouping: false,
		}).format(ct.aiTranThangUsd),
	};
}

const cungTap = (a: readonly string[], b: readonly string[]) =>
	a.length === b.length && a.every((x) => b.includes(x));

function daDoi(nhap: Nhap, ct: Luu, tran: number | null): boolean {
	return (
		nhap.aiOn !== ct.aiOn ||
		nhap.deXuat !== ct.aiDeXuatPhamVi ||
		nhap.tomTat !== ct.aiTomTatPhamVi ||
		!cungTap(nhap.deXuatDonVi, ct.aiDeXuatDonVi) ||
		!cungTap(nhap.tomTatDonVi, ct.aiTomTatDonVi) ||
		tran !== ct.aiTranThangUsd
	);
}

function thangSau(thang: string): string {
	const [nam, so] = thang.split("-").map(Number) as [number, number];
	return so === 12
		? `${nam + 1}-01`
		: `${nam}-${String(so + 1).padStart(2, "0")}`;
}

export function ChiBaoSanSang({
	aiOn,
	dangKiem,
	sanSang,
	thang,
}: {
	aiOn: boolean;
	dangKiem: boolean;
	sanSang: SanSangHien;
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
		return <StatusIndicator size="sm" tone="success" label={s.sanSang} />;
	}
	if (sanSang.lyDo === "het-tran-thang") {
		const ngay = `01/${thangHien(thangSau(thang)).slice(0, 2)}`;
		return <StatusIndicator size="sm" tone="error" label={s.hetTran(ngay)} />;
	}
	return (
		<StatusIndicator
			size="sm"
			tone="warning"
			label={s.chuaSanSang(s.lyDo[sanSang.lyDo])}
		/>
	);
}

function DongViec({
	viec,
	phamVi,
	donVi,
	tenDonVi,
	khoa,
	doiPhamVi,
	moChon,
}: {
	viec: Viec;
	phamVi: AiPhamVi;
	donVi: string[];
	tenDonVi: Map<string, string>;
	khoa: boolean;
	doiPhamVi: (p: AiPhamVi) => void;
	moChon: () => void;
}) {
	const t = troLyOkrMessages(useLocale()).troLy;
	const ma = useId();
	const nhan = t.viec[viec].nhan;
	const daChon = donVi.filter((id) => tenDonVi.has(id));
	return (
		<Field data-viec={viec}>
			<FieldLabel htmlFor={`${ma}-pham-vi`}>{nhan}</FieldLabel>
			<Select
				value={phamVi}
				disabled={khoa}
				onValueChange={(v) => {
					const moi = AI_PHAM_VI.find((p) => p === v);
					if (moi) doiPhamVi(moi);
				}}
			>
				<SelectTrigger
					id={`${ma}-pham-vi`}
					className="w-full sm:w-56"
					data-pham-vi={viec}
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
			{phamVi === "danh-sach" ? (
				<div className="flex flex-wrap items-center gap-2">
					{daChon.length > 0 ? (
						<ul
							aria-label={t.donViBat(nhan)}
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
						data-nut={`chon-don-vi-${viec}`}
						onClick={moChon}
					>
						{t.chonDonVi}
					</Button>
				</div>
			) : null}
			<FieldDescription>
				{phamVi === "danh-sach" && daChon.length === 0
					? t.chuaChonDonVi
					: t.viec[viec].moTa}
			</FieldDescription>
		</Field>
	);
}

export function TheTroLyOkr() {
	const locale = useLocale();
	const t = troLyOkrMessages(locale).troLy;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const ma = useId();
	const program = useQuery(trpc.okr.program.queryOptions());
	const so = useQuery(trpc.okr.aiChiTieu.queryOptions());
	const cay = useQuery(trpc.org.tree.queryOptions());
	const [nhap, setNhap] = useState<Nhap | null>(null);
	const [dangChon, setDangChon] = useState<Viec | null>(null);
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

	const tenDonVi = new Map<string, string>([[DON_VI_ONEHUB, t.hop.onehub]]);
	const mucChon: PickListItem[] = [
		{ id: DON_VI_ONEHUB, label: t.hop.onehub, hint: t.hop.goiYOnehub },
	];
	for (const bp of cay.data?.divisions ?? []) {
		tenDonVi.set(bp.id, bp.name);
		mucChon.push({ id: bp.id, label: bp.name, hint: t.hop.goiYBoPhan });
		for (const pb of bp.departments) {
			tenDonVi.set(pb.id, pb.name);
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
					<Skeleton className="h-9 w-32" />
				</CardContent>
			</Card>
		);
	}

	const daLuu = program.data;
	const tran = docTran(nhap.tran);
	const tranHong = tran === null;
	const doi = daDoi(nhap, daLuu, tran);
	const khoa = luu.isPending;
	const sua = (thay: Partial<Nhap>) =>
		setNhap((cu) => (cu ? { ...cu, ...thay } : cu));
	const moChon = (viec: Viec) => {
		setChonTam(viec === "de-xuat" ? nhap.deXuatDonVi : nhap.tomTatDonVi);
		setDangChon(viec);
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
						disabled={khoa || !doi || tranHong}
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
							thang={so.data.thang}
						/>
					</div>
				) : null}
				<form
					id={FORM}
					onSubmit={(event) => {
						event.preventDefault();
						if (tran === null || khoa) return;
						luu.mutate({
							aiOn: nhap.aiOn,
							aiDeXuatPhamVi: nhap.deXuat,
							aiDeXuatDonVi: nhap.deXuatDonVi,
							aiTomTatPhamVi: nhap.tomTat,
							aiTomTatDonVi: nhap.tomTatDonVi,
							aiTranThangUsd: tran,
						});
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
						<DongViec
							viec="de-xuat"
							phamVi={nhap.deXuat}
							donVi={nhap.deXuatDonVi}
							tenDonVi={tenDonVi}
							khoa={khoa || !nhap.aiOn}
							doiPhamVi={(p) => sua({ deXuat: p })}
							moChon={() => moChon("de-xuat")}
						/>
						<DongViec
							viec="tom-tat-tuan"
							phamVi={nhap.tomTat}
							donVi={nhap.tomTatDonVi}
							tenDonVi={tenDonVi}
							khoa={khoa || !nhap.aiOn}
							doiPhamVi={(p) => sua({ tomTat: p })}
							moChon={() => moChon("tom-tat-tuan")}
						/>
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
					title={t.hop.tieuDe(t.viec[dangChon].nhan)}
					description={t.hop.moTa}
					searchPlaceholder={t.hop.tim}
					items={mucChon}
					selected={chonTam}
					onSelectedChange={setChonTam}
					confirmLabel={t.hop.xacNhan}
					cancelLabel={t.hop.huy}
					emptyLabel={t.hop.rong}
					onConfirm={() => {
						sua(
							dangChon === "de-xuat"
								? { deXuatDonVi: chonTam }
								: { tomTatDonVi: chonTam },
						);
						setDangChon(null);
					}}
				/>
			) : null}
		</Card>
	);
}
