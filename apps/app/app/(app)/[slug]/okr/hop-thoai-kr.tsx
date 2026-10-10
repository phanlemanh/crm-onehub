"use client";

import { Button } from "@crm/ui/components/button";
import { Combobox } from "@crm/ui/components/combobox";
import { DatePicker } from "@crm/ui/components/date-picker";
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
import {
	Sheet,
	SheetBody,
	SheetClose,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import { Spinner } from "@crm/ui/components/spinner";
import { Textarea } from "@crm/ui/components/textarea";
import type { Locale } from "@crm/ui/lib/locale";
import { OKR_KHEP } from "@crm/validation/okr-khep";
import { kiemOkr, type TruongKiem } from "@crm/validation/okr-kiem";
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
import { okrGopYMessages } from "@/lib/messages/okr-gop-y";
import { okrKhepMessages } from "@/lib/messages/okr-khep";
import { okrSoMessages } from "@/lib/messages/okr-so";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { DongDanGopY } from "./dong-dan-gop-y";
import type { KetQua } from "./kieu";
import { KHOA_NGUON } from "./nguon-so";
import { nhapNguonKhac } from "./nguon-so-luat";
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

type OKr = {
	ten: string;
	kieu: KieuKr;
	khoi: string;
	dich: string;
	hien: string;
	donVi: string;
	chu: string;
	han: string | null;
	trongSo: string;
};

function oKrDau(kr: KetQua | null, chuMacDinh: string, locale: Locale): OKr {
	return {
		ten: kr?.title ?? "",
		kieu: kr?.kind ?? "tang-toi",
		khoi: kr ? hienSo(kr.startValue, locale) : "0",
		dich: kr ? hienSo(kr.targetValue, locale) : "",
		hien: kr ? hienSo(kr.currentValue, locale) : "",
		donVi: kr?.unit ?? "",
		chu: kr?.owner.id ?? chuMacDinh,
		han: kr?.dueOn ?? null,
		trongSo: kr ? hienSo(kr.weight, locale) : "1",
	};
}

function oKrKhac(a: OKr, b: OKr): boolean {
	return (
		a.ten !== b.ten ||
		a.kieu !== b.kieu ||
		a.khoi !== b.khoi ||
		a.dich !== b.dich ||
		a.hien !== b.hien ||
		a.donVi !== b.donVi ||
		a.chu !== b.chu ||
		a.han !== b.han ||
		a.trongSo !== b.trongSo
	);
}

function DongXuHuong({
	keyResultId,
	donVi,
}: {
	keyResultId: string;
	donVi: string;
}) {
	const locale = useLocale();
	const trpc = useTRPC();
	const xuHuong = useQuery(trpc.okr.xuHuongKr.queryOptions({ keyResultId }));
	const x = xuHuong.data;
	if (!x) return null;
	const moiTuan = `${x.moiTuan > 0 ? "+" : ""}${hienSo(x.moiTuan, locale)}`;
	return (
		<FieldDescription variant="hoi" data-xu-huong>
			{okrGopYMessages(locale).xuHuong(
				moiTuan,
				hienSo(x.uocCuoiKy, locale),
				donVi,
			)}
		</FieldDescription>
	);
}

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
	mucTieu: MucTieuNguon & { title: string };
	kr: KetQua | null;
	chuMacDinh: string;
	suaDuocCot: boolean;
	dong: () => void;
}) {
	const locale = useLocale();
	const m = okrMessages(locale);
	const h = m.hopThoai;
	const so = okrSoMessages(locale);
	const mk = okrKhepMessages(locale);
	const trpc = useTRPC();
	const cache = useCrmCache();
	const url = useWorkspaceUrl();
	const ma = useId();
	const users = useQuery(trpc.users.list.queryOptions());
	const program = useQuery(trpc.okr.program.queryOptions());
	const cycles = useQuery(trpc.okr.cycles.queryOptions());

	const [daLuuMot, setDaLuuMot] = useState(false);

	const [dau, setDau] = useState(() => oKrDau(kr, chuMacDinh, locale));
	const [ten, setTen] = useState(dau.ten);
	const [kieu, setKieu] = useState<KieuKr>(dau.kieu);
	const [khoi, setKhoi] = useState(dau.khoi);
	const [dich, setDich] = useState(dau.dich);
	const [hien, setHien] = useState(dau.hien);
	const [donVi, setDonVi] = useState(dau.donVi);
	const [chu, setChu] = useState(dau.chu);
	const [han, setHan] = useState<string | null>(dau.han);
	const [trongSo, setTrongSo] = useState(dau.trongSo);
	const [lyDo, setLyDo] = useState("");
	const [loi, setLoi] = useState<string | null>(null);
	const n = useNguonSo({ objectiveId, kr, mucTieu, baoLoi: setLoi });
	const [nguonDau, setNguonDau] = useState(n.gia);
	const goc = n.goc;
	const oHienTai: OKr = {
		ten,
		kieu,
		khoi,
		dich,
		hien,
		donVi,
		chu,
		han,
		trongSo,
	};
	const coThayDoi =
		oKrKhac(dau, oHienTai) || nhapNguonKhac(nguonDau, n.gia) || lyDo !== "";
	const gopYKr = useQuery({
		...trpc.okr.troLyDanhSach.queryOptions({
			objectiveId,
			keyResultId: n.krId ?? "",
		}),
		enabled: n.krId !== null,
		retry: false,
	});
	const soGopYKr =
		gopYKr.data && gopYKr.data.lyDo === null ? gopYKr.data.dong.length : 0;

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
	const hoi = kiemOkr({
		title: mucTieu.title,
		whyNow: "",
		keyResults: [
			{
				title: ten,
				kind: kieu,
				startValue: soKhoi ?? 0,
				targetValue: soDich ?? 0,
			},
		],
	}).filter(
		(h) =>
			(h.truong !== "startValue" || !khoaKhoi) &&
			(h.truong !== "targetValue" || soDich !== null),
	);
	const hoiDuoi = (truong: TruongKiem) =>
		hoi
			.filter((c) => c.truong === truong)
			.map((c) => (
				<FieldDescription variant="hoi" data-hoi-chat-luong={c.ma} key={c.ma}>
					{mk.luat[c.ma]}
				</FieldDescription>
			));
	const chuKy =
		cycles.data?.cycles.find((c) => c.id === mucTieu.cycleId) ?? null;
	const canLyDo =
		goc !== null &&
		mucTieu.status === "cong-bo" &&
		chuKy?.phase === "dang-chay" &&
		chuKy.cuaSoRa === null &&
		soDich !== null &&
		soDich !== goc.targetValue;
	const lyDoDu = lyDo.trim().length >= OKR_KHEP.lyDo.toiThieu;
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
			(canLyDo && !lyDoDu) ||
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
				const kq = await sua.mutateAsync({
					id,
					...doi,
					lyDoDoiDich: canLyDo ? lyDo.trim() : undefined,
				});
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
			setDau(oHienTai);
			setNguonDau(n.gia);
			setLyDo("");
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
		<Sheet
			open
			onOpenChange={(mo) => {
				if (!mo && !dangLuu) dong();
			}}
			coThayDoi={coThayDoi}
		>
			<SheetContent side="right" data-hop-thoai-kr={n.krId ?? "moi"}>
				<SheetHeader>
					<SheetTitle>{n.krId ? h.suaKr : h.themKr}</SheetTitle>
					<SheetDescription translate="no">{mucTieu.title}</SheetDescription>
				</SheetHeader>
				<SheetBody data-cuon-hop>
					<form
						id={`${ma}-form`}
						onSubmit={(e) => {
							e.preventDefault();
							void gui();
						}}
					>
						<FieldGroup>
							{n.krId ? (
								<DongDanGopY
									keyResultId={n.krId}
									moTa={okrGopYMessages(locale).danSang.moTaKr}
									objectiveId={objectiveId}
									so={soGopYKr}
								/>
							) : null}
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
								{hoiDuoi("title")}
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
									{hoiDuoi("startValue")}
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
									{canLyDo && goc ? (
										<FieldDescription>
											{mk.lyDoDich.dichTruoc}{" "}
											<span className="tabular-nums">
												{hienSo(goc.targetValue, locale)}
											</span>
										</FieldDescription>
									) : null}
									{hoiDuoi("targetValue")}
									{n.krId ? (
										<DongXuHuong keyResultId={n.krId} donVi={dau.donVi} />
									) : null}
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
							{canLyDo ? (
								<Field data-o-ly-do-dich>
									<FieldLabel htmlFor={`${ma}-ly-do-dich`}>
										{mk.lyDoDich.nhan}
									</FieldLabel>
									<Textarea
										id={`${ma}-ly-do-dich`}
										value={lyDo}
										rows={2}
										maxLength={OKR_KHEP.lyDo.toiDa}
										translate="no"
										required
										aria-describedby={`${ma}-ly-do-dich-mo-ta`}
										onChange={(e) => setLyDo(e.target.value)}
									/>
									<FieldDescription id={`${ma}-ly-do-dich-mo-ta`}>
										{mk.lyDoDich.moTa}
									</FieldDescription>
								</Field>
							) : null}
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
				</SheetBody>
				<SheetFooter>
					<SheetClose asChild dongNgay={daLuuMot && !coThayDoi}>
						<Button variant="outline" disabled={dangLuu}>
							{daLuuMot ? so.trangThai.hopThoai.dong : h.huy}
						</Button>
					</SheetClose>
					<Button
						type="submit"
						form={`${ma}-form`}
						disabled={dangLuu || !sanSang || !daSua || (canLyDo && !lyDoDu)}
						data-nut="gui-kr"
					>
						{dangLuu ? <Spinner /> : null}
						{n.krId ? h.luu : h.themKr}
					</Button>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
