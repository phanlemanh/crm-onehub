"use client";

import { Button } from "@crm/ui/components/button";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import Link from "next/link";
import { useState } from "react";
import {
	PageShell,
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { BaSoTinHieu } from "@/components/tin-hieu/ba-so-tin-hieu";
import { BangTatCa, KhongQuyenTatCa } from "@/components/tin-hieu/bang-tat-ca";
import { DanhSachTinHieu } from "@/components/tin-hieu/danh-sach-tin-hieu";
import {
	HopGuiTinHieu,
	NutGuiDauTrang,
	NutGuiTao,
} from "@/components/tin-hieu/hop-gui-tin-hieu";
import {
	ThanhTheTinHieu,
	type TheTinHieu,
} from "@/components/tin-hieu/thanh-the-tin-hieu";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";
import { DONG_MAU } from "../gui-tin-hieu-trong-crm/du-lieu";
import {
	BA_SO,
	BA_SO_RONG,
	DONG_KHONG_BAN_VE,
	DONG_TAT_CA,
	DONG_THIEU,
	STATE,
} from "./du-lieu";

const GOC = "/proto/moi-tin-hieu-cho-quan-tri";
const HREF_CUA_TOI = `${GOC}?state=${STATE.cuaToiQuanTri}`;
const HREF_TAT_CA = `${GOC}?state=${STATE.tatCaCo}`;

function KhungChoTatCa() {
	return (
		<div className="flex flex-col gap-3" data-tin-hieu-tat-ca-dang-tai="">
			<div className="grid grid-cols-3 gap-2">
				<Skeleton className="h-24" />
				<Skeleton className="h-24" />
				<Skeleton className="h-24" />
			</div>
			<Skeleton className="h-10 w-full" />
			<Skeleton className="h-10 w-full" />
			<Skeleton className="h-10 w-full" />
		</div>
	);
}

function Khung({
	the,
	laQuanTri,
	children,
	nut,
}: {
	the: TheTinHieu;
	laQuanTri: boolean;
	children: React.ReactNode;
	nut?: React.ReactNode;
}) {
	const m = tinHieuMessages("vi");
	const tieu = the === "tat-ca" ? m.tatCa : m.trang;
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{tieu.tieuDe}</PageShellTitle>
					<PageShellDescription>{tieu.moTa}</PageShellDescription>
				</PageShellHeading>
				{nut ? <PageShellActions>{nut}</PageShellActions> : null}
			</PageShellHeader>
			<ThanhTheTinHieu
				hrefCuaToi={HREF_CUA_TOI}
				hrefTatCa={HREF_TAT_CA}
				laQuanTri={laQuanTri}
				the={the}
			/>
			<PageShellContent>{children}</PageShellContent>
		</PageShell>
	);
}

function TatCa({ state }: { state: string }) {
	const m = tinHieuMessages("vi").tatCa;
	if (state === STATE.tatCaKhongQuyen)
		return (
			<Khung laQuanTri={false} the="tat-ca">
				<KhongQuyenTatCa
					nutVe={
						<Button asChild variant="outline">
							<Link href={HREF_CUA_TOI}>{m.ve}</Link>
						</Button>
					}
				/>
			</Khung>
		);
	let than: React.ReactNode;
	if (state === STATE.tatCaDangTai) than = <KhungChoTatCa />;
	else if (state === STATE.tatCaLoi)
		than = (
			<VungTaiLoi
				moTa={m.taiLoiMoTa}
				onThuLai={() => {}}
				tieuDe={m.taiLoiTieuDe}
			/>
		);
	else {
		const rong = state === STATE.tatCaRong;
		const khongBanVe = state === STATE.tatCaKhongBanVe;
		const dong = rong
			? []
			: state === STATE.tatCaThieu
				? DONG_THIEU
				: khongBanVe
					? DONG_KHONG_BAN_VE
					: DONG_TAT_CA;
		const so = rong
			? BA_SO_RONG
			: khongBanVe
				? { ...BA_SO, chuaCoCho: null }
				: BA_SO;
		than = (
			<div className="flex flex-col gap-6">
				<BaSoTinHieu so={so} />
				<BangTatCa banVeDocDuoc={!khongBanVe} dong={dong} />
			</div>
		);
	}
	return (
		<Khung laQuanTri the="tat-ca">
			{than}
		</Khung>
	);
}

function CuaToi() {
	return (
		<Khung laQuanTri nut={<NutGuiTao variant="default" />} the="cua-toi">
			<DanhSachTinHieu
				banVeDocDuoc
				dangXoa={null}
				dong={DONG_MAU}
				nutGui={<NutGuiTao variant="outline" />}
				onXoa={() => {}}
			/>
		</Khung>
	);
}

function HopBaoTruoc() {
	const [mo, setMo] = useState(true);
	const [muonLam, setMuonLam] = useState("");
	const [daXayRa, setDaXayRa] = useState("");
	return (
		<div className="flex items-center justify-end gap-2 rounded-lg border p-2">
			<HopGuiTinHieu
				daXayRa={daXayRa}
				giaiDoan="soan"
				hrefDaGui={HREF_CUA_TOI}
				loi={null}
				ma="crm-10"
				man="/okr/kr"
				muonLam={muonLam}
				nut={<NutGuiDauTrang />}
				onDaXayRaChange={setDaXayRa}
				onGui={() => {}}
				onMuonLamChange={setMuonLam}
				onOpenChange={setMo}
				open={mo}
			/>
		</div>
	);
}

export function MoiTinHieuChoQuanTriMau({ state }: { state: string }) {
	return (
		<LocaleProvider locale="vi">
			{state === STATE.hopBaoTruoc ? (
				<HopBaoTruoc />
			) : state === STATE.cuaToiQuanTri ? (
				<CuaToi />
			) : (
				<TatCa key={state} state={state} />
			)}
		</LocaleProvider>
	);
}
