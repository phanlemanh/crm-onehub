"use client";

import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@crm/ui/components/breadcrumb";
import { Card, CardContent } from "@crm/ui/components/card";
import Link from "next/link";
import { NHAN_TAB, type TabOkr } from "./du-lieu";
import { type DauTrang, duongTrang, TrangMucTieu } from "./khung";

const KHONG_SUA =
	"Bạn xem được Kinh doanh vùng 1 nhưng không thêm mục tiêu được: chỉ trưởng đơn vị này, trưởng đơn vị cấp trên và quản trị làm được.";
const KHONG_DAN =
	"Bạn chưa dẫn đơn vị nào nên chưa thêm được mục tiêu: mục tiêu thuộc về đơn vị và do trưởng đơn vị đặt.";
const SOAN_HET_LUOT = "Đơn vị đã dùng hết lượt soạn của chu kỳ này.";

type Man = DauTrang;

const thao = (tab: TabOkr): Man => ({
	tab,
	donVi: "cskh",
	tenDonVi: "Chăm sóc khách hàng",
	duoc: true,
	lyDo: null,
	phaLapKeHoach: true,
	soanKhoa: null,
	nguoi: "Võ Phương Thảo",
});

const MAN = {
	"ST-dhk-don-vi": thao("theo-don-vi"),
	"ST-dhk-cua-toi": thao("cua-toi"),
	"ST-dhk-cap-nhat-tuan": thao("cua-toi"),
	"ST-dhk-toan-canh": thao("toan-canh"),
	"ST-dhk-hoi-y": thao("hoi-y"),
	"ST-dhk-suc-khoe": thao("toan-canh"),
	"ST-dhk-menu": { ...thao("theo-don-vi"), menuMo: true },
	"ST-dhk-soan": { ...thao("theo-don-vi"), soanKhoa: SOAN_HET_LUOT },
	"ST-dhk-khong-quyen": {
		...thao("theo-don-vi"),
		donVi: "kd1",
		tenDonVi: "Kinh doanh vùng 1",
		duoc: false,
		lyDo: KHONG_SUA,
		nguoi: "Bùi Thu Nga",
	},
	"ST-dhk-khong-dan": {
		...thao("cua-toi"),
		donVi: null,
		tenDonVi: "OneHub",
		duoc: false,
		lyDo: KHONG_DAN,
		nguoi: "Bùi Thu Nga",
	},
} satisfies Record<string, Man>;

function Than({ state, d }: { state: string; d: DauTrang }) {
	if (state === "ST-dhk-suc-khoe")
		return (
			<div className="flex flex-col gap-4">
				<Breadcrumb>
					<BreadcrumbList>
						<BreadcrumbItem>
							<BreadcrumbLink asChild>
								<Link href={duongTrang("ST-dhk-toan-canh", d.donVi)}>
									{NHAN_TAB["toan-canh"]}
								</Link>
							</BreadcrumbLink>
						</BreadcrumbItem>
						<BreadcrumbSeparator />
						<BreadcrumbItem>
							<BreadcrumbPage>Sức khoẻ chương trình</BreadcrumbPage>
						</BreadcrumbItem>
					</BreadcrumbList>
				</Breadcrumb>
				<GiuCho cau="Thân trang Sức khoẻ chương trình giữ như app hôm nay." />
			</div>
		);
	if (d.tab === "theo-don-vi")
		return (
			<GiuCho
				cau={`Thân trang Theo đơn vị của ${d.tenDonVi} giữ như app hôm nay (DH2 dựng lại sau), chỉ bỏ ba nút tạo, nhập, soạn ở hàng nút vì chúng đã lên đầu trang.`}
			/>
		);
	return (
		<GiuCho
			cau={`Thân thẻ ${NHAN_TAB[d.tab]} giữ như app hôm nay — lượt này chỉ đổi đầu trang.`}
		/>
	);
}

function GiuCho({ cau }: { cau: string }) {
	return (
		<Card>
			<CardContent className="text-muted-foreground text-sm">{cau}</CardContent>
		</Card>
	);
}

export function DieuHuongKhuMucTieuMau({ state }: { state: string }) {
	const man: Man =
		state in MAN ? MAN[state as keyof typeof MAN] : MAN["ST-dhk-don-vi"];
	const d: DauTrang = man;
	return (
		<TrangMucTieu d={d} key={state}>
			<Than d={d} state={state} />
		</TrangMucTieu>
	);
}
