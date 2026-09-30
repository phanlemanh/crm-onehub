"use client";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { KhungUngDung } from "../ban-mau-okr/phan-chung";
import { MUC_TIEU } from "../tro-ly-okr-de-xuat/du-lieu";
import {
	CotMau,
	FormDeal,
	FormKr,
	FormMucTieu,
	HoiLai,
	KhungMucTieuNen,
	Ngan,
} from "./ngan";

const MAN = [
	"ST-khung-deal",
	"ST-khung-tao-muc-tieu",
	"ST-khung-sua-muc-tieu",
	"ST-khung-them-kr",
	"ST-khung-sua-kr",
	"ST-khung-cot-muc-tieu",
	"ST-khung-cot-kr",
	"ST-khung-hoi-lai",
	"ST-khung-url-sai",
] as const;

type Man = (typeof MAN)[number];

function laMan(s: string): s is Man {
	return MAN.some((m) => m === s);
}

function NoiDung({ man }: { man: Man }) {
	switch (man) {
		case "ST-khung-deal":
			return (
				<Ngan
					tieuDe="Thoả thuận mới"
					moTa="Mỗi thoả thuận thuộc về một công ty và có một người đứng tên phụ trách."
					chinh="Thêm thoả thuận"
					tat
					dauVet={{ "data-ngan-deal": "moi" }}
				>
					<FormDeal />
				</Ngan>
			);
		case "ST-khung-tao-muc-tieu":
			return (
				<Ngan
					tieuDe="Thêm mục tiêu"
					chinh="Tạo mục tiêu"
					tat
					dauVet={{ "data-hop-thoai-muc-tieu": "moi" }}
				>
					<FormMucTieu moi nutGopY={false} />
				</Ngan>
			);
		case "ST-khung-sua-muc-tieu":
		case "ST-khung-hoi-lai":
			return (
				<>
					<KhungMucTieuNen />
					<Ngan
						tieuDe="Sửa mục tiêu"
						chinh="Lưu"
						tat={man === "ST-khung-sua-muc-tieu"}
						dauVet={{ "data-hop-thoai-muc-tieu": "mt-1" }}
					>
						<FormMucTieu moi={false} nutGopY />
					</Ngan>
					{man === "ST-khung-hoi-lai" ? <HoiLai /> : null}
				</>
			);
		case "ST-khung-them-kr":
			return (
				<>
					<KhungMucTieuNen />
					<Ngan
						tieuDe="Thêm KR"
						moTa={MUC_TIEU.ten}
						chinh="Thêm KR"
						tat
						dauVet={{ "data-hop-thoai-kr": "moi" }}
					>
						<FormKr moi nutGopY={false} />
					</Ngan>
				</>
			);
		case "ST-khung-sua-kr":
			return (
				<>
					<KhungMucTieuNen />
					<Ngan
						tieuDe="Sửa KR"
						moTa={MUC_TIEU.ten}
						chinh="Lưu"
						tat
						dauVet={{ "data-hop-thoai-kr": "kr-1" }}
					>
						<FormKr moi={false} nutGopY />
					</Ngan>
				</>
			);
		case "ST-khung-cot-muc-tieu":
			return (
				<>
					<KhungMucTieuNen />
					<Ngan
						tieuDe="Sửa mục tiêu"
						chinh="Lưu"
						tat
						cot={<CotMau chiKr={false} />}
						dauVet={{ "data-hop-thoai-muc-tieu": "mt-1" }}
					>
						<FormMucTieu moi={false} nutGopY={false} />
					</Ngan>
				</>
			);
		case "ST-khung-cot-kr":
			return (
				<>
					<KhungMucTieuNen />
					<Ngan
						tieuDe="Sửa KR"
						moTa={MUC_TIEU.ten}
						chinh="Lưu"
						tat
						cot={<CotMau chiKr />}
						dauVet={{ "data-hop-thoai-kr": "kr-1" }}
					>
						<FormKr moi={false} nutGopY={false} />
					</Ngan>
				</>
			);
		case "ST-khung-url-sai":
			return (
				<>
					<KhungMucTieuNen />
					<Empty data-url-sai>
						<EmptyHeader>
							<EmptyTitle>Không ngăn nào mở</EmptyTitle>
							<EmptyDescription>
								URL trỏ tới một KR không còn trong Mục tiêu này; khoá bị xoá
								khỏi URL, khung Mục tiêu vẫn mở.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				</>
			);
	}
}

export function KhungTaoOkrNhuDealMau({ state }: { state: string }) {
	const man: Man = laMan(state) ? state : "ST-khung-sua-kr";
	return (
		<KhungUngDung key={man} trang="theo-don-vi" vai="day-du">
			<NoiDung man={man} />
		</KhungUngDung>
	);
}
