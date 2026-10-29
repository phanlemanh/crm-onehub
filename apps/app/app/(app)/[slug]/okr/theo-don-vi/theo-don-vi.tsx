"use client";

import { Button } from "@crm/ui/components/button";
import { useLocale } from "@crm/ui/components/locale-provider";
import type { PhaChuKy } from "@crm/validation/okr-chu-ky";
import { skipToken, useQuery } from "@tanstack/react-query";
import { parseAsBoolean, useQueryState, useQueryStates } from "nuqs";
import type { ReactNode } from "react";
import { okrSoanBoMessages } from "@/lib/messages/okr-soan-bo";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import { ChamDiem } from "../cham-diem";
import { useChuKy } from "../chon-chu-ky";
import { GOC, giaiDon } from "../don-dich";
import { type QuyenKhu, useQuyenKhu } from "../hanh-dong-khu";
import { HopThoaiNhapOkr } from "../hop-thoai-nhap";
import { HopTuan } from "../hop-tuan";
import { KhoiKrCuaToi } from "../khoi-kr-cua-toi";
import type { CayDuLieu } from "../kieu";
import type { LocOkrGiaTri } from "../loc-okr";
import { BoKhoaUrl, NganTaoMucTieu } from "../ngan-okr-url";
import {
	type CachXem,
	type DonChonOkr,
	khoaDon,
	locOkr,
	okrParsers,
} from "../okr-search-params";
import { useChuyenLinkCuSoan } from "../soan/chuyen-link-cu";
import { soanBoDuoc, useMoSoanBo } from "../soan-bo/mo-soan-bo";
import { useTenGoc } from "../ten-goc";
import {
	ChuaChuKy,
	DonKhongThay,
	Loi,
	Rong,
	RongBoPhan,
} from "../trang-thai-okr";
import { BangDonVi } from "./bang";
import { duongCha } from "./bang-don-vi";
import { ChanBang } from "./chan-bang";
import { giuKhiChiDoiLoc } from "./giu-bang";
import { KhungDangTaiDonVi } from "./hang-cong-cu";
import { HangSoBo, HangSoBoDangTai } from "./hang-so-bo";
import { NutDaBo } from "./nut-da-bo";
import { TheConBo } from "./the-con";
import { ViTriBo } from "./vi-tri-bo";
import { ViecCuaBo } from "./viec-cua-bo";

const PHA_CO_CHAM: readonly PhaChuKy[] = ["cham-diem", "da-dong"];

function HopNhapTheoUrl({
	cycleId,
	unit,
	tenDonVi,
	duoc,
}: {
	cycleId: string;
	unit: DonChonOkr;
	tenDonVi: string;
	duoc: boolean | undefined;
}) {
	const [mo, datMo] = useQueryState(
		SEARCH_PARAM.okr.nhap,
		parseAsBoolean.withDefault(false),
	);
	if (mo && duoc === false) return <BoKhoaUrl bo={() => void datMo(null)} />;
	if (!mo || !duoc) return null;
	return (
		<HopThoaiNhapOkr
			cycleId={cycleId}
			unit={unit}
			tenDonVi={tenDonVi}
			dong={() => void datMo(null)}
		/>
	);
}

function NutSoanBo({ q }: { q: Extract<QuyenKhu, { kieu: "xong" }> }) {
	const m = okrSoanBoMessages(useLocale());
	const soan = useMoSoanBo(q);
	return (
		<Button data-nut="soan-bo-okr" onClick={() => soan.mo()} variant="outline">
			{m.loiVao.nutRong}
		</Button>
	);
}

function viTriNguoi(cay: CayDuLieu, id: string) {
	const p = cay.people.find((x) => x.id === id);
	const pb = [
		...cay.divisions.flatMap((x) => x.departments),
		...cay.chuaXep,
	].find((x) => x.id === p?.primaryDepartmentId);
	return { phongBan: pb?.name ?? null, quanLy: p?.manager?.name ?? null };
}

export function TheoDonVi() {
	useChuyenLinkCuSoan();
	const trpc = useTRPC();
	const quyenKhu = useQuyenKhu("theo-don-vi");
	const [url, datUrl] = useQueryStates(okrParsers);
	const loc: LocOkrGiaTri = locOkr(url);
	const giaTriLoc = <T extends string>(v: T[]) => (v.length > 0 ? v : null);
	const doiLoc = (thay: Partial<LocOkrGiaTri>) =>
		void datUrl({
			[SEARCH_PARAM.okr.phuTrach]: giaTriLoc(thay.phuTrach ?? loc.phuTrach),
			[SEARCH_PARAM.okr.loai]: giaTriLoc(thay.loai ?? loc.loai),
			[SEARCH_PARAM.okr.trangThai]: giaTriLoc(thay.trangThai ?? loc.trangThai),
			[SEARCH_PARAM.okr.tuTin]: giaTriLoc(thay.tuTin ?? loc.tuTin),
			[SEARCH_PARAM.okr.gopY]: giaTriLoc(thay.gopY ?? loc.gopY),
		});
	const boLoc = () =>
		void datUrl({
			[SEARCH_PARAM.okr.phuTrach]: null,
			[SEARCH_PARAM.okr.loai]: null,
			[SEARCH_PARAM.okr.trangThai]: null,
			[SEARCH_PARAM.okr.tuTin]: null,
			[SEARCH_PARAM.okr.gopY]: null,
		});
	const don = url[SEARCH_PARAM.okr.don] ?? GOC;
	const { cycles, currentId } = useChuKy();
	const phaKy =
		cycles.data?.cycles.find((c) => c.id === currentId)?.phase ?? null;
	const coCham = phaKy !== null && PHA_CO_CHAM.includes(phaKy);
	const xinXem: CachXem = url[SEARCH_PARAM.okr.xem] ?? "danh-sach";
	const xem: CachXem = xinXem === "cham" && !coCham ? "danh-sach" : xinXem;
	const cay = useQuery(trpc.org.tree.queryOptions());
	const access = useQuery(trpc.okr.access.queryOptions());
	const tenGoc = useTenGoc();
	const dem = useQuery(
		trpc.okr.countByUnit.queryOptions(
			currentId === null ? skipToken : { cycleId: currentId },
		),
	);
	const byUnit = useQuery({
		...trpc.okr.danhSach.queryOptions(
			currentId === null ? skipToken : { cycleId: currentId, unit: don, loc },
		),
		placeholderData:
			currentId === null
				? undefined
				: giuKhiChiDoiLoc({ cycleId: currentId, don }),
	});

	const quanTri = access.data?.canManageProgram === true;
	const theCon = (
		<TheConBo
			coCham={coCham}
			don={don}
			ky={url[SEARCH_PARAM.okr.ky]}
			xem={xem}
		/>
	);
	const coThe = (noiDung: ReactNode) => (
		<div className="flex flex-col gap-6">
			<div className="flex flex-col gap-3 pb-1">
				<ViTriBo ky={url[SEARCH_PARAM.okr.ky]} tenBo={null} />
				{theCon}
			</div>
			{noiDung}
		</div>
	);
	const thuLai = () => {
		void cay.refetch();
		void cycles.refetch();
		void byUnit.refetch();
	};

	if (cycles.data?.cycles.length === 0 && !access.isPending)
		return <ChuaChuKy quanTri={quanTri} />;
	if (cycles.isPending || access.isPending || cay.isPending)
		return coThe(
			<>
				{xem === "danh-sach" ? <HangSoBoDangTai /> : null}
				<KhungDangTaiDonVi />
			</>,
		);
	if (cycles.isError || cay.isError) return coThe(<Loi thuLai={thuLai} />);
	if (currentId === null) return <ChuaChuKy quanTri={quanTri} />;

	const kyDangXem = cycles.data.cycles.find((c) => c.id === currentId);
	const tenKy = kyDangXem?.name ?? "";
	const dv = giaiDon(don, cay.data, tenGoc);
	const veGoc = () =>
		void datUrl({
			[SEARCH_PARAM.okr.don]: GOC,
		});

	if (dv === null) return coThe(<DonKhongThay veGoc={veGoc} />);

	const dangLocTrangThai = loc.trangThai.length > 0;
	const daBo = dangLocTrangThai ? [] : (byUnit.data?.daBo ?? []);
	const xemDaBo = url[SEARCH_PARAM.okr.daBo] && daBo.length > 0;
	const objectives = xemDaBo ? daBo : (byUnit.data?.rows ?? []);
	const soKr = objectives.reduce((t, mt) => t + mt.keyResults.length, 0);
	const khoa = `${currentId}:${khoaDon(don)}`;
	const rong =
		don.loai === "bp" ? (
			<RongBoPhan tenDon={dv.ten} tenKy={tenKy} />
		) : (
			<Rong
				chuaTruong={dv.coTruong === false}
				quanTri={quanTri}
				tenDon={dv.ten}
				tenKy={tenKy}
				soan={
					quyenKhu.kieu === "xong" && soanBoDuoc(quyenKhu) ? (
						<NutSoanBo q={quyenKhu} />
					) : undefined
				}
			/>
		);

	let than: ReactNode;
	if (xem === "viec") {
		than = <ViecCuaBo cycleId={currentId} key={khoa} unit={don} />;
	} else if (xem === "cham") {
		than = <ChamDiem cycleId={currentId} key={khoa} unit={don} />;
	} else if (xem === "hop-tuan") {
		than = <HopTuan cycleId={currentId} key={khoa} unit={don} />;
	} else if (byUnit.isError) {
		than = <Loi thuLai={thuLai} />;
	} else if (byUnit.isPending) {
		than = <KhungDangTaiDonVi />;
	} else {
		than = (
			<>
				<BangDonVi
					boLocMay={boLoc}
					dangTaiLai={byUnit.isPlaceholderData}
					chanBang={
						<ChanBang
							dem={{ mucTieu: objectives.length, kr: soKr }}
							don={don}
							duong={duongCha(cay.data, don, tenGoc)}
							dv={dv}
							nguoi={don.loai === "nguoi" ? viTriNguoi(cay.data, don.id) : null}
						/>
					}
					dem={byUnit.data?.facetCounts}
					doiLoc={doiLoc}
					loc={loc}
					rong={rong}
					rows={objectives}
					tenNguoi={new Map(cay.data.people.map((p) => [p.id, p.name]))}
					toggles={
						daBo.length > 0 ? (
							<NutDaBo
								bat={xemDaBo}
								doi={(bat) =>
									void datUrl({ [SEARCH_PARAM.okr.daBo]: bat ? true : null })
								}
								n={daBo.length}
							/>
						) : null
					}
				/>
				{don.loai === "nguoi" ? (
					<KhoiKrCuaToi cycleId={currentId} userId={don.id} />
				) : null}
			</>
		);
	}

	than = (
		<>
			<div className="flex flex-col gap-3 pb-1">
				<ViTriBo
					ky={url[SEARCH_PARAM.okr.ky]}
					menu={{ cay: cay.data, dem: dem.data, don, tenGoc, the: xem }}
					tenBo={dv.ten}
				/>
				{theCon}
			</div>
			{xem === "danh-sach" ? (
				<HangSoBo
					chuKy={kyDangXem ?? null}
					cycleId={currentId}
					key={khoa}
					unit={don}
				/>
			) : null}
			{than}
		</>
	);

	return (
		<div className="flex flex-col gap-6">
			{than}
			<NganTaoMucTieu
				suaDuoc={byUnit.data?.canCreate}
				cycleId={currentId}
				don={don}
				tenDon={dv.ten}
			/>
			<HopNhapTheoUrl
				cycleId={currentId}
				duoc={byUnit.data?.canCreate}
				tenDonVi={dv.ten}
				unit={don}
			/>
		</div>
	);
}
