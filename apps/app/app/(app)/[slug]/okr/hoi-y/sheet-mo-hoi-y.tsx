"use client";

import Add from "@carbon/icons-react/es/Add";
import Subtract from "@carbon/icons-react/es/Subtract";
import { Button } from "@crm/ui/components/button";
import { ConfirmDialog } from "@crm/ui/components/confirm-dialog";
import { DatePicker } from "@crm/ui/components/date-picker";
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
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Select,
	SelectContent,
	SelectGroup,
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
import type { PhaChuKy } from "@crm/validation/okr-chu-ky";
import {
	dongSoLieuHoiY,
	moHoiYInput,
	OKR_HOI_Y,
	suaHoiYInput,
} from "@crm/validation/okr-hoi-y";
import { useMutation, useQuery } from "@tanstack/react-query";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useId, useState } from "react";
import { toast } from "sonner";
import { okrHoiYMessages } from "@/lib/messages/okr-hoi-y";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { ChuKy } from "../kieu";
import { dien } from "./chu";
import {
	congNgay,
	gioVN,
	HOI_Y_MAN,
	type HoiY,
	hanLucTu,
	homNayVN,
	kiemHan,
	kiemHanSua,
	type LoiHan,
} from "./man-hoi-y";

type DongNhap = { id: number; nhan: string; giaTri: string; ghiChu: string };

const PHA_MO = "lap-ke-hoach" satisfies PhaChuKy;

export const CHE_DO_SHEET = ["mo", "sua"] as const;

export function useMoHoiY() {
	return useQueryState(
		SEARCH_PARAM.okr.moHoiY,
		parseAsStringLiteral(CHE_DO_SHEET),
	);
}

type Nap = {
	cauHoi: string;
	loiMo: string;
	dong: DongNhap[];
	ngay: string;
	gio: string;
	nguoiChon: string;
};

function napTu(sua: HoiY | null, cauHoiMacDinh: string, bayGio: number): Nap {
	if (sua)
		return {
			cauHoi: sua.hoiY.cauHoi,
			loiMo: sua.hoiY.loiMo,
			dong: sua.hoiY.soLieu.map((s, i) => ({ id: i + 1, ...s })),
			ngay: homNayVN(Date.parse(sua.hoiY.hanLuc)),
			gio: gioVN(sua.hoiY.hanLuc),
			nguoiChon: sua.nguoiChon.id,
		};
	return {
		cauHoi: cauHoiMacDinh,
		loiMo: "",
		dong: [{ id: 1, nhan: "", giaTri: "", ghiChu: "" }],
		ngay: congNgay(homNayVN(bayGio), HOI_Y_MAN.han.ngayMacDinh),
		gio: HOI_Y_MAN.han.gioMacDinh,
		nguoiChon: "",
	};
}

function FormHoiY({
	chuKy,
	cycleId,
	sua,
	onXong,
}: {
	chuKy: ChuKy[];
	cycleId: string;
	sua: HoiY | null;
	onXong: (cycleId: string) => void;
}) {
	const m = okrHoiYMessages(useLocale()).sheet;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const id = useId();
	const moDuoc = sua
		? chuKy.filter((c) => c.id === cycleId)
		: chuKy.filter((c) => c.phase === PHA_MO);
	const [bayGio] = useState(() => Date.now());
	const [kyId, setKyId] = useState(
		moDuoc.some((c) => c.id === cycleId) ? cycleId : (moDuoc[0]?.id ?? ""),
	);
	const tenKy = (idKy: string) => chuKy.find((c) => c.id === idKy)?.name ?? "";
	const [dau] = useState(() =>
		napTu(sua, dien(m.cauHoiMacDinh, { ky: tenKy(kyId) }), bayGio),
	);
	const [cauHoi, setCauHoi] = useState(dau.cauHoi);
	const [loiMo, setLoiMo] = useState(dau.loiMo);
	const [dong, setDong] = useState<DongNhap[]>(dau.dong);
	const [daCham, setDaCham] = useState<ReadonlySet<number>>(new Set());
	const [ngay, setNgay] = useState(dau.ngay);
	const [gio, setGio] = useState(dau.gio);
	const [nguoiChon, setNguoiChon] = useState(dau.nguoiChon);
	const quanTri = useQuery(
		trpc.workspace.members.queryOptions({
			role: ["owner", "admin"],
			pageSize: HOI_Y_MAN.nguoiChonToiDa,
		}),
	);
	const xong = async (cau: string) => {
		toast.success(cau);
		onXong(kyId);
		await cache.hoiY();
	};
	const mo = useMutation(
		trpc.okr.moHoiY.mutationOptions({ onSuccess: () => xong(m.daMo) }),
	);
	const luu = useMutation(
		trpc.okr.suaHoiY.mutationOptions({ onSuccess: () => xong(m.daLuu) }),
	);
	const [hoiDong, setHoiDong] = useState(false);
	const dongSom = useMutation(
		trpc.okr.suaHoiY.mutationOptions({
			onSuccess: () => {
				setHoiDong(false);
				return xong(m.daDong);
			},
			onError: () => setHoiDong(false),
		}),
	);

	const khoaNoiDung = sua !== null && sua.trangThai !== "dang-mo";
	const hanLuc = ngay && gio ? hanLucTu(ngay, gio) : "";
	const soLieu = dong.map((d) => ({
		nhan: d.nhan.trim(),
		giaTri: d.giaTri.trim(),
		ghiChu: d.ghiChu.trim(),
	}));
	const vao = {
		cycleId: kyId,
		cauHoi: cauHoi.trim(),
		loiMo: loiMo.trim(),
		soLieu,
		hanLuc,
		nguoiChonUserId: nguoiChon,
	};
	const doiHan =
		sua !== null && !khoaNoiDung && hanLuc !== hanLucTu(dau.ngay, dau.gio);
	const thayDoi = sua && {
		hoiYId: sua.hoiY.id,
		cauHoi:
			!khoaNoiDung && vao.cauHoi !== sua.hoiY.cauHoi ? vao.cauHoi : undefined,
		loiMo: !khoaNoiDung && vao.loiMo !== sua.hoiY.loiMo ? vao.loiMo : undefined,
		soLieu:
			!khoaNoiDung && JSON.stringify(soLieu) !== JSON.stringify(sua.hoiY.soLieu)
				? soLieu
				: undefined,
		hanLuc: doiHan ? hanLuc : undefined,
		nguoiChonUserId: nguoiChon !== sua.nguoiChon.id ? nguoiChon : undefined,
	};
	const loiHan: LoiHan = sua
		? doiHan
			? kiemHanSua(hanLuc, sua.hoiY.createdAt, Date.now())
			: null
		: kiemHan(hanLuc, Date.now());
	const coThayDoi =
		thayDoi !== null &&
		Object.entries(thayDoi).some(([k, v]) => k !== "hoiYId" && v !== undefined);
	const hopLe =
		loiHan === null &&
		(thayDoi
			? coThayDoi && suaHoiYInput.safeParse(thayDoi).success
			: moHoiYInput.safeParse(vao).success);
	const cauHoiSai =
		!khoaNoiDung && !moHoiYInput.shape.cauHoi.safeParse(cauHoi).success;
	const loiDong = (d: DongNhap, so: number): string | null => {
		if (!daCham.has(d.id)) return null;
		if (!dongSoLieuHoiY.shape.nhan.safeParse(d.nhan).success)
			return dien(m.loiNhan, {
				n: so,
				tu: OKR_HOI_Y.soLieu.nhan.min,
				den: OKR_HOI_Y.soLieu.nhan.max,
			});
		if (!dongSoLieuHoiY.shape.giaTri.safeParse(d.giaTri).success)
			return dien(m.loiGiaTri, {
				n: so,
				tu: OKR_HOI_Y.soLieu.giaTri.min,
				den: OKR_HOI_Y.soLieu.giaTri.max,
			});
		return null;
	};
	const doi = (
		idDong: number,
		truong: "nhan" | "giaTri" | "ghiChu",
		chu: string,
	) => {
		setDong((cu) =>
			cu.map((d) => (d.id === idDong ? { ...d, [truong]: chu } : d)),
		);
		setDaCham((cu) => new Set([...cu, idDong]));
	};
	const soMoi = Math.max(0, ...dong.map((d) => d.id)) + 1;
	const loiHanChu =
		loiHan === "thieu"
			? m.loiHanThieu
			: loiHan === "som"
				? dien(m.loiHanSom, { n: OKR_HOI_Y.hanGio.min })
				: loiHan === "qua"
					? m.loiHanQua
					: loiHan === "muon"
						? dien(m.loiHanMuon, { n: OKR_HOI_Y.hanGio.max })
						: null;
	const dangGui = mo.isPending || luu.isPending || dongSom.isPending;
	const loiMay =
		(sua ? (dongSom.error ?? luu.error) : mo.error)?.message ?? null;
	const dongDuoc = sua !== null && sua.trangThai === "dang-mo";
	const nguoiChonDuoc = [
		...(quanTri.data?.rows ?? []).map((n) => ({ id: n.userId, ten: n.name })),
		...(sua &&
		!(quanTri.data?.rows ?? []).some((n) => n.userId === sua.nguoiChon.id)
			? [{ id: sua.nguoiChon.id, ten: sua.nguoiChon.name }]
			: []),
	];

	return (
		<form
			className="flex min-h-0 flex-1 flex-col"
			noValidate
			onSubmit={(e) => {
				e.preventDefault();
				if (!hopLe) return;
				if (thayDoi) luu.mutate(thayDoi);
				else mo.mutate(vao);
			}}
		>
			<div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-6">
				{khoaNoiDung ? (
					<FieldDescription data-khoi="chi-nguoi-chon">
						{m.chiNguoiChon}
					</FieldDescription>
				) : null}
				<FieldGroup>
					<Field>
						<FieldLabel htmlFor={`${id}-ky`}>{m.chuKy}</FieldLabel>
						<Select
							disabled={sua !== null}
							onValueChange={setKyId}
							value={kyId}
						>
							<SelectTrigger id={`${id}-ky`}>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{moDuoc.map((c) => (
										<SelectItem key={c.id} value={c.id}>
											<span translate="no">{c.name}</span>
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
						<FieldDescription>{m.chuKyMoTa}</FieldDescription>
					</Field>
					<Field data-invalid={cauHoiSai ? true : undefined}>
						<FieldLabel htmlFor={`${id}-cau-hoi`}>{m.cauHoi}</FieldLabel>
						<Textarea
							aria-invalid={cauHoiSai ? true : undefined}
							disabled={khoaNoiDung}
							id={`${id}-cau-hoi`}
							maxLength={OKR_HOI_Y.cauHoi.max}
							onChange={(e) => setCauHoi(e.target.value)}
							translate="no"
							value={cauHoi}
						/>
						{cauHoiSai ? (
							<FieldError>
								{dien(m.loiCauHoi, {
									tu: OKR_HOI_Y.cauHoi.min,
									den: OKR_HOI_Y.cauHoi.max,
								})}
							</FieldError>
						) : (
							<FieldDescription>{m.cauHoiMoTa}</FieldDescription>
						)}
					</Field>
					<Field>
						<FieldLabel htmlFor={`${id}-loi-mo`}>{m.loiMo}</FieldLabel>
						<Textarea
							disabled={khoaNoiDung}
							id={`${id}-loi-mo`}
							maxLength={OKR_HOI_Y.loiMo.max}
							onChange={(e) => setLoiMo(e.target.value)}
							translate="no"
							value={loiMo}
						/>
						<FieldDescription>{m.loiMoMoTa}</FieldDescription>
					</Field>
				</FieldGroup>
				<FieldSet disabled={khoaNoiDung}>
					<FieldLegend>{m.conSo}</FieldLegend>
					<FieldDescription>
						{dien(m.conSoMoTa, {
							min: OKR_HOI_Y.soLieu.min,
							max: OKR_HOI_Y.soLieu.max,
						})}
					</FieldDescription>
					<ItemGroup>
						{dong.map((d, i) => {
							const loi = loiDong(d, i + 1);
							return (
								<Item data-dong={i + 1} key={d.id} size="sm" variant="outline">
									<ItemContent>
										<FieldGroup>
											<Field data-invalid={loi ? true : undefined}>
												<FieldLabel htmlFor={`${id}-nhan-${d.id}`}>
													{m.nhan}
												</FieldLabel>
												<Input
													aria-invalid={loi ? true : undefined}
													id={`${id}-nhan-${d.id}`}
													maxLength={OKR_HOI_Y.soLieu.nhan.max}
													onChange={(e) => doi(d.id, "nhan", e.target.value)}
													translate="no"
													value={d.nhan}
												/>
											</Field>
											<Field>
												<FieldLabel htmlFor={`${id}-gia-tri-${d.id}`}>
													{m.giaTri}
												</FieldLabel>
												<Input
													id={`${id}-gia-tri-${d.id}`}
													maxLength={OKR_HOI_Y.soLieu.giaTri.max}
													onChange={(e) => doi(d.id, "giaTri", e.target.value)}
													translate="no"
													value={d.giaTri}
												/>
											</Field>
											<Field>
												<FieldLabel htmlFor={`${id}-ghi-chu-${d.id}`}>
													{m.ghiChu}
												</FieldLabel>
												<Input
													id={`${id}-ghi-chu-${d.id}`}
													maxLength={OKR_HOI_Y.soLieu.ghiChu.max}
													onChange={(e) => doi(d.id, "ghiChu", e.target.value)}
													translate="no"
													value={d.ghiChu}
												/>
											</Field>
											{loi ? <FieldError>{loi}</FieldError> : null}
										</FieldGroup>
									</ItemContent>
									<ItemActions>
										<Button
											aria-label={dien(m.boDong, { n: i + 1 })}
											disabled={dong.length <= OKR_HOI_Y.soLieu.min}
											onClick={() =>
												setDong((cu) => cu.filter((x) => x.id !== d.id))
											}
											size="icon-sm"
											type="button"
											variant="ghost"
										>
											<Icon icon={Subtract} />
										</Button>
									</ItemActions>
								</Item>
							);
						})}
					</ItemGroup>
					<Field orientation="horizontal">
						<Button
							disabled={dong.length >= OKR_HOI_Y.soLieu.max}
							onClick={() =>
								setDong((cu) => [
									...cu,
									{ id: soMoi, nhan: "", giaTri: "", ghiChu: "" },
								])
							}
							size="sm"
							type="button"
							variant="ghost"
						>
							<Icon data-icon="inline-start" icon={Add} />
							{m.themDong}
						</Button>
					</Field>
				</FieldSet>
				<FieldGroup>
					<Field data-invalid={loiHanChu ? true : undefined}>
						<FieldLabel htmlFor={`${id}-han-ngay`}>{m.hanNgay}</FieldLabel>
						{khoaNoiDung ? (
							<Input disabled id={`${id}-han-ngay`} readOnly value={ngay} />
						) : (
							<DatePicker
								id={`${id}-han-ngay`}
								onChange={setNgay}
								value={ngay}
							/>
						)}
					</Field>
					<Field data-invalid={loiHanChu ? true : undefined}>
						<FieldLabel htmlFor={`${id}-han-gio`}>{m.hanGio}</FieldLabel>
						<Input
							aria-invalid={loiHanChu ? true : undefined}
							disabled={khoaNoiDung}
							id={`${id}-han-gio`}
							onChange={(e) => setGio(e.target.value)}
							type="time"
							value={gio}
						/>
						{loiHanChu ? (
							<FieldError>{loiHanChu}</FieldError>
						) : (
							<FieldDescription>
								{dien(m.hanMoTa, {
									min: OKR_HOI_Y.hanGio.min,
									max: OKR_HOI_Y.hanGio.max,
								})}
							</FieldDescription>
						)}
					</Field>
					{dongDuoc ? (
						<Field>
							<Button
								className="self-start"
								data-nut="dong-ngay"
								disabled={dangGui}
								onClick={() => setHoiDong(true)}
								type="button"
								variant="outline"
							>
								{m.dongNgay}
							</Button>
							<FieldDescription>{m.dongNgayMoTa}</FieldDescription>
						</Field>
					) : null}
					<Field>
						<FieldLabel htmlFor={`${id}-nguoi-chon`}>{m.nguoiChon}</FieldLabel>
						<Select onValueChange={setNguoiChon} value={nguoiChon}>
							<SelectTrigger id={`${id}-nguoi-chon`}>
								<SelectValue placeholder={m.nguoiChonGoiY} />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{nguoiChonDuoc.map((n) => (
										<SelectItem key={n.id} value={n.id}>
											<span translate="no">{n.ten}</span>
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
						<FieldDescription data-khoi="mo-ta-nguoi-chon">
							{nguoiChon === "" ? m.nguoiChonThieu : m.nguoiChonMoTa}
						</FieldDescription>
					</Field>
				</FieldGroup>
			</div>
			<SheetFooter>
				{loiMay ? <FieldError data-khoi="loi-may">{loiMay}</FieldError> : null}
				<div className="flex items-center justify-between gap-2">
					<SheetClose asChild>
						<Button data-nut="huy-sheet" type="button" variant="outline">
							{m.huy}
						</Button>
					</SheetClose>
					<Button disabled={!hopLe || dangGui} type="submit">
						{dangGui ? <Spinner data-icon="inline-start" /> : null}
						{sua ? m.luu : m.mo}
					</Button>
				</div>
			</SheetFooter>
			{dongDuoc ? (
				<ConfirmDialog
					nut={m.dongNgay}
					onConfirm={() =>
						dongSom.mutate({ hoiYId: sua.hoiY.id, dongNgay: true })
					}
					onOpenChange={setHoiDong}
					open={hoiDong}
					pending={dongSom.isPending}
					than={m.dongNgayThan}
					thoi={m.dongNgayThoi}
					tieuDe={m.dongNgayTieuDe}
				/>
			) : null}
		</form>
	);
}

export function SheetMoHoiY({
	chuKy,
	cycleId,
	sua,
	onXong,
}: {
	chuKy: ChuKy[];
	cycleId: string;
	sua: HoiY | null;
	onXong: (cycleId: string) => void;
}) {
	const m = okrHoiYMessages(useLocale()).sheet;
	const [cheDo, setCheDo] = useMoHoiY();
	const canCheDo = sua ? "sua" : "mo";
	const mo = cheDo === canCheDo;
	return (
		<Sheet
			onOpenChange={(tiep) => void setCheDo(tiep ? canCheDo : null)}
			open={mo}
		>
			<SheetContent data-khoi="sheet-mo-hoi-y" side="right" size="md">
				<SheetHeader>
					<SheetTitle>{sua ? m.tieuDeSua : m.tieuDe}</SheetTitle>
					<SheetDescription>{sua ? m.moTaSua : m.moTa}</SheetDescription>
				</SheetHeader>
				{mo ? (
					<FormHoiY
						chuKy={chuKy}
						cycleId={cycleId}
						onXong={(ky) => {
							void setCheDo(null);
							onXong(ky);
						}}
						sua={sua}
					/>
				) : null}
			</SheetContent>
		</Sheet>
	);
}
