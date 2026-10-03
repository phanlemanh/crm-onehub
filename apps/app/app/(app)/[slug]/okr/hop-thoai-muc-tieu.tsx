"use client";

import Close from "@carbon/icons-react/es/Close";
import { Button } from "@crm/ui/components/button";
import { Combobox } from "@crm/ui/components/combobox";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
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
import { MUC_HIEN_THI, type MucHienThi } from "@crm/validation/okr-hien-thi";
import {
	type CapMucTieu,
	type DonViMucTieu,
	LOAI_MUC_TIEU,
	type LoaiMucTieu,
	mucTieuInput,
} from "@crm/validation/okr-muc-tieu";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useId, useState } from "react";
import { toast } from "sonner";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { okrMessages } from "@/lib/messages/okr";
import { okrCanhKrMessages } from "@/lib/messages/okr-canh-kr";
import {
	type OkrGioiHanMessages,
	okrGioiHanMessages,
} from "@/lib/messages/okr-gioi-han";
import { okrGopYMessages } from "@/lib/messages/okr-gop-y";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { DongDanGopY } from "./dong-dan-gop-y";
import type { MucTieu } from "./kieu";
import type { DonChonOkr } from "./okr-search-params";
import { KhungTuMau, NutBatDauTuMau, NutTaoTuMau, useTuMau } from "./tu-mau";

export type YeuCauMucTieu =
	| { loai: "tao"; cycleId: string; don: DonChonOkr; tenDon: string }
	| { loai: "sua"; mucTieu: MucTieu };

const CAP_THEO_DON = {
	goc: "onehub",
	bp: "bo-phan",
	pb: "phong-ban",
	nguoi: "ca-nhan",
} as const satisfies Record<DonChonOkr["loai"], CapMucTieu>;

function donViMoi(
	cap: CapMucTieu,
	don: DonChonOkr,
	chu: string,
): DonViMucTieu | null {
	switch (cap) {
		case "onehub":
			return { level: "onehub" };
		case "bo-phan":
			return don.loai === "bp" ? { level: cap, divisionId: don.id } : null;
		case "phong-ban":
			return don.loai === "pb" ? { level: cap, departmentId: don.id } : null;
		case "ca-nhan": {
			const nguoi = don.loai === "nguoi" ? don.id : chu;
			return nguoi === "" ? null : { level: cap, personUserId: nguoi };
		}
	}
}

const cungTapHop = (a: string[], b: string[]) =>
	a.length === b.length && [...a].sort().join("|") === [...b].sort().join("|");

function OMucHienThi({
	ma,
	hienThi,
	onDoi,
	g,
}: {
	ma: string;
	hienThi: MucHienThi;
	onDoi: (moi: MucHienThi) => void;
	g: OkrGioiHanMessages;
}) {
	return (
		<Field>
			<FieldLabel htmlFor={`${ma}-hien-thi`}>{g.hienThi.tieuDe}</FieldLabel>
			<Select
				value={hienThi}
				onValueChange={(v) => {
					const moi = MUC_HIEN_THI.find((x) => x === v);
					if (moi) onDoi(moi);
				}}
			>
				<SelectTrigger
					id={`${ma}-hien-thi`}
					aria-describedby={`${ma}-hien-thi-mo-ta`}
					data-o="muc-hien-thi"
				>
					<SelectValue />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="cong-khai">{g.hienThi.congKhai}</SelectItem>
					<SelectItem value="gioi-han">{g.hienThi.gioiHan}</SelectItem>
				</SelectContent>
			</Select>
			<FieldDescription id={`${ma}-hien-thi-mo-ta`}>
				{hienThi === "gioi-han" ? g.hienThi.khiTao : g.hienThi.congKhaiMoTa}
			</FieldDescription>
		</Field>
	);
}

export function HopThoaiMucTieu({
	yeuCau,
	dong,
}: {
	yeuCau: YeuCauMucTieu;
	dong: () => void;
}) {
	const locale = useLocale();
	const m = okrMessages(locale);
	const h = m.hopThoai;
	const tm = okrCanhKrMessages(locale).mau.tuMau;
	const g = okrGioiHanMessages(locale);
	const trpc = useTRPC();
	const cache = useCrmCache();
	const openRecord = useOpenRecord();
	const ma = useId();
	const users = useQuery(trpc.users.list.queryOptions());
	const me = useQuery(trpc.users.me.queryOptions());
	const program = useQuery(trpc.okr.program.queryOptions());

	const cu = yeuCau.loai === "sua" ? yeuCau.mucTieu : null;
	const capGoc =
		yeuCau.loai === "sua"
			? yeuCau.mucTieu.level
			: CAP_THEO_DON[yeuCau.don.loai];
	const [dau] = useState(() => ({
		cap: capGoc,
		ten: cu?.title ?? "",
		loai: cu?.kind ?? "cam-ket",
		chuChon: cu?.owner.id ?? "",
		thamGia: cu?.participants.map((p) => p.id) ?? [],
		viSao: cu?.whyNow ?? "",
	}));
	const [cap, setCap] = useState<CapMucTieu>(dau.cap);
	const [ten, setTen] = useState(dau.ten);
	const [loai, setLoai] = useState<LoaiMucTieu>(dau.loai);
	const [chuChon, setChuChon] = useState(dau.chuChon);
	const [thamGia, setThamGia] = useState<string[]>(dau.thamGia);
	const [viSao, setViSao] = useState(dau.viSao);
	const [hienThi, setHienThi] = useState<MucHienThi>("cong-khai");
	const [loi, setLoi] = useState<string | null>(null);
	const coThayDoi =
		cap !== dau.cap ||
		ten !== dau.ten ||
		loai !== dau.loai ||
		chuChon !== dau.chuChon ||
		!cungTapHop(thamGia, dau.thamGia) ||
		viSao !== dau.viSao ||
		hienThi !== "cong-khai";
	const chu = chuChon || me.data?.id || "";
	const tenNguoi = (id: string) =>
		users.data?.find((u) => u.id === id)?.name ?? "";

	const xongTao =
		(thongBao: string) => (kq: { id: string; canhBao: string | null }) => {
			if (kq.canhBao) toast.warning(kq.canhBao);
			toast.success(thongBao);
			void cache.okr(kq.id);
			dong();
			openRecord({ kind: "objective", id: kq.id });
		};
	const tao = useMutation(
		trpc.okr.createObjective.mutationOptions({
			onSuccess: xongTao(h.daTao),
			onError: (e) => setLoi(e.message),
		}),
	);
	const sua = useMutation(
		trpc.okr.updateObjective.mutationOptions({
			onSuccess: (kq) => {
				if (kq.canhBao) toast.warning(kq.canhBao);
				toast.success(h.daLuu);
				void cache.okr(kq.id);
				dong();
			},
			onError: (e) => setLoi(e.message),
		}),
	);

	const coCaNhan = program.data?.personalOn === true;
	const capChon: CapMucTieu[] =
		yeuCau.loai === "sua" || capGoc === "ca-nhan" || !coCaNhan
			? [capGoc]
			: [capGoc, "ca-nhan"];
	const donVi = yeuCau.loai === "tao" ? donViMoi(cap, yeuCau.don, chu) : null;
	const tenDonVi =
		yeuCau.loai === "sua"
			? yeuCau.mucTieu.unitName
			: cap === "ca-nhan" && yeuCau.don.loai !== "nguoi"
				? tenNguoi(chu)
				: yeuCau.tenDon;

	const tuMau = useTuMau({
		tao:
			yeuCau.loai === "tao"
				? { cycleId: yeuCau.cycleId, don: yeuCau.don }
				: null,
		cap,
		chu,
		donVi,
		baoLoi: setLoi,
		xong: xongTao(tm.daTao),
	});
	const dangLuu = tao.isPending || sua.isPending || tuMau.dangTao;

	const tenHopLe = mucTieuInput.shape.title.safeParse(ten).success;
	const viSaoHopLe = mucTieuInput.shape.whyNow.safeParse(viSao).success;
	const sanSang =
		tenHopLe &&
		viSaoHopLe &&
		chu !== "" &&
		(yeuCau.loai === "sua" || donVi !== null);

	const nguoiThamGia = thamGia.filter((id) => id !== chu);
	const doi = cu
		? {
				title: ten.trim() === cu.title ? undefined : ten,
				kind: loai === cu.kind ? undefined : loai,
				ownerUserId: chu === cu.owner.id ? undefined : chu,
				participantIds: cungTapHop(
					nguoiThamGia,
					cu.participants.map((p) => p.id),
				)
					? undefined
					: nguoiThamGia,
				whyNow: viSao.trim() === cu.whyNow ? undefined : viSao,
			}
		: null;
	const daSua = doi === null || Object.values(doi).some((v) => v !== undefined);

	const gui = () => {
		if (dangLuu || !sanSang || !daSua) return;
		setLoi(null);
		if (yeuCau.loai === "tao") {
			if (!donVi) return;
			tao.mutate({
				cycleId: yeuCau.cycleId,
				unit: donVi,
				title: ten,
				kind: loai,
				ownerUserId: chu,
				participantIds: nguoiThamGia,
				whyNow: viSao,
				hienThi,
			});
			return;
		}
		if (doi) sua.mutate({ id: yeuCau.mucTieu.id, ...doi });
	};

	const moiNguoi = users.data ?? [];
	const luaChonChu = moiNguoi.map((u) => ({
		value: u.id,
		label: u.name,
		hint: u.email,
		keywords: [u.email],
	}));
	const luaChonThamGia = luaChonChu.filter(
		(o) => o.value !== chu && !thamGia.includes(o.value),
	);

	return (
		<Sheet
			open
			onOpenChange={(mo) => {
				if (!mo && !dangLuu) dong();
			}}
			coThayDoi={coThayDoi || tuMau.mauChon !== null}
		>
			<SheetContent
				side="right"
				data-hop-thoai-muc-tieu={cu?.id ?? "moi"}
				aria-describedby={undefined}
			>
				<SheetHeader>
					<SheetTitle>
						{yeuCau.loai === "sua" ? h.suaMucTieu : m.themMucTieu}
					</SheetTitle>
				</SheetHeader>
				<SheetBody data-cuon-hop>
					{tuMau.dangMo ? (
						<KhungTuMau
							tuMau={tuMau}
							id={`${ma}-tu-mau`}
							loi={loi}
							dangLuu={dangLuu}
						/>
					) : (
						<form
							id={`${ma}-form`}
							onSubmit={(e) => {
								e.preventDefault();
								gui();
							}}
						>
							<FieldGroup>
								<NutBatDauTuMau tuMau={tuMau} />
								{cu ? (
									<DongDanGopY
										moTa={okrGopYMessages(locale).danSang.moTaMucTieu}
										objectiveId={cu.id}
										so={cu.soGopYCho}
									/>
								) : null}
								<div className="grid grid-cols-2 gap-3">
									<Field data-disabled={capChon.length === 1}>
										<FieldLabel htmlFor={`${ma}-cap`}>{h.cap}</FieldLabel>
										<Select
											value={cap}
											disabled={capChon.length === 1}
											onValueChange={(v) => {
												const moi = capChon.find((c) => c === v);
												if (moi) setCap(moi);
											}}
										>
											<SelectTrigger id={`${ma}-cap`}>
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{capChon.map((c) => (
													<SelectItem key={c} value={c}>
														{h.capMucTieu[c]}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</Field>
									<Field data-disabled>
										<FieldLabel htmlFor={`${ma}-don-vi`}>{m.donVi}</FieldLabel>
										<Input
											id={`${ma}-don-vi`}
											value={tenDonVi}
											disabled
											translate="no"
										/>
									</Field>
								</div>
								{yeuCau.loai === "sua" ? (
									<FieldDescription>{h.khongDoiDonVi}</FieldDescription>
								) : cap === "ca-nhan" ? (
									<FieldDescription>{h.caNhanCua}</FieldDescription>
								) : null}
								<Field>
									<FieldLabel htmlFor={`${ma}-ten`}>{h.tenMucTieu}</FieldLabel>
									<Input
										id={`${ma}-ten`}
										value={ten}
										maxLength={200}
										autoComplete="off"
										translate="no"
										onChange={(e) => setTen(e.target.value)}
									/>
								</Field>
								<Field>
									<FieldLabel htmlFor={`${ma}-loai`}>{h.loai}</FieldLabel>
									<Select
										value={loai}
										onValueChange={(v) => {
											const moi = LOAI_MUC_TIEU.find((l) => l === v);
											if (moi) setLoai(moi);
										}}
									>
										<SelectTrigger id={`${ma}-loai`}>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{LOAI_MUC_TIEU.map((l) => (
												<SelectItem key={l} value={l}>
													{m.loai[l]}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</Field>
								<Field>
									<FieldLabel htmlFor={`${ma}-chu`}>{m.phuTrach}</FieldLabel>
									<Combobox
										id={`${ma}-chu`}
										translate="no"
										disabled={users.isPending}
										options={luaChonChu}
										value={chu}
										onValueChange={(v) => {
											setChuChon(v);
											setThamGia((ds) => ds.filter((id) => id !== v));
										}}
										placeholder={users.isPending ? h.dangTai : h.chonNguoi}
										searchPlaceholder={h.timNguoi}
										empty={h.khongAi}
									/>
								</Field>
								<Field>
									<FieldLabel htmlFor={`${ma}-tham-gia`}>
										{h.thamGia}
									</FieldLabel>
									<Combobox
										id={`${ma}-tham-gia`}
										translate="no"
										disabled={users.isPending}
										options={luaChonThamGia}
										value=""
										onValueChange={(v) => setThamGia((ds) => [...ds, v])}
										placeholder={h.themNguoi}
										searchPlaceholder={h.timNguoi}
										empty={h.khongAi}
									/>
									{thamGia.length > 0 ? (
										<div className="flex flex-wrap gap-1" data-nguoi-tham-gia>
											{thamGia.map((id) => (
												<TokenFieldItem key={id}>
													<span className="truncate px-1" translate="no">
														{tenNguoi(id)}
													</span>
													<TokenFieldAction
														aria-label={dien(h.boNguoi, { ten: tenNguoi(id) })}
														onClick={() =>
															setThamGia((ds) => ds.filter((x) => x !== id))
														}
													>
														<Icon icon={Close} />
													</TokenFieldAction>
												</TokenFieldItem>
											))}
										</div>
									) : null}
								</Field>
								{yeuCau.loai === "tao" ? (
									<OMucHienThi
										ma={ma}
										hienThi={hienThi}
										onDoi={setHienThi}
										g={g}
									/>
								) : null}
								<Field>
									<FieldLabel htmlFor={`${ma}-vi-sao`}>{h.viSao}</FieldLabel>
									<Textarea
										id={`${ma}-vi-sao`}
										value={viSao}
										maxLength={500}
										translate="no"
										aria-describedby={`${ma}-vi-sao-mo-ta`}
										onChange={(e) => setViSao(e.target.value)}
									/>
									<FieldDescription id={`${ma}-vi-sao-mo-ta`}>
										{h.viSaoMoTa}
									</FieldDescription>
								</Field>
								{ten.trim() !== "" && !tenHopLe ? (
									<FieldError>{h.tenQuaNgan}</FieldError>
								) : null}
								{loi ? <FieldError>{loi}</FieldError> : null}
							</FieldGroup>
						</form>
					)}
				</SheetBody>
				<SheetFooter>
					<SheetClose asChild>
						<Button variant="outline" disabled={dangLuu}>
							{h.huy}
						</Button>
					</SheetClose>
					{tuMau.dangMo ? (
						<NutTaoTuMau tuMau={tuMau} id={`${ma}-tu-mau`} dangLuu={dangLuu} />
					) : (
						<Button
							type="submit"
							form={`${ma}-form`}
							disabled={dangLuu || !sanSang || !daSua}
							data-nut="gui-muc-tieu"
						>
							{dangLuu ? <Spinner /> : null}
							{yeuCau.loai === "sua" ? h.luu : h.taoMucTieu}
						</Button>
					)}
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
