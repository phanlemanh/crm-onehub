"use client";

import Add from "@carbon/icons-react/es/Add";
import Subtract from "@carbon/icons-react/es/Subtract";
import { Button } from "@crm/ui/components/button";
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
} from "@crm/validation/okr-hoi-y";
import { useMutation, useQuery } from "@tanstack/react-query";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useId, useState } from "react";
import { toast } from "sonner";
import { okrHoiYMessages } from "@/lib/messages/okr-hoi-y";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import type { ChuKy } from "../kieu";
import { dien } from "./chu";
import { congNgay, HOI_Y_MAN, hanLucTu, homNayVN, kiemHan } from "./man-hoi-y";

type DongNhap = { id: number; nhan: string; giaTri: string; ghiChu: string };

const PHA_MO = "lap-ke-hoach" satisfies PhaChuKy;

export function useMoHoiY() {
	return useQueryState(
		SEARCH_PARAM.okr.moHoiY,
		parseAsBoolean.withDefault(false),
	);
}

function FormMoHoiY({
	chuKy,
	cycleId,
	onXong,
}: {
	chuKy: ChuKy[];
	cycleId: string;
	onXong: (cycleId: string) => void;
}) {
	const m = okrHoiYMessages(useLocale()).sheet;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const id = useId();
	const moDuoc = chuKy.filter((c) => c.phase === PHA_MO);
	const [bayGio] = useState(() => Date.now());
	const [kyId, setKyId] = useState(
		moDuoc.some((c) => c.id === cycleId) ? cycleId : (moDuoc[0]?.id ?? ""),
	);
	const tenKy = (idKy: string) => chuKy.find((c) => c.id === idKy)?.name ?? "";
	const [cauHoi, setCauHoi] = useState(() =>
		dien(m.cauHoiMacDinh, { ky: tenKy(kyId) }),
	);
	const [loiMo, setLoiMo] = useState("");
	const [dong, setDong] = useState<DongNhap[]>([
		{ id: 1, nhan: "", giaTri: "", ghiChu: "" },
	]);
	const [daCham, setDaCham] = useState<ReadonlySet<number>>(new Set());
	const [ngay, setNgay] = useState(() =>
		congNgay(homNayVN(bayGio), HOI_Y_MAN.han.ngayMacDinh),
	);
	const [gio, setGio] = useState<string>(HOI_Y_MAN.han.gioMacDinh);
	const [nguoiChon, setNguoiChon] = useState("");
	const quanTri = useQuery(
		trpc.workspace.members.queryOptions({
			role: ["owner", "admin"],
			pageSize: HOI_Y_MAN.nguoiChonToiDa,
		}),
	);
	const mo = useMutation(
		trpc.okr.moHoiY.mutationOptions({
			onSuccess: async () => {
				toast.success(m.daMo);
				onXong(kyId);
				await cache.hoiY();
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const hanLuc = ngay && gio ? hanLucTu(ngay, gio) : "";
	const loiHan = kiemHan(hanLuc, Date.now());
	const vao = {
		cycleId: kyId,
		cauHoi: cauHoi.trim(),
		loiMo: loiMo.trim(),
		soLieu: dong.map((d) => ({
			nhan: d.nhan.trim(),
			giaTri: d.giaTri.trim(),
			ghiChu: d.ghiChu.trim(),
		})),
		hanLuc,
		nguoiChonUserId: nguoiChon,
	};
	const hopLe = moHoiYInput.safeParse(vao).success && loiHan === null;
	const cauHoiSai = !moHoiYInput.shape.cauHoi.safeParse(cauHoi).success;
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
				: loiHan === "muon"
					? dien(m.loiHanMuon, { n: OKR_HOI_Y.hanGio.max })
					: null;

	return (
		<form
			className="flex min-h-0 flex-1 flex-col"
			noValidate
			onSubmit={(e) => {
				e.preventDefault();
				if (hopLe) mo.mutate(vao);
			}}
		>
			<div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-6">
				<FieldGroup>
					<Field>
						<FieldLabel htmlFor={`${id}-ky`}>{m.chuKy}</FieldLabel>
						<Select onValueChange={setKyId} value={kyId}>
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
							id={`${id}-loi-mo`}
							maxLength={OKR_HOI_Y.loiMo.max}
							onChange={(e) => setLoiMo(e.target.value)}
							translate="no"
							value={loiMo}
						/>
						<FieldDescription>{m.loiMoMoTa}</FieldDescription>
					</Field>
				</FieldGroup>
				<FieldSet>
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
												<FieldDescription>{m.ghiChuMoTa}</FieldDescription>
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
						<DatePicker id={`${id}-han-ngay`} onChange={setNgay} value={ngay} />
					</Field>
					<Field data-invalid={loiHanChu ? true : undefined}>
						<FieldLabel htmlFor={`${id}-han-gio`}>{m.hanGio}</FieldLabel>
						<Input
							aria-invalid={loiHanChu ? true : undefined}
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
					<Field>
						<FieldLabel htmlFor={`${id}-nguoi-chon`}>{m.nguoiChon}</FieldLabel>
						<Select onValueChange={setNguoiChon} value={nguoiChon}>
							<SelectTrigger id={`${id}-nguoi-chon`}>
								<SelectValue placeholder={m.nguoiChonGoiY} />
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{(quanTri.data?.rows ?? []).map((n) => (
										<SelectItem key={n.userId} value={n.userId}>
											<span translate="no">{n.name}</span>
										</SelectItem>
									))}
								</SelectGroup>
							</SelectContent>
						</Select>
						<FieldDescription>{m.nguoiChonMoTa}</FieldDescription>
					</Field>
				</FieldGroup>
			</div>
			<SheetFooter>
				<div className="flex items-center justify-between gap-2">
					<SheetClose asChild>
						<Button type="button" variant="outline">
							{m.huy}
						</Button>
					</SheetClose>
					<Button disabled={!hopLe || mo.isPending} type="submit">
						{mo.isPending ? <Spinner data-icon="inline-start" /> : null}
						{m.mo}
					</Button>
				</div>
			</SheetFooter>
		</form>
	);
}

export function SheetMoHoiY({
	chuKy,
	cycleId,
	onXong,
}: {
	chuKy: ChuKy[];
	cycleId: string;
	onXong: (cycleId: string) => void;
}) {
	const m = okrHoiYMessages(useLocale()).sheet;
	const [mo, setMo] = useMoHoiY();
	return (
		<Sheet onOpenChange={(tiep) => void setMo(tiep || null)} open={mo}>
			<SheetContent data-khoi="sheet-mo-hoi-y" side="right" size="md">
				<SheetHeader>
					<SheetTitle>{m.tieuDe}</SheetTitle>
					<SheetDescription>{m.moTa}</SheetDescription>
				</SheetHeader>
				{mo ? (
					<FormMoHoiY
						chuKy={chuKy}
						cycleId={cycleId}
						onXong={(ky) => {
							void setMo(null);
							onXong(ky);
						}}
					/>
				) : null}
			</SheetContent>
		</Sheet>
	);
}
