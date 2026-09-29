"use client";

import { KhungUngDung } from "../ban-mau-okr/phan-chung";
import { CaiDatGopY, type HinhCaiDat } from "./cai-dat";
import {
	type HinhHop,
	type HinhKr,
	HopThoaiKr,
	HopThoaiMucTieu,
} from "./hop-thoai";

type Man =
	| { man: "muc-tieu"; hinh: HinhHop }
	| { man: "kr"; hinh: HinhKr }
	| { man: "cai-dat"; hinh: HinhCaiDat };

const MAN_THEO_STATE = {
	"ST-muctieu-nut": { man: "muc-tieu", hinh: "nut" },
	"ST-muctieu-nut-khoa-sua": { man: "muc-tieu", hinh: "nut-khoa-sua" },
	"ST-muctieu-dang-soan": { man: "muc-tieu", hinh: "dang-soan" },
	"ST-muctieu-co-dong": { man: "muc-tieu", hinh: "co-dong" },
	"ST-muctieu-sua-dong": { man: "muc-tieu", hinh: "sua-dong" },
	"ST-muctieu-da-quyet": { man: "muc-tieu", hinh: "da-quyet" },
	"ST-muctieu-rong": { man: "muc-tieu", hinh: "rong" },
	"ST-muctieu-loi": { man: "muc-tieu", hinh: "loi" },
	"ST-muctieu-loi-nhan": { man: "muc-tieu", hinh: "loi-nhan" },
	"ST-muctieu-het-tran": { man: "muc-tieu", hinh: "het-tran" },
	"ST-muctieu-het-luot": { man: "muc-tieu", hinh: "het-luot" },
	"ST-muctieu-dang-cho": { man: "muc-tieu", hinh: "dang-cho" },
	"ST-huong-chuyen-man": { man: "muc-tieu", hinh: "huong-chuyen-man" },
	"ST-kr-cot": { man: "kr", hinh: "cot" },
	"ST-kr-xu-huong": { man: "kr", hinh: "xu-huong" },
	"ST-kr-khong-xu-huong": { man: "kr", hinh: "khong-xu-huong" },
	"ST-caidat-nac": { man: "cai-dat", hinh: "nac" },
	"ST-caidat-nac-bat-toan": { man: "cai-dat", hinh: "nac-bat-toan" },
	"ST-sodo-dang-tai": { man: "cai-dat", hinh: "so-do-dang-tai" },
	"ST-sodo-rong": { man: "cai-dat", hinh: "so-do-rong" },
	"ST-sodo-co-so": { man: "cai-dat", hinh: "so-do-co-so" },
	"ST-sodo-ngan": { man: "cai-dat", hinh: "so-do-ngan" },
	"ST-sodo-loi": { man: "cai-dat", hinh: "so-do-loi" },
} satisfies Record<string, Man>;

function laState(s: string): s is keyof typeof MAN_THEO_STATE {
	return s in MAN_THEO_STATE;
}

export function TroLyOkrDeXuatMau({ state }: { state: string }) {
	const m: Man = MAN_THEO_STATE[laState(state) ? state : "ST-muctieu-co-dong"];
	if (m.man === "cai-dat") {
		return (
			<div
				className="ml-[calc(50%-50vw)] w-screen border-y bg-background px-4 py-6"
				data-okr-khung="cai-dat"
				key={state}
			>
				<CaiDatGopY hinh={m.hinh} />
			</div>
		);
	}
	return (
		<KhungUngDung key={state} trang="theo-don-vi" vai="day-du">
			{m.man === "muc-tieu" ? (
				<HopThoaiMucTieu hinh={m.hinh} />
			) : (
				<HopThoaiKr hinh={m.hinh} />
			)}
		</KhungUngDung>
	);
}
