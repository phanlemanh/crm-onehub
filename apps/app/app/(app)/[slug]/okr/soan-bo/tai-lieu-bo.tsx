"use client";

import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import type { ComboboxOption } from "@crm/ui/components/combobox";
import { FieldDescription } from "@crm/ui/components/field";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Separator } from "@crm/ui/components/separator";
import { Textarea } from "@crm/ui/components/textarea";
import type { Locale } from "@crm/ui/lib/locale";
import type { KrCham, MucTieuCham } from "@crm/validation/okr-cham-bo";
import { docSoOkr } from "@crm/validation/okr-kr";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useEffectEvent, useRef } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { okrSoanBoMessages } from "@/lib/messages/okr-soan-bo";
import { useTRPC } from "@/lib/trpc/client";
import { ChamTrangThai } from "../tien-do-kr";
import {
	type BanNhap,
	daBoDi,
	datFocus,
	type KrNhap,
	krCua,
	lanFocus,
	type MtNhap,
	mucTieuMoiHien,
	suaKr,
	suaKrCo,
	suaMucTieu,
	suaTenCo,
	suaViSao,
	suaViSaoCo,
	themKr,
	themMucTieu,
} from "./ban-nhap";
import { SOAN_BO } from "./cau-hinh";
import {
	DauTheoKara,
	DongKrDoc,
	DongKrMoi,
	giaKrCo,
	laEnterGhi,
	TrangThaiDong,
} from "./dong-kr";
import {
	DongMucTieuMoi,
	MenuMucTieu,
	NutThemKr,
	OViSao,
} from "./dong-muc-tieu";
import { type DongKrNhap, dongKrTrong, type suyKieuKr } from "./du-lieu-bo";
import { NhoKaraSoan } from "./nho-kara-soan";
import { usePhuThuocSoan } from "./phu-thuoc";
import { docTheoKara, type TheoKara } from "./theo-kara";
import type { BoSoan, MucTieuSoan } from "./use-bo-soan";
import { useCuonToiMucTieu } from "./use-cuon-toi-mt";
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
	theoKara: TheoKara;
	cauNoi: boolean;
};

type KrSoan = MucTieuSoan["keyResults"][number];

function krTheoKara(kr: KrSoan, soan: SoanTaiLieu | null): KrSoan {
	const chu = soan ? docTheoKara(soan.theoKara, kr.id, "kr.title") : null;
	return chu ? { ...kr, title: chu.giaTri } : kr;
}

function mtTheoKara(mt: MucTieuSoan, soan: SoanTaiLieu | null): MucTieuSoan {
	const chu = soan ? docTheoKara(soan.theoKara, mt.id, "title") : null;
	return chu ? { ...mt, title: chu.giaTri } : mt;
}

function dauKr(kr: KrSoan, soan: SoanTaiLieu | null): boolean {
	if (soan === null || soan.banNhap.krCo[kr.id]?.ten !== undefined)
		return false;
	return docTheoKara(soan.theoKara, kr.id, "kr.title")?.dau === true;
}

function dauMt(mt: MucTieuSoan, soan: SoanTaiLieu | null): boolean {
	if (soan === null || soan.banNhap.tenCo[mt.id] !== undefined) return false;
	return docTheoKara(soan.theoKara, mt.id, "title")?.dau === true;
}

type BoiCanh = SoanTaiLieu & {
	bo: BoXong;
	boTrong: boolean;
	ghi: GhiBanNhap;
	nguoi: ComboboxOption[];
	nguoiMacDinh: string;
	moiPhim: boolean;
	xoaDuoc: (id: string) => boolean;
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
		luuDong.danhDauGo(kr.khoa, !dongKrTrong({ ...kr, ...phan }));
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
					onXoa={() => ghi.xoaKr(kr.khoa, luuDong.id(kr.khoa))}
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
				menu={
					id !== null && bc.xoaDuoc(id) ? (
						<MenuMucTieu
							ten={mt.ten}
							onXoa={() =>
								ghi.xoaMucTieu(
									mt.khoa,
									id,
									krCua(bc.banNhap, mt.khoa).map((kr) => kr.khoa),
								)
							}
						/>
					) : null
				}
				onDoi={(ten) => {
					bc.datBanNhap((bn) => suaMucTieu(bn, mt.khoa, ten));
					luuDong.danhDauGo(mt.khoa, ten.trim() !== "");
					if (bc.moiPhim) ghi.luuMucTieu({ ...mt, ten });
				}}
				onEnter={() => {
					ghi.luuMucTieu(mt);
					if (mt.ten.trim() !== "") moKrMoi(bc, mt.khoa);
				}}
				onRoi={() => ghi.luuMucTieu(mt)}
			/>
			<OViSao
				value={mt.viSao}
				disabled={false}
				onDoi={(viSao) => bc.datBanNhap((bn) => suaViSao(bn, mt.khoa, viSao))}
				onRoi={() => ghi.luuMucTieu(mt)}
			/>
			<DanhSachKrMoi mt={mtCuaKr} dau={0} bc={bc} />
			<NutThemKr onThem={() => moKrMoi(bc, mt.khoa)} />
		</section>
	);
}

type KhoaMucTieu = { ten: boolean; so: boolean };

function khoaCua(
	mt: MucTieuSoan,
	chiXem: boolean,
	khoaSoCongBo: boolean,
): KhoaMucTieu {
	const ten = chiXem || (mt.status !== "nhap" && mt.status !== "cong-bo");
	return { ten, so: ten || (mt.status === "cong-bo" && khoaSoCongBo) };
}

function CauKhoa({ mt, khoa }: { mt: MucTieuSoan; khoa: KhoaMucTieu }) {
	const m = okrSoanBoMessages(useLocale()).taiLieu;
	if (mt.status === "cho-duyet")
		return (
			<FieldDescription data-cau-khoa="cho-duyet">
				{m.khoaChoDuyet}
			</FieldDescription>
		);
	if (mt.status === "cong-bo" && khoa.so)
		return <FieldDescription data-cau-khoa="so">{m.khoaSo}</FieldDescription>;
	return null;
}

function krCoHien(mt: MucTieuSoan, bc: SoanTaiLieu | null) {
	return bc
		? mt.keyResults
				.filter(
					(kr) => !bc.luuDong.daLuu.has(kr.id) && !daBoDi(bc.banNhap, kr.id),
				)
				.map((kr) => krTheoKara(kr, bc))
		: mt.keyResults;
}

function mucTieuCoHien(mucTieu: MucTieuSoan[], bc: SoanTaiLieu | null) {
	return bc
		? mucTieu.filter(
				(mt) => !bc.luuDong.daLuu.has(mt.id) && !daBoDi(bc.banNhap, mt.id),
			)
		: mucTieu;
}

function DanhSachKrCo({
	mt,
	khoa,
	locale,
	bc,
}: {
	mt: MucTieuSoan;
	khoa: KhoaMucTieu;
	locale: Locale;
	bc: BoiCanh | null;
}) {
	const krHien = krCoHien(mt, bc);
	if (krHien.length === 0) return null;
	return (
		<ol className="flex flex-col gap-2">
			{krHien.map((kr, i) => {
				const gia = giaKrCo(kr, bc?.banNhap.krCo[kr.id], locale);
				return (
					<DongKrDoc
						key={kr.id}
						kr={kr}
						thuTu={i + 1}
						gia={gia}
						nguoi={bc?.nguoi ?? []}
						khoaTen={khoa.ten}
						khoaSo={khoa.so}
						trangThai={bc ? bc.luuDong.trangThai(kr.id) : null}
						xoaDuoc={bc !== null && mt.status === "nhap"}
						theoKara={dauKr(kr, bc)}
						onDoi={(phan) => {
							if (bc === null) return;
							bc.datBanNhap((bn) => suaKrCo(bn, kr.id, phan));
							bc.luuDong.danhDauGo(kr.id, true);
							if (bc.moiPhim || phan.nguoi !== undefined)
								bc.ghi.luuKrCo(mt, kr, { ...gia, ...phan }, khoa.so);
						}}
						onRoi={() => {
							if (bc !== null && !khoa.ten)
								bc.ghi.luuKrCo(mt, kr, gia, khoa.so);
						}}
						onXoa={() => bc?.ghi.xoaKr(kr.id, kr.id)}
					/>
				);
			})}
		</ol>
	);
}

function KhoiMucTieuDoc({
	mt: mtGoc,
	chiXem,
	locale,
	bc,
}: {
	mt: MucTieuSoan;
	chiXem: boolean;
	locale: Locale;
	bc: BoiCanh | null;
}) {
	const mt = mtTheoKara(mtGoc, bc);
	const m = okrMessages(locale);
	const phuThuoc = usePhuThuocSoan();
	const khoa = khoaCua(mt, chiXem, phuThuoc.khoaSoCongBo);
	const themDuoc = bc !== null && mt.status === "nhap";
	const ten = bc?.banNhap.tenCo[mt.id] ?? mt.title;
	const viSao = bc?.banNhap.viSaoCo[mt.id] ?? mt.whyNow;
	const xoaDuoc = bc !== null && mt.status === "nhap" && mt.quyen?.xoa === true;
	const luuTen = (chu: string) => {
		if (bc !== null && !khoa.ten) bc.ghi.luuTenCo(mt, chu);
	};
	return (
		<section
			className="flex flex-col gap-3"
			data-dong-mt={mt.id}
			data-luu={bc ? bc.luuDong.trangThai(mt.id).loai : undefined}
			aria-label={mt.title}
		>
			<div className="flex flex-wrap items-center gap-2">
				<ChamTrangThai status={mt.status} />
				<Badge variant="outline">{m.loai[mt.kind]}</Badge>
				{bc ? <CauKhoa mt={mt} khoa={khoa} /> : null}
				{xoaDuoc && bc ? (
					<div className="ml-auto">
						<MenuMucTieu
							ten={ten}
							onXoa={() =>
								bc.ghi.xoaMucTieu(mt.id, mt.id, [
									...mt.keyResults.map((kr) => kr.id),
									...krCua(bc.banNhap, mt.id).map((kr) => kr.khoa),
								])
							}
						/>
					</div>
				) : null}
			</div>
			<Textarea
				variant="tai-lieu"
				size="tieu-de"
				rows={1}
				aria-label={m.hopThoai.tenMucTieu}
				value={ten}
				disabled={khoa.ten}
				translate="no"
				data-o-nhap="ten"
				onChange={(e) => {
					if (bc === null || khoa.ten) return;
					const chu = e.target.value;
					bc.datBanNhap((bn) => suaTenCo(bn, mt.id, chu));
					bc.luuDong.danhDauGo(mt.id, true);
					if (bc.moiPhim) luuTen(chu);
				}}
				onBlur={() => luuTen(ten)}
				onKeyDown={(e) => {
					if (bc === null || !laEnterGhi(e)) return;
					e.preventDefault();
					luuTen(ten);
					if (themDuoc) moKrMoi(bc, mt.id);
				}}
			/>
			{dauMt(mtGoc, bc) ? <DauTheoKara /> : null}
			{bc ? <TrangThaiDong trangThai={bc.luuDong.trangThai(mt.id)} /> : null}
			<OViSao
				value={viSao}
				disabled={khoa.ten}
				onDoi={(chu) => {
					if (bc === null || khoa.ten) return;
					bc.datBanNhap((bn) => suaViSaoCo(bn, mt.id, chu));
				}}
				onRoi={() => {
					if (bc !== null && !khoa.ten) bc.ghi.luuViSaoCo(mt, viSao);
				}}
			/>
			<DanhSachKrCo mt={mt} khoa={khoa} locale={locale} bc={bc} />
			{bc !== null && themDuoc ? (
				<>
					<DanhSachKrMoi
						mt={{ khoa: mt.id, idCoSan: mt.id }}
						dau={krCoHien(mt, bc).length}
						bc={bc}
					/>
					<NutThemKr onThem={() => moKrMoi(bc, mt.id)} />
				</>
			) : null}
		</section>
	);
}

function useBoiCanh(bo: BoXong, soan: SoanTaiLieu): BoiCanh {
	const trpc = useTRPC();
	const phuThuoc = usePhuThuocSoan();
	const users = useQuery(trpc.users.list.queryOptions());
	const ghi = useGhiBanNhap(bo, soan.luuDong, soan.datBanNhap);
	return {
		...soan,
		bo,
		boTrong: bo.mucTieu.length === 0,
		ghi,
		xoaDuoc: (id) => bo.mucTieu.find((mt) => mt.id === id)?.quyen?.xoa ?? true,
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
	const coSan = mucTieuCoHien(mucTieu, bc);
	const moi = bc ? mucTieuMoiHien(bc.banNhap, mucTieu.length > 0) : [];
	const goc = useRef<HTMLDivElement>(null);
	useCuonToiMucTieu(goc);
	return (
		<div className="flex flex-col gap-6" data-tai-lieu-bo="" ref={goc}>
			{mucTieu.length === 0 && !chiXem ? (
				<FieldDescription>{m.taiLieu.boTrong}</FieldDescription>
			) : null}
			{coSan.map((mt, i) => (
				<div key={mt.id} className="flex flex-col gap-6">
					{i > 0 ? <Separator /> : null}
					<KhoiMucTieuDoc mt={mt} chiXem={chiXem} locale={locale} bc={bc} />
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
					<NhoKaraSoan
						bo={bc.bo}
						cauNoi={bc.cauNoi}
						hien={bc.boTrong}
						them={
							<Button
								variant="ghost"
								size="sm"
								type="button"
								data-nut="them-muc-tieu-bo"
								onClick={() => bc.datBanNhap(themMucTieu)}
							>
								{m.taiLieu.themMucTieu}
							</Button>
						}
					/>
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

export type ViTriCham = { mt: string; kr: readonly string[] };

export type NoiDungCham = { bo: MucTieuCham[]; viTri: ViTriCham[] };

type KrDem = { cham: KrCham; dong: string };

const soCua = (chu: string): number | null =>
	chu.trim() === "" ? null : docSoOkr(chu);

function krMoiCham(
	kr: KrNhap,
	nguoiMacDinh: string,
	suyKieu: typeof suyKieuKr,
): KrDem {
	const khoi = soCua(kr.khoi);
	const dich = soCua(kr.dich);
	return {
		cham: {
			title: kr.ten,
			kind: kr.kieu ?? suyKieu(khoi, dich) ?? SOAN_BO.kieuKhiChuaRo,
			startValue: khoi,
			targetValue: dich,
			ownerUserId: kr.nguoi ?? nguoiMacDinh,
		},
		dong: `[data-dong-kr-moi="${kr.khoa}"]`,
	};
}

const krMoiCua = (
	soan: SoanTaiLieu,
	khoaMt: string,
	nguoiMacDinh: string,
	suyKieu: typeof suyKieuKr,
): KrDem[] =>
	krCua(soan.banNhap, khoaMt)
		.filter((kr) => !dongKrTrong(kr))
		.map((kr) => krMoiCham(kr, nguoiMacDinh, suyKieu));

function krCoCham(kr: MucTieuSoan["keyResults"][number], soan: SoanTaiLieu) {
	const sua = soan.banNhap.krCo[kr.id];
	return {
		cham: {
			title: sua?.ten ?? kr.title,
			kind: kr.kind,
			startValue: sua?.khoi === undefined ? kr.startValue : soCua(sua.khoi),
			targetValue: sua?.dich === undefined ? kr.targetValue : soCua(sua.dich),
			ownerUserId: kr.owner.id,
		},
		dong: `[data-dong-kr="${kr.id}"]`,
	};
}

type DongCham = { cham: MucTieuCham; viTri: ViTriCham };

function dongCham(
	title: string,
	whyNow: string,
	mt: string,
	krs: KrDem[],
): DongCham {
	return {
		cham: { title, whyNow, keyResults: krs.map((k) => k.cham) },
		viTri: { mt, kr: krs.map((k) => k.dong) },
	};
}

export function noiDungCham(
	bo: BoXong,
	soan: SoanTaiLieu,
	suyKieu: typeof suyKieuKr,
): NoiDungCham {
	const coSan = mucTieuCoHien(bo.mucTieu, soan).map((mt) =>
		dongCham(
			soan.banNhap.tenCo[mt.id] ?? mtTheoKara(mt, soan).title,
			soan.banNhap.viSaoCo[mt.id] ?? mt.whyNow,
			`[data-dong-mt="${mt.id}"]`,
			[
				...krCoHien(mt, soan).map((kr) => krCoCham(kr, soan)),
				...(mt.status === "nhap"
					? krMoiCua(soan, mt.id, bo.nguoiMacDinh, suyKieu)
					: []),
			],
		),
	);
	const moi = mucTieuMoiHien(soan.banNhap, bo.mucTieu.length > 0)
		.map((mt) =>
			dongCham(
				mt.ten,
				mt.viSao,
				`[data-dong-moi="${mt.khoa}"]`,
				krMoiCua(soan, mt.khoa, bo.nguoiMacDinh, suyKieu),
			),
		)
		.filter((d) => d.cham.title.trim() !== "" || d.cham.keyResults.length > 0);
	const tat = [...coSan, ...moi];
	return { bo: tat.map((d) => d.cham), viTri: tat.map((d) => d.viTri) };
}

export type QuyenCongBo = Pick<
	NonNullable<MucTieuSoan["quyen"]>,
	"congBo" | "guiDuyet"
>;

export type MucCongBo = {
	id: string;
	ten: string;
	status: MucTieuSoan["status"];
	soKrDaLuu: number;
	quyen: QuyenCongBo | null;
};

const idKrMoiDaLuu = (soan: SoanTaiLieu, khoaMt: string): string[] =>
	krCua(soan.banNhap, khoaMt).flatMap((kr) => {
		const id = soan.luuDong.id(kr.khoa);
		return id === null ? [] : [id];
	});

export function mucCongBoCua(bo: BoXong, soan: SoanTaiLieu): MucCongBo[] {
	const moi = mucTieuMoiHien(soan.banNhap, bo.mucTieu.length > 0).flatMap(
		(mt) => {
			const id = soan.luuDong.id(mt.khoa);
			return id === null ? [] : [{ id, mt }];
		},
	);
	const tenMoi = new Map(moi.map(({ id, mt }) => [id, mt.ten]));
	const coSanId = new Set(bo.mucTieu.map((mt) => mt.id));
	const coSan = bo.mucTieu
		.filter((mt) => !daBoDi(soan.banNhap, mt.id))
		.map((mt) => ({
			id: mt.id,
			ten:
				tenMoi.get(mt.id) ??
				soan.banNhap.tenCo[mt.id] ??
				mtTheoKara(mt, soan).title,
			status: mt.status,
			soKrDaLuu: new Set([
				...mt.keyResults
					.filter((kr) => !daBoDi(soan.banNhap, kr.id))
					.map((kr) => kr.id),
				...idKrMoiDaLuu(soan, mt.id),
			]).size,
			quyen: mt.quyen,
		}));
	const chiMoi = moi
		.filter(({ id }) => !coSanId.has(id))
		.map(({ id, mt }) => ({
			id,
			ten: mt.ten,
			status: "nhap" as const,
			soKrDaLuu: idKrMoiDaLuu(soan, mt.khoa).length,
			quyen: null,
		}));
	return [...coSan, ...chiMoi];
}
