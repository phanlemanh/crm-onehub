"use client";

import Template from "@carbon/icons-react/es/Template";
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
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import {
	docSoOkr,
	kiemSoTheoKieu,
	type LoiSoTheoKieu,
} from "@crm/validation/okr-kr";
import type { CapMau, MauKr } from "@crm/validation/okr-mau";
import type { CapMucTieu, DonViMucTieu } from "@crm/validation/okr-muc-tieu";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { dien, dienNode } from "@/components/crm/record-sheet/plan-copy";
import { okrMessages } from "@/lib/messages/okr";
import { okrCanhKrMessages } from "@/lib/messages/okr-canh-kr";
import type { MauChon } from "@/lib/okr-mau";
import { useTRPC } from "@/lib/trpc/client";
import { hienSo } from "./hop-thoai-kr";
import type { DonChonOkr } from "./okr-search-params";

export type LocMau = { cap: CapMau; donViId: string };
export type SoTuMau = { startValue: number | null; targetValue: number | null };

type NguoiPhongBan = { id: string; primaryDepartmentId: string | null };
type CheDo =
	| { loai: "tay" }
	| { loai: "chon" }
	| { loai: "mau"; mauId: string };
type KetQuaTao = { id: string; canhBao: string | null };

export type TuMau = {
	mauHop: MauChon[];
	mauChon: MauChon | null;
	dangMo: boolean;
	dangTao: boolean;
	moChon: () => void;
	vietTay: () => void;
	chon: (mauId: string) => void;
	gui: (so: SoTuMau[]) => void;
};

export function locMau(
	cap: CapMucTieu,
	don: DonChonOkr,
	nguoi: string,
	nguoiPhongBan: readonly NguoiPhongBan[],
): LocMau | null {
	switch (cap) {
		case "onehub":
			return null;
		case "bo-phan":
			return don.loai === "bp" ? { cap, donViId: don.id } : null;
		case "phong-ban":
			return don.loai === "pb" ? { cap, donViId: don.id } : null;
		case "ca-nhan": {
			const pb =
				nguoiPhongBan.find((p) => p.id === nguoi)?.primaryDepartmentId ?? null;
			return pb === null ? null : { cap, donViId: pb };
		}
	}
}

export function useTuMau({
	tao,
	batDau,
	cap,
	chu,
	donVi,
	baoLoi,
	xong,
}: {
	tao: { cycleId: string; don: DonChonOkr } | null;
	batDau?: "tay" | "mau";
	cap: CapMucTieu;
	chu: string;
	donVi: DonViMucTieu | null;
	baoLoi: (loi: string | null) => void;
	xong: (kq: KetQuaTao) => void;
}): TuMau {
	const trpc = useTRPC();
	const [cheDo, setCheDo] = useState<CheDo>({
		loai: batDau === "mau" ? "chon" : "tay",
	});
	const cay = useQuery({
		...trpc.org.tree.queryOptions(),
		enabled: tao !== null && cap === "ca-nhan",
	});
	const nguoi = tao?.don.loai === "nguoi" ? tao.don.id : chu;
	const loc =
		tao === null ? null : locMau(cap, tao.don, nguoi, cay.data?.people ?? []);
	const ds = useQuery({
		...trpc.okr.mau.queryOptions(loc ?? {}),
		enabled: loc !== null,
	});
	const taoTuMau = useMutation(
		trpc.okr.taoTuMau.mutationOptions({
			onSuccess: xong,
			onError: (e) => baoLoi(e.message),
		}),
	);
	const mauHop = loc === null ? [] : (ds.data?.mau ?? []);
	const mauChon =
		cheDo.loai === "mau"
			? (mauHop.find((x) => x.id === cheDo.mauId) ?? null)
			: null;
	const doiCheDo = (moi: CheDo) => {
		baoLoi(null);
		setCheDo(moi);
	};
	return {
		mauHop,
		mauChon,
		dangMo: cheDo.loai === "chon" || mauChon !== null,
		dangTao: taoTuMau.isPending,
		moChon: () => doiCheDo({ loai: "chon" }),
		vietTay: () => doiCheDo({ loai: "tay" }),
		chon: (mauId) => doiCheDo({ loai: "mau", mauId }),
		gui: (so) => {
			if (taoTuMau.isPending || !mauChon || !donVi || !tao) return;
			baoLoi(null);
			taoTuMau.mutate({
				mauId: mauChon.id,
				cycleId: tao.cycleId,
				unit: donVi,
				ownerUserId: chu,
				krs: so.map((k) => ({ ...k, ownerUserId: chu })),
			});
		},
	};
}

type ONhap = { khoa: number; kr: MauKr; khoi: string; dich: string };
type LoiKr = "thieu" | "sai" | LoiSoTheoKieu;

const trong = (chu: string) => chu.trim() === "";
const soHong = (chu: string) => !trong(chu) && docSoOkr(chu) === null;

function loiCua(o: ONhap): LoiKr | null {
	if (o.kr.kind === "moc") return null;
	if (soHong(o.khoi) || soHong(o.dich)) return "sai";
	const khoi = docSoOkr(o.khoi);
	const dich = docSoOkr(o.dich);
	if (khoi === null || dich === null) return "thieu";
	return kiemSoTheoKieu(o.kr.kind, khoi, dich);
}

function soCua(o: ONhap): SoTuMau {
	if (o.kr.kind === "moc") return { startValue: null, targetValue: null };
	return { startValue: docSoOkr(o.khoi), targetValue: docSoOkr(o.dich) };
}

export function NutTaoTuMau({
	tuMau,
	id,
	dangLuu,
}: {
	tuMau: TuMau;
	id: string;
	dangLuu: boolean;
}) {
	const t = okrCanhKrMessages(useLocale()).mau.tuMau;
	if (!tuMau.mauChon) return null;
	return (
		<Button type="submit" form={id} disabled={dangLuu} data-nut="tao-tu-mau">
			{dangLuu ? <Spinner /> : null}
			{t.tao}
		</Button>
	);
}

export function KhungTuMau({
	tuMau,
	id,
	loi,
	dangLuu,
}: {
	tuMau: TuMau;
	id: string;
	loi: string | null;
	dangLuu: boolean;
}) {
	const t = okrCanhKrMessages(useLocale()).mau.tuMau;
	const mau = tuMau.mauChon;
	return (
		<div className="flex flex-col gap-4">
			{mau ? (
				<FormTuMau key={mau.id} id={id} mau={mau} loi={loi} onTao={tuMau.gui} />
			) : (
				<ChonMau mau={tuMau.mauHop} onChon={tuMau.chon} />
			)}
			{mau ? (
				<div>
					<Button
						type="button"
						size="sm"
						variant="ghost"
						disabled={dangLuu}
						data-nut="chon-mau-khac"
						onClick={tuMau.moChon}
					>
						{t.chonKhac}
					</Button>
				</div>
			) : null}
		</div>
	);
}

function ChonMau({
	mau,
	onChon,
}: {
	mau: MauChon[];
	onChon: (id: string) => void;
}) {
	const t = okrCanhKrMessages(useLocale()).mau;
	return (
		<FieldSet data-trang-thai="ST-datmt-chon-mau">
			<FieldLegend variant="label">{t.tuMau.chonTieuDe}</FieldLegend>
			<ItemGroup>
				{mau.map((x) => (
					<Item asChild key={x.id} size="sm" variant="outline">
						<button
							type="button"
							data-chon-mau={x.id}
							onClick={() => onChon(x.id)}
						>
							<ItemMedia variant="icon">
								<Icon icon={Template} />
							</ItemMedia>
							<ItemContent>
								<ItemTitle>
									<span translate="no">{x.ten}</span>
								</ItemTitle>
								<ItemDescription>
									<span translate="no">{x.noiDung.cauMucTieu}</span>
									{" · "}
									{dien(t.dong.soKr, { n: x.soKr })}
								</ItemDescription>
							</ItemContent>
						</button>
					</Item>
				))}
			</ItemGroup>
		</FieldSet>
	);
}

function FormTuMau({
	id,
	mau,
	loi,
	onTao,
}: {
	id: string;
	mau: MauChon;
	loi: string | null;
	onTao: (so: SoTuMau[]) => void;
}) {
	const locale = useLocale();
	const t = okrCanhKrMessages(locale).mau.tuMau;
	const o = okrMessages(locale);
	const [nhap, setNhap] = useState<ONhap[]>(() =>
		mau.noiDung.krs.map((kr, khoa) => ({ khoa, kr, khoi: "", dich: "" })),
	);
	const [daBam, setDaBam] = useState(false);

	const doi = (khoa: number, moi: Partial<Pick<ONhap, "khoi" | "dich">>) =>
		setNhap((cu) => cu.map((x) => (x.khoa === khoa ? { ...x, ...moi } : x)));

	return (
		<form
			id={id}
			data-form-tu-mau={mau.id}
			data-trang-thai="ST-datmt-tu-mau"
			onSubmit={(e) => {
				e.preventDefault();
				setDaBam(true);
				if (nhap.some((x) => loiCua(x) !== null)) return;
				onTao(nhap.map(soCua));
			}}
		>
			<FieldGroup>
				<FieldDescription>
					{dienNode(t.moTa, { ten: <span translate="no">{mau.ten}</span> })}
				</FieldDescription>
				<Field data-disabled>
					<FieldLabel htmlFor={`${id}-cau`}>{t.mucTieu}</FieldLabel>
					<Input
						id={`${id}-cau`}
						value={mau.noiDung.cauMucTieu}
						disabled
						translate="no"
						data-o-cau-tu-mau
					/>
				</Field>
				<Field data-disabled>
					<FieldLabel htmlFor={`${id}-loai`}>{t.loai}</FieldLabel>
					<Input id={`${id}-loai`} value={o.loai[mau.noiDung.loai]} disabled />
				</Field>
				<ItemGroup>
					{nhap.map((x) => (
						<DongKrTuMau
							key={x.khoa}
							ma={`${id}-kr-${x.khoa}`}
							nhap={x}
							daBam={daBam}
							onDoi={(moi) => doi(x.khoa, moi)}
						/>
					))}
				</ItemGroup>
				{loi ? <FieldError data-loi-tu-mau>{loi}</FieldError> : null}
			</FieldGroup>
		</form>
	);
}

function DongKrTuMau({
	ma,
	nhap,
	daBam,
	onDoi,
}: {
	ma: string;
	nhap: ONhap;
	daBam: boolean;
	onDoi: (moi: Partial<Pick<ONhap, "khoi" | "dich">>) => void;
}) {
	const locale = useLocale();
	const t = okrCanhKrMessages(locale).mau.tuMau;
	const o = okrMessages(locale);
	const h = o.hopThoai;
	const { kr } = nhap;
	const loi = loiCua(nhap);
	const hien = loi === "thieu" && !daBam ? null : loi;
	const hongKhoi =
		(hien === "thieu" && trong(nhap.khoi)) ||
		(hien === "sai" && soHong(nhap.khoi));
	const hongDich =
		(hien === "thieu" && trong(nhap.dich)) ||
		(hien === "sai" && soHong(nhap.dich)) ||
		(hien !== null && hien !== "thieu" && hien !== "sai");
	const goiY = (so: number | null) =>
		so === null ? undefined : hienSo(so, locale);
	return (
		<Item
			size="sm"
			variant="outline"
			role="listitem"
			data-kr-tu-mau={nhap.khoa}
		>
			<ItemContent>
				<ItemTitle>
					<span translate="no">{kr.title}</span>
				</ItemTitle>
				<ItemDescription>
					{o.kieu[kr.kind]}
					{kr.unit ? (
						<>
							{" · "}
							<span translate="no">{kr.unit}</span>
						</>
					) : null}
				</ItemDescription>
				{kr.kind === "moc" ? (
					<FieldDescription>{t.mocKhongSo}</FieldDescription>
				) : (
					<div className="grid items-start gap-3 sm:grid-cols-2">
						<Field data-invalid={hongKhoi || undefined}>
							<FieldLabel htmlFor={`${ma}-khoi`}>{h.khoiDiem}</FieldLabel>
							<Input
								id={`${ma}-khoi`}
								value={nhap.khoi}
								inputMode="decimal"
								autoComplete="off"
								placeholder={goiY(kr.startValue)}
								aria-invalid={hongKhoi || undefined}
								data-o-khoi-diem
								onChange={(e) => onDoi({ khoi: e.target.value })}
							/>
						</Field>
						<Field data-invalid={hongDich || undefined}>
							<FieldLabel htmlFor={`${ma}-dich`}>{h.dich}</FieldLabel>
							<Input
								id={`${ma}-dich`}
								value={nhap.dich}
								inputMode="decimal"
								autoComplete="off"
								placeholder={goiY(kr.targetValue)}
								aria-invalid={hongDich || undefined}
								data-o-dich
								onChange={(e) => onDoi({ dich: e.target.value })}
							/>
						</Field>
					</div>
				)}
				{hien === null ? null : (
					<FieldError data-loi-kr-tu-mau={hien}>
						{hien === "thieu"
							? t.thieuSo
							: hien === "sai"
								? h.soSai
								: h.soTheoKieu[hien]}
					</FieldError>
				)}
			</ItemContent>
		</Item>
	);
}
