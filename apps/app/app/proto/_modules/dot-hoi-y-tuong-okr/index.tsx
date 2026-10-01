"use client";

import { KhungUngDung } from "../ban-mau-okr/phan-chung";
import { ChonMan, demChuaKetLuan, type HinhChon } from "./chon";
import { HOI_Y, NGUOI } from "./du-lieu";
import { GomMan } from "./gom";
import { GopMan, type HinhGop } from "./gop";
import { type HinhKetQua, KetQuaMan } from "./ket-qua";
import { DangTaiHoiY, LoiHoiY, TrongHoiY } from "./khung";
import { MoHoiYMan } from "./mo-hoi-y";
import { VietTruocMan } from "./viet-truoc";

type Man =
	| { man: "dang-tai" }
	| { man: "loi" }
	| { man: "trong"; quanTri: boolean }
	| { man: "mo-sheet" }
	| { man: "gop"; hinh: HinhGop }
	| { man: "viet-truoc" }
	| { man: "gom" }
	| { man: "chon"; hinh: HinhChon }
	| { man: "ket-qua"; hinh: HinhKetQua };

type CanhMan = { nguoi: string; m: Man };

const THANH_VIEN = NGUOI.van.ten;
const NGUOI_CHON = HOI_Y.nguoiChon.ten;
const QUAN_TRI = NGUOI.trang.ten;

const CANH_THEO_STATE = {
	"ST-hoiy-dang-tai": { nguoi: THANH_VIEN, m: { man: "dang-tai" } },
	"ST-hoiy-loi": { nguoi: THANH_VIEN, m: { man: "loi" } },
	"ST-hoiy-trong-quan-tri": {
		nguoi: NGUOI_CHON,
		m: { man: "trong", quanTri: true },
	},
	"ST-hoiy-trong-thanh-vien": {
		nguoi: THANH_VIEN,
		m: { man: "trong", quanTri: false },
	},
	"ST-mo-sheet": { nguoi: NGUOI_CHON, m: { man: "mo-sheet" } },
	"ST-gop-chua-gop": { nguoi: THANH_VIEN, m: { man: "gop", hinh: "chua-gop" } },
	"ST-gop-da-gop": { nguoi: THANH_VIEN, m: { man: "gop", hinh: "da-gop" } },
	"ST-gop-het-han": { nguoi: THANH_VIEN, m: { man: "gop", hinh: "het-han" } },
	"ST-viet-truoc": { nguoi: NGUOI_CHON, m: { man: "viet-truoc" } },
	"ST-gom": { nguoi: QUAN_TRI, m: { man: "gom" } },
	"ST-chon-chua-du": { nguoi: NGUOI_CHON, m: { man: "chon", hinh: "chua-du" } },
	"ST-chon-du": { nguoi: NGUOI_CHON, m: { man: "chon", hinh: "du" } },
	"ST-ket-qua": { nguoi: THANH_VIEN, m: { man: "ket-qua", hinh: "chua-hieu" } },
	"ST-ket-qua-da-hieu": {
		nguoi: THANH_VIEN,
		m: { man: "ket-qua", hinh: "da-hieu" },
	},
} satisfies Record<string, CanhMan>;

function NoiDung({ m }: { m: Man }) {
	switch (m.man) {
		case "dang-tai":
			return <DangTaiHoiY />;
		case "loi":
			return <LoiHoiY />;
		case "trong":
			return <TrongHoiY quanTri={m.quanTri} />;
		case "mo-sheet":
			return <MoHoiYMan />;
		case "gop":
			return <GopMan hinh={m.hinh} />;
		case "viet-truoc":
			return <VietTruocMan />;
		case "gom":
			return <GomMan />;
		case "chon":
			return <ChonMan hinh={m.hinh} />;
		case "ket-qua":
			return <KetQuaMan hinh={m.hinh} />;
	}
}

function nhanTabHoiY(m: Man): string | undefined {
	if (m.man === "gop" && m.hinh === "chua-gop") return "Mới";
	if (m.man === "chon") {
		const con = demChuaKetLuan(m.hinh);
		return con > 0 ? String(con) : undefined;
	}
	return undefined;
}

export function DotHoiYTuongOkrMau({ state }: { state: string }) {
	const canh: CanhMan =
		state in CANH_THEO_STATE
			? CANH_THEO_STATE[state as keyof typeof CANH_THEO_STATE]
			: CANH_THEO_STATE["ST-gop-chua-gop"];

	return (
		<KhungUngDung
			chuKy={HOI_Y.chuKy}
			congCuCungHangTab
			key={state}
			nhanTabHoiY={nhanTabHoiY(canh.m)}
			nguoi={canh.nguoi}
			trang="hoi-y"
			vai="day-du"
		>
			<div data-state={state}>
				<NoiDung m={canh.m} />
			</div>
		</KhungUngDung>
	);
}
