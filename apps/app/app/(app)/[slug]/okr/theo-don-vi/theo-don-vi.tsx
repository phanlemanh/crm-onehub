"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import type { PhaChuKy } from "@crm/validation/okr-chu-ky";
import { keepPreviousData, skipToken, useQuery } from "@tanstack/react-query";
import { parseAsBoolean, useQueryState, useQueryStates } from "nuqs";
import type { ReactNode } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import { CayCanChinh } from "../cay-can-chinh";
import { ChamDiem } from "../cham-diem";
import { useChuKy } from "../chon-chu-ky";
import { GOC, giaiDon } from "../don-dich";
import { HopThoaiNhapOkr } from "../hop-thoai-nhap";
import { HopTuan } from "../hop-tuan";
import { KhoiKrCuaToi } from "../khoi-kr-cua-toi";
import type { CayDuLieu } from "../kieu";
import type { LocOkrGiaTri } from "../loc-okr";
import { BoKhoaUrl, NganTaoMucTieu } from "../ngan-okr-url";
import { NhomDaBo } from "../nhom-da-bo";
import {
	type CachXem,
	type DonChonOkr,
	khoaDon,
	locOkr,
	okrParsers,
} from "../okr-search-params";
import { useChuyenLinkCuSoan } from "../soan/chuyen-link-cu";
import { ChuaChuKy, DangTai, DonKhongThay, Loi, Rong } from "../trang-thai-okr";
import { BangDonVi } from "./bang";
import { conTrucTiep, duongCha } from "./bang-don-vi";
import { ChanBang } from "./chan-bang";
import { ChonDonVi } from "./chon-don-vi";
import { DonViCon } from "./don-vi-con";
import {
	HangCongCuDonVi,
	KhungDangTaiDonVi,
	KhungHangCongCu,
} from "./hang-cong-cu";

const PHA_CO_CHAM: readonly PhaChuKy[] = ["cham-diem", "da-dong"];

/** Hộp «Nhập từ bảng tính» mở bằng khoá đường dẫn, để nút «…» ở đầu trang mọi thẻ dùng chung một hộp. */
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

function viTriNguoi(cay: CayDuLieu, id: string) {
	const p = cay.people.find((x) => x.id === id);
	const pb = [
		...cay.divisions.flatMap((x) => x.departments),
		...cay.chuaXep,
	].find((x) => x.id === p?.primaryDepartmentId);
	return { phongBan: pb?.name ?? null, quanLy: p?.manager?.name ?? null };
}

function XemCay({
	cycleId,
	tenGoc,
	tenKy,
}: {
	cycleId: string;
	tenGoc: string;
	tenKy: string;
}) {
	const trpc = useTRPC();
	const cay = useQuery(trpc.okr.cayCanChinh.queryOptions({ cycleId }));
	if (cay.isPending) return <DangTai />;
	if (cay.isError) return <Loi thuLai={() => void cay.refetch()} />;
	if (cay.data.roots.length === 0 && cay.data.chuaCanChinh.length === 0)
		return (
			<Rong tenDon={tenGoc} tenKy={tenKy} chuaTruong={false} quanTri={false} />
		);
	return (
		<div data-trang-thai="ST-donvi-caycanchinh">
			<CayCanChinh
				roots={cay.data.roots}
				chuaCanChinh={cay.data.chuaCanChinh}
				canh={cay.data.canh}
			/>
		</div>
	);
}

/** Các thân không phải bảng: cùng hàng công cụ trong khung cùng lớp với DataTable. */
function KhungCachXem({
	hang,
	children,
}: {
	hang: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-3">
			<KhungHangCongCu>{hang}</KhungHangCongCu>
			{children}
		</div>
	);
}

export function TheoDonVi() {
	useChuyenLinkCuSoan();
	const m = okrMessages(useLocale());
	const trpc = useTRPC();
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
	const workspace = useQuery(trpc.workspace.get.queryOptions());
	const dem = useQuery(
		trpc.okr.countByUnit.queryOptions(
			currentId === null ? skipToken : { cycleId: currentId },
		),
	);
	const byUnit = useQuery({
		...trpc.okr.danhSach.queryOptions(
			currentId === null ? skipToken : { cycleId: currentId, unit: don, loc },
		),
		placeholderData: keepPreviousData,
	});

	const quanTri = access.data?.canManageProgram === true;
	const thuLai = () => {
		void cay.refetch();
		void cycles.refetch();
		void byUnit.refetch();
	};

	if (cycles.data?.cycles.length === 0 && !access.isPending)
		return <ChuaChuKy quanTri={quanTri} />;
	if (cycles.isPending || access.isPending || cay.isPending)
		return <KhungDangTaiDonVi />;
	if (cycles.isError || cay.isError) return <Loi thuLai={thuLai} />;
	if (currentId === null) return <ChuaChuKy quanTri={quanTri} />;

	const tenGoc = workspace.data?.name || m.goc;
	const tenKy = cycles.data.cycles.find((c) => c.id === currentId)?.name ?? "";
	const dv = giaiDon(don, cay.data, tenGoc);
	const chonDon = (d: DonChonOkr) =>
		void datUrl({
			[SEARCH_PARAM.okr.don]: khoaDon(d) === "goc" ? null : d,
		});
	const hang = (
		<HangCongCuDonVi
			chon={
				<ChonDonVi
					cay={cay.data}
					chonDon={chonDon}
					dem={dem.data}
					don={don}
					tenGoc={tenGoc}
				/>
			}
			coCham={coCham}
			doiXem={(moi) =>
				void datUrl({
					[SEARCH_PARAM.okr.xem]: moi === "danh-sach" ? null : moi,
				})
			}
			xem={xem}
		/>
	);

	if (dv === null)
		return (
			<KhungCachXem hang={hang}>
				<DonKhongThay veGoc={() => chonDon(GOC)} />
			</KhungCachXem>
		);

	const objectives = byUnit.data?.rows ?? [];
	const soKr = objectives.reduce((t, mt) => t + mt.keyResults.length, 0);
	const khoa = `${currentId}:${khoaDon(don)}`;

	let than: ReactNode;
	if (xem === "cham") {
		than = (
			<KhungCachXem hang={hang}>
				<ChamDiem cycleId={currentId} key={khoa} unit={don} />
			</KhungCachXem>
		);
	} else if (xem === "hop-tuan") {
		than = (
			<KhungCachXem hang={hang}>
				<HopTuan cycleId={currentId} key={khoa} unit={don} />
			</KhungCachXem>
		);
	} else if (xem === "cay") {
		than = (
			<KhungCachXem hang={hang}>
				<XemCay cycleId={currentId} tenGoc={tenGoc} tenKy={tenKy} />
			</KhungCachXem>
		);
	} else if (byUnit.data === undefined && byUnit.isPending) {
		than = <KhungDangTaiDonVi hang={hang} />;
	} else if (byUnit.isError) {
		than = (
			<KhungCachXem hang={hang}>
				<Loi thuLai={thuLai} />
			</KhungCachXem>
		);
	} else {
		than = (
			<>
				<BangDonVi
					boLocMay={boLoc}
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
					hangCongCu={hang}
					loc={loc}
					rong={
						<Rong
							chuaTruong={dv.coTruong === false}
							quanTri={quanTri}
							tenDon={dv.ten}
							tenKy={tenKy}
						/>
					}
					rows={objectives}
					tenNguoi={new Map(cay.data.people.map((p) => [p.id, p.name]))}
				/>
				{don.loai === "nguoi" ? (
					<KhoiKrCuaToi cycleId={currentId} userId={don.id} />
				) : null}
				<NhomDaBo
					danhDauCuaToi={false}
					ds={byUnit.data?.daBo ?? []}
					hienDonVi={false}
				/>
				<DonViCon
					con={conTrucTiep(cay.data, don)}
					dem={dem.data}
					ky={url[SEARCH_PARAM.okr.ky]}
				/>
			</>
		);
	}

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
