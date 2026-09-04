"use client";

import Copy from "@carbon/icons-react/es/Copy";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@crm/ui/components/accordion";
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
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { Icon } from "@crm/ui/components/icon";
import { Label } from "@crm/ui/components/label";
import { useLocale } from "@crm/ui/components/locale-provider";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { Switch } from "@crm/ui/components/switch";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { theoDoiMessages } from "@/lib/messages/settings-theo-doi";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

const OPEN_TAG = "<script";
const CLOSE_TAG = "></script>";
const SITE_ATTRIBUTE = "data-site";
const TAM_DUNG = { khoa: "paused" } as const;
const GTM = { id: "gtm" } as const;

function SnippetText({
	value,
	className,
}: {
	value: string;
	className?: string;
}) {
	return <span className={className}>{value}</span>;
}

export function TrackingScript() {
	const t = theoDoiMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();
	const tracking = useQuery(trpc.tracking.settings.queryOptions());
	const [section, setSection] = useState("html");

	const setFlag = useMutation(
		trpc.tracking.setFlag.mutationOptions({
			onSuccess: async (_result, input) => {
				await cache.tracking();
				toast.success(input.enabled ? t.doanMa.daTamDung : t.doanMa.daChayLai);
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	const rotate = useMutation(
		trpc.tracking.rotateSiteId.mutationOptions({
			onSuccess: async () => {
				await cache.tracking();
				toast.success(t.doanMa.daDoiSiteId);
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	if (!tracking.data) return null;

	const {
		siteId,
		snippet,
		tagManagerSnippet,
		scriptUrl,
		receivingSince,
		paused,
		canManage,
	} = tracking.data;

	const copy = (value: string | null) => {
		const clipboard = navigator.clipboard;

		if (!value || !clipboard) {
			toast.error(t.doanMa.khongChepBoiDen);
			return;
		}

		clipboard
			.writeText(value)
			.then(() => toast.success(t.doanMa.daChep))
			.catch(() => toast.error(t.doanMa.khongChep));
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<div className="flex items-center gap-2">
						{t.doanMa.tieuDe}
						<StatusIndicator
							size="sm"
							tone={paused ? "warning" : receivingSince ? "success" : "neutral"}
							label={
								paused
									? t.doanMa.trangThai.tamDung
									: receivingSince
										? t.doanMa.trangThai.dangNhan
										: t.doanMa.trangThai.chuaNhan
							}
						/>
					</div>
				</CardTitle>
				<CardDescription>{t.doanMa.moTa}</CardDescription>

				<CardAction>
					<Button
						size="sm"
						onClick={() =>
							copy(section === GTM.id ? tagManagerSnippet : snippet)
						}
						type="button"
					>
						<Icon icon={Copy} data-icon="inline-start" />
						{t.doanMa.chep}
					</Button>
				</CardAction>
			</CardHeader>

			<CardContent>
				<Accordion
					type="single"
					collapsible
					value={section}
					onValueChange={setSection}
				>
					<AccordionItem value="html">
						<AccordionTrigger>{t.doanMa.danHtml}</AccordionTrigger>
						<AccordionContent className="flex flex-col gap-4">
							<pre
								translate="no"
								className="overflow-x-auto rounded-md border bg-muted p-4 font-mono text-code-foreground text-xs/5"
							>
								<SnippetText value={OPEN_TAG} className="text-code-accent" />
								<SnippetText value={"\n  src="} />
								<SnippetText
									value={`"${scriptUrl}"`}
									className="text-code-string"
								/>
								<SnippetText value={`\n  ${SITE_ATTRIBUTE}=`} />
								<SnippetText
									value={`"${siteId}"`}
									className="text-code-string"
								/>
								<SnippetText value={"\n  async\n  defer\n"} />
								<SnippetText value={CLOSE_TAG} className="text-code-accent" />
							</pre>
							<p className="text-muted-foreground text-xs/relaxed">
								<span translate="no">{t.doanMa.siteIdNhan}</span>{" "}
								<span className="font-mono text-foreground" translate="no">
									{siteId}
								</span>{" "}
								{t.doanMa.siteIdMoTa}
							</p>
						</AccordionContent>
					</AccordionItem>

					<AccordionItem value={GTM.id}>
						<AccordionTrigger>{t.doanMa.themQuaGtm}</AccordionTrigger>
						<AccordionContent className="flex flex-col gap-4">
							<pre
								translate="no"
								className="overflow-x-auto rounded-md border bg-muted p-4 font-mono text-code-foreground text-xs/5"
							>
								<SnippetText value={OPEN_TAG} className="text-code-accent" />
								<SnippetText value={"\n  src="} />
								<SnippetText
									value={`"${scriptUrl}?site=${siteId}"`}
									className="text-code-string"
								/>
								<SnippetText value={"\n  async\n  defer\n"} />
								<SnippetText value={CLOSE_TAG} className="text-code-accent" />
							</pre>
							<ol className="flex list-decimal flex-col gap-1 pl-4 text-muted-foreground text-xs/relaxed">
								<li>{t.doanMa.buoc1}</li>
								<li>{t.doanMa.buoc2}</li>
								<li>
									{t.doanMa.buoc3Dau}{" "}
									<span className="font-mono text-foreground" translate="no">
										{scriptUrl}
									</span>{" "}
									{t.doanMa.buoc3Cuoi}
								</li>
							</ol>
							<p className="text-muted-foreground text-xs/relaxed">
								{t.doanMa.ghiChuDau}{" "}
								<span className="font-mono text-foreground" translate="no">
									data-site
								</span>{" "}
								{t.doanMa.ghiChuCuoi}
							</p>
						</AccordionContent>
					</AccordionItem>
				</Accordion>

				<div className="flex items-center justify-between gap-6">
					<Label
						htmlFor="tracking-paused"
						className="flex flex-col items-start gap-1"
					>
						<span className="text-sm">{t.doanMa.tamDungNhan}</span>
						<span className="font-normal text-muted-foreground text-xs">
							{t.doanMa.tamDungMoTa}
						</span>
					</Label>

					<Switch
						id="tracking-paused"
						checked={paused}
						disabled={!canManage || setFlag.isPending}
						onCheckedChange={(enabled) =>
							setFlag.mutate({ flag: TAM_DUNG.khoa, enabled })
						}
					/>
				</div>

				<CardFooter>
					<div className="-ml-2 flex flex-wrap items-center gap-1 text-muted-foreground">
						<AlertDialog>
							<AlertDialogTrigger asChild>
								<Button
									variant="ghost"
									size="xs"
									disabled={!canManage || rotate.isPending}
								>
									{t.doanMa.doiSiteId}
								</Button>
							</AlertDialogTrigger>

							<AlertDialogContent>
								<AlertDialogHeader>
									<AlertDialogTitle>{t.doanMa.hoiDoi}</AlertDialogTitle>
									<AlertDialogDescription>
										{t.doanMa.hoiDoiMoTa}
									</AlertDialogDescription>
								</AlertDialogHeader>

								<AlertDialogFooter>
									<AlertDialogCancel>{t.doanMa.huy}</AlertDialogCancel>
									<AlertDialogAction
										variant="destructive"
										onClick={() => rotate.mutate()}
									>
										{t.doanMa.doi}
									</AlertDialogAction>
								</AlertDialogFooter>
							</AlertDialogContent>
						</AlertDialog>
					</div>
				</CardFooter>
			</CardContent>
		</Card>
	);
}
