"use client";

import Add from "@carbon/icons-react/es/Add";
import Enterprise from "@carbon/icons-react/es/Enterprise";
import Renew from "@carbon/icons-react/es/Renew";
import Upload from "@carbon/icons-react/es/Upload";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import { KhungXuong } from "@crm/ui/components/khung-xuong";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "@crm/ui/components/sheet";
import { useQuery } from "@tanstack/react-query";
import { useQueryStates } from "nuqs";
import { useState, useSyncExternalStore } from "react";
import { searchParsers } from "@/components/data-table/list-search-params";
import { HopChuyenOkr } from "@/components/okr/hop-chuyen-okr";
import { toChucMessages } from "@/lib/messages/to-chuc";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import { CayDieuHuong } from "./cay-dieu-huong";
import { ChiTiet, giaiDon, tenChon } from "./chi-tiet";
import { DaLuuTruToChuc } from "./da-luu-tru-to-chuc";
import { HopGanPhongBan } from "./hop-gan-phong-ban";
import { HopThemNguoi } from "./hop-them-nguoi";
import { HopThoaiDonVi } from "./hop-thoai-don-vi";
import { HopThoaiNhap } from "./hop-thoai-nhap";
import { HopThoaiViTri } from "./hop-thoai-vi-tri";
import {
	type ChonDaGiai,
	type HanhDong,
	type HoiLuuTru,
	KHO_HEP,
	moiPhongBan,
	okrMoCua,
	type YeuCauDonVi,
} from "./kieu";
import { OSo } from "./o-so";
import { type DonChon, toChucParsers } from "./to-chuc-search-params";
import { XacNhanLuuTru } from "./xac-nhan-luu-tru";

function useKhoHep(): boolean {
	return useSyncExternalStore(
		(bao) => {
			const q = window.matchMedia(KHO_HEP);
			q.addEventListener("change", bao);
			return () => q.removeEventListener("change", bao);
		},
		() => window.matchMedia(KHO_HEP).matches,
		() => false,
	);
}

function veDon(chon: ChonDaGiai): DonChon {
	switch (chon.loai) {
		case "goc":
			return { loai: "goc" };
		case "chua-co":
			return { loai: "chua-co" };
		case "bp":
			return { loai: "bp", id: chon.bp.id };
		case "pb":
			return { loai: "pb", id: chon.pb.id };
	}
}

export function ToChuc({ tenGoc }: { tenGoc?: string }) {
	const t = toChucMessages(useLocale());
	const trpc = useTRPC();
	const cay = useQuery(trpc.org.tree.queryOptions());
	const quyen = useQuery(trpc.org.access.queryOptions());
	const [{ don, loc, chuyenOkr }, datUrl] = useQueryStates(toChucParsers);
	const [{ q }] = useQueryStates(searchParsers);
	const hep = useKhoHep();
	const [nguoiMo, setNguoiMo] = useState<string | null>(null);
	const [donVi, setDonVi] = useState<YeuCauDonVi | null>(null);
	const [moNhap, setMoNhap] = useState(false);
	const [hoiLuu, setHoiLuu] = useState<HoiLuuTru | null>(null);
	const [ganVao, setGanVao] = useState<string | null>(null);
	const [themVao, setThemVao] = useState<string | null>(null);
	const goc = tenGoc ?? t.goc;
	const sua = quyen.data?.canManage === true;

	if (cay.isPending || quyen.isPending) {
		return (
			<div className="flex flex-col gap-2" data-trang-thai="ST-tochuc-dangtai">
				<p className="text-muted-foreground text-sm" role="status">
					{t.loading}
				</p>
				<KhungXuong hinh="the" />
			</div>
		);
	}

	if (cay.isError || !cay.data) {
		return (
			<Empty data-trang-thai="ST-tochuc-loi">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Icon icon={WarningAlt} />
					</EmptyMedia>
					<EmptyTitle>{t.loi.title}</EmptyTitle>
					<EmptyDescription>{t.loi.body}</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button
						variant="outline"
						onClick={() => {
							void cay.refetch();
							void quyen.refetch();
						}}
					>
						<Icon icon={Renew} data-icon="inline-start" />
						{t.loi.action}
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	const d = cay.data;
	const rong = d.divisions.length === 0 && d.chuaXep.length === 0;
	const chon = giaiDon(don, d);
	const donHien = hep && don === null ? null : veDon(chon);
	const chonDon = (x: DonChon) => void datUrl({ [SEARCH_PARAM.toChuc.don]: x });
	const nguoi = nguoiMo ? d.people.find((p) => p.id === nguoiMo) : undefined;
	const bpGan = ganVao ? d.divisions.find((x) => x.id === ganVao) : undefined;
	const pbThem = themVao
		? moiPhongBan(d).find((x) => x.id === themVao)
		: undefined;

	const hd: HanhDong = {
		sua,
		moDonVi: setDonVi,
		moNguoi: setNguoiMo,
		hoiLuuTru: setHoiLuu,
		moGan: (bp) => setGanVao(bp.id),
		moThem: (pb) => setThemVao(pb.id),
		moChuyenOkr: (x) => void datUrl({ [SEARCH_PARAM.toChuc.chuyenOkr]: x }),
	};

	const duong =
		chon.loai === "bp"
			? goc
			: chon.loai === "pb"
				? (chon.bp?.name ?? t.chuaXep)
				: undefined;

	return (
		<>
			{rong ? (
				<Empty data-trang-thai="ST-tochuc-trong">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Icon icon={Enterprise} />
						</EmptyMedia>
						<EmptyTitle>{t.rong.title}</EmptyTitle>
						<EmptyDescription>{t.rong.body}</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						<div className="flex flex-wrap justify-center gap-2">
							<Button
								disabled={!sua}
								aria-haspopup="dialog"
								onClick={() => setMoNhap(true)}
							>
								<Icon icon={Upload} data-icon="inline-start" />
								{t.nhap}
							</Button>
							<Button
								variant="outline"
								disabled={!sua}
								aria-haspopup="dialog"
								onClick={() => setDonVi({ loai: "tao-bo-phan" })}
							>
								<Icon icon={Add} data-icon="inline-start" />
								{t.themBoPhan}
							</Button>
						</div>
					</EmptyContent>
				</Empty>
			) : (
				<>
					<OSo
						coverage={d.coverage}
						chonChuaCo={chon.loai === "chua-co" && donHien !== null}
						locChuaTruong={loc === "chua-truong"}
						moChuaCo={() => chonDon({ loai: "chua-co" })}
						doiLoc={() =>
							void datUrl({
								[SEARCH_PARAM.toChuc.loc]:
									loc === "chua-truong" ? null : "chua-truong",
							})
						}
					/>
					<div className="grid grid-cols-1 rounded-lg border lg:grid-cols-[18rem_minmax(0,1fr)]">
						<div className="min-w-0 lg:border-e">
							<CayDieuHuong
								cay={d}
								tenGoc={goc}
								chon={donHien}
								loc={loc}
								tim={q}
								chonDon={chonDon}
							/>
						</div>
						{hep ? null : (
							<div className="min-w-0">
								<ChiTiet cay={d} chon={chon} tenGoc={goc} hd={hd} />
							</div>
						)}
					</div>
				</>
			)}

			<DaLuuTruToChuc cay={d} sua={sua} />

			{hep && !rong ? (
				<Sheet
					open={don !== null}
					onOpenChange={(mo) => {
						if (!mo) void datUrl({ [SEARCH_PARAM.toChuc.don]: null });
					}}
				>
					<SheetContent side="right" size="md">
						<SheetHeader>
							<SheetTitle translate="no">
								{tenChon(chon, goc, t.chuaCoPhongBan)}
							</SheetTitle>
							<SheetDescription translate="no">
								{duong ? `${duong} ›` : t.cay}
							</SheetDescription>
						</SheetHeader>
						<div className="min-h-0 flex-1 overflow-y-auto">
							<ChiTiet cay={d} chon={chon} tenGoc={goc} hd={hd} anTieuDe />
						</div>
					</SheetContent>
				</Sheet>
			) : null}

			{nguoi && sua ? (
				<HopThoaiViTri
					key={nguoi.id}
					cay={d}
					nguoi={nguoi}
					dong={() => setNguoiMo(null)}
				/>
			) : null}
			{donVi ? (
				<HopThoaiDonVi
					key={JSON.stringify(donVi)}
					cay={d}
					yeuCau={donVi}
					dong={() => setDonVi(null)}
				/>
			) : null}
			{bpGan && sua ? (
				<HopGanPhongBan
					key={bpGan.id}
					cay={d}
					bp={bpGan}
					dong={() => setGanVao(null)}
				/>
			) : null}
			{pbThem && sua ? (
				<HopThemNguoi
					key={pbThem.id}
					cay={d}
					pb={pbThem}
					dong={() => setThemVao(null)}
				/>
			) : null}
			{moNhap ? <HopThoaiNhap dong={() => setMoNhap(false)} /> : null}
			{chuyenOkr && sua ? (
				<HopChuyenOkr
					key={`${chuyenOkr.level}:${chuyenOkr.id}`}
					nguon={chuyenOkr}
					dong={() => void datUrl({ [SEARCH_PARAM.toChuc.chuyenOkr]: null })}
				/>
			) : null}
			<XacNhanLuuTru
				hoi={hoiLuu}
				okrMo={hoiLuu ? okrMoCua(d, hoiLuu) : 0}
				moChuyen={(x) => {
					setHoiLuu(null);
					hd.moChuyenOkr({ level: x.loai, id: x.id });
				}}
				dong={() => setHoiLuu(null)}
				daLuu={(x) => {
					if (chon.loai === "pb" && chon.pb.id === x.id)
						chonDon(chon.bp ? { loai: "bp", id: chon.bp.id } : { loai: "goc" });
					if (chon.loai === "bp" && chon.bp.id === x.id)
						chonDon({ loai: "goc" });
				}}
			/>
		</>
	);
}
