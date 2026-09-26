"use client";

import { Button } from "@crm/ui/components/button";
import { Combobox } from "@crm/ui/components/combobox";
import { DatePicker } from "@crm/ui/components/date-picker";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { Spinner } from "@crm/ui/components/spinner";
import type { Locale } from "@crm/ui/lib/locale";
import {
	docSoOkr,
	KIEU_KR,
	type KieuKr,
	kiemSoTheoKieu,
	krInput,
} from "@crm/validation/okr-kr";
import { crmHopKieu } from "@crm/validation/okr-nguon";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useId, useState } from "react";
import { toast } from "sonner";
import { okrMessages } from "@/lib/messages/okr";
import { okrSoMessages } from "@/lib/messages/okr-so";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import type { KetQua } from "./kieu";
import { KHOA_NGUON } from "./nguon-so";
import { type MucTieuNguon, NguonSo, useNguonSo } from "./o-nguon-so";

export function hienSo(so: number, locale: Locale): string {
	const chu = locale === "vi" ? String(so).replace(".", ",") : String(so);
	return docSoOkr(chu) === so ? chu : `${chu}0`;
}

type ONhap = {
	ten: string;
	kieu: KieuKr;
	chu: string;
	soKhoi: number | null;
	soDich: number | null;
	soHien: number | null;
	donVi: string;
	han: string | null;
	soTrongSo: number | null;
	coTrongSo: boolean;
	khoaHien: boolean;
};

function khac<T>(moi: T | null, cu: T): T | undefined {
	return moi === null || moi === cu ? undefined : moi;
}

function doiCuaKr(goc: KetQua, o: ONhap) {
	return {
		title: o.ten.trim() === goc.title ? undefined : o.ten,
		kind: khac(o.kieu, goc.kind),
		ownerUserId: khac(o.chu, goc.owner.id),
		startValue: khac(o.soKhoi, goc.startValue),
		targetValue: khac(o.soDich, goc.targetValue),
		currentValue: o.khoaHien ? undefined : khac(o.soHien, goc.currentValue),
		unit: o.donVi.trim() === goc.unit ? undefined : o.donVi,
		dueOn: o.han === goc.dueOn ? undefined : o.han,
		weight: o.coTrongSo ? khac(o.soTrongSo, goc.weight) : undefined,
	};
}

export function HopThoaiKr({
	objectiveId,
	mucTieu,
	kr,
	chuMacDinh,
	suaDuocCot,
	dong,
}: {
	objectiveId: string;
	mucTieu: MucTieuNguon;
	kr: KetQua | null;
	chuMacDinh: string;
	suaDuocCot: boolean;
	dong: () => void;
}) {
	const locale = useLocale();
	const m = okrMessages(locale);
	const h = m.hopThoai;
	const so = okrSoMessages(locale);
	const trpc = useTRPC();
	const cache = useCrmCache();
	const url = useWorkspaceUrl();
	const ma = useId();
	const users = useQuery(trpc.users.list.queryOptions());
	const program = useQuery(trpc.okr.program.queryOptions());

	const [daLuuMot, setDaLuuMot] = useState(false);

	const [ten, setTen] = useState(kr?.title ?? "");
	const [kieu, setKieu] = useState<KieuKr>(kr?.kind ?? "tang-toi");
	const [khoi, setKhoi] = useState(kr ? hienSo(kr.startValue, locale) : "0");
	const [dich, setDich] = useState(kr ? hienSo(kr.targetValue, locale) : "");
	const [hien, setHien] = useState(kr ? hienSo(kr.currentValue, locale) : "");
	const [donVi, setDonVi] = useState(kr?.unit ?? "");
	const [chu, setChu] = useState(kr?.owner.id ?? chuMacDinh);
	const [han, setHan] = useState<string | null>(kr?.dueOn ?? null);
	const [trongSo, setTrongSo] = useState(kr ? hienSo(kr.weight, locale) : "1");
	const [loi, setLoi] = useState<string | null>(null);
	const n = useNguonSo({ objectiveId, kr, mucTieu, baoLoi: setLoi });
	const goc = n.goc;

	const tao = useMutation(trpc.okr.createKeyResult.mutationOptions());
	const sua = useMutation(trpc.okr.updateKeyResult.mutationOptions());
	const dangLuu = tao.isPending || sua.isPending || n.dangGui;

	const khoaKhoi = goc?.startLocked === true || !suaDuocCot;
	const khoaMay = goc !== null && goc.source !== "tay";
	const khoaHien = goc?.hienTaiQuaCapNhat === true || khoaMay;
	const coTrongSo = program.data?.weightsOn === true;
	const soKhoi = docSoOkr(khoi);
	const soDich = docSoOkr(dich);
	const soHien = hien.trim() === "" ? soKhoi : docSoOkr(hien);
	const soTrongSo = docSoOkr(trongSo);
	const loiKieu =
		soKhoi !== null && soDich !== null
			? kiemSoTheoKieu(kieu, soKhoi, soDich)
			: null;
	const tenHopLe = krInput.shape.title.safeParse(ten).success;
	const donViHopLe = krInput.shape.unit.safeParse(donVi).success;
	const trongSoHopLe =
		!coTrongSo || krInput.shape.weight.safeParse(soTrongSo).success;
	const sanSang =
		tenHopLe &&
		donViHopLe &&
		trongSoHopLe &&
		chu !== "" &&
		soKhoi !== null &&
		soDich !== null &&
		soHien !== null &&
		loiKieu === null &&
		n.hopLe &&
		(n.gia.loai !== "crm" || crmHopKieu(kieu)) &&
		!n.dangCho;

	const doi = goc
		? doiCuaKr(goc, {
				ten,
				kieu,
				chu,
				soKhoi,
				soDich,
				soHien,
				donVi,
				han,
				soTrongSo,
				coTrongSo,
				khoaHien,
			})
		: null;
	const doiKr = doi !== null && Object.values(doi).some((v) => v !== undefined);
	const daSua = doi === null || doiKr || n.doiNguon;

	const gui = async () => {
		if (
			dangLuu ||
			!sanSang ||
			!daSua ||
			soKhoi === null ||
			soDich === null ||
			soHien === null
		)
			return;
		setLoi(null);
		let id = n.krId;
		let giuMo = false;
		try {
			if (id === null) {
				const kq = await tao.mutateAsync({
					objectiveId,
					title: ten,
					kind: kieu,
					ownerUserId: chu,
					startValue: soKhoi,
					targetValue: soDich,
					currentValue: soHien,
					unit: donVi,
					dueOn: han,
					weight: coTrongSo && soTrongSo !== null ? soTrongSo : 1,
				});
				if (kq.canhBao) toast.warning(kq.canhBao);
				id = kq.id;
				n.datKrId(kq.id);
			} else if (doi && doiKr) {
				const kq = await sua.mutateAsync({ id, ...doi });
				if (kq.canhBao) toast.warning(kq.canhBao);
			}
			giuMo = await n.luu(id);
		} catch (e) {
			setLoi(e instanceof Error ? e.message : String(e));
			void cache.okr(objectiveId);
			return;
		}
		toast.success(goc ? h.daLuu : h.daThemKr);
		void cache.okr(objectiveId);
		if (giuMo) {
			setDaLuuMot(true);
			return;
		}
		dong();
	};

	const nguoi = (users.data ?? []).map((u) => ({
		value: u.id,
		label: u.name,
		hint: u.email,
		keywords: [u.email],
	}));
	const soHong = (chuSo: string) =>
		chuSo.trim() !== "" && docSoOkr(chuSo) === null;

	return (
		<Dialog
			open
			onOpenChange={(mo) => {
				if (!mo && !dangLuu) dong();
			}}
		>
			<DialogContent data-hop-thoai-kr={n.krId ?? "moi"}>
				<DialogHeader>
					<DialogTitle>{n.krId ? h.suaKr : h.themKr}</DialogTitle>
				</DialogHeader>
				<div className="-m-1 max-h-[70svh] overflow-y-auto p-1" data-cuon-hop>
					<form
						id={`${ma}-form`}
						onSubmit={(e) => {
							e.preventDefault();
							void gui();
						}}
					>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor={`${ma}-ten`}>{h.tenKr}</FieldLabel>
								<Input
									id={`${ma}-ten`}
									value={ten}
									maxLength={200}
									autoComplete="off"
									translate="no"
									onChange={(e) => setTen(e.target.value)}
								/>
							</Field>
							<Field data-disabled={!suaDuocCot}>
								<FieldLabel htmlFor={`${ma}-kieu`}>{h.kieuKr}</FieldLabel>
								<Select
									value={kieu}
									disabled={!suaDuocCot}
									onValueChange={(v) => {
										const moi = KIEU_KR.find((k) => k === v);
										if (moi) setKieu(moi);
									}}
								>
									<SelectTrigger id={`${ma}-kieu`} data-o-kieu>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{KIEU_KR.map((k) => (
											<SelectItem key={k} value={k}>
												{m.kieu[k]}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{suaDuocCot ? null : (
									<FieldDescription>{h.chiNguoiSua}</FieldDescription>
								)}
							</Field>
							<div className="grid items-start gap-3 sm:grid-cols-3">
								<Field data-disabled={khoaKhoi}>
									<FieldLabel htmlFor={`${ma}-khoi`}>{h.khoiDiem}</FieldLabel>
									<Input
										id={`${ma}-khoi`}
										value={khoi}
										inputMode="decimal"
										autoComplete="off"
										disabled={khoaKhoi}
										aria-invalid={soHong(khoi)}
										aria-describedby={
											kr?.startLocked ? `${ma}-khoi-mo-ta` : undefined
										}
										data-o-khoi-diem
										onChange={(e) => setKhoi(e.target.value)}
									/>
									{kr?.startLocked ? (
										<FieldDescription id={`${ma}-khoi-mo-ta`}>
											{h.daKhoa}
										</FieldDescription>
									) : null}
								</Field>
								<Field data-invalid={loiKieu !== null || soHong(dich)}>
									<FieldLabel htmlFor={`${ma}-dich`}>{h.dich}</FieldLabel>
									<Input
										id={`${ma}-dich`}
										value={dich}
										inputMode="decimal"
										autoComplete="off"
										aria-invalid={loiKieu !== null || soHong(dich)}
										data-o-dich
										onChange={(e) => setDich(e.target.value)}
									/>
								</Field>
								<Field>
									<FieldLabel htmlFor={`${ma}-hien`}>{h.hienTai}</FieldLabel>
									<Input
										id={`${ma}-hien`}
										value={hien}
										inputMode="decimal"
										autoComplete="off"
										placeholder={khoi}
										readOnly={khoaHien}
										aria-invalid={soHong(hien)}
										aria-describedby={khoaHien ? `${ma}-hien-mo-ta` : undefined}
										data-o-hien-tai
										onChange={(e) => setHien(e.target.value)}
									/>
									{khoaMay && goc ? (
										<FieldDescription id={`${ma}-hien-mo-ta`}>
											{so.nguon[KHOA_NGUON[goc.source]].moTa}
										</FieldDescription>
									) : khoaHien ? (
										<FieldDescription id={`${ma}-hien-mo-ta`}>
											{h.hienTaiDoiO}{" "}
											<Link href={url("/okr/cap-nhat-tuan")}>
												{h.capNhatTuan}
											</Link>
										</FieldDescription>
									) : null}
								</Field>
							</div>
							{loiKieu ? (
								<FieldError data-loi-kieu={loiKieu}>
									{h.soTheoKieu[loiKieu]}
								</FieldError>
							) : soHong(khoi) || soHong(dich) || soHong(hien) ? (
								<FieldError>{h.soSai}</FieldError>
							) : (
								<FieldDescription data-quy-uoc-so>
									{h.quyUocSo}
								</FieldDescription>
							)}
							<NguonSo
								kr={goc}
								kieu={kieu}
								objective={n.mucTieu}
								khoa={n.mucTieu.status !== "nhap"}
								gia={n.gia}
								datGia={n.datGia}
								phamVi={n.phamVi}
								docThu={n.docThu}
								docLai={n.docLai}
								dangDocLai={n.dangGui}
							/>
							<div className="grid items-start gap-3 sm:grid-cols-2">
								<Field>
									<FieldLabel htmlFor={`${ma}-don-vi`}>{h.donViDo}</FieldLabel>
									<Input
										id={`${ma}-don-vi`}
										value={donVi}
										maxLength={24}
										autoComplete="off"
										translate="no"
										aria-describedby={`${ma}-don-vi-mo-ta`}
										onChange={(e) => setDonVi(e.target.value)}
									/>
									<FieldDescription id={`${ma}-don-vi-mo-ta`}>
										{h.donViDoMoTa}
									</FieldDescription>
								</Field>
								<Field data-disabled={!suaDuocCot}>
									<FieldLabel htmlFor={`${ma}-chu`}>{m.phuTrach}</FieldLabel>
									<Combobox
										id={`${ma}-chu`}
										translate="no"
										disabled={!suaDuocCot || users.isPending}
										options={nguoi}
										value={chu}
										onValueChange={setChu}
										placeholder={users.isPending ? h.dangTai : h.chonNguoi}
										searchPlaceholder={h.timNguoi}
										empty={h.khongAi}
									/>
								</Field>
							</div>
							<div className="grid items-start gap-3 sm:grid-cols-2">
								<Field>
									<FieldLabel htmlFor={`${ma}-han`}>{h.han}</FieldLabel>
									<DatePicker
										id={`${ma}-han`}
										value={han}
										onChange={(v) => setHan(v === "" ? null : v)}
									/>
								</Field>
								{coTrongSo ? (
									<Field>
										<FieldLabel htmlFor={`${ma}-trong-so`}>
											{h.trongSo}
										</FieldLabel>
										<Input
											id={`${ma}-trong-so`}
											value={trongSo}
											inputMode="decimal"
											autoComplete="off"
											aria-invalid={!trongSoHopLe}
											aria-describedby={`${ma}-trong-so-mo-ta`}
											onChange={(e) => setTrongSo(e.target.value)}
										/>
										<FieldDescription id={`${ma}-trong-so-mo-ta`}>
											{h.trongSoMoTa}
										</FieldDescription>
									</Field>
								) : null}
							</div>
							{loi ? <FieldError data-loi-may-chu>{loi}</FieldError> : null}
						</FieldGroup>
					</form>
				</div>
				<DialogFooter>
					<Button variant="outline" onClick={dong} disabled={dangLuu}>
						{daLuuMot ? so.trangThai.hopThoai.dong : h.huy}
					</Button>
					<Button
						type="submit"
						form={`${ma}-form`}
						disabled={dangLuu || !sanSang || !daSua}
						data-nut="gui-kr"
					>
						{dangLuu ? <Spinner /> : null}
						{n.krId ? h.luu : h.themKr}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
