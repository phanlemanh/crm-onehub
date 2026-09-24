"use client";

import SendAlt from "@carbon/icons-react/es/SendAlt";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { Spinner } from "@crm/ui/components/spinner";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { THONG_BAO as THONG_BAO_CU } from "../nhac-qua-zalo/du-lieu";
import { KhoiKenh, KhoiMa } from "../nhac-qua-zalo/thong-bao";
import { type Buoc, CacBuoc } from "./buoc";
import { TEN_BOT, type ThongBaoMoi } from "./du-lieu";

function TenBot() {
	return (
		<span className="font-medium" translate="no">
			{TEN_BOT}
		</span>
	);
}

function buocNoi(du: ThongBaoMoi): Buoc[] {
	const { lienKet } = du;
	const daCoMa = lienKet.loai === "ma-cho";
	return [
		{
			id: "tim-bot",
			trangThai: daCoMa ? "xong" : "dang",
			tieuDe: (
				<>
					Mở Zalo, tìm <TenBot />
				</>
			),
			moTa: "Gõ đúng tên này vào ô tìm kiếm của Zalo, rồi bấm Nhắn tin.",
		},
		{
			id: "lay-ma",
			trangThai: daCoMa ? "xong" : "dang",
			tieuDe:
				lienKet.loai === "ma-het-han"
					? "Mã đã hết hạn — lấy mã mới"
					: "Lấy mã nối",
			moTa: daCoMa ? undefined : "Mã có 6 số, sống 15 phút.",
			than: daCoMa ? undefined : (
				<Button size="sm">
					{lienKet.loai === "ma-het-han" ? "Tạo mã mới" : "Nối Zalo"}
				</Button>
			),
		},
		{
			id: "nhan-ma",
			trangThai: daCoMa ? "dang" : "cho",
			tieuDe: "Nhắn mã cho bot",
			moTa: daCoMa ? undefined : "Nối xong trang này tự chuyển sang «Đã nối».",
			than: daCoMa ? <KhoiMa lienKet={lienKet} tenBot={TEN_BOT} /> : undefined,
		},
	];
}

function DaNoi({ du }: { du: ThongBaoMoi }) {
	if (du.lienKet.loai !== "da-noi") return null;
	return (
		<div className="flex flex-col gap-3">
			<div className="flex flex-wrap items-center gap-3">
				<StatusIndicator
					tone="success"
					className="text-sm"
					label={
						<>
							Đã nối · <span translate="no">{du.lienKet.tenZalo}</span>
						</>
					}
				/>
				<div className="ml-auto flex gap-2">
					<Button variant="outline" size="sm" disabled={du.guiThu === "dang"}>
						{du.guiThu === "dang" ? (
							<Spinner data-icon="inline-start" />
						) : (
							<Icon icon={SendAlt} data-icon="inline-start" />
						)}
						{du.guiThu === "dang" ? "Đang gửi…" : "Gửi thử nhắc ngay"}
					</Button>
					<Button variant="outline" size="sm">
						Gỡ
					</Button>
				</div>
			</div>
			{du.guiThu === "xong" ? (
				<StatusIndicator
					tone="success"
					size="sm"
					label="Đã gửi tin thử qua Zalo. Mở Zalo để xem."
				/>
			) : null}
			{du.guiThu === "loi" ? (
				<p role="alert" className="text-destructive text-xs">
					Chưa gửi được tin thử. Thử lại.
				</p>
			) : null}
		</div>
	);
}

export function TrangThongBaoMoi({ du }: { du: ThongBaoMoi }) {
	const kenh =
		du.lienKet.loai === "da-noi"
			? THONG_BAO_CU["ST-thong-bao-da-noi"]
			: THONG_BAO_CU["ST-thong-bao-chua-noi"];
	return (
		<main className="flex min-w-0 flex-1 flex-col px-(--spacing-page-inline) pt-(--spacing-page-top) pb-(--spacing-page-bottom)">
			<div className="mx-auto flex w-full max-w-(--container-page) flex-col gap-(--spacing-page-gap)">
				<header className="flex flex-col gap-1 px-(--spacing-block-inline)">
					<h1 className="font-medium text-xl">Thông báo của bạn</h1>
					<p className="text-muted-foreground text-sm">
						Chỉ áp cho bạn. Mỗi sáng 08:30 máy gom việc cần để ý và nhắn bạn ở
						một kênh.
					</p>
				</header>
				<section
					aria-labelledby="khoi-zalo"
					className="flex flex-col gap-3 border-t px-(--spacing-block-inline) pt-5"
				>
					<h2 id="khoi-zalo" className="font-medium text-sm">
						Zalo
					</h2>
					{du.lienKet.loai === "da-noi" ? (
						<DaNoi du={du} />
					) : (
						<CacBuoc nhan="Ba bước nối Zalo" buoc={buocNoi(du)} />
					)}
				</section>
				<section
					aria-labelledby="khoi-kenh"
					className="flex flex-col gap-3 border-t px-(--spacing-block-inline) pt-5"
				>
					<h2 id="khoi-kenh" className="font-medium text-sm">
						Nhận nhắc việc qua
					</h2>
					<KhoiKenh du={kenh} />
				</section>
			</div>
		</main>
	);
}
