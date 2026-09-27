"use client";

import { useState } from "react";
import { deXuatTheoPhamVi, type PhamVi } from "./du-lieu";
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
	| { loai: "doc"; choLanDau: boolean }
	| { loai: "soan"; sua: boolean }
	| { loai: "rong" }
	| { loai: "dang-tai" }
	| { loai: "cho-duyet"; chon: string; cu: boolean }
	| { loai: "nguon" }
	| { loai: "suc-khoe" }
	| { loai: "khong-co" }
	| { loai: "tim-nhanh" }
	| { loai: "hoi"; tuChoi: boolean };

type KhoiTao = { phamVi: PhamVi; man: Man };

const MAN_THEO_STATE = {
	"ST-danh-sach": { phamVi: "luot-1", man: { loai: "danh-sach" } },
	"ST-doc-trang": {
		phamVi: "luot-1",
		man: { loai: "doc", choLanDau: false },
	},
	"ST-doc-cho-lan-dau": {
		phamVi: "luot-1",
		man: { loai: "doc", choLanDau: true },
	},
	"ST-viet-trang": { phamVi: "luot-1", man: { loai: "soan", sua: false } },
	"ST-kho-rong": { phamVi: "luot-1", man: { loai: "rong" } },
	"ST-dang-tai": { phamVi: "luot-1", man: { loai: "dang-tai" } },
	"ST-duyet-thuong": {
		phamVi: "luot-1",
		man: { loai: "cho-duyet", chon: "dx-khieu-nai", cu: false },
	},
	"ST-de-xuat-cu": {
		phamVi: "luot-1",
		man: { loai: "cho-duyet", chon: "dx-khieu-nai", cu: true },
	},
	"ST-tai-nguon": { phamVi: "day-du", man: { loai: "nguon" } },
	"ST-duyet-ban-may-soan": {
		phamVi: "day-du",
		man: { loai: "cho-duyet", chon: "dx-hoa-hong", cu: false },
	},
	"ST-tim-nhanh": { phamVi: "day-du", man: { loai: "tim-nhanh" } },
	"ST-suc-khoe": { phamVi: "day-du", man: { loai: "suc-khoe" } },
	"ST-tac-nhan-tra-loi": {
		phamVi: "day-du",
		man: { loai: "hoi", tuChoi: false },
	},
	"ST-tac-nhan-tu-choi": {
		phamVi: "day-du",
		man: { loai: "hoi", tuChoi: true },
	},
	"ST-soat-dinh-ky": {
		phamVi: "day-du",
		man: { loai: "cho-duyet", chon: "dx-zalo", cu: false },
	},
	"ST-the-cu-phap-ly": {
		phamVi: "day-du",
		man: { loai: "cho-duyet", chon: "dx-luat", cu: false },
	},
	"ST-khong-co-quyen": { phamVi: "day-du", man: { loai: "khong-co" } },
} satisfies Record<string, KhoiTao>;

function tabCua(man: Man): TabKho | null {
	if (man.loai === "cho-duyet") return "cho-duyet";
	if (man.loai === "nguon") return "nguon";
	if (man.loai === "suc-khoe") return "suc-khoe";
	if (man.loai === "soan") return null;
	return "trang";
}

function KhoTaiLieu({ phamVi, dau }: { phamVi: PhamVi; dau: Man }) {
	const [man, setMan] = useState<Man>(dau);
	const deXuat = deXuatTheoPhamVi(phamVi);
	const deXuatDau = deXuat[0]?.id ?? "dx-hoa-hong";
	const deXuatCuaTrangDoc =
		phamVi === "luot-1" ? "dx-hoa-hong-sua" : "dx-hoa-hong";

	if (man.loai === "hoi") {
		return (
			<KhungUngDung muc="chat">
				<HoiTacNhan tuChoi={man.tuChoi} />
			</KhungUngDung>
		);
	}

	const moTab = (tab: TabKho) => {
		if (tab === "cho-duyet")
			setMan({ loai: "cho-duyet", chon: deXuatDau, cu: false });
		else if (tab === "nguon") setMan({ loai: "nguon" });
		else if (tab === "suc-khoe") setMan({ loai: "suc-khoe" });
		else setMan({ loai: "danh-sach" });
	};

	const moDoc = () => setMan({ loai: "doc", choLanDau: false });

	return (
		<KhungUngDung muc="tai-lieu">
			<DauKho
				hanhDong={
					<NutDauKho
						onTaiNguon={() => setMan({ loai: "nguon" })}
						onViet={() => setMan({ loai: "soan", sua: false })}
						phamVi={phamVi}
					/>
				}
				moTimNhanh={man.loai === "tim-nhanh"}
				onTab={moTab}
				phamVi={phamVi}
				soChoDuyet={man.loai === "rong" ? 0 : deXuat.length}
				tab={tabCua(man)}
			/>
			{man.loai === "danh-sach" ? (
				<DanhSachTrang onMo={moDoc} phamVi={phamVi} />
			) : null}
			{man.loai === "doc" ? (
				<DocTrang
					choLanDau={man.choLanDau}
					onSua={() => setMan({ loai: "soan", sua: true })}
					onVe={() => setMan({ loai: "danh-sach" })}
					onXemDeXuat={() =>
						setMan({ loai: "cho-duyet", chon: deXuatCuaTrangDoc, cu: false })
					}
					phamVi={phamVi}
				/>
			) : null}
			{man.loai === "soan" ? (
				<SoanTrang
					key={man.sua ? "sua" : "moi"}
					onGui={() => setMan({ loai: "doc", choLanDau: !man.sua })}
					onHuy={() =>
						setMan(
							man.sua
								? { loai: "doc", choLanDau: false }
								: { loai: "danh-sach" },
						)
					}
					sua={man.sua}
				/>
			) : null}
			{man.loai === "rong" ? (
				<KhoRong
					onViet={() => setMan({ loai: "soan", sua: false })}
					phamVi={phamVi}
				/>
			) : null}
			{man.loai === "dang-tai" ? <DangTai /> : null}
			{man.loai === "cho-duyet" ? (
				<ChoDuyet
					chonDau={man.chon}
					cu={man.cu}
					key={`${man.chon}-${man.cu}`}
					phamVi={phamVi}
				/>
			) : null}
			{man.loai === "nguon" ? <DanhSachNguon /> : null}
			{man.loai === "suc-khoe" ? <SucKhoeKho /> : null}
			{man.loai === "khong-co" ? <KhongCoQuyen /> : null}
			{man.loai === "tim-nhanh" ? (
				<DanhSachTrang onMo={moDoc} phamVi={phamVi} />
			) : null}
		</KhungUngDung>
	);
}

export function KhoTaiLieuMau({ state }: { state: string }) {
	const dau: KhoiTao =
		MAN_THEO_STATE[state as keyof typeof MAN_THEO_STATE] ??
		MAN_THEO_STATE["ST-danh-sach"];
	return <KhoTaiLieu dau={dau.man} key={state} phamVi={dau.phamVi} />;
}
