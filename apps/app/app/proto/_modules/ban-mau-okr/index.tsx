"use client";

import { CapNhatTuan, type HinhCapNhat } from "./cap-nhat-tuan";
import { CuaToi } from "./cua-toi";
import { KhungUngDung, type TrangOkr, type Vai } from "./phan-chung";
import { type HinhDonVi, TheoDonVi } from "./theo-don-vi";
import { type HinhToanCanh, ToanCanh } from "./toan-canh";

type Man =
	| {
			trang: "cua-toi";
			hinh: "co-du-lieu" | "dang-tai" | "rong" | "loi";
			moDieuHuong?: boolean;
	  }
	| { trang: "cap-nhat"; hinh: HinhCapNhat }
	| { trang: "theo-don-vi"; hinh: HinhDonVi }
	| { trang: "toan-canh"; hinh: HinhToanCanh };

const MAN_THEO_STATE = {
	"ST-cuatoi-codulieu": { trang: "cua-toi", hinh: "co-du-lieu" },
	"ST-cuatoi-dieuhuong": {
		trang: "cua-toi",
		hinh: "co-du-lieu",
		moDieuHuong: true,
	},
	"ST-cuatoi-rong": { trang: "cua-toi", hinh: "rong" },
	"ST-cuatoi-dangtai": { trang: "cua-toi", hinh: "dang-tai" },
	"ST-cuatoi-loi": { trang: "cua-toi", hinh: "loi" },
	"ST-capnhat-dangdien": { trang: "cap-nhat", hinh: "dang-dien" },
	"ST-capnhat-sokhonghople": { trang: "cap-nhat", hinh: "so-khong-hop-le" },
	"ST-capnhat-danggui": { trang: "cap-nhat", hinh: "dang-gui" },
	"ST-capnhat-loigui": { trang: "cap-nhat", hinh: "loi-gui" },
	"ST-capnhat-dagui": { trang: "cap-nhat", hinh: "da-gui" },
	"ST-capnhat-rong": { trang: "cap-nhat", hinh: "rong" },
	"ST-capnhat-dangtai": { trang: "cap-nhat", hinh: "dang-tai" },
	"ST-capnhat-loi": { trang: "cap-nhat", hinh: "loi" },
	"ST-donvi-danhsach": { trang: "theo-don-vi", hinh: "danh-sach" },
	"ST-donvi-caycanchinh": { trang: "theo-don-vi", hinh: "cay-can-chinh" },
	"ST-donvi-sheet": { trang: "theo-don-vi", hinh: "sheet" },
	"ST-donvi-rong": { trang: "theo-don-vi", hinh: "rong" },
	"ST-donvi-dangtai": { trang: "theo-don-vi", hinh: "dang-tai" },
	"ST-donvi-loi": { trang: "theo-don-vi", hinh: "loi" },
	"ST-toancanh-codulieu": { trang: "toan-canh", hinh: "co-du-lieu" },
	"ST-toancanh-tuandau": { trang: "toan-canh", hinh: "tuan-dau" },
	"ST-toancanh-dangtai": { trang: "toan-canh", hinh: "dang-tai" },
	"ST-toancanh-loi": { trang: "toan-canh", hinh: "loi" },
} satisfies Record<string, Man>;

const VAI_THEO_TRANG = {
	"cua-toi": "chi-okr",
	"cap-nhat": "chi-okr",
	"theo-don-vi": "chi-okr",
	"toan-canh": "day-du",
} satisfies Record<TrangOkr, Vai>;

function NoiDung({ man }: { man: Man }) {
	switch (man.trang) {
		case "cua-toi":
			return <CuaToi hinh={man.hinh} />;
		case "cap-nhat":
			return <CapNhatTuan hinh={man.hinh} />;
		case "theo-don-vi":
			return <TheoDonVi hinh={man.hinh} />;
		case "toan-canh":
			return <ToanCanh hinh={man.hinh} />;
	}
}

export function BanMauOkrMau({ state }: { state: string }) {
	const man: Man =
		state in MAN_THEO_STATE
			? MAN_THEO_STATE[state as keyof typeof MAN_THEO_STATE]
			: MAN_THEO_STATE["ST-cuatoi-codulieu"];
	const vai =
		man.trang === "theo-don-vi" && man.hinh === "rong"
			? "day-du"
			: VAI_THEO_TRANG[man.trang];

	return (
		<KhungUngDung
			key={state}
			moDieuHuong={man.trang === "cua-toi" && man.moDieuHuong === true}
			trang={man.trang}
			vai={vai}
		>
			<NoiDung man={man} />
		</KhungUngDung>
	);
}
