"use client";

import { useState } from "react";
import { DE_XUAT } from "./du-lieu";
import { DauKho, KhungUngDung, type TabKho } from "./khung";
import { ChoDuyet, DanhSachNguon } from "./man-duyet";
import { HoiTacNhan } from "./man-hoi";
import {
	DangTai,
	DanhSachTrang,
	DocTrang,
	KhongCoQuyen,
	KhoRong,
	NutDauKho,
	SoanTrang,
	SucKhoeKho,
} from "./man-trang";

type Man =
	| { loai: "danh-sach" }
	| { loai: "doc" }
	| { loai: "soan" }
	| { loai: "rong" }
	| { loai: "dang-tai" }
	| { loai: "cho-duyet"; chon: string }
	| { loai: "nguon" }
	| { loai: "suc-khoe" }
	| { loai: "khong-co" }
	| { loai: "tim-nhanh" }
	| { loai: "hoi"; tuChoi: boolean };

const MAN_THEO_STATE = {
	"ST-danh-sach": { loai: "danh-sach" },
	"ST-doc-trang": { loai: "doc" },
	"ST-viet-trang": { loai: "soan" },
	"ST-kho-rong": { loai: "rong" },
	"ST-dang-tai": { loai: "dang-tai" },
	"ST-tac-nhan-tra-loi": { loai: "hoi", tuChoi: false },
	"ST-tac-nhan-tu-choi": { loai: "hoi", tuChoi: true },
	"ST-tai-nguon": { loai: "nguon" },
	"ST-duyet-ban-may-soan": { loai: "cho-duyet", chon: "dx-hoa-hong" },
	"ST-soat-dinh-ky": { loai: "cho-duyet", chon: "dx-zalo" },
	"ST-de-xuat-cu": { loai: "cho-duyet", chon: "dx-khieu-nai" },
	"ST-the-cu-phap-ly": { loai: "cho-duyet", chon: "dx-luat" },
	"ST-suc-khoe": { loai: "suc-khoe" },
	"ST-tim-nhanh": { loai: "tim-nhanh" },
	"ST-khong-co-quyen": { loai: "khong-co" },
} satisfies Record<string, Man>;

function tabCua(man: Man): TabKho | null {
	if (man.loai === "cho-duyet") return "cho-duyet";
	if (man.loai === "nguon") return "nguon";
	if (man.loai === "suc-khoe") return "suc-khoe";
	if (man.loai === "soan") return null;
	return "trang";
}

function KhoTaiLieu({ dau }: { dau: Man }) {
	const [man, setMan] = useState<Man>(dau);

	if (man.loai === "hoi") {
		return (
			<KhungUngDung muc="chat">
				<HoiTacNhan tuChoi={man.tuChoi} />
			</KhungUngDung>
		);
	}

	const moTab = (tab: TabKho) => {
		if (tab === "cho-duyet") setMan({ loai: "cho-duyet", chon: "dx-hoa-hong" });
		else if (tab === "nguon") setMan({ loai: "nguon" });
		else if (tab === "suc-khoe") setMan({ loai: "suc-khoe" });
		else setMan({ loai: "danh-sach" });
	};

	return (
		<KhungUngDung muc="tai-lieu">
			<DauKho
				hanhDong={
					<NutDauKho
						onTaiNguon={() => setMan({ loai: "nguon" })}
						onViet={() => setMan({ loai: "soan" })}
					/>
				}
				moTimNhanh={man.loai === "tim-nhanh"}
				onTab={moTab}
				soChoDuyet={man.loai === "rong" ? 0 : DE_XUAT.length}
				tab={tabCua(man)}
			/>
			{man.loai === "danh-sach" ? (
				<DanhSachTrang onMo={() => setMan({ loai: "doc" })} />
			) : null}
			{man.loai === "doc" ? (
				<DocTrang
					onVe={() => setMan({ loai: "danh-sach" })}
					onXemDeXuat={() => setMan({ loai: "cho-duyet", chon: "dx-hoa-hong" })}
				/>
			) : null}
			{man.loai === "soan" ? (
				<SoanTrang onHuy={() => setMan({ loai: "danh-sach" })} />
			) : null}
			{man.loai === "rong" ? (
				<KhoRong onViet={() => setMan({ loai: "soan" })} />
			) : null}
			{man.loai === "dang-tai" ? <DangTai /> : null}
			{man.loai === "cho-duyet" ? (
				<ChoDuyet chonDau={man.chon} key={man.chon} />
			) : null}
			{man.loai === "nguon" ? <DanhSachNguon /> : null}
			{man.loai === "suc-khoe" ? <SucKhoeKho /> : null}
			{man.loai === "khong-co" ? <KhongCoQuyen /> : null}
			{man.loai === "tim-nhanh" ? (
				<DanhSachTrang onMo={() => setMan({ loai: "doc" })} />
			) : null}
		</KhungUngDung>
	);
}

export function KhoTaiLieuMau({ state }: { state: string }) {
	const dau: Man =
		MAN_THEO_STATE[state as keyof typeof MAN_THEO_STATE] ??
		MAN_THEO_STATE["ST-danh-sach"];
	return <KhoTaiLieu dau={dau} key={state} />;
}
