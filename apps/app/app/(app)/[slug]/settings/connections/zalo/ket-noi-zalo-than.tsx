import Warning from "@carbon/icons-react/es/Warning";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import { EntityLogo } from "@crm/ui/components/entity-logo";
import { Icon } from "@crm/ui/components/icon";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import type { Locale } from "@crm/ui/lib/locale";
import Link from "next/link";
import { nhacQuaZaloMessages } from "@/lib/messages/nhac-qua-zalo";

export type NguoiNoi = { id: string; ten: string; tenZalo: string | null };

export type KetNoiZaloDu = {
	bat: boolean;
	tenBot: string | null;
	pollCuoi: string | null;
	im: boolean;
	daNoi: number;
	tong: number;
	nguoi: NguoiNoi[];
};

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
					<div className="flex items-end justify-between gap-4">
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
									className="w-20 shrink-0"
								/>
							</li>
						))}
					</ul>
				</section>
			) : (
				<section className="flex flex-col gap-2 border-t px-(--spacing-block-inline) pt-5">
					<h2 className="font-medium text-sm">{t.cachBatTieuDe}</h2>
					<ol className="flex list-decimal flex-col gap-1 pl-5 text-muted-foreground text-sm">
						<li>{t.cachBat1}</li>
						<li>{t.cachBat2}</li>
						<li>{t.cachBat3}</li>
					</ol>
				</section>
			)}
		</>
	);
}
