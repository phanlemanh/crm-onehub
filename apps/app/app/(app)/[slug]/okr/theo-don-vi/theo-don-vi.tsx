"use client";

import Add from "@carbon/icons-react/es/Add";
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
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { keepPreviousData, skipToken, useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { type ReactNode, useState } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { okrToanCanhMessages } from "@/lib/messages/okr-toan-canh";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import { CayCanChinh } from "../cay-can-chinh";
import { CayDonVi } from "../cay-don-vi";
import { useChuKy } from "../chon-chu-ky";
import { HopThoaiMucTieu } from "../hop-thoai-muc-tieu";
import { HopThoaiNhapOkr } from "../hop-thoai-nhap";
import { HopTuan } from "../hop-tuan";
import { KhoiKrCuaToi } from "../khoi-kr-cua-toi";
import { KhoiMucTieu } from "../khoi-muc-tieu";
import type { CayDuLieu, MucTieu } from "../kieu";
import { coLoc, KhongKhop, LocOkr, type LocOkrGiaTri } from "../loc-okr";
import {
	CACH_XEM,
	type CachXem,
	type DonChonOkr,
	khoaDon,
	okrParsers,
} from "../okr-search-params";
import { ChuaChuKy, DangTai, DonKhongThay, Loi, Rong } from "../trang-thai-okr";

const GOC: DonChonOkr = { loai: "goc" };

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
		<div className="flex flex-col gap-6" data-trang-thai="ST-donvi-danhsach">
			{objectives.map((mt) => (
				<KhoiMucTieu
					key={mt.id}
					mucTieu={mt}
					hienDonVi={false}
					danhDauCuaToi={false}
				/>
			))}
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

export function TheoDonVi() {
	const locale = useLocale();
	const m = okrMessages(locale);
	const mt = okrToanCanhMessages(locale);
	const trpc = useTRPC();
	const [url, datUrl] = useQueryStates(okrParsers);
	const loc: LocOkrGiaTri = {
		phuTrach: url[SEARCH_PARAM.okr.phuTrach],
		loai: url[SEARCH_PARAM.okr.loai],
		trangThai: url[SEARCH_PARAM.okr.trangThai],
		tuTin: url[SEARCH_PARAM.okr.tuTin],
	};
	const giaTriLoc = <T extends string>(v: T[]) => (v.length > 0 ? v : null);
	const doiLoc = (thay: Partial<LocOkrGiaTri>) =>
		void datUrl({
			[SEARCH_PARAM.okr.phuTrach]: giaTriLoc(thay.phuTrach ?? loc.phuTrach),
			[SEARCH_PARAM.okr.loai]: giaTriLoc(thay.loai ?? loc.loai),
			[SEARCH_PARAM.okr.trangThai]: giaTriLoc(thay.trangThai ?? loc.trangThai),
			[SEARCH_PARAM.okr.tuTin]: giaTriLoc(thay.tuTin ?? loc.tuTin),
		});
	const boLoc = () =>
		void datUrl({
			[SEARCH_PARAM.okr.phuTrach]: null,
			[SEARCH_PARAM.okr.loai]: null,
			[SEARCH_PARAM.okr.trangThai]: null,
			[SEARCH_PARAM.okr.tuTin]: null,
		});
	const don = url[SEARCH_PARAM.okr.don] ?? GOC;
	const xem: CachXem = url[SEARCH_PARAM.okr.xem] ?? "danh-sach";
	const { cycles, currentId } = useChuKy();
	const [themMo, setThemMo] = useState(false);
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
	if (xem === "hop-tuan") {
		noiDung = (
			<HopTuan
				cycleId={currentId}
				key={`${currentId}:${khoaDon(don)}`}
				unit={don}
			/>
		);
	} else if (xem === "cay") {
		noiDung = <XemCay cycleId={currentId} tenGoc={tenGoc} tenKy={tenKy} />;
	} else if (byUnit.isPending) noiDung = <DangTai />;
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
								<ToggleGroup
									aria-label={m.cachXem}
									type="single"
									variant="outline"
									size="sm"
									spacing={0}
									value={xem}
									onValueChange={(v) => {
										const moi = CACH_XEM.find((c) => c === v);
										if (moi)
											void datUrl({
												[SEARCH_PARAM.okr.xem]:
													moi === "danh-sach" ? null : moi,
											});
									}}
								>
									<ToggleGroupItem value="danh-sach">
										{m.danhSach}
									</ToggleGroupItem>
									<ToggleGroupItem value="cay">{m.cayCanChinh}</ToggleGroupItem>
									<ToggleGroupItem value="hop-tuan">
										{mt.hopTuan.cachXem}
									</ToggleGroupItem>
								</ToggleGroup>
								{xem === "danh-sach" ? (
									<LocOkr
										boLoc={boLoc}
										dem={byUnit.data?.facetCounts}
										doiLoc={doiLoc}
										loc={loc}
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
								{byUnit.data?.canEdit ? (
									<Button
										size="sm"
										aria-haspopup="dialog"
										data-nut="them-muc-tieu"
										onClick={() => setThemMo(true)}
									>
										<Icon icon={Add} data-icon="inline-start" />
										{m.themMucTieu}
									</Button>
								) : null}
							</div>
						</Card>
						{don.loai === "nguoi" && xem === "danh-sach" ? (
							<KhoiKrCuaToi cycleId={currentId} userId={don.id} />
						) : null}
						{noiDung}
						{themMo ? (
							<HopThoaiMucTieu
								yeuCau={{
									loai: "tao",
									cycleId: currentId,
									don,
									tenDon: dv.ten,
								}}
								dong={() => setThemMo(false)}
							/>
						) : null}
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
