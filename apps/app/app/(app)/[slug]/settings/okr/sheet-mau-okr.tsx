"use client";

import Add from "@carbon/icons-react/es/Add";
import Close from "@carbon/icons-react/es/Close";
import TrashCan from "@carbon/icons-react/es/TrashCan";
import { Button } from "@crm/ui/components/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { PickListDialog } from "@crm/ui/components/pick-list-dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import {
	Sheet,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import { Spinner } from "@crm/ui/components/spinner";
import { Textarea } from "@crm/ui/components/textarea";
import {
	TokenFieldAction,
	TokenFieldItem,
} from "@crm/ui/components/token-field";
import type { Locale } from "@crm/ui/lib/locale";
import {
	docSoOkr,
	KIEU_KR,
	type KieuKr,
	type LoiSoTheoKieu,
} from "@crm/validation/okr-kr";
import {
	CAP_MAU,
	type CapMau,
	type LuuMauInput,
	luuMauInput,
	mauKr,
	mauNoiDung,
	OKR_MAU,
} from "@crm/validation/okr-mau";
import { LOAI_MUC_TIEU, type LoaiMucTieu } from "@crm/validation/okr-muc-tieu";
import { useId, useRef, useState } from "react";
import { hienSo } from "@/app/(app)/[slug]/okr/hop-thoai-kr";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { okrMessages } from "@/lib/messages/okr";
import { okrCanhKrMessages } from "@/lib/messages/okr-canh-kr";
import {
	loiSoTheoKr,
	type MauChon,
	type NhomDonVi,
	nhomDonVi,
} from "@/lib/okr-mau";

export type DonViChon = { id: string; label: string; hint?: string };
export type DonViTheoNhom = Record<NhomDonVi, DonViChon[]>;

type KrNhap = {
	khoa: number;
	ten: string;
	kieu: KieuKr;
	donVi: string;
	khoi: string;
	dich: string;
};

type Nhap = {
	ten: string;
	cap: CapMau;
	donViIds: string[];
	cauMucTieu: string;
	loai: LoaiMucTieu;
	krs: KrNhap[];
};

const FORM = "okr-mau";
const DON_VI_DO_TOI_DA = mauKr.shape.unit.maxLength ?? undefined;

const soHoacTrong = (so: number | null, locale: Locale) =>
	so === null ? "" : hienSo(so, locale);

function krTrong(khoa: number): KrNhap {
	return { khoa, ten: "", kieu: "tang-toi", donVi: "", khoi: "", dich: "" };
}

function nhapTu(mau: MauChon | null, locale: Locale): Nhap {
	if (!mau)
		return {
			ten: "",
			cap: "phong-ban",
			donViIds: [],
			cauMucTieu: "",
			loai: "cam-ket",
			krs: [krTrong(0)],
		};
	return {
		ten: mau.ten,
		cap: mau.cap,
		donViIds: mau.donViIds,
		cauMucTieu: mau.noiDung.cauMucTieu,
		loai: mau.noiDung.loai,
		krs: mau.noiDung.krs.map((k, i) => ({
			khoa: i,
			ten: k.title,
			kieu: k.kind,
			donVi: k.unit,
			khoi: soHoacTrong(k.startValue, locale),
			dich: soHoacTrong(k.targetValue, locale),
		})),
	};
}

const soCua = (k: KrNhap, chu: string) =>
	k.kieu === "moc" ? null : docSoOkr(chu);

const soHong = (k: KrNhap, chu: string) =>
	k.kieu !== "moc" && chu.trim() !== "" && docSoOkr(chu) === null;

const chuHong = (chu: string, khuon: typeof mauKr.shape.title) =>
	chu.trim() !== "" && !khuon.safeParse(chu).success;

function banNhap(id: string | null, n: Nhap) {
	return luuMauInput.safeParse({
		id,
		ten: n.ten,
		cap: n.cap,
		donViIds: n.donViIds,
		noiDung: {
			cauMucTieu: n.cauMucTieu,
			loai: n.loai,
			krs: n.krs.map((k) => ({
				title: k.ten,
				kind: k.kieu,
				unit: k.donVi,
				startValue: soCua(k, k.khoi),
				targetValue: soCua(k, k.dich),
			})),
		},
	});
}

export function SheetMauOkr({
	mau,
	donVi,
	dangLuu,
	loi,
	onLuu,
	onDong,
}: {
	mau: MauChon | null;
	donVi: DonViTheoNhom;
	dangLuu: boolean;
	loi: string | null;
	onLuu: (vao: LuuMauInput) => void;
	onDong: () => void;
}) {
	const locale = useLocale();
	const t = okrCanhKrMessages(locale).mau.sheet;
	const o = okrMessages(locale);
	const h = o.hopThoai;
	const ma = useId();
	const [dau] = useState(() => nhapTu(mau, locale));
	const [n, setN] = useState<Nhap>(dau);
	const khoaKe = useRef(dau.krs.length);
	const [chonMo, setChonMo] = useState(false);
	const [chonTam, setChonTam] = useState<string[]>([]);

	const ket = banNhap(mau?.id ?? null, n);
	const loiKieu = ket.success
		? new Map<number, LoiSoTheoKieu>()
		: loiSoTheoKr(ket.error.issues);
	const coSoHong = n.krs.some((k) => soHong(k, k.khoi) || soHong(k, k.dich));
	const coThayDoi = JSON.stringify(n) !== JSON.stringify(dau);
	const hopLe = ket.success && !coSoHong;
	const tenHong =
		n.ten.trim() !== "" && !luuMauInput.shape.ten.safeParse(n.ten).success;
	const cauHong = chuHong(n.cauMucTieu, mauNoiDung.shape.cauMucTieu);
	const dsDonVi = donVi[nhomDonVi(n.cap)];
	const tenDonVi = new Map(dsDonVi.map((d) => [d.id, d.label]));

	const doi = (moi: Partial<Nhap>) => setN((cu) => ({ ...cu, ...moi }));
	const doiKr = (khoa: number, moi: Partial<KrNhap>) =>
		setN((cu) => ({
			...cu,
			krs: cu.krs.map((k) => (k.khoa === khoa ? { ...k, ...moi } : k)),
		}));
	const themKr = () => {
		const khoa = khoaKe.current;
		khoaKe.current += 1;
		setN((cu) => ({ ...cu, krs: [...cu.krs, krTrong(khoa)] }));
	};
	const boKr = (khoa: number) =>
		setN((cu) => ({ ...cu, krs: cu.krs.filter((k) => k.khoa !== khoa) }));

	return (
		<Sheet
			open
			coThayDoi={coThayDoi}
			onOpenChange={(mo) => {
				if (!mo && !dangLuu) onDong();
			}}
		>
			<SheetContent
				side="right"
				size="md"
				data-sheet-mau={mau?.id ?? "moi"}
				data-trang-thai="ST-mau-sheet"
			>
				<SheetHeader>
					<SheetTitle>{mau ? t.tieuDeSua : t.tieuDeThem}</SheetTitle>
					<SheetDescription>{t.moTa}</SheetDescription>
				</SheetHeader>
				<form
					id={FORM}
					className="flex-1 overflow-y-auto px-4"
					data-cuon-hop
					onSubmit={(e) => {
						e.preventDefault();
						if (ket.success && hopLe && !dangLuu) onLuu(ket.data);
					}}
				>
					<FieldGroup>
						<Field data-invalid={tenHong || undefined}>
							<FieldLabel htmlFor={`${ma}-ten`}>{t.ten}</FieldLabel>
							<Input
								id={`${ma}-ten`}
								value={n.ten}
								maxLength={OKR_MAU.ten.max}
								autoComplete="off"
								translate="no"
								aria-invalid={tenHong || undefined}
								data-o-ten-mau
								onChange={(e) => doi({ ten: e.target.value })}
							/>
							{tenHong ? (
								<FieldError>
									{dien(t.loiTen, {
										min: OKR_MAU.ten.min,
										max: OKR_MAU.ten.max,
									})}
								</FieldError>
							) : null}
						</Field>
						<div className="grid items-start gap-3 sm:grid-cols-2">
							<Field>
								<FieldLabel htmlFor={`${ma}-cap`}>{t.cap}</FieldLabel>
								<Select
									value={n.cap}
									onValueChange={(v) => {
										const cap = CAP_MAU.find((c) => c === v);
										if (!cap) return;
										doi(
											nhomDonVi(cap) === nhomDonVi(n.cap)
												? { cap }
												: { cap, donViIds: [] },
										);
									}}
								>
									<SelectTrigger id={`${ma}-cap`} data-o-cap-mau>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{CAP_MAU.map((c) => (
											<SelectItem key={c} value={c}>
												{h.capMucTieu[c]}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
							<Field>
								<FieldLabel htmlFor={`${ma}-loai`}>{t.loai}</FieldLabel>
								<Select
									value={n.loai}
									onValueChange={(v) => {
										const loai = LOAI_MUC_TIEU.find((l) => l === v);
										if (loai) doi({ loai });
									}}
								>
									<SelectTrigger id={`${ma}-loai`} data-o-loai-mau>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{LOAI_MUC_TIEU.map((l) => (
											<SelectItem key={l} value={l}>
												{o.loai[l]}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</Field>
						</div>
						<Field>
							<FieldLabel htmlFor={`${ma}-ap-cho`}>{t.apCho}</FieldLabel>
							<div className="flex flex-wrap items-center gap-1">
								{n.donViIds.map((id) => (
									<TokenFieldItem key={id} data-token-don-vi={id}>
										<span className="truncate px-1" translate="no">
											{tenDonVi.get(id) ?? id}
										</span>
										<TokenFieldAction
											aria-label={dien(t.boDonVi, {
												ten: tenDonVi.get(id) ?? id,
											})}
											onClick={() =>
												doi({
													donViIds: n.donViIds.filter((x) => x !== id),
												})
											}
										>
											<Icon icon={Close} />
										</TokenFieldAction>
									</TokenFieldItem>
								))}
								<Button
									id={`${ma}-ap-cho`}
									type="button"
									size="sm"
									variant="ghost"
									aria-describedby={`${ma}-ap-cho-mo-ta`}
									data-nut="chon-don-vi"
									onClick={() => {
										setChonTam(n.donViIds);
										setChonMo(true);
									}}
								>
									{t.chonDonVi}
								</Button>
							</div>
							<FieldDescription id={`${ma}-ap-cho-mo-ta`}>
								{n.cap === "ca-nhan" ? t.apChoCaNhan : t.apChoMoTa}
							</FieldDescription>
						</Field>
						<Field data-invalid={cauHong || undefined}>
							<FieldLabel htmlFor={`${ma}-cau`}>{t.cauMucTieu}</FieldLabel>
							<Textarea
								id={`${ma}-cau`}
								value={n.cauMucTieu}
								rows={2}
								maxLength={OKR_MAU.cauMucTieu.max}
								translate="no"
								aria-describedby={`${ma}-cau-mo-ta`}
								aria-invalid={cauHong || undefined}
								data-o-cau-muc-tieu
								onChange={(e) => doi({ cauMucTieu: e.target.value })}
							/>
							{cauHong ? (
								<FieldError data-loi-cau-muc-tieu>
									{dien(t.loiCau, OKR_MAU.cauMucTieu)}
								</FieldError>
							) : (
								<FieldDescription id={`${ma}-cau-mo-ta`}>
									{dien(t.toiDaKyTu, { max: OKR_MAU.cauMucTieu.max })}
								</FieldDescription>
							)}
						</Field>
						<FieldSet>
							<FieldLegend variant="label">{t.krMau}</FieldLegend>
							<FieldDescription>
								{dien(t.soKr, { min: 1, max: OKR_MAU.krToiDa })}
							</FieldDescription>
							<ItemGroup>
								{n.krs.map((k, i) => (
									<DongKrMau
										key={k.khoa}
										kr={k}
										thu={i}
										ma={`${ma}-kr-${k.khoa}`}
										loiKieu={loiKieu.get(i) ?? null}
										boDuoc={n.krs.length > 1}
										onDoi={(moi) => doiKr(k.khoa, moi)}
										onBo={() => boKr(k.khoa)}
									/>
								))}
							</ItemGroup>
							<div>
								<Button
									type="button"
									size="sm"
									variant="outline"
									disabled={n.krs.length >= OKR_MAU.krToiDa}
									data-nut="them-kr-mau"
									onClick={themKr}
								>
									<Icon icon={Add} data-icon="inline-start" />
									{t.themKr}
								</Button>
							</div>
						</FieldSet>
						{loi ? <FieldError data-loi-luu-mau>{loi}</FieldError> : null}
					</FieldGroup>
				</form>
				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline" disabled={dangLuu}>
							{t.huy}
						</Button>
					</SheetClose>
					<Button
						type="submit"
						form={FORM}
						disabled={!hopLe || dangLuu || (mau !== null && !coThayDoi)}
						data-nut="luu-mau"
					>
						{dangLuu ? <Spinner data-icon="inline-start" /> : null}
						{t.luu}
					</Button>
				</SheetFooter>
			</SheetContent>
			<PickListDialog
				open={chonMo}
				onOpenChange={setChonMo}
				title={t.hop.tieuDe}
				description={t.hop.moTa}
				searchPlaceholder={t.hop.tim}
				items={dsDonVi}
				selected={chonTam}
				onSelectedChange={setChonTam}
				confirmLabel={(so) => dien(t.hop.xacNhan, { n: so })}
				cancelLabel={t.hop.huy}
				emptyLabel={t.hop.rong}
				onConfirm={() => {
					doi({ donViIds: chonTam });
					setChonMo(false);
				}}
			/>
		</Sheet>
	);
}

function DongKrMau({
	kr,
	thu,
	ma,
	loiKieu,
	boDuoc,
	onDoi,
	onBo,
}: {
	kr: KrNhap;
	thu: number;
	ma: string;
	loiKieu: LoiSoTheoKieu | null;
	boDuoc: boolean;
	onDoi: (moi: Partial<KrNhap>) => void;
	onBo: () => void;
}) {
	const locale = useLocale();
	const t = okrCanhKrMessages(locale).mau.sheet;
	const o = okrMessages(locale);
	const h = o.hopThoai;
	const hongKhoi = soHong(kr, kr.khoi);
	const hongDich = soHong(kr, kr.dich) || loiKieu !== null;
	const tenHong = chuHong(kr.ten, mauKr.shape.title);
	const tenThu = dien(t.krThu, { n: thu + 1 });
	return (
		<Item size="sm" variant="outline" role="listitem" data-kr-mau={thu}>
			<ItemContent>
				<ItemTitle>{tenThu}</ItemTitle>
				<FieldGroup>
					<Field data-invalid={tenHong || undefined}>
						<FieldLabel htmlFor={`${ma}-ten`}>{t.tenKr}</FieldLabel>
						<Input
							id={`${ma}-ten`}
							value={kr.ten}
							maxLength={OKR_MAU.tenKr.max}
							autoComplete="off"
							translate="no"
							aria-invalid={tenHong || undefined}
							data-o-ten-kr
							onChange={(e) => onDoi({ ten: e.target.value })}
						/>
						{tenHong ? (
							<FieldError data-loi-ten-kr>
								{dien(t.loiTenKr, OKR_MAU.tenKr)}
							</FieldError>
						) : null}
					</Field>
					<div className="grid items-start gap-3 sm:grid-cols-2">
						<Field>
							<FieldLabel htmlFor={`${ma}-kieu`}>{t.kieu}</FieldLabel>
							<Select
								value={kr.kieu}
								onValueChange={(v) => {
									const kieu = KIEU_KR.find((k) => k === v);
									if (kieu) onDoi({ kieu });
								}}
							>
								<SelectTrigger id={`${ma}-kieu`} data-o-kieu-kr>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{KIEU_KR.map((k) => (
										<SelectItem key={k} value={k}>
											{o.kieu[k]}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</Field>
						<Field>
							<FieldLabel htmlFor={`${ma}-don-vi`}>{t.donViDo}</FieldLabel>
							<Input
								id={`${ma}-don-vi`}
								value={kr.donVi}
								maxLength={DON_VI_DO_TOI_DA}
								autoComplete="off"
								translate="no"
								data-o-don-vi-do
								onChange={(e) => onDoi({ donVi: e.target.value })}
							/>
						</Field>
					</div>
					{kr.kieu === "moc" ? (
						<FieldDescription>{t.mocKhongSo}</FieldDescription>
					) : (
						<div className="grid items-start gap-3 sm:grid-cols-2">
							<Field data-invalid={hongKhoi || undefined}>
								<FieldLabel htmlFor={`${ma}-khoi`}>{t.khoiDiem}</FieldLabel>
								<Input
									id={`${ma}-khoi`}
									value={kr.khoi}
									inputMode="decimal"
									autoComplete="off"
									aria-invalid={hongKhoi || undefined}
									data-o-khoi-diem
									onChange={(e) => onDoi({ khoi: e.target.value })}
								/>
							</Field>
							<Field data-invalid={hongDich || undefined}>
								<FieldLabel htmlFor={`${ma}-dich`}>{t.dich}</FieldLabel>
								<Input
									id={`${ma}-dich`}
									value={kr.dich}
									inputMode="decimal"
									autoComplete="off"
									aria-invalid={hongDich || undefined}
									data-o-dich
									onChange={(e) => onDoi({ dich: e.target.value })}
								/>
							</Field>
						</div>
					)}
					{loiKieu ? (
						<FieldError data-loi-kieu={loiKieu}>
							{h.soTheoKieu[loiKieu]}
						</FieldError>
					) : hongKhoi || soHong(kr, kr.dich) ? (
						<FieldError>{h.soSai}</FieldError>
					) : null}
				</FieldGroup>
			</ItemContent>
			<ItemActions>
				<Button
					type="button"
					size="icon-sm"
					variant="ghost"
					aria-label={dien(t.boKr, { n: thu + 1 })}
					disabled={!boDuoc}
					data-nut="bo-kr-mau"
					onClick={onBo}
				>
					<Icon icon={TrashCan} />
				</Button>
			</ItemActions>
		</Item>
	);
}
