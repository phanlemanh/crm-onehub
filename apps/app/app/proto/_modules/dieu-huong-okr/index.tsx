"use client";

import { KhungXuong } from "@crm/ui/components/khung-xuong";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CuaToi } from "./cua-toi";
import { DON_VI, duongTrang, type MaNguoiXem, NGUOI_XEM } from "./du-lieu";
import { TrangMucTieu } from "./khung";
import { type CachXem, TrangDonVi } from "./trang-don-vi";

type Man =
	| {
			man: "don-vi";
			donVi: string;
			xem: MaNguoiXem;
			cachXem: CachXem;
			moChon: boolean;
	  }
	| { man: "cua-toi"; xem: MaNguoiXem }
	| { man: "dang-tai"; xem: MaNguoiXem }
	| { man: "loi"; xem: MaNguoiXem };

const MAN_THEO_STATE = {
	"ST-dh-don-vi": {
		man: "don-vi",
		donVi: "cskh",
		xem: "thao",
		cachXem: "danh-sach",
		moChon: false,
	},
	"ST-dh-chon-don-vi": {
		man: "don-vi",
		donVi: "cskh",
		xem: "thao",
		cachXem: "danh-sach",
		moChon: true,
	},
	"ST-dh-bo-phan": {
		man: "don-vi",
		donVi: "vanhanh",
		xem: "son",
		cachXem: "danh-sach",
		moChon: false,
	},
	"ST-dh-hop-tuan": {
		man: "don-vi",
		donVi: "cskh",
		xem: "thao",
		cachXem: "hop-tuan",
		moChon: false,
	},
	"ST-dh-chua-dat": {
		man: "don-vi",
		donVi: "kho",
		xem: "son",
		cachXem: "danh-sach",
		moChon: false,
	},
	"ST-dh-khong-quyen": {
		man: "don-vi",
		donVi: "kinhdoanh",
		xem: "nga",
		cachXem: "danh-sach",
		moChon: false,
	},
	"ST-dh-cua-toi": { man: "cua-toi", xem: "thao" },
	"ST-dh-cua-toi-thanh-vien": { man: "cua-toi", xem: "nga" },
	"ST-dh-dang-tai": { man: "dang-tai", xem: "thao" },
	"ST-dh-loi": { man: "loi", xem: "thao" },
} satisfies Record<string, Man>;

function NoiDung({ state }: { state: string }) {
	const router = useRouter();
	const tham = useSearchParams();
	const m: Man =
		state in MAN_THEO_STATE
			? MAN_THEO_STATE[state as keyof typeof MAN_THEO_STATE]
			: MAN_THEO_STATE["ST-dh-don-vi"];
	const xem = NGUOI_XEM[m.xem];
	const tuDuong = tham.get("donVi");
	const donViId =
		tuDuong && DON_VI.some((d) => d.id === tuDuong)
			? tuDuong
			: m.man === "don-vi"
				? m.donVi
				: (xem.danId ?? "cskh");

	switch (m.man) {
		case "don-vi":
			return (
				<TrangMucTieu
					donViId={donViId}
					key={`${state}-${donViId}`}
					tab="theo-don-vi"
					xem={xem}
				>
					<TrangDonVi cachXem={m.cachXem} donViId={donViId} moChon={m.moChon} />
				</TrangMucTieu>
			);
		case "cua-toi":
			return (
				<TrangMucTieu donViId={donViId} key={state} tab="cua-toi" xem={xem}>
					<CuaToi xem={xem} />
				</TrangMucTieu>
			);
		case "dang-tai":
			return (
				<TrangMucTieu donViId={donViId} key={state} tab="theo-don-vi" xem={xem}>
					<KhungXuong hinh="tong-quan" />
				</TrangMucTieu>
			);
		case "loi":
			return (
				<TrangMucTieu donViId={donViId} key={state} tab="theo-don-vi" xem={xem}>
					<VungTaiLoi
						moTa="Máy chủ không trả về OKR của đơn vị này. Dữ liệu vẫn còn nguyên; thử lại sau ít giây."
						onThuLai={() => router.push(duongTrang("ST-dh-dang-tai", donViId))}
						tieuDe="Không tải được OKR của đơn vị"
					/>
				</TrangMucTieu>
			);
	}
}

export function DieuHuongOkrMau({ state }: { state: string }) {
	return (
		<Suspense fallback={<KhungXuong hinh="tong-quan" />}>
			<NoiDung state={state} />
		</Suspense>
	);
}
