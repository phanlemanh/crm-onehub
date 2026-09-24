"use client";

import Warning from "@carbon/icons-react/es/Warning";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { EntityLogo } from "@crm/ui/components/entity-logo";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { Input } from "@crm/ui/components/input";
import { Spinner } from "@crm/ui/components/spinner";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { type Buoc, CacBuoc } from "./buoc";
import { type KetNoiMoi, TEN_BOT } from "./du-lieu";

const LOI_TOKEN = {
	"sai-dang":
		"Đây không phải Bot Token. Bot Token có dạng 1234567890:AbC…, khác Secret Token.",
	"zalo-tu-choi":
		"Zalo không nhận token này. Chép lại Bot Token trong Zalo Bot Manager.",
} as const;

function OToken({ du }: { du: KetNoiMoi }) {
	const dangKiem = du.oToken === "dang-kiem";
	const loi =
		du.oToken === "sai-dang" || du.oToken === "zalo-tu-choi"
			? LOI_TOKEN[du.oToken]
			: null;
	return (
		<form className="flex flex-col gap-3">
			<Field data-invalid={loi ? true : undefined}>
				<FieldLabel htmlFor="bot-token">Bot Token</FieldLabel>
				<Input
					id="bot-token"
					type="password"
					autoComplete="off"
					spellCheck={false}
					aria-invalid={loi ? true : undefined}
					defaultValue={du.oToken === "trong" ? "" : "1234567890:AbCdEfGh"}
					placeholder={du.goiToken ? `••••${du.goiToken}` : "1234567890:AbC…"}
					disabled={dangKiem}
				/>
				<div aria-live="polite">
					{loi ? <FieldError>{loi}</FieldError> : null}
				</div>
			</Field>
			<div>
				<Button
					size="sm"
					variant={du.bat ? "outline" : "default"}
					disabled={dangKiem}
				>
					{dangKiem ? <Spinner data-icon="inline-start" /> : null}
					{dangKiem ? "Đang kiểm…" : du.bat ? "Thay token" : "Lưu"}
				</Button>
			</div>
		</form>
	);
}

function buocBat(du: KetNoiMoi): Buoc[] {
	return [
		{
			id: "tao-bot",
			trangThai: "dang",
			tieuDe: "Tạo bot trong Zalo",
			moTa: (
				<>
					Mở app Zalo, tìm OA «Zalo Bot Manager», chọn Tạo bot và đặt tên — tên
					này là tên mọi người tìm để nối.
				</>
			),
		},
		{
			id: "chep-token",
			trangThai: "dang",
			tieuDe: "Chép Bot Token",
			moTa: (
				<>
					Trong Zalo Bot Manager, mở bot vừa tạo và chép Bot Token. Token có
					dạng{" "}
					<code className="font-mono" translate="no">
						1234567890:AbC…
					</code>{" "}
					— không phải Secret Token.
				</>
			),
		},
		{
			id: "dan-token",
			trangThai: "dang",
			tieuDe: "Dán vào đây",
			moTa: "CRM kiểm token với Zalo rồi tự đăng ký nhận tin.",
			than: <OToken du={du} />,
		},
	];
}

function TrangThaiWebhook({ du }: { du: KetNoiMoi }) {
	if (du.webhook === "da-dang-ky") {
		return (
			<StatusIndicator tone="success" size="sm" label="Nhận tin qua webhook" />
		);
	}
	if (du.webhook === "can-https") {
		return (
			<Alert variant="warning">
				<Icon icon={Warning} />
				<AlertTitle>Tin nhắn tới bot chưa về CRM</AlertTitle>
				<AlertDescription>
					Tác tử chưa có địa chỉ https nên Zalo không giao tin về được. Khi thử
					tại máy, chạy{" "}
					<code className="font-mono" translate="no">
						bun run --filter=agent zalo:poll
					</code>
					.
				</AlertDescription>
			</Alert>
		);
	}
	return (
		<Alert variant="warning">
			<Icon icon={Warning} />
			<AlertTitle>Zalo chưa giao tin nhắn về CRM</AlertTitle>
			<AlertDescription>
				Người nhắn mã sẽ không được nối cho tới khi đăng ký lại.
			</AlertDescription>
			{du.quanTri ? (
				<div className="pt-2">
					<Button variant="outline" size="sm">
						Đăng ký lại
					</Button>
				</div>
			) : null}
		</Alert>
	);
}

function BotCuaXuong({ du }: { du: KetNoiMoi }) {
	if (!du.quanTri) {
		return (
			<p className="text-muted-foreground text-sm">
				Chỉ quản trị viên thay được bot.
			</p>
		);
	}
	if (!du.bat) {
		return <CacBuoc nhan="Ba bước bật bot Zalo" buoc={buocBat(du)} />;
	}
	return (
		<div className="flex flex-col gap-4">
			{du.nguonToken === "env" ? (
				<FieldDescription>
					Token đang đặt trong tệp .env của máy chủ. Dán token ở đây để thay.
				</FieldDescription>
			) : null}
			<OToken du={du} />
		</div>
	);
}

export function TrangKetNoiMoi({ du }: { du: KetNoiMoi }) {
	const daNoi = du.nguoi.filter((n) => n.tenZalo !== null).length;
	return (
		<main className="flex min-w-0 flex-1 flex-col px-(--spacing-page-inline) pt-(--spacing-page-top) pb-(--spacing-page-bottom)">
			<div className="mx-auto flex w-full max-w-(--container-page) flex-col gap-(--spacing-page-gap)">
				<header className="flex flex-col gap-2 px-(--spacing-block-inline)">
					<div className="flex items-center gap-3">
						<EntityLogo name="Zalo" />
						<h1 className="font-medium text-xl" translate="no">
							Zalo
						</h1>
						<span className="ml-auto">
							{du.bat ? (
								<StatusIndicator
									tone="success"
									size="sm"
									label={<span translate="no">{TEN_BOT}</span>}
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
				<section
					aria-labelledby="bot-xuong"
					className="flex flex-col gap-3 border-t px-(--spacing-block-inline) pt-5"
				>
					<h2 id="bot-xuong" className="font-medium text-sm">
						Bot của xưởng
					</h2>
					{du.bat ? <TrangThaiWebhook du={du} /> : null}
					<BotCuaXuong du={du} />
				</section>
				{du.bat ? (
					<section
						aria-labelledby="ai-da-noi"
						className="flex flex-col gap-3 border-t px-(--spacing-block-inline) pt-5"
					>
						<div className="flex flex-wrap items-end justify-between gap-4">
							<div>
								<h2 id="ai-da-noi" className="font-medium text-sm">
									{daNoi}/{du.nguoi.length} người đã nối Zalo
								</h2>
								<p className="text-muted-foreground text-xs">
									Người chưa nối vẫn nhận nhắc qua Slack. Mỗi người tự nối ở
									Thông báo của bạn.
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
									<span
										className="min-w-0 flex-1 truncate text-sm"
										translate="no"
									>
										{n.ten}
									</span>
									{n.tenZalo ? (
										<span
											className="hidden truncate text-muted-foreground text-xs sm:inline"
											translate="no"
										>
											{n.tenZalo}
										</span>
									) : null}
									<StatusIndicator
										size="sm"
										tone={n.tenZalo ? "success" : "neutral"}
										label={n.tenZalo ? "Đã nối" : "Chưa nối"}
										className="shrink-0"
									/>
								</li>
							))}
						</ul>
					</section>
				) : null}
			</div>
		</main>
	);
}
