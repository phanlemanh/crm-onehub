"use client";

import CheckmarkFilled from "@carbon/icons-react/es/CheckmarkFilled";
import Warning from "@carbon/icons-react/es/Warning";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { Field, FieldDescription, FieldLabel } from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
	InputGroupText,
} from "@crm/ui/components/input-group";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useId, useState } from "react";
import { toast } from "sonner";
import { theoDoiMessages } from "@/lib/messages/settings-theo-doi";
import { useTRPC } from "@/lib/trpc/client";
import type { RouterOutputs } from "@/lib/trpc/types";

type Result = RouterOutputs["tracking"]["verify"];

export function VerifyInstallation() {
	const t = theoDoiMessages(useLocale());
	const trpc = useTRPC();
	const urlId = useId();

	const [url, setUrl] = useState("");
	const [result, setResult] = useState<Result | null>(null);

	const tracking = useQuery(trpc.tracking.settings.queryOptions());

	const verify = useMutation(
		trpc.tracking.verify.mutationOptions({
			onSuccess: (outcome) => setResult(outcome),
			onError: (error) => toast.error(error.message),
		}),
	);

	if (!tracking.data) return null;

	const { canManage, siteId } = tracking.data;

	return (
		<Card>
			<CardHeader>
				<CardTitle>
					<div className="flex items-center gap-2">
						{t.kiemTra.tieuDe}
						{result ? <Indicator result={result} /> : null}
					</div>
				</CardTitle>
				<CardDescription>{t.kiemTra.moTa}</CardDescription>

				<CardAction>
					<Button
						size="sm"
						type="submit"
						form="verify-tracking"
						disabled={!canManage || verify.isPending || url.trim() === ""}
					>
						{verify.isPending ? <Spinner data-icon="inline-start" /> : null}
						{t.kiemTra.kiemNgay}
					</Button>
				</CardAction>
			</CardHeader>

			<CardContent>
				<form
					id="verify-tracking"
					onSubmit={(event) => {
						event.preventDefault();
						setResult(null);
						verify.mutate({ url: url.trim() });
					}}
				>
					<Field>
						<FieldLabel htmlFor={urlId}>{t.kiemTra.trangNhan}</FieldLabel>
						<InputGroup>
							<InputGroupAddon>
								<InputGroupText>https://</InputGroupText>
							</InputGroupAddon>
							<InputGroupInput
								id={urlId}
								value={url}
								onChange={(event) => {
									setUrl(event.target.value);
									setResult(null);
								}}
								placeholder={t.kiemTra.trangGoiY}
								translate="no"
								autoComplete="off"
								autoCapitalize="off"
								autoCorrect="off"
								spellCheck={false}
								inputMode="url"
								disabled={!canManage || verify.isPending}
							/>
						</InputGroup>
						<FieldDescription>{t.kiemTra.trangMoTa}</FieldDescription>
					</Field>
				</form>

				{result && siteId ? <Outcome result={result} siteId={siteId} /> : null}
			</CardContent>
		</Card>
	);
}

function Indicator({ result }: { result: Result }) {
	const t = theoDoiMessages(useLocale());

	if (result.status === "found" && result.pageView) {
		return (
			<StatusIndicator
				size="sm"
				tone="success"
				label={t.kiemTra.trangThai.vuaXong}
			/>
		);
	}

	if (result.status === "found" && result.container?.carriesSiteId === false) {
		return (
			<StatusIndicator
				size="sm"
				tone="warning"
				label={t.kiemTra.trangThai.gtmCanSua}
			/>
		);
	}

	return (
		<StatusIndicator
			size="sm"
			tone="warning"
			label={
				result.status === "found"
					? t.kiemTra.trangThai.chuaCoLuotXem
					: t.kiemTra.trangThai.khongThay
			}
		/>
	);
}

function Outcome({ result, siteId }: { result: Result; siteId: string }) {
	const t = theoDoiMessages(useLocale());

	if (result.status === "unreachable") {
		return (
			<Alert variant="destructive">
				<Icon icon={Warning} />
				<AlertTitle>
					{t.kiemTra.khongMo} <span translate="no">{result.host}</span>
				</AlertTitle>
				<AlertDescription>
					{result.detail} {t.kiemTra.khongMoMoTa}
				</AlertDescription>
			</Alert>
		);
	}

	if (result.status === "missing") {
		return (
			<Alert variant="destructive">
				<Icon icon={Warning} />
				<AlertTitle>
					{t.kiemTra.khongCoScript} <span translate="no">{result.host}</span>
				</AlertTitle>
				<AlertDescription>
					{t.kiemTra.khongCoScriptMoTa(String(result.responseMs))}
					{result.containers.length > 0
						? t.kiemTra.cungDocContainer(
								result.containers.join(t.kiemTra.noiVa),
							)
						: ""}
				</AlertDescription>
			</Alert>
		);
	}

	if (result.container && !result.container.carriesSiteId) {
		return (
			<Alert variant="destructive">
				<Icon icon={Warning} />
				<AlertTitle>{t.kiemTra.gtmRoiSiteId}</AlertTitle>
				<AlertDescription>
					{t.kiemTra.gtmRoiSiteIdMoTa(result.container.id)}
					{result.pageView ? t.kiemTra.vanCoLuotXem : ""}
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<Alert>
			<Icon icon={CheckmarkFilled} className="text-success" />
			<AlertTitle>
				{result.container ? t.kiemTra.thayTrongContainer : t.kiemTra.thayTren}{" "}
				<span translate="no">
					{result.container ? result.container.id : result.host}
				</span>
			</AlertTitle>
			<AlertDescription>
				{t.kiemTra.thayMoTaDau(String(result.responseMs))}{" "}
				<span translate="no">{siteId}</span> {t.kiemTra.thayMoTaGiua}{" "}
				{result.allowed
					? t.kiemTra.coTrongDanhSach
					: t.kiemTra.khongTrongDanhSach}
				{result.container ? t.kiemTra.chiChayKhiGtm : ""}
				{result.pageView ? t.kiemTra.coLuotXem : t.kiemTra.chuaCoLuotXem}
			</AlertDescription>
		</Alert>
	);
}
