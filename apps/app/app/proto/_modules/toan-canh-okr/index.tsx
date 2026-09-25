"use client";

import {
	KhungUngDung,
	type TrangOkr,
	type Vai,
} from "../ban-mau-okr/phan-chung";
import { type HinhDienBien, SheetDienBien } from "./dien-bien";
import { type HinhHopTuan, HopTuan } from "./hop-tuan";
import { type HinhLoc, TheoDonViLoc } from "./loc";
import { type HinhSucKhoe, SucKhoe } from "./suc-khoe";
import {
	type HinhTongQuan,
	TongQuan,
	TongQuanRongCuaNguoi,
	TrangNguoi,
} from "./tong-quan";

type Man =
	| { man: "hop-tuan"; hinh: HinhHopTuan }
	| { man: "suc-khoe"; hinh: HinhSucKhoe }
	| { man: "tong-quan"; hinh: HinhTongQuan }
	| { man: "nguoi"; rong: boolean }
	| { man: "dien-bien"; hinh: HinhDienBien }
	| { man: "loc"; hinh: HinhLoc };

const MAN_THEO_STATE = {
	"ST-hoptuan-codulieu": { man: "hop-tuan", hinh: "co-du-lieu" },
	"ST-hoptuan-tabrieng": { man: "hop-tuan", hinh: "tab-rieng" },
	"ST-hoptuan-yenang": { man: "hop-tuan", hinh: "yen-ang" },
	"ST-hoptuan-tuandau": { man: "hop-tuan", hinh: "tuan-dau" },
	"ST-hoptuan-dangtai": { man: "hop-tuan", hinh: "dang-tai" },
	"ST-hoptuan-loi": { man: "hop-tuan", hinh: "loi" },
	"ST-suckhoe-codulieu": { man: "suc-khoe", hinh: "co-du-lieu" },
	"ST-suckhoe-caidat": { man: "suc-khoe", hinh: "cai-dat" },
	"ST-suckhoe-tuandau": { man: "suc-khoe", hinh: "tuan-dau" },
	"ST-suckhoe-khongquyen": { man: "suc-khoe", hinh: "khong-quyen" },
	"ST-suckhoe-dangtai": { man: "suc-khoe", hinh: "dang-tai" },
	"ST-suckhoe-loi": { man: "suc-khoe", hinh: "loi" },
	"ST-tongquan-khoi": { man: "tong-quan", hinh: "khoi" },
	"ST-tongquan-rong": { man: "tong-quan", hinh: "rong" },
	"ST-tongquan-chiokr": { man: "tong-quan", hinh: "chi-okr" },
	"ST-nguoi-codulieu": { man: "nguoi", rong: false },
	"ST-nguoi-rong": { man: "nguoi", rong: true },
	"ST-dienbien-so": { man: "dien-bien", hinh: "so" },
	"ST-dienbien-moc": { man: "dien-bien", hinh: "moc" },
	"ST-dienbien-chuaco": { man: "dien-bien", hinh: "chua-co" },
	"ST-donvi-loc": { man: "loc", hinh: "co-ket-qua" },
	"ST-donvi-loc-khongkhop": { man: "loc", hinh: "khong-khop" },
} satisfies Record<string, Man>;

type KhungMau = { trang: TrangOkr; vai: Vai; nguoi?: string };

const KHUNG = {
	"hop-tuan": { trang: "theo-don-vi", vai: "chi-okr", nguoi: "Võ Phương Thảo" },
	"suc-khoe": { trang: "toan-canh", vai: "day-du" },
	"tong-quan": { trang: "cua-toi", vai: "day-du" },
	nguoi: { trang: "theo-don-vi", vai: "chi-okr" },
	"dien-bien": { trang: "theo-don-vi", vai: "chi-okr" },
	loc: { trang: "theo-don-vi", vai: "chi-okr" },
} satisfies Record<Man["man"], KhungMau>;

function NoiDung({ m }: { m: Man }) {
	switch (m.man) {
		case "hop-tuan":
			return <HopTuan hinh={m.hinh} />;
		case "suc-khoe":
			return <SucKhoe hinh={m.hinh} />;
		case "tong-quan":
			return <TongQuan hinh={m.hinh} />;
		case "nguoi":
			return m.rong ? <TongQuanRongCuaNguoi /> : <TrangNguoi />;
		case "dien-bien":
			return <SheetDienBien hinh={m.hinh} />;
		case "loc":
			return <TheoDonViLoc hinh={m.hinh} />;
	}
}

export function ToanCanhOkrMau({ state }: { state: string }) {
	const m: Man =
		state in MAN_THEO_STATE
			? MAN_THEO_STATE[state as keyof typeof MAN_THEO_STATE]
			: MAN_THEO_STATE["ST-hoptuan-codulieu"];

	if (m.man === "tong-quan") {
		return (
			<div
				className="ml-[calc(50%-50vw)] w-screen border-y bg-background"
				data-okr-khung="tong-quan"
				key={state}
			>
				<NoiDung m={m} />
			</div>
		);
	}

	const k: KhungMau = KHUNG[m.man];
	return (
		<KhungUngDung key={state} nguoi={k.nguoi} trang={k.trang} vai={k.vai}>
			<NoiDung m={m} />
		</KhungUngDung>
	);
}
