"use client";

import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { baoDaLuuTru } from "@crm/ui/lib/bao-luu-tru";
import { useState } from "react";
import { toast } from "sonner";
import { dien } from "@/components/crm/record-sheet/plan-copy";
import { useTableQuery } from "@/components/data-table/use-table-query";
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
import { BangTatCa } from "@/components/tin-hieu/bang-tat-ca";
import { DanhSachTinHieu } from "@/components/tin-hieu/danh-sach-tin-hieu";
import { NutGuiTao } from "@/components/tin-hieu/hop-gui-tin-hieu";
import { tatCaListParams } from "@/components/tin-hieu/tham-so-tat-ca";
import {
	ThanhTheTinHieu,
	type TheTinHieu,
} from "@/components/tin-hieu/thanh-the-tin-hieu";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";
import type { DongTatCa } from "@/lib/tin-hieu/loc-tat-ca";
import { BA_SO } from "../moi-tin-hieu-cho-quan-tri/du-lieu";
import {
	DONG_CUA_TOI,
	DONG_DA_LUU_TRU,
	DONG_DANG_DUNG,
	DONG_LOI,
	DONG_VUA_LUU_TRU,
	STATE,
} from "./du-lieu";

const GOC = "/proto/go-tin-hieu-rac";

function Khung({
	the,
	children,
	nut,
}: {
	the: TheTinHieu;
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
				hrefCuaToi={`${GOC}?state=${STATE.cuaToiDaLuuTru}`}
				hrefTatCa={`${GOC}?state=${STATE.coMenu}`}
				laQuanTri
				the={the}
			/>
			<PageShellContent>{children}</PageShellContent>
		</PageShell>
	);
}

function dongBanDau(state: string, daLuuTru: boolean): DongTatCa[] {
	if (daLuuTru) return state === STATE.daLuuTruRong ? [] : DONG_DA_LUU_TRU;
	if (state === STATE.vuaLuuTru) return DONG_VUA_LUU_TRU;
	if (state === STATE.luuTruLoi) return DONG_LOI;
	return DONG_DANG_DUNG;
}

function TatCa({ state }: { state: string }) {
	const m = tinHieuMessages("vi").tatCa.luuTru;
	const { input } = useTableQuery(tatCaListParams);
	const [dangDung, setDangDung] = useState(() => dongBanDau(state, false));
	const [daLuuTru, setDaLuuTru] = useState(() => dongBanDau(state, true));
	const [dangCho, setDangCho] = useState<string | null>(null);
	const hong = state === STATE.luuTruLoi;

	const khoiPhuc = (d: DongTatCa) => {
		setDaLuuTru((ds) => ds.filter((x) => x.id !== d.id));
		setDangDung((ds) =>
			[...ds.filter((x) => x.id !== d.id), { ...d, luuTru: null }].sort(
				(a, b) => b.guiLuc.localeCompare(a.guiLuc),
			),
		);
		toast.success(dien(m.daKhoiPhuc, { ma: d.ma }));
	};

	const luuTru = (d: DongTatCa) => {
		if (hong) {
			toast.error(dien(m.luuTruHong, { ma: d.ma }));
			return;
		}
		setDangCho(d.id);
		setDangDung((ds) => ds.filter((x) => x.id !== d.id));
		setDaLuuTru((ds) => [
			{
				...d,
				luuTru: {
					luc: "2026-11-12T03:00:00Z",
					nguoi: { id: "u-quan-tri", ten: "Đỗ Minh Quân" },
				},
			},
			...ds,
		]);
		setDangCho(null);
		baoDaLuuTru({
			thongDiep: dien(m.daLuuTru, { ma: d.ma }),
			nhanHoanTac: m.hoanTac,
			onHoanTac: () => khoiPhuc(d),
		});
	};

	return (
		<Khung the="tat-ca">
			<div className="flex flex-col gap-6">
				<BaSoTinHieu so={BA_SO} />
				<BangTatCa
					banVeDocDuoc
					dong={input.archived ? daLuuTru : dangDung}
					thaoTac={{ dangCho, onKhoiPhuc: khoiPhuc, onLuuTru: luuTru }}
				/>
			</div>
		</Khung>
	);
}

function CuaToi() {
	return (
		<Khung nut={<NutGuiTao variant="default" />} the="cua-toi">
			<DanhSachTinHieu
				banVeDocDuoc
				dangXoa={null}
				dong={DONG_CUA_TOI}
				nutGui={<NutGuiTao variant="outline" />}
				onXoa={() => {}}
			/>
		</Khung>
	);
}

export function GoTinHieuRacMau({ state }: { state: string }) {
	return (
		<LocaleProvider locale="vi">
			{state === STATE.cuaToiDaLuuTru ? (
				<CuaToi />
			) : (
				<TatCa key={state} state={state} />
			)}
		</LocaleProvider>
	);
}
