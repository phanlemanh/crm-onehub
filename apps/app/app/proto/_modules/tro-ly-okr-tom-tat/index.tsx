"use client";

import { KhungUngDung } from "../ban-mau-okr/phan-chung";
import { BangHopTuan } from "./bang-hop";
import { type HinhKhoi, KhoiTomTat } from "./khoi-tom-tat";
import { type HinhNhac, NhacSang } from "./nhac-sang";
import { type HinhQuanTri, QuanTriTomTat } from "./quan-tri";

type Man =
	| { man: "hop-tuan"; hinh: HinhKhoi }
	| { man: "suc-khoe"; hinh: HinhQuanTri }
	| { man: "nhac"; hinh: HinhNhac };

const MAN_THEO_STATE = {
	"ST-tomtat-co-cau": { man: "hop-tuan", hinh: "co-cau" },
	"ST-tomtat-trich-dan": { man: "hop-tuan", hinh: "trich-dan" },
	"ST-tomtat-dang-soan": { man: "hop-tuan", hinh: "dang-soan" },
	"ST-tomtat-chua-cap-nhat": { man: "hop-tuan", hinh: "chua-cap-nhat" },
	"ST-tomtat-loc-het": { man: "hop-tuan", hinh: "loc-het" },
	"ST-tomtat-da-phan-hoi": { man: "hop-tuan", hinh: "da-phan-hoi" },
	"ST-tomtat-loi": { man: "hop-tuan", hinh: "loi" },
	"ST-tomtat-dang-tai": { man: "hop-tuan", hinh: "dang-tai" },
	"ST-suckhoe-tomtat-co": { man: "suc-khoe", hinh: "co" },
	"ST-suckhoe-tomtat-rong": { man: "suc-khoe", hinh: "rong" },
	"ST-suckhoe-tomtat-ngan": { man: "suc-khoe", hinh: "ngan" },
	"ST-nhac-dong-tomtat": { man: "nhac", hinh: "cong-tac" },
	"ST-nhac-tin-mau": { man: "nhac", hinh: "tin-mau" },
} satisfies Record<string, Man>;

function laState(s: string): s is keyof typeof MAN_THEO_STATE {
	return s in MAN_THEO_STATE;
}

export function TroLyOkrTomTatMau({ state }: { state: string }) {
	const m: Man = MAN_THEO_STATE[laState(state) ? state : "ST-tomtat-co-cau"];
	if (m.man === "nhac") {
		return (
			<div
				className="ml-[calc(50%-50vw)] w-screen border-y bg-background"
				data-okr-khung="nhac-buoi-sang"
				key={state}
			>
				<NhacSang hinh={m.hinh} />
			</div>
		);
	}
	if (m.man === "suc-khoe") {
		return (
			<KhungUngDung key={state} trang="toan-canh" vai="day-du">
				<QuanTriTomTat hinh={m.hinh} />
			</KhungUngDung>
		);
	}
	return (
		<KhungUngDung
			key={state}
			nguoi="Trần Văn Hùng"
			trang="theo-don-vi"
			vai="chi-okr"
		>
			<BangHopTuan
				chuaCapNhat={m.hinh === "chua-cap-nhat"}
				khoi={<KhoiTomTat hinh={m.hinh} />}
			/>
		</KhungUngDung>
	);
}
