"use client";

import { LocaleProvider } from "@crm/ui/components/locale-provider";
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
import {
	DanhSachTinHieu,
	type DongTinHieu,
} from "@/components/tin-hieu/danh-sach-tin-hieu";
import {
	HopGuiTinHieu,
	NutGuiTao,
} from "@/components/tin-hieu/hop-gui-tin-hieu";
import { tinHieuMessages } from "@/lib/messages/tin-hieu";
import { DanhSachMoi, HopMoi } from "./ban-moi";
import {
	CHU,
	DA_XAY_RA_MAU,
	DONG_MAU,
	MUON_LAM_MAU,
	type NgonNgu,
	STATE,
	TEN_MAN_MAU,
} from "./du-lieu";

const HOP_STATE: Record<
	string,
	{
		nn: NgonNgu;
		chu: boolean;
		giaiDoan: "soan" | "da-gui";
		loi: "qua-tran" | "may-chu" | null;
	}
> = {
	[STATE.hopTrong]: { nn: "vi", chu: false, giaiDoan: "soan", loi: null },
	[STATE.hopDangGo]: { nn: "vi", chu: true, giaiDoan: "soan", loi: null },
	[STATE.hopQuaTran]: {
		nn: "vi",
		chu: true,
		giaiDoan: "soan",
		loi: "qua-tran",
	},
	[STATE.hopQuaTranEn]: {
		nn: "en",
		chu: true,
		giaiDoan: "soan",
		loi: "qua-tran",
	},
	[STATE.hopLoi]: { nn: "vi", chu: true, giaiDoan: "soan", loi: "may-chu" },
	[STATE.hopDaGui]: { nn: "vi", chu: false, giaiDoan: "da-gui", loi: null },
};

const DONG_TRUOC: DongTinHieu[] = [
	{
		id: "t41",
		ma: "crm-41",
		tieuDe: "Mở cập nhật KR không thấy số tuần trước",
		muonLam: "Cập nhật số tuần này cho KR của tôi",
		man: "/okr/cm9x2k4lq0001/kr/cm9x2k4lq0007",
		guiLuc: "2026-10-16T02:14:00Z",
		coTheXoa: true,
		trangThai: {
			nhan: "Chờ lấy về",
			cau: "Đã nhận — chờ đội sản phẩm lấy về",
			nghia: "nhap",
		},
	},
	{
		id: "t38",
		ma: "crm-38",
		tieuDe: "Tài liệu quy trình tuyển dụng tìm không ra khi gõ «tuyển»",
		muonLam: "Tìm quy trình tuyển dụng để gửi cho ứng viên",
		man: "/tai-lieu/quy-trinh-tuyen-dung",
		guiLuc: "2026-10-15T08:40:00Z",
		coTheXoa: false,
		trangThai: {
			nhan: "Chờ gom",
			cau: "Đội sản phẩm đã lấy về — chờ gom nhóm",
			nghia: "nhap",
		},
	},
];

function TruocBang() {
	const m = tinHieuMessages("vi").trang;
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{m.tieuDe}</PageShellTitle>
					<PageShellDescription>
						Trước khi sửa — đúng như production 14/10.
					</PageShellDescription>
				</PageShellHeading>
			</PageShellHeader>
			<PageShellContent>
				<DanhSachTinHieu
					banVeDocDuoc
					dangXoa={null}
					dong={DONG_TRUOC}
					nutGui={null}
					onXoa={() => {}}
				/>
			</PageShellContent>
		</PageShell>
	);
}

function TruocHopQuaTran() {
	const m = tinHieuMessages("vi");
	const [mo, setMo] = useState(true);
	return (
		<HopGuiTinHieu
			daXayRa={DA_XAY_RA_MAU}
			giaiDoan="soan"
			hrefDaGui="#"
			loi={dien(m.hop.quaTran, { tran: String(TIN_HIEU.tranMoiNgay) })}
			ma={null}
			man="/okr/cm9x2k4lq0001/kr/cm9x2k4lq0007"
			muonLam={MUON_LAM_MAU}
			nut={<NutGuiTao variant="default" />}
			onDaXayRaChange={() => {}}
			onGui={() => {}}
			onMuonLamChange={() => {}}
			onOpenChange={setMo}
			open={mo}
		/>
	);
}

function TrangMoi({ state }: { state: string }) {
	const nn: NgonNgu = state === STATE.dsEn ? "en" : "vi";
	const chu = CHU[nn];
	const nutGui = (
		<HopMoi
			chu={chu}
			chuBanDau={{ muonLam: "", daXayRa: "" }}
			giaiDoanBanDau="soan"
			loi={null}
			moBanDau={false}
			tenMan={TEN_MAN_MAU[nn]}
		/>
	);
	const dong =
		state === STATE.dsRong
			? []
			: state === STATE.dsDaXoa
				? DONG_MAU.filter((d) => d.id !== "t41")
				: DONG_MAU;
	return (
		<PageShell>
			<PageShellHeader>
				<PageShellHeading>
					<PageShellTitle>{chu.tieuDe}</PageShellTitle>
					<PageShellDescription>{chu.moTa}</PageShellDescription>
				</PageShellHeading>
				{state === STATE.dsRong ? null : (
					<PageShellActions>{nutGui}</PageShellActions>
				)}
			</PageShellHeader>
			<PageShellContent>
				<DanhSachMoi
					baoLoi={state === STATE.dsXoaHong ? chu.xoaHongDaLayVe : undefined}
					chu={chu}
					daXoa={state === STATE.dsDaXoa ? "crm-41" : undefined}
					dong={dong}
					hoiXoaBanDau={state === STATE.dsXacNhanXoa ? "t41" : undefined}
					menuMoBanDau={state === STATE.dsXoaKhoa ? "t38" : undefined}
					nn={nn}
					nutGui={nutGui}
				/>
			</PageShellContent>
		</PageShell>
	);
}

export function SuaGiaoDienTinHieuMau({ state }: { state: string }) {
	const hop = HOP_STATE[state];
	return (
		<LocaleProvider locale={hop?.nn ?? (state === STATE.dsEn ? "en" : "vi")}>
			{state === STATE.truocBang ? (
				<TruocBang />
			) : state === STATE.truocHopQuaTran ? (
				<TruocHopQuaTran />
			) : hop ? (
				<HopMoi
					chu={CHU[hop.nn]}
					chuBanDau={
						hop.chu
							? { muonLam: MUON_LAM_MAU, daXayRa: DA_XAY_RA_MAU }
							: { muonLam: "", daXayRa: "" }
					}
					giaiDoanBanDau={hop.giaiDoan}
					key={state}
					loi={hop.loi}
					moBanDau
					tenMan={TEN_MAN_MAU[hop.nn]}
				/>
			) : (
				<TrangMoi key={state} state={state} />
			)}
		</LocaleProvider>
	);
}
