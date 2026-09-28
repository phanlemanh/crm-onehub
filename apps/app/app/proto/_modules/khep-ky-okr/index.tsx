"use client";

import { KhungUngDung, type TrangOkr } from "../ban-mau-okr/phan-chung";
import { CaiDatChuKy, type HinhCaiDat } from "./cai-dat";
import {
	ChamDiem,
	type HinhCham,
	type HinhMangSang,
	MangSang,
	ToanCanhXuat,
} from "./cham";
import { DatOkr, type HinhDat } from "./dat";

type Man =
	| { man: "cham"; hinh: HinhCham }
	| { man: "mang-sang"; hinh: HinhMangSang }
	| { man: "cai-dat"; hinh: HinhCaiDat }
	| { man: "dat"; hinh: HinhDat; trang: TrangOkr }
	| { man: "xuat" };

const MAN_THEO_STATE = {
	"ST-cham-donvi": { man: "cham", hinh: "don-vi" },
	"ST-cham-sheet": { man: "cham", hinh: "sheet" },
	"ST-cham-lydo": { man: "cham", hinh: "ly-do" },
	"ST-cham-daxong": { man: "cham", hinh: "da-xong" },
	"ST-cham-chiokr": { man: "cham", hinh: "chi-okr" },
	"ST-cham-dadong": { man: "cham", hinh: "da-dong" },
	"ST-cham-rong": { man: "cham", hinh: "rong" },
	"ST-cham-dangtai": { man: "cham", hinh: "dang-tai" },
	"ST-cham-loi": { man: "cham", hinh: "loi" },
	"ST-mangsang-hoi": { man: "mang-sang", hinh: "hoi" },
	"ST-mangsang-khongky": { man: "mang-sang", hinh: "khong-ky" },
	"ST-caidat-ra": { man: "cai-dat", hinh: "ra" },
	"ST-caidat-dong-chan": { man: "cai-dat", hinh: "dong-chan" },
	"ST-caidat-dong": { man: "cai-dat", hinh: "dong" },
	"ST-caidat-molai": { man: "cai-dat", hinh: "mo-lai" },
	"ST-kr-lydo": { man: "dat", hinh: "ly-do", trang: "theo-don-vi" },
	"ST-kr-hoi": { man: "dat", hinh: "hoi", trang: "theo-don-vi" },
	"ST-muctieu-doitrong": {
		man: "dat",
		hinh: "doi-trong",
		trang: "theo-don-vi",
	},
	"ST-dai-ra": { man: "dat", hinh: "dai-ra", trang: "cua-toi" },
	"ST-toancanh-xuat": { man: "xuat" },
} satisfies Record<string, Man>;

function NoiDung({ m }: { m: Man }) {
	switch (m.man) {
		case "cham":
			return <ChamDiem hinh={m.hinh} />;
		case "mang-sang":
			return <MangSang hinh={m.hinh} />;
		case "cai-dat":
			return <CaiDatChuKy hinh={m.hinh} />;
		case "dat":
			return <DatOkr hinh={m.hinh} />;
		case "xuat":
			return <ToanCanhXuat />;
	}
}

function trangCua(m: Man): TrangOkr {
	if (m.man === "dat") return m.trang;
	if (m.man === "xuat") return "toan-canh";
	return "theo-don-vi";
}

export function KhepKyOkrMau({ state }: { state: string }) {
	const m: Man =
		state in MAN_THEO_STATE
			? MAN_THEO_STATE[state as keyof typeof MAN_THEO_STATE]
			: MAN_THEO_STATE["ST-cham-donvi"];

	if (m.man === "cai-dat") {
		return (
			<div
				className="ml-[calc(50%-50vw)] w-screen border-y bg-background px-4 py-6"
				data-okr-khung="cai-dat"
				key={state}
			>
				<NoiDung m={m} />
			</div>
		);
	}

	return (
		<KhungUngDung
			key={state}
			nguoi={
				m.man === "cham" && m.hinh === "chi-okr" ? "Bùi Thu Nga" : undefined
			}
			trang={trangCua(m)}
			vai={m.man === "cham" && m.hinh === "chi-okr" ? "chi-okr" : "day-du"}
		>
			<NoiDung m={m} />
		</KhungUngDung>
	);
}
