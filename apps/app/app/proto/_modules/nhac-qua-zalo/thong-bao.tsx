"use client";

import Copy from "@carbon/icons-react/es/Copy";
import Warning from "@carbon/icons-react/es/Warning";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "@crm/ui/components/alert-dialog";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { Skeleton } from "@crm/ui/components/skeleton";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { useState } from "react";
import type { KenhUuTien, LienKetMau, ThongBaoMau } from "./du-lieu";

const MO_TA_KENH = {
	AUTO: "Zalo khi bạn đã nối Zalo, không thì Slack.",
	ZALO: "Chỉ Zalo. Zalo không dùng được thì tin đi qua Slack và trang này báo cho bạn.",
	SLACK:
		"Chỉ Slack. Slack không dùng được thì tin đi qua Zalo và trang này báo cho bạn.",
} satisfies Record<KenhUuTien, string>;

const TEN_KENH = { zalo: "Zalo", slack: "Slack" } as const;

function nhomMa(ma: string): string {
	return `${ma.slice(0, 3)} ${ma.slice(3)}`;
}

export function KhoiMa({
	lienKet,
	tenBot,
}: {
	lienKet: Extract<LienKetMau, { loai: "ma-cho" }>;
	tenBot: string;
}) {
	return (
		<div className="flex flex-col gap-3 rounded-lg border p-4">
			<p className="text-sm">
				Nhắn mã này cho <span translate="no">{tenBot}</span> trên Zalo.
			</p>
			<div className="flex flex-wrap items-center gap-3">
				<output
					aria-label={`Mã nối Zalo ${lienKet.ma.split("").join(" ")}`}
					className="font-medium font-mono text-3xl tabular-nums tracking-widest"
				>
					{nhomMa(lienKet.ma)}
				</output>
				<Button variant="outline" size="sm">
					<Icon icon={Copy} data-icon="inline-start" />
					Chép mã
				</Button>
			</div>
			<StatusIndicator
				busy
				size="sm"
				label={`Đang chờ bạn nhắn · hết hạn lúc ${lienKet.hetHanLuc}`}
			/>
		</div>
	);
}

function KhoiZalo({ du }: { du: ThongBaoMau }) {
	const { lienKet } = du;

	if (!du.zaloBat) {
		return (
			<p className="text-muted-foreground text-sm">
				Zalo chưa bật cho xưởng này. Nhờ quản trị viên bật trong Kết nối › Zalo.
			</p>
		);
	}

	if (lienKet.loai === "da-noi") {
		return (
			<div className="flex flex-wrap items-center gap-3">
				<StatusIndicator
					tone="success"
					className="text-sm"
					label={
						<>
							Đã nối · <span translate="no">{lienKet.tenZalo}</span>
						</>
					}
				/>
				<AlertDialog>
					<AlertDialogTrigger asChild>
						<Button variant="outline" size="sm" className="ml-auto">
							Gỡ
						</Button>
					</AlertDialogTrigger>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								Gỡ Zalo khỏi tài khoản của bạn?
							</AlertDialogTitle>
							<AlertDialogDescription>
								{du.uuTien === "ZALO"
									? "Bạn đang chọn nhận qua Zalo. Sau khi gỡ, nhắc việc sẽ về Slack và lựa chọn của bạn đổi thành Tự động."
									: "Bot sẽ không nhắn cho bạn nữa. Bạn có thể nối lại bất cứ lúc nào."}
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel>Giữ nguyên</AlertDialogCancel>
							<AlertDialogAction variant="destructive">
								Gỡ Zalo
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		);
	}

	if (lienKet.loai === "ma-cho") {
		return <KhoiMa lienKet={lienKet} tenBot={du.tenBot} />;
	}

	return (
		<div className="flex flex-wrap items-center gap-3">
			<p className="text-muted-foreground text-sm">
				{lienKet.loai === "ma-het-han"
					? "Mã đã hết hạn."
					: "Nhận nhắc việc trên Zalo. Bấm nối, rồi nhắn mã 6 số cho bot."}
			</p>
			<Button size="sm" className="ml-auto">
				{lienKet.loai === "ma-het-han" ? "Tạo mã mới" : "Nối Zalo"}
			</Button>
		</div>
	);
}

function lyDoKhoa(du: ThongBaoMau, kenh: KenhUuTien): string | null {
	if (kenh === "ZALO" && !du.zaloBat) return "chưa bật cho xưởng.";
	if (kenh === "ZALO" && du.lienKet.loai !== "da-noi") return "bạn chưa nối.";
	if (kenh === "SLACK" && !du.slackKhop)
		return "chưa nhận ra bạn — nhờ quản trị viên ghép người ở Kết nối › Slack.";
	return null;
}

export function KhoiKenh({ du }: { du: ThongBaoMau }) {
	const [chon, setChon] = useState<KenhUuTien>(du.uuTien);
	const khoaZalo = lyDoKhoa(du, "ZALO");
	const khoaSlack = lyDoKhoa(du, "SLACK");
	const lyDo = [khoaZalo, khoaSlack].filter((d) => d !== null);

	return (
		<div className="flex flex-col gap-3">
			<ToggleGroup
				type="single"
				variant="outline"
				spacing={0}
				value={chon}
				onValueChange={(v) => v && setChon(v as KenhUuTien)}
				aria-label="Nhận nhắc việc qua"
			>
				<ToggleGroupItem value="AUTO">Tự động</ToggleGroupItem>
				<ToggleGroupItem
					value="ZALO"
					disabled={khoaZalo !== null}
					aria-describedby={khoaZalo ? "ly-do-zalo" : undefined}
				>
					Zalo
				</ToggleGroupItem>
				<ToggleGroupItem
					value="SLACK"
					disabled={khoaSlack !== null}
					aria-describedby={khoaSlack ? "ly-do-slack" : undefined}
				>
					Slack
				</ToggleGroupItem>
			</ToggleGroup>
			<p className="text-sm">{MO_TA_KENH[chon]}</p>
			{lyDo.length > 0 ? (
				<ul className="flex flex-col gap-1 text-muted-foreground text-xs">
					{khoaZalo ? <li id="ly-do-zalo">Zalo: {khoaZalo}</li> : null}
					{khoaSlack ? <li id="ly-do-slack">Slack: {khoaSlack}</li> : null}
				</ul>
			) : null}
			{du.lech && du.kenhSeDung ? (
				<Alert variant="warning">
					<Icon icon={Warning} />
					<AlertTitle>
						Nhắc sáng mai sẽ qua {TEN_KENH[du.kenhSeDung]}
					</AlertTitle>
					<AlertDescription>
						Bạn chọn {du.uuTien === "SLACK" ? "Slack" : "Zalo"} nhưng kênh đó
						chưa dùng được, nên tin đi đường còn lại để bạn không lỡ việc.
					</AlertDescription>
				</Alert>
			) : null}
			{du.luuLoi ? (
				<p role="alert" className="text-destructive text-xs">
					Không lưu được lựa chọn. Thử lại.
				</p>
			) : null}
		</div>
	);
}

export function TrangThongBao({ du }: { du: ThongBaoMau | "dang-tai" }) {
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
					{du === "dang-tai" ? (
						<Skeleton className="h-8 w-full" />
					) : (
						<KhoiZalo du={du} />
					)}
				</section>
				<section
					aria-labelledby="khoi-kenh"
					className="flex flex-col gap-3 border-t px-(--spacing-block-inline) pt-5"
				>
					<h2 id="khoi-kenh" className="font-medium text-sm">
						Nhận nhắc việc qua
					</h2>
					{du === "dang-tai" ? (
						<Skeleton className="h-8 w-64" />
					) : (
						<KhoiKenh du={du} />
					)}
				</section>
			</div>
		</main>
	);
}
