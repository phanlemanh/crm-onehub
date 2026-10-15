"use client";

import { LocaleProvider } from "@crm/ui/components/locale-provider";
import type { Locale } from "@crm/ui/lib/locale";
import { TIN_HIEU } from "@crm/validation/tin-hieu";
import { useState } from "react";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import {
	PageShell,
	PageShellActions,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import { DanhSachTinHieu } from "@/components/tin-hieu/danh-sach-tin-hieu";
import {
	type GiaiDoanGui,
	HopGuiTinHieu,
	NutGuiTao,
} from "@/components/tin-hieu/hop-gui-tin-hieu";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";
import { tenMan } from "@/lib/tin-hieu/ten-man";
import {
	DA_XAY_RA_MAU,
	dongMau,
	MAN_MAU,
	MUON_LAM_MAU,
	STATE,
} from "./du-lieu";

type HopMauVao = {
	locale: Locale;
	chu: boolean;
	giaiDoan: GiaiDoanGui;
	loi: "qua-tran" | "may-chu" | null;
};

const HOP = new Map<string, HopMauVao>([
	[STATE.hopTrong, { locale: "vi", chu: false, giaiDoan: "soan", loi: null }],
	[STATE.hopDangGo, { locale: "vi", chu: true, giaiDoan: "soan", loi: null }],
	[
		STATE.hopQuaTran,
		{
			locale: "vi",
			chu: true,
			giaiDoan: "soan",
			loi: "qua-tran",
		},
	],
	[
		STATE.hopQuaTranEn,
		{
			locale: "en",
			chu: true,
			giaiDoan: "soan",
			loi: "qua-tran",
		},
	],
	[
		STATE.hopLoi,
		{
			locale: "vi",
			chu: true,
			giaiDoan: "soan",
			loi: "may-chu",
		},
	],
	[
		STATE.hopDaGui,
		{
			locale: "vi",
			chu: false,
			giaiDoan: "da-gui",
			loi: null,
		},
	],
]);

function HopMau({
	vao,
	moBanDau,
	nut,
}: {
	vao: HopMauVao;
	moBanDau: boolean;
	nut: React.ReactNode;
}) {
	const m = tinHieuMessages(vao.locale);
	const [mo, setMo] = useState(moBanDau);
	const [muonLam, setMuonLam] = useState(vao.chu ? MUON_LAM_MAU : "");
	const [daXayRa, setDaXayRa] = useState(vao.chu ? DA_XAY_RA_MAU : "");
	const [giaiDoan, setGiaiDoan] = useState<GiaiDoanGui>(vao.giaiDoan);
	const loi =
		vao.loi === "qua-tran"
			? dien(m.hop.quaTran, { tran: String(TIN_HIEU.tranMoiNgay) })
			: vao.loi === "may-chu"
				? m.hop.chuaGui
				: null;
	return (
		<HopGuiTinHieu
			daXayRa={daXayRa}
			giaiDoan={giaiDoan}
			hrefDaGui="/proto/sua-giao-dien-tin-hieu?state=ST-ds-co"
			loi={loi}
			ma="crm-42"
			man={tenMan(MAN_MAU, vao.locale)}
			muonLam={muonLam}
			nut={nut}
			onDaXayRaChange={setDaXayRa}
			onGui={() => {
				setMuonLam("");
				setDaXayRa("");
				setGiaiDoan("da-gui");
			}}
			onMuonLamChange={setMuonLam}
			onOpenChange={(o) => {
				setMo(o);
				if (!o) setGiaiDoan("soan");
			}}
			open={mo}
			quaTran={vao.loi === "qua-tran"}
		/>
	);
}

function TrangMau({ state, locale }: { state: string; locale: Locale }) {
	const m = tinHieuMessages(locale);
	const nutGui = (variant: "default" | "outline") => (
		<HopMau
			moBanDau={false}
			nut={<NutGuiTao variant={variant} />}
			vao={{ locale, chu: false, giaiDoan: "soan", loi: null }}
		/>
	);
	const tatCa = dongMau(m);
	const dong =
		state === STATE.dsRong
			? []
			: state === STATE.dsDaXoa
				? tatCa.filter((d) => d.id !== "t41")
				: tatCa;
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.trang.tieuDe}</PageShellTitle>
					<PageShellDescription>{m.trang.moTa}</PageShellDescription>
				</PageShellHeading>
				{state === STATE.dsRong ? null : (
					<PageShellActions>{nutGui("default")}</PageShellActions>
				)}
			</PageShellHeader>
			<PageShellContent>
				<DanhSachTinHieu
					banVeDocDuoc
					daXoa={state === STATE.dsDaXoa ? "crm-41" : null}
					dangXoa={null}
					dong={dong}
					hoiXoaBanDau={state === STATE.dsXacNhanXoa ? "t41" : undefined}
					nutGui={nutGui("outline")}
					onXoa={() => {}}
					xoaHong={
						state === STATE.dsXoaHong
							? dien(m.trang.xoaHongDaLayVe, { ma: "crm-41" })
							: null
					}
				/>
			</PageShellContent>
		</PageShell>
	);
}

export function SuaGiaoDienTinHieuMau({ state }: { state: string }) {
	const hop = HOP.get(state);
	const locale: Locale = hop?.locale ?? (state === STATE.dsEn ? "en" : "vi");
	return (
		<LocaleProvider locale={locale}>
			{hop ? (
				<HopMau
					key={state}
					moBanDau
					nut={<NutGuiTao variant="default" />}
					vao={hop}
				/>
			) : (
				<TrangMau key={state} locale={locale} state={state} />
			)}
		</LocaleProvider>
	);
}
