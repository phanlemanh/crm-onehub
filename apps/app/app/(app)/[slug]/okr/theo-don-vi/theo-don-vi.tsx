"use client";

import DocumentImport from "@carbon/icons-react/es/DocumentImport";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { ViewSwitch } from "@crm/ui/components/view-switch";
import type { PhaChuKy } from "@crm/validation/okr-chu-ky";
import { keepPreviousData, skipToken, useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { type ReactNode, useState } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { okrKhepMessages } from "@/lib/messages/okr-khep";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import { BangMucTieu } from "../bang-muc-tieu";
import { CayCanChinh } from "../cay-can-chinh";
import { CayDonVi } from "../cay-don-vi";
import { ChamDiem } from "../cham-diem";
import { DIEM_CAM_GOP_Y } from "../chip-gop-y";
import { useChuKy } from "../chon-chu-ky";
import { HopThoaiNhapOkr } from "../hop-thoai-nhap";
import { HopTuan } from "../hop-tuan";
import { KhoiKrCuaToi } from "../khoi-kr-cua-toi";
import type { CayDuLieu, MucTieu } from "../kieu";
import { coLoc, KhongKhop, LocOkr, type LocOkrGiaTri } from "../loc-okr";
import { NganTaoMucTieu, NutThemMucTieu } from "../ngan-okr-url";
import {
	CACH_XEM,
	type CachXem,
	type DonChonOkr,
	khoaDon,
	locOkr,
	okrParsers,
} from "../okr-search-params";
import { NutSoan } from "../soan/nut-soan";
import { ChuaChuKy, DangTai, DonKhongThay, Loi, Rong } from "../trang-thai-okr";

const GOC: DonChonOkr = { loai: "goc" };
const PHA_CO_CHAM: readonly PhaChuKy[] = ["cham-diem", "da-dong"];

type DonDaGiai = { ten: string; truong: string | null; coTruong: boolean };

function giaiDon(
	don: DonChonOkr,
	cay: CayDuLieu,
	tenGoc: string,
): DonDaGiai | null {
	const coTruong = (head: { name: string } | null) => ({
		truong: head?.name ?? null,
		coTruong: head !== null,
	});
	switch (don.loai) {
		case "goc":
			return { ten: tenGoc, truong: null, coTruong: true };
		case "bp": {
			const bp = cay.divisions.find((x) => x.id === don.id);
			return bp ? { ten: bp.name, ...coTruong(bp.head) } : null;
		}
		case "pb": {
			const pb = [
				...cay.divisions.flatMap((x) => x.departments),
				...cay.chuaXep,
			].find((x) => x.id === don.id);
			return pb ? { ten: pb.name, ...coTruong(pb.head) } : null;
		}
		case "nguoi": {
			const nguoi = cay.people.find((x) => x.id === don.id);
			return nguoi ? { ten: nguoi.name, truong: null, coTruong: true } : null;
		}
	}
}

function khoaMoiDonVi(cay: CayDuLieu): string[] {
	return [
		"goc",
		...cay.divisions.flatMap((bp) => [
			`bp:${bp.id}`,
			...bp.departments.map((pb) => `pb:${pb.id}`),
		]),
		...cay.chuaXep.map((pb) => `pb:${pb.id}`),
	];
}

function viTriNguoi(cay: CayDuLieu, id: string) {
	const p = cay.people.find((x) => x.id === id);
	const pb = [
		...cay.divisions.flatMap((x) => x.departments),
		...cay.chuaXep,
	].find((x) => x.id === p?.primaryDepartmentId);
	return { phongBan: pb?.name ?? null, quanLy: p?.manager?.name ?? null };
}

function DanhSach({ objectives }: { objectives: MucTieu[] }) {
	return (
		<div data-trang-thai="ST-donvi-danhsach">
			<BangMucTieu
				danhDauCuaToi={false}
				diemCam={DIEM_CAM_GOP_Y}
				ds={objectives}
				hienDonVi={false}
			/>
		</div>
	);
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
			/>
		</div>
	);
}

const dangCho = (q: { isPending: boolean; isPlaceholderData: boolean }) =>
	q.isPending || q.isPlaceholderData;

export function TheoDonVi({ cauNoiOkr = false }: { cauNoiOkr?: boolean }) {
	const locale = useLocale();
	const m = okrMessages(locale);
	const mt = okrToanCanhMessages(locale);
	const mk = okrKhepMessages(locale);
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
	const [nhapMo, setNhapMo] = useState(false);
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
	if (cycles.isPending || access.isPending || cay.isPending) return <DangTai />;
	if (cycles.isError || cay.isError) return <Loi thuLai={thuLai} />;
	if (currentId === null) return <ChuaChuKy quanTri={quanTri} />;

	const tenGoc = workspace.data?.name || m.goc;
	const tenKy = cycles.data.cycles.find((c) => c.id === currentId)?.name ?? "";
	const dv = giaiDon(don, cay.data, tenGoc);
	const nguoi = don.loai === "nguoi" ? viTriNguoi(cay.data, don.id) : null;
	const demChu = Object.fromEntries(
		khoaMoiDonVi(cay.data).map((k) => [
			k,
			dem.data ? m.demMucTieu(dem.data[k] ?? 0) : "",
		]),
	);
	const chonDon = (d: DonChonOkr) =>
		void datUrl({
			[SEARCH_PARAM.okr.don]: khoaDon(d) === "goc" ? null : d,
		});
	const objectives = byUnit.data?.rows ?? [];
	const soKr = objectives.reduce((t, mt) => t + mt.keyResults.length, 0);

	let noiDung: ReactNode;
	if (xem === "cham") {
		noiDung = (
			<ChamDiem
				cycleId={currentId}
				key={`${currentId}:${khoaDon(don)}`}
				unit={don}
			/>
		);
	} else if (xem === "hop-tuan") {
		noiDung = (
			<HopTuan
				cycleId={currentId}
				key={`${currentId}:${khoaDon(don)}`}
				unit={don}
			/>
		);
	} else if (xem === "cay") {
		noiDung = <XemCay cycleId={currentId} tenGoc={tenGoc} tenKy={tenKy} />;
	} else if (dangCho(byUnit)) noiDung = <DangTai />;
	else if (byUnit.isError) noiDung = <Loi thuLai={thuLai} />;
	else if (objectives.length === 0 && coLoc(loc))
		noiDung = <KhongKhop boLoc={boLoc} />;
	else if (objectives.length === 0)
		noiDung = (
			<Rong
				tenDon={dv?.ten ?? ""}
				tenKy={tenKy}
				chuaTruong={dv?.coTruong === false}
				quanTri={quanTri}
			/>
		);
	else noiDung = <DanhSach objectives={objectives} />;

	return (
		<div className="grid grid-cols-1 gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
			<div className="min-w-0">
				<CayDonVi
					cay={cay.data}
					tenGoc={tenGoc}
					dem={demChu}
					don={don}
					chonDon={chonDon}
				/>
			</div>
			<div className="flex min-w-0 flex-col gap-6">
				{dv === null ? (
					<DonKhongThay veGoc={() => chonDon(GOC)} />
				) : (
					<>
						<Card data-don-vi={khoaDon(don)}>
							<CardHeader>
								<CardTitle>
									<span translate="no">{dv.ten}</span>
								</CardTitle>
								<CardDescription>
									{m.cap[don.loai]}
									{nguoi
										? ` · ${nguoi.phongBan ? `${mt.nguoi.phongBanChinh} ${nguoi.phongBan}` : mt.nguoi.chuaCoPhongBan} · ${nguoi.quanLy ? `${mt.nguoi.quanLy} ${nguoi.quanLy}` : mt.nguoi.khongQuanLy}`
										: null}
									{don.loai === "bp" || don.loai === "pb" ? (
										<>
											{" · "}
											{dv.truong ? (
												<>
													{m.truong} <span translate="no">{dv.truong}</span>
												</>
											) : (
												m.chuaCoTruong
											)}
										</>
									) : null}
									{byUnit.data
										? ` · ${m.demDonVi(objectives.length, soKr)}`
										: null}
								</CardDescription>
							</CardHeader>
							<div className="flex flex-wrap items-center gap-2" data-hang-nut>
								<ViewSwitch
									items={[
										{ value: "danh-sach", label: m.danhSach },
										{ value: "cay", label: m.cayCanChinh },
										{ value: "hop-tuan", label: mt.hopTuan.cachXem },
										...(coCham
											? [{ value: "cham", label: mk.cham.cachXem }]
											: []),
									]}
									label={m.cachXem}
									value={xem}
									onValueChange={(v) => {
										const moi = CACH_XEM.find((c) => c === v);
										if (moi)
											void datUrl({
												[SEARCH_PARAM.okr.xem]:
													moi === "danh-sach" ? null : moi,
											});
									}}
								/>
								{xem === "danh-sach" ? (
									<LocOkr
										boLoc={boLoc}
										dem={byUnit.data?.facetCounts}
										doiLoc={doiLoc}
										loc={loc}
										tenNguoi={
											new Map(cay.data.people.map((p) => [p.id, p.name]))
										}
									/>
								) : null}
								{byUnit.data?.canEdit || quanTri ? (
									<Button
										size="sm"
										variant="outline"
										aria-haspopup="dialog"
										data-nut="nhap-bang-tinh"
										onClick={() => setNhapMo(true)}
									>
										<Icon icon={DocumentImport} data-icon="inline-start" />
										{m.nhapBangTinh}
									</Button>
								) : null}
								<NutThemMucTieu suaDuoc={byUnit.data?.canCreate} />
								<NutSoan
									don={don}
									cycleId={currentId}
									phaKy={phaKy}
									quanTri={quanTri}
									canEdit={byUnit.data?.canEdit === true}
									cauNoi={cauNoiOkr}
								/>
							</div>
						</Card>
						{don.loai === "nguoi" && xem === "danh-sach" ? (
							<KhoiKrCuaToi cycleId={currentId} userId={don.id} />
						) : null}
						{noiDung}
						<NganTaoMucTieu
							suaDuoc={byUnit.data?.canCreate}
							cycleId={currentId}
							don={don}
							tenDon={dv.ten}
						/>
						{nhapMo ? (
							<HopThoaiNhapOkr
								cycleId={currentId}
								unit={don}
								tenDonVi={dv.ten}
								dong={() => setNhapMo(false)}
							/>
						) : null}
					</>
				)}
			</div>
		</div>
	);
}
