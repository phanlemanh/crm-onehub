"use client";

import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import type { ComboboxOption } from "@crm/ui/components/combobox";
import { FieldDescription } from "@crm/ui/components/field";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Separator } from "@crm/ui/components/separator";
import { Textarea } from "@crm/ui/components/textarea";
import type { Locale } from "@crm/ui/lib/locale";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useEffectEvent } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { okrSoanBoMessages } from "@/lib/messages/okr-soan-bo";
import { useTRPC } from "@/lib/trpc/client";
import { ChamTrangThai } from "../tien-do-kr";
import {
	type BanNhap,
	datFocus,
	type KrNhap,
	krCua,
	lanFocus,
	type MtNhap,
	mucTieuMoiHien,
	suaKr,
	suaMucTieu,
	themKr,
	themMucTieu,
} from "./ban-nhap";
import { DongKrDoc, DongKrMoi, laEnterGhi } from "./dong-kr";
import { DongMucTieuMoi } from "./dong-muc-tieu";
import type { DongKrNhap } from "./du-lieu-bo";
import { usePhuThuocSoan } from "./phu-thuoc";
import type { BoSoan, MucTieuSoan } from "./use-bo-soan";
import {
	type GhiBanNhap,
	type MtCuaKr,
	useGhiBanNhap,
} from "./use-ghi-ban-nhap";
import type { LuuDong } from "./use-luu-dong";

type BoXong = Extract<BoSoan, { trang: "xong" }>;

export type SoanTaiLieu = {
	banNhap: BanNhap;
	datBanNhap: (doi: (bn: BanNhap) => BanNhap) => void;
	luuDong: LuuDong;
};

type BoiCanh = SoanTaiLieu & {
	ghi: GhiBanNhap;
	nguoi: ComboboxOption[];
	nguoiMacDinh: string;
	moiPhim: boolean;
};

function DanhSachKrMoi({
	mt,
	dau,
	bc,
}: {
	mt: MtCuaKr;
	dau: number;
	bc: BoiCanh;
}) {
	const { banNhap, datBanNhap, luuDong, ghi } = bc;
	const krs = krCua(banNhap, mt.khoa);
	if (krs.length === 0) return null;
	const doi = (kr: KrNhap, phan: Partial<DongKrNhap>) => {
		datBanNhap((bn) => suaKr(bn, mt.khoa, kr.khoa, phan));
		if (bc.moiPhim) ghi.luuKr(mt, { ...kr, ...phan });
	};
	const enter = (kr: KrNhap, i: number) => {
		ghi.luuKr(mt, kr);
		const sau = krs[i + 1];
		if (sau) datBanNhap((bn) => datFocus(bn, sau.khoa));
		else if (kr.ten.trim() !== "")
			datBanNhap((bn) => themKr(bn, mt.khoa, kr.khoa));
	};
	return (
		<ol className="flex flex-col gap-2">
			{krs.map((kr, i) => (
				<DongKrMoi
					key={kr.khoa}
					kr={kr}
					thuTu={dau + i + 1}
					lanFocus={lanFocus(banNhap, kr.khoa)}
					trangThai={luuDong.trangThai(kr.khoa)}
					idDaLuu={luuDong.id(kr.khoa)}
					nguoiMacDinh={bc.nguoiMacDinh}
					nguoi={bc.nguoi}
					onDoi={(phan) => doi(kr, phan)}
					onEnter={() => enter(kr, i)}
					onRoi={() => ghi.luuKr(mt, kr)}
				/>
			))}
		</ol>
	);
}

function moKrMoi(bc: BoiCanh, khoaMt: string): void {
	const cuoi = krCua(bc.banNhap, khoaMt).at(-1);
	if (cuoi && cuoi.ten.trim() === "")
		bc.datBanNhap((bn) => datFocus(bn, cuoi.khoa));
	else bc.datBanNhap((bn) => themKr(bn, khoaMt));
}

function KhoiMucTieuMoi({ mt, bc }: { mt: MtNhap; bc: BoiCanh }) {
	const { luuDong, ghi } = bc;
	const id = luuDong.id(mt.khoa);
	const mtCuaKr: MtCuaKr = { khoa: mt.khoa, idCoSan: null };
	const thuLaiKr = useEffectEvent(() => {
		for (const kr of krCua(bc.banNhap, mt.khoa)) {
			const t = luuDong.trangThai(kr.khoa);
			if (t.loai === "chua-luu" && t.ly === "muc-tieu-chua-luu")
				ghi.luuKr(mtCuaKr, kr);
		}
	});
	useEffect(() => {
		if (id !== null) thuLaiKr();
	}, [id]);
	return (
		<section
			className="flex flex-col gap-3"
			data-dong-moi={mt.khoa}
			data-dong-mt={id ?? undefined}
			data-luu={luuDong.trangThai(mt.khoa).loai}
			aria-label={mt.ten}
		>
			<DongMucTieuMoi
				ten={mt.ten}
				lanFocus={lanFocus(bc.banNhap, mt.khoa)}
				trangThai={luuDong.trangThai(mt.khoa)}
				onDoi={(ten) => {
					bc.datBanNhap((bn) => suaMucTieu(bn, mt.khoa, ten));
					if (bc.moiPhim) ghi.luuMucTieu({ ...mt, ten });
				}}
				onEnter={() => {
					ghi.luuMucTieu(mt);
					if (mt.ten.trim() !== "") moKrMoi(bc, mt.khoa);
				}}
				onRoi={() => ghi.luuMucTieu(mt)}
			/>
			<DanhSachKrMoi mt={mtCuaKr} dau={0} bc={bc} />
		</section>
	);
}

function KhoiMucTieuDoc({
	mt,
	khoa,
	locale,
	bc,
}: {
	mt: MucTieuSoan;
	khoa: boolean;
	locale: Locale;
	bc: BoiCanh | null;
}) {
	const m = okrMessages(locale);
	const themDuoc = bc !== null && mt.status === "nhap";
	const krHien = bc
		? mt.keyResults.filter((kr) => !bc.luuDong.daLuu.has(kr.id))
		: mt.keyResults;
	return (
		<section
			className="flex flex-col gap-3"
			data-dong-mt={mt.id}
			aria-label={mt.title}
		>
			<div className="flex flex-wrap items-center gap-2">
				<ChamTrangThai status={mt.status} />
				<Badge variant="outline">{m.loai[mt.kind]}</Badge>
			</div>
			<Textarea
				variant="tai-lieu"
				size="tieu-de"
				rows={1}
				aria-label={m.hopThoai.tenMucTieu}
				defaultValue={mt.title}
				disabled={khoa}
				translate="no"
				onKeyDown={(e) => {
					if (bc === null || !themDuoc || !laEnterGhi(e)) return;
					e.preventDefault();
					moKrMoi(bc, mt.id);
				}}
			/>
			{krHien.length > 0 ? (
				<ol className="flex flex-col gap-2">
					{krHien.map((kr) => (
						<DongKrDoc key={kr.id} kr={kr} khoa={khoa} locale={locale} />
					))}
				</ol>
			) : null}
			{bc !== null && themDuoc ? (
				<DanhSachKrMoi
					mt={{ khoa: mt.id, idCoSan: mt.id }}
					dau={krHien.length}
					bc={bc}
				/>
			) : null}
		</section>
	);
}

function useBoiCanh(bo: BoXong, soan: SoanTaiLieu): BoiCanh {
	const trpc = useTRPC();
	const phuThuoc = usePhuThuocSoan();
	const users = useQuery(trpc.users.list.queryOptions());
	const ghi = useGhiBanNhap(bo, soan.luuDong);
	return {
		...soan,
		ghi,
		nguoi: (users.data ?? []).map((u) => ({
			value: u.id,
			label: u.name,
			hint: u.email,
			keywords: [u.email],
		})),
		nguoiMacDinh: bo.nguoiMacDinh,
		moiPhim: phuThuoc.luuKhi === "moi-phim",
	};
}

function TaiLieu({
	mucTieu,
	chiXem,
	bc,
}: {
	mucTieu: MucTieuSoan[];
	chiXem: boolean;
	bc: BoiCanh | null;
}) {
	const locale = useLocale();
	const m = okrSoanBoMessages(locale);
	const coSan = bc
		? mucTieu.filter((mt) => !bc.luuDong.daLuu.has(mt.id))
		: mucTieu;
	const moi = bc ? mucTieuMoiHien(bc.banNhap, mucTieu.length > 0) : [];
	return (
		<div className="flex flex-col gap-6" data-tai-lieu-bo="">
			{mucTieu.length === 0 && !chiXem ? (
				<FieldDescription>{m.taiLieu.boTrong}</FieldDescription>
			) : null}
			{coSan.map((mt, i) => (
				<div key={mt.id} className="flex flex-col gap-6">
					{i > 0 ? <Separator /> : null}
					<KhoiMucTieuDoc mt={mt} khoa={chiXem} locale={locale} bc={bc} />
				</div>
			))}
			{bc
				? moi.map((mt, i) => (
						<div key={mt.khoa} className="flex flex-col gap-6">
							{i > 0 || coSan.length > 0 ? <Separator /> : null}
							<KhoiMucTieuMoi mt={mt} bc={bc} />
						</div>
					))
				: null}
			{bc ? (
				<>
					<Separator />
					<Button
						variant="ghost"
						size="sm"
						type="button"
						className="w-fit"
						data-nut="them-muc-tieu-bo"
						onClick={() => bc.datBanNhap(themMucTieu)}
					>
						{m.taiLieu.themMucTieu}
					</Button>
				</>
			) : null}
		</div>
	);
}

function TaiLieuSoan({ bo, soan }: { bo: BoXong; soan: SoanTaiLieu }) {
	const bc = useBoiCanh(bo, soan);
	return <TaiLieu mucTieu={bo.mucTieu} chiXem={false} bc={bc} />;
}

export function TaiLieuBo({
	bo,
	soan,
}: {
	bo: BoXong;
	soan: SoanTaiLieu | null;
}) {
	if (bo.quyen.loai === "chi-xem" || soan === null)
		return <TaiLieu mucTieu={bo.mucTieu} chiXem bc={null} />;
	return <TaiLieuSoan bo={bo} soan={soan} />;
}
