import Warning from "@carbon/icons-react/es/Warning";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { EntityLogo } from "@crm/ui/components/entity-logo";
import { Icon } from "@crm/ui/components/icon";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { StepList, StepListItem } from "@crm/ui/components/step-list";
import type { Locale } from "@crm/ui/lib/locale";
import Link from "next/link";
import { nhacQuaZaloMessages } from "@/lib/messages/nhac-qua-zalo";
import { OToken } from "./o-token";
import {
	type TrangThaiWebhook,
	TrangThaiWebhookZalo,
} from "./trang-thai-webhook";

export type NguoiNoi = { id: string; ten: string; tenZalo: string | null };

export type KetNoiZaloDu = {
	bat: boolean;
	tenBot: string | null;
	pollCuoi: string | null;
	im: boolean;
	daNoi: number;
	tong: number;
	nguoi: NguoiNoi[];
	canManage: boolean;
	nguonToken: "man-hinh" | "env" | null;
	goiToken: string | null;
	webhook: TrangThaiWebhook;
};

const BUOC_DAN_TOKEN = 3;

function BotCuaXuong({ du, locale }: { du: KetNoiZaloDu; locale: Locale }) {
	const t = nhacQuaZaloMessages(locale).ketNoi;
	if (!du.canManage) {
		return <p className="text-muted-foreground text-sm">{t.chiQuanTri}</p>;
	}
	if (!du.bat) {
		return (
			<StepList activeStep={BUOC_DAN_TOKEN} label={t.baBuoc}>
				<StepListItem
					step={1}
					activeStep={BUOC_DAN_TOKEN}
					title={t.buoc1TieuDe}
					description={t.buoc1MoTa}
				/>
				<StepListItem
					step={2}
					activeStep={BUOC_DAN_TOKEN}
					title={t.buoc2TieuDe}
					description={t.buoc2MoTa}
				/>
				<StepListItem
					step={BUOC_DAN_TOKEN}
					activeStep={BUOC_DAN_TOKEN}
					title={t.buoc3TieuDe}
					description={t.buoc3MoTa}
				>
					<OToken daBat={false} goiToken={null} />
				</StepListItem>
			</StepList>
		);
	}
	return (
		<div className="flex flex-col gap-4">
			{du.nguonToken === "env" ? (
				<p className="text-muted-foreground text-sm">{t.tokenEnv}</p>
			) : null}
			<OToken daBat goiToken={du.goiToken} />
		</div>
	);
}

export function KetNoiZaloThan({
	du,
	locale,
	hrefThongBao,
}: {
	du: KetNoiZaloDu;
	locale: Locale;
	hrefThongBao: string;
}) {
	const t = nhacQuaZaloMessages(locale).ketNoi;
	return (
		<>
			<header className="flex flex-col gap-2 px-(--spacing-block-inline)">
				<div className="flex items-center gap-3">
					<EntityLogo name="Zalo" />
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
										<span translate="no">{du.tenBot}</span>
										{du.pollCuoi ? ` · ${t.traLoiLanCuoi(du.pollCuoi)}` : null}
									</>
								}
							/>
						) : (
							<StatusIndicator size="sm" label={t.chuaBat} />
						)}
					</span>
				</div>
				<p className="text-muted-foreground text-sm">{t.moTa}</p>
			</header>
			<section
				aria-labelledby="bot-xuong"
				className="flex flex-col gap-3 border-t px-(--spacing-block-inline) pt-5"
			>
				<h2 id="bot-xuong" className="font-medium text-sm">
					{t.botXuong}
				</h2>
				{du.bat ? (
					<TrangThaiWebhookZalo
						trangThai={du.webhook}
						canManage={du.canManage}
					/>
				) : null}
				<BotCuaXuong du={du} locale={locale} />
			</section>
			<section className="flex flex-col gap-2 border-t px-(--spacing-block-inline) pt-5">
				<h2 className="font-medium text-sm">{t.mangVe}</h2>
				<p className="text-muted-foreground text-sm">{t.mangVeMoTa}</p>
				<h2 className="mt-3 font-medium text-sm">{t.gui}</h2>
				<p className="text-muted-foreground text-sm">{t.guiMoTa}</p>
			</section>
			{du.bat && du.im && du.pollCuoi ? (
				<div className="px-(--spacing-block-inline)">
					<Alert variant="warning">
						<Icon icon={Warning} />
						<AlertTitle>{t.imTieuDe(du.pollCuoi)}</AlertTitle>
						<AlertDescription>{t.imMoTa}</AlertDescription>
					</Alert>
				</div>
			) : null}
			{du.bat ? (
				<section
					aria-labelledby="ai-da-noi"
					className="flex flex-col gap-3 border-t px-(--spacing-block-inline) pt-5"
				>
					<div className="flex flex-wrap items-end justify-between gap-4">
						<div>
							<h2 id="ai-da-noi" className="font-medium text-sm">
								{t.daNoiSo(String(du.daNoi), String(du.tong))}
							</h2>
							<p className="text-muted-foreground text-xs">
								{t.chuaNoiVanSlack}
							</p>
						</div>
						<Button asChild variant="outline" size="sm">
							<Link href={hrefThongBao}>{t.noiCuaToi}</Link>
						</Button>
					</div>
					<ul className="flex flex-col divide-y rounded-lg border">
						{du.nguoi.map((n) => (
							<li
								key={n.id}
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
										className="truncate text-muted-foreground text-xs"
										translate="no"
									>
										{n.tenZalo}
									</span>
								) : null}
								<StatusIndicator
									size="sm"
									tone={n.tenZalo ? "success" : "neutral"}
									label={n.tenZalo ? t.daNoi : t.chuaNoi}
								/>
							</li>
						))}
					</ul>
				</section>
			) : null}
		</>
	);
}
