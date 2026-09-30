"use client";

import { KhungUngDung } from "../ban-mau-okr/phan-chung";
import { KY_SOAN } from "./du-lieu";
import { DanhSachCuoc, type HinhNut, KhungDonVi } from "./khung-don-vi";
import { type HinhSoan, ManSoan } from "./man-soan";
import { type HinhPhu, ManPhu } from "./phu";

type Man =
	| { man: "nut"; hinh: HinhNut }
	| { man: "soan"; hinh: HinhSoan }
	| { man: "cuoc"; rong: boolean }
	| { man: "phu"; hinh: HinhPhu };

const MAN_THEO_STATE = {
	"ST-soan-nut": { man: "nut", hinh: "nut" },
	"ST-soan-nut-tiep": { man: "nut", hinh: "nut-tiep" },
	"ST-soan-nut-an": { man: "nut", hinh: "nut-an" },
	"ST-soan-nut-het-cuoc": { man: "nut", hinh: "nut-het-cuoc" },
	"ST-soan-nut-het-tran": { man: "nut", hinh: "nut-het-tran" },
	"ST-soan-mo-dau": { man: "soan", hinh: "mo-dau" },
	"ST-soan-thieu-boi-canh": { man: "soan", hinh: "thieu-boi-canh" },
	"ST-soan-dang-tra-loi": { man: "soan", hinh: "dang-tra-loi" },
	"ST-soan-ban-nhap": { man: "soan", hinh: "ban-nhap" },
	"ST-soan-dong-sua": { man: "soan", hinh: "dong-sua" },
	"ST-soan-dong-da-quyet": { man: "soan", hinh: "dong-da-quyet" },
	"ST-soan-sua-qua-chat": { man: "soan", hinh: "sua-qua-chat" },
	"ST-soan-dong-bi-loai": { man: "soan", hinh: "dong-bi-loai" },
	"ST-soan-loi": { man: "soan", hinh: "loi" },
	"ST-soan-het-luot": { man: "soan", hinh: "het-luot" },
	"ST-soan-dua-vao-xac-nhan": { man: "soan", hinh: "dua-vao-xac-nhan" },
	"ST-soan-dua-vao-thieu-dich": { man: "soan", hinh: "dua-vao-thieu-dich" },
	"ST-soan-da-dua-vao": { man: "soan", hinh: "da-dua-vao" },
	"ST-soan-dua-vao-loi": { man: "soan", hinh: "dua-vao-loi" },
	"ST-soan-hep": { man: "soan", hinh: "hep" },
	"ST-cuoc-danh-sach": { man: "cuoc", rong: false },
	"ST-cuoc-rong": { man: "cuoc", rong: true },
	"ST-tochuc-mo-ta": { man: "phu", hinh: "tochuc-mo-ta" },
	"ST-tochuc-chuc-danh": { man: "phu", hinh: "tochuc-chuc-danh" },
	"ST-kho-tao-chien-luoc": { man: "phu", hinh: "kho-tao-chien-luoc" },
	"ST-kho-duyet-canh-bao": { man: "phu", hinh: "kho-duyet-canh-bao" },
	"ST-kho-duyet-qua-tran": { man: "phu", hinh: "kho-duyet-qua-tran" },
	"ST-caidat-nac-soan": { man: "phu", hinh: "caidat-nac-soan" },
	"ST-sodo-soan": { man: "phu", hinh: "sodo-soan" },
	"ST-sodo-soan-rong": { man: "phu", hinh: "sodo-soan-rong" },
	"ST-sodo-soan-ngan": { man: "phu", hinh: "sodo-soan-ngan" },
} satisfies Record<string, Man>;

function laState(s: string): s is keyof typeof MAN_THEO_STATE {
	return s in MAN_THEO_STATE;
}

export function SoanOkrCungTroLyMau({ state }: { state: string }) {
	const m: Man = MAN_THEO_STATE[laState(state) ? state : "ST-soan-ban-nhap"];
	if (m.man === "phu") {
		return (
			<div
				className="ml-[calc(50%-50vw)] w-screen border-y bg-background px-4 py-6"
				data-okr-khung="phu"
				key={state}
			>
				<ManPhu hinh={m.hinh} />
			</div>
		);
	}
	const khung = (nut: HinhNut | null, con?: React.ReactNode) => (
		<KhungUngDung
			chuKy={KY_SOAN.ten}
			key={state}
			trang="theo-don-vi"
			vai="day-du"
		>
			<KhungDonVi nut={nut}>{con}</KhungDonVi>
		</KhungUngDung>
	);
	if (m.man === "nut") return khung(m.hinh);
	if (m.man === "cuoc") return khung("nut", <DanhSachCuoc rong={m.rong} />);
	return <ManSoan hinh={m.hinh}>{khung("nut")}</ManSoan>;
}
