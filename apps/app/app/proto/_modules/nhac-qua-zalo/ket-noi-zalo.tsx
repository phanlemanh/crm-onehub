import Warning from "@carbon/icons-react/es/Warning";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { EntityLogo } from "@crm/ui/components/entity-logo";
import { Icon } from "@crm/ui/components/icon";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import type { KetNoiMau } from "./du-lieu";

function DanhSachNguoi({ du }: { du: KetNoiMau }) {
	const daNoi = du.nguoi.filter((n) => n.tenZalo !== null).length;
	return (
		<section
			aria-labelledby="ai-da-noi"
			className="flex flex-col gap-3 border-t px-(--spacing-block-inline) pt-5"
		>
			<div className="flex items-end justify-between gap-4">
				<div>
					<h2 id="ai-da-noi" className="font-medium text-sm">
						{daNoi}/{du.nguoi.length} người đã nối Zalo
					</h2>
					<p className="text-muted-foreground text-xs">
						Người chưa nối vẫn nhận nhắc qua Slack. Mỗi người tự nối ở Thông báo
						của bạn.
					</p>
				</div>
				<Button variant="outline" size="sm">
					Nối Zalo của tôi
				</Button>
			</div>
			<ul className="flex flex-col divide-y rounded-lg border">
				{du.nguoi.map((n) => (
					<li
						key={n.ten}
						className="flex items-center gap-3 px-(--spacing-block-inline) py-3"
					>
						<span className="min-w-0 flex-1 truncate text-sm" translate="no">
							{n.ten}
						</span>
						{n.tenZalo ? (
							<span
								className="truncate text-muted-foreground text-xs"
								translate="no"
							>
								{n.tenZalo}
							</span>
						) : null}
						<StatusIndicator
							size="sm"
							tone={n.tenZalo ? "success" : "neutral"}
							label={n.tenZalo ? "Đã nối" : "Chưa nối"}
							className="w-20 shrink-0"
						/>
					</li>
				))}
			</ul>
		</section>
	);
}

export function TrangKetNoiZalo({ du }: { du: KetNoiMau }) {
	return (
		<main className="flex min-w-0 flex-1 flex-col px-(--spacing-page-inline) pt-(--spacing-page-top) pb-(--spacing-page-bottom)">
			<div className="mx-auto flex w-full max-w-(--container-page) flex-col gap-(--spacing-page-gap)">
				<header className="flex flex-col gap-2 px-(--spacing-block-inline)">
					<div className="flex items-center gap-3">
						<EntityLogo name="Zalo" size="default" />
						<h1 className="font-medium text-xl" translate="no">
							Zalo
						</h1>
						<span className="ml-auto">
							{du.bat ? (
								<StatusIndicator
									tone={du.im ? "warning" : "success"}
									size="sm"
									label={
										<>
											<span translate="no">{du.tenBot}</span> · trả lời lần cuối{" "}
											{du.pollCuoi}
										</>
									}
								/>
							) : (
								<StatusIndicator size="sm" label="Chưa bật" />
							)}
						</span>
					</div>
					<p className="text-muted-foreground text-sm">
						Bot Zalo gửi nhắc việc buổi sáng cho từng người trong đội.
					</p>
				</header>
				<section className="flex flex-col gap-2 border-t px-(--spacing-block-inline) pt-5">
					<h2 className="font-medium text-sm">Mang về</h2>
					<p className="text-muted-foreground text-sm">
						Mã nối mà mỗi người nhắn cho bot. Không đọc hay lưu tin nào khác.
					</p>
					<h2 className="mt-3 font-medium text-sm">Gửi đi</h2>
					<p className="text-muted-foreground text-sm">
						Tin nhắc việc buổi sáng, riêng cho người đã nối. Không nhắn khách,
						không nhắn nhóm.
					</p>
				</section>
				{du.bat && du.im ? (
					<div className="px-(--spacing-block-inline)">
						<Alert variant="warning">
							<Icon icon={Warning} />
							<AlertTitle>Bot không trả lời từ {du.pollCuoi}</AlertTitle>
							<AlertDescription>
								Tác tử có thể đang tắt. Người đang chờ nối sẽ không nhận được
								xác nhận, và nhắc sáng mai có thể không đi.
							</AlertDescription>
						</Alert>
					</div>
				) : null}
				{du.bat ? (
					<DanhSachNguoi du={du} />
				) : (
					<section className="flex flex-col gap-2 border-t px-(--spacing-block-inline) pt-5">
						<h2 className="font-medium text-sm">Cách bật</h2>
						<ol className="flex list-decimal flex-col gap-1 pl-5 text-muted-foreground text-sm">
							<li>Tạo một bot ở bot.zaloplatforms.com và lấy token.</li>
							<li>
								Đặt <code translate="no">ZALO_BOT_TOKEN</code> vào tệp .env ở
								gốc máy chủ, rồi khởi động lại tác tử.
							</li>
							<li>Trong một phút trang này chuyển sang đang chạy.</li>
						</ol>
					</section>
				)}
			</div>
		</main>
	);
}
