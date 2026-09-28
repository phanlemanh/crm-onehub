"use client";

import { KhungUngDung } from "../ban-mau-okr/phan-chung";
import { type HinhTraoDoi, TraoDoiGhiNhan } from "./ghi-nhan";
import {
	BangKrCoViec,
	type HinhKhungKr,
	HopThoaiCapNhatMoc,
	KhungKr,
	KhungMucTieuNen,
} from "./khung-kr";
import { type HinhMau, MauOkrMan } from "./mau";

type Man =
	| { man: "bang-kr" }
	| { man: "khung-kr"; hinh: HinhKhungKr; vai?: "chi-okr" }
	| { man: "cap-nhat-moc" }
	| { man: "trao-doi"; hinh: HinhTraoDoi; vai?: "chi-okr" }
	| { man: "mau"; hinh: HinhMau }
	| { man: "canh" };

const MAN_THEO_STATE = {
	"ST-bangkr-co-viec": { man: "bang-kr" },
	"ST-khungkr-co-viec": { man: "khung-kr", hinh: "co-viec" },
	"ST-khungkr-them": { man: "khung-kr", hinh: "them" },
	"ST-khungkr-gan": { man: "khung-kr", hinh: "gan" },
	"ST-khungkr-rong": { man: "khung-kr", hinh: "rong" },
	"ST-khungkr-dang-tai": { man: "khung-kr", hinh: "dang-tai" },
	"ST-khungkr-loi": { man: "khung-kr", hinh: "loi" },
	"ST-khungkr-chi-okr": { man: "khung-kr", hinh: "chi-okr", vai: "chi-okr" },
	"ST-khungkr-goc-mat": { man: "khung-kr", hinh: "goc-mat" },
	"ST-khungkr-khoa": { man: "khung-kr", hinh: "khoa" },
	"ST-bangchung-co": { man: "khung-kr", hinh: "bang-chung" },
	"ST-bangchung-rong": { man: "khung-kr", hinh: "bang-chung-rong" },
	"ST-bangchung-sai": { man: "khung-kr", hinh: "bang-chung-sai" },
	"ST-capnhat-moc": { man: "cap-nhat-moc" },
	"ST-traodoi-ghinhan": { man: "trao-doi", hinh: "dong" },
	"ST-traodoi-soan-ghinhan": {
		man: "trao-doi",
		hinh: "soan",
		vai: "chi-okr",
	},
	"ST-mau-danh-sach": { man: "mau", hinh: "danh-sach" },
	"ST-mau-rong": { man: "mau", hinh: "rong" },
	"ST-mau-khong-quyen": { man: "mau", hinh: "khong-quyen" },
	"ST-mau-sheet": { man: "mau", hinh: "sheet" },
	"ST-datmt-chon-mau": { man: "mau", hinh: "chon-mau" },
	"ST-datmt-tu-mau": { man: "mau", hinh: "tu-mau" },
	"ST-canh-chong": { man: "canh" },
} satisfies Record<string, Man>;

function NoiDung({ m }: { m: Man }) {
	switch (m.man) {
		case "bang-kr":
			return <KhungMucTieuNen />;
		case "khung-kr":
			return (
				<>
					<KhungMucTieuNen />
					<KhungKr hinh={m.hinh} />
				</>
			);
		case "cap-nhat-moc":
			return (
				<>
					<KhungMucTieuNen />
					<HopThoaiCapNhatMoc />
				</>
			);
		case "trao-doi":
			return (
				<KhungMucTieuNen tab="trao-doi">
					<TraoDoiGhiNhan hinh={m.hinh} />
				</KhungMucTieuNen>
			);
		case "mau":
			return <MauOkrMan hinh={m.hinh} />;
		case "canh":
			return (
				<>
					<KhungMucTieuNen>
						<BangKrCoViec />
					</KhungMucTieuNen>
					<KhungKr hinh="co-viec" />
				</>
			);
	}
}

export function CanhKrOkrMau({ state }: { state: string }) {
	const m: Man =
		state in MAN_THEO_STATE
			? MAN_THEO_STATE[state as keyof typeof MAN_THEO_STATE]
			: MAN_THEO_STATE["ST-bangkr-co-viec"];
	const chiOkr = "vai" in m && m.vai === "chi-okr";

	if (m.man === "mau" && m.hinh !== "chon-mau" && m.hinh !== "tu-mau") {
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
			nguoi={chiOkr ? "Bùi Thu Nga" : undefined}
			trang="theo-don-vi"
			vai={chiOkr ? "chi-okr" : "day-du"}
		>
			<NoiDung m={m} />
		</KhungUngDung>
	);
}
