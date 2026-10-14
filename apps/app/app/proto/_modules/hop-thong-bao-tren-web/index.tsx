"use client";

import { Avatar, AvatarFallback } from "@crm/ui/components/avatar";
import { LocaleProvider } from "@crm/ui/components/locale-provider";
import { useState } from "react";
import {
	PageShell,
	PageShellContent,
	PageShellDescription,
	PageShellHeader,
	PageShellHeading,
	PageShellTitle,
} from "@/components/page-shell";
import {
	ChuongThongBaoKhung,
	type TrangThaiChuong,
} from "@/components/thong-bao/chuong-thong-bao";
import type { DongThongBao } from "@/components/thong-bao/dong-thong-bao";
import {
	type LocThongBao,
	TrangThongBaoThan,
} from "@/components/thong-bao/trang-thong-bao";
import { NutGuiDauTrang } from "@/components/tin-hieu/hop-gui-tin-hieu";
import { NutGuiTinHieu } from "@/components/tin-hieu/nut-gui-tin-hieu";
import { thongBaoMessages } from "@/lib/messages/thong-bao";
import {
	CU_HON,
	DA_DOC,
	HOM_NAY,
	HREF_TRANG,
	STATE,
	TRUOC_DO,
} from "./du-lieu";

const TRAN_SO = 99;

type CanhChuong = {
	trangThai: TrangThaiChuong;
	so: number;
	homNay: DongThongBao[];
	truocDo: DongThongBao[];
	mo: boolean;
};

const CHUONG: Record<string, CanhChuong> = {
	[STATE.ngucanh]: {
		trangThai: "xong",
		so: 3,
		homNay: HOM_NAY,
		truocDo: TRUOC_DO,
		mo: false,
	},
	[STATE.chuongCo]: {
		trangThai: "xong",
		so: 3,
		homNay: HOM_NAY,
		truocDo: TRUOC_DO,
		mo: true,
	},
	[STATE.chuong99]: {
		trangThai: "xong",
		so: 128,
		homNay: HOM_NAY,
		truocDo: TRUOC_DO,
		mo: false,
	},
	[STATE.chuongHet]: {
		trangThai: "xong",
		so: 0,
		homNay: DA_DOC(HOM_NAY),
		truocDo: TRUOC_DO,
		mo: true,
	},
	[STATE.chuongRong]: {
		trangThai: "xong",
		so: 0,
		homNay: [],
		truocDo: [],
		mo: true,
	},
	[STATE.chuongChoTai]: {
		trangThai: "cho-tai",
		so: 0,
		homNay: [],
		truocDo: [],
		mo: true,
	},
	[STATE.chuongLoi]: {
		trangThai: "loi",
		so: 0,
		homNay: [],
		truocDo: [],
		mo: true,
	},
};

function ChuongMau({ canh }: { canh: CanhChuong }) {
	const [mo, setMo] = useState(canh.mo);
	const [homNay, setHomNay] = useState(canh.homNay);
	const [so, setSo] = useState(canh.so);
	return (
		<div className="flex h-12 items-center justify-end gap-1.5 border-b px-3">
			<ChuongThongBaoKhung
				dangDocHet={false}
				homNay={homNay}
				hrefTatCa={HREF_TRANG}
				onDocHet={() => {
					setHomNay(DA_DOC(homNay));
					setSo(0);
				}}
				onMo={() => {}}
				onOpenChange={setMo}
				onThuLai={() => {}}
				open={mo}
				soChuaDoc={so}
				tranSo={TRAN_SO}
				trangThai={canh.trangThai}
				truocDo={canh.truocDo}
			/>
			<NutGuiTinHieu nut={<NutGuiDauTrang />} />
			<Avatar className="size-7">
				<AvatarFallback>MP</AvatarFallback>
			</Avatar>
		</div>
	);
}

function TrangMau({ state }: { state: string }) {
	const m = thongBaoMessages("vi");
	const [loc, setLoc] = useState<LocThongBao>(
		state === STATE.trangLocRong ? "chua-doc" : "tat-ca",
	);
	const chiGio = (ds: DongThongBao[]) =>
		ds.map((d) => ({ ...d, gio: d.gio.split(", ").at(-1) ?? d.gio }));
	const tatCa = [
		{ nhan: m.chuong.homNay, dong: HOM_NAY },
		{ nhan: "Hôm qua", dong: chiGio(TRUOC_DO.slice(0, 1)) },
		{ nhan: "Thứ Hai, 12/10", dong: chiGio(TRUOC_DO.slice(1, 2)) },
		{ nhan: "Chủ Nhật, 11/10", dong: chiGio(TRUOC_DO.slice(2)) },
		{ nhan: "Thứ Bảy, 10/10", dong: chiGio(CU_HON.slice(0, 1)) },
		{ nhan: "Thứ Sáu, 09/10", dong: chiGio(CU_HON.slice(1)) },
	];
	const nhom =
		state === STATE.trangRong
			? []
			: state === STATE.trangLocRong
				? tatCa.map((n) => ({ ...n, dong: [] }))
				: loc === "chua-doc"
					? tatCa.map((n) => ({ ...n, dong: n.dong.filter((d) => d.chuaDoc) }))
					: tatCa;
	const trangThai =
		state === STATE.trangChoTai
			? "cho-tai"
			: state === STATE.trangLoi
				? "loi"
				: "xong";
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.trang.tieuDe}</PageShellTitle>
					<PageShellDescription>{m.trang.moTa}</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<TrangThongBaoThan
					coThem={state === STATE.trangCo && loc === "tat-ca"}
					dangThem={false}
					loc={loc}
					nhom={nhom}
					onLoc={setLoc}
					onMo={() => {}}
					onThuLai={() => {}}
					onXemThem={() => {}}
					trangThai={trangThai}
				/>
			</PageShellContent>
		</PageShell>
	);
}

export function HopThongBaoMau({ state }: { state: string }) {
	const canh = CHUONG[state];
	return (
		<LocaleProvider locale="vi">
			{canh ? (
				<ChuongMau key={state} canh={canh} />
			) : (
				<TrangMau key={state} state={state} />
			)}
		</LocaleProvider>
	);
}
