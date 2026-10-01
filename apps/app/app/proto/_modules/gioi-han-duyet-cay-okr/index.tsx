"use client";

import { KhungUngDung, type TrangOkr } from "../ban-mau-okr/phan-chung";
import {
	ChuongTrinhOkr,
	type HinhChuongTrinh,
	type HinhToChuc,
	ToChuc,
} from "./cai-dat";
import { NGUOI } from "./du-lieu";
import {
	type HinhKhung,
	HopMucHienThi,
	HopTraLai,
	KhongThay,
	KhungTheoHinh,
	ViecCuaToi,
} from "./khung-muc-tieu";
import { type HinhMoCoi, SucKhoeMoCoi } from "./mo-coi";

type Man =
	| { man: "khung"; hinh: HinhKhung; nguoi: string }
	| { man: "khong-thay" }
	| { man: "hien-thi"; conCanChinh: boolean }
	| { man: "tra-lai" }
	| { man: "viec-cua-toi" }
	| { man: "chuong-trinh"; hinh: HinhChuongTrinh }
	| { man: "to-chuc"; hinh: HinhToChuc }
	| { man: "mo-coi"; hinh: HinhMoCoi };

const MAN_THEO_STATE = {
	"ST-khung-gioi-han": {
		man: "khung",
		hinh: "gioi-han",
		nguoi: NGUOI.trang.ten,
	},
	"ST-khung-khong-thay": { man: "khong-thay" },
	"ST-hienthi-hop": { man: "hien-thi", conCanChinh: false },
	"ST-hienthi-con-can-chinh": { man: "hien-thi", conCanChinh: true },
	"ST-duyet-cho-nguoi-gui": {
		man: "khung",
		hinh: "cho-nguoi-gui",
		nguoi: NGUOI.ha.ten,
	},
	"ST-duyet-cho-nguoi-duyet": {
		man: "khung",
		hinh: "cho-nguoi-duyet",
		nguoi: NGUOI.minh.ten,
	},
	"ST-duyet-tra-lai-hop": { man: "tra-lai" },
	"ST-duyet-bi-tra-lai": {
		man: "khung",
		hinh: "bi-tra-lai",
		nguoi: NGUOI.ha.ten,
	},
	"ST-duyet-viec-cua-toi": { man: "viec-cua-toi" },
	"ST-chuongtrinh-duyet": { man: "chuong-trinh", hinh: "duyet" },
	"ST-chuongtrinh-khong-quyen": { man: "chuong-trinh", hinh: "khong-quyen" },
	"ST-tochuc-okr-mo": { man: "to-chuc", hinh: "okr-mo" },
	"ST-tochuc-luu-tru-chan": { man: "to-chuc", hinh: "luu-tru-chan" },
	"ST-chuyen-hop": { man: "to-chuc", hinh: "chuyen" },
	"ST-chuyen-loi": { man: "to-chuc", hinh: "chuyen-loi" },
	"ST-mocoi-co": { man: "mo-coi", hinh: "co" },
	"ST-mocoi-rong": { man: "mo-coi", hinh: "rong" },
	"ST-mocoi-dang-tai": { man: "mo-coi", hinh: "dang-tai" },
	"ST-mocoi-loi": { man: "mo-coi", hinh: "loi" },
} satisfies Record<string, Man>;

function NoiDung({ m }: { m: Man }) {
	switch (m.man) {
		case "khung":
			return <KhungTheoHinh hinh={m.hinh} />;
		case "khong-thay":
			return <KhongThay />;
		case "hien-thi":
			return (
				<>
					<KhungTheoHinh hinh="gioi-han" />
					<HopMucHienThi conCanChinh={m.conCanChinh} />
				</>
			);
		case "tra-lai":
			return (
				<>
					<KhungTheoHinh hinh="cho-nguoi-duyet" />
					<HopTraLai />
				</>
			);
		case "viec-cua-toi":
			return <ViecCuaToi />;
		case "chuong-trinh":
			return <ChuongTrinhOkr hinh={m.hinh} />;
		case "to-chuc":
			return <ToChuc hinh={m.hinh} />;
		case "mo-coi":
			return <SucKhoeMoCoi hinh={m.hinh} />;
	}
}

function trangCua(m: Man): TrangOkr {
	if (m.man === "viec-cua-toi") return "cua-toi";
	if (m.man === "mo-coi") return "toan-canh";
	return "theo-don-vi";
}

function nguoiCua(m: Man): string {
	if (m.man === "khung") return m.nguoi;
	if (m.man === "tra-lai" || m.man === "viec-cua-toi") return NGUOI.minh.ten;
	if (m.man === "hien-thi") return NGUOI.trang.ten;
	return NGUOI.quan.ten;
}

export function GioiHanDuyetCayOkrMau({ state }: { state: string }) {
	const m: Man =
		state in MAN_THEO_STATE
			? MAN_THEO_STATE[state as keyof typeof MAN_THEO_STATE]
			: MAN_THEO_STATE["ST-khung-gioi-han"];

	if (m.man === "chuong-trinh" || m.man === "to-chuc") {
		return (
			<div
				className="ml-[calc(50%-50vw)] w-screen border-y bg-background"
				data-okr-khung="cai-dat"
				data-state={state}
				key={state}
			>
				<NoiDung m={m} />
			</div>
		);
	}

	return (
		<KhungUngDung
			key={state}
			nguoi={nguoiCua(m)}
			trang={trangCua(m)}
			vai="day-du"
		>
			<div className="flex flex-col gap-6" data-state={state}>
				<NoiDung m={m} />
			</div>
		</KhungUngDung>
	);
}
