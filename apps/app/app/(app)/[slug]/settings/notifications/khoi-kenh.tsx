"use client";

import Warning from "@carbon/icons-react/es/Warning";
import { Alert, AlertDescription, AlertTitle } from "@crm/ui/components/alert";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldLabel,
} from "@crm/ui/components/field";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { Switch } from "@crm/ui/components/switch";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import { nhacQuaZaloMessages } from "@/lib/messages/nhac-qua-zalo";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

const KENH = ["AUTO", "ZALO", "SLACK"] as const;

type KenhUuTien = (typeof KENH)[number];

function laKenh(v: string): v is KenhUuTien {
	return KENH.some((k) => k === v);
}

export function KhoiKenh() {
	const t = nhacQuaZaloMessages(useLocale()).kenh;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const queryClient = useQueryClient();
	const idZalo = useId();
	const idSlack = useId();
	const [dangChon, setDangChon] = useState<KenhUuTien | null>(null);
	const [loi, setLoi] = useState(false);

	const trangThai = useQuery(trpc.zalo.cuaToi.queryOptions());

	const luu = useMutation(
		trpc.zalo.luuUuTien.mutationOptions({
			onMutate: (v) => {
				setLoi(false);
				setDangChon(v.channel);
			},
			onSuccess: async (kq) => {
				queryClient.setQueryData(trpc.zalo.cuaToi.queryKey(), (cu) =>
					cu ? { ...cu, uuTien: kq.channel } : cu,
				);
				setDangChon(null);
				await cache.zalo();
			},
			onError: () => {
				setDangChon(null);
				setLoi(true);
			},
		}),
	);

	const du = trangThai.data;
	if (!du) return <Skeleton className="h-8 w-64" />;

	const hienTai = dangChon ?? du.uuTien;
	const khoaZalo = du.zaloDuoc
		? null
		: du.zaloBat
			? t.khoaZaloChuaNoi
			: t.khoaZaloTat;
	const khoaSlack = du.slackDuoc ? null : t.khoaSlack;
	const moTa = {
		AUTO: t.moTaAuto,
		ZALO: t.moTaZalo,
		SLACK: t.moTaSlack,
	} satisfies Record<KenhUuTien, string>;

	return (
		<div className="flex flex-col gap-3">
			<ToggleGroup
				type="single"
				variant="outline"
				spacing={0}
				value={hienTai}
				aria-label={t.tieuDe}
				onValueChange={(v) => {
					if (laKenh(v) && v !== hienTai) luu.mutate({ channel: v });
				}}
			>
				<ToggleGroupItem value="AUTO">{t.auto}</ToggleGroupItem>
				<ToggleGroupItem
					value="ZALO"
					disabled={khoaZalo !== null}
					aria-disabled={khoaZalo !== null}
					aria-describedby={khoaZalo ? idZalo : undefined}
				>
					{t.zalo}
				</ToggleGroupItem>
				<ToggleGroupItem
					value="SLACK"
					disabled={khoaSlack !== null}
					aria-disabled={khoaSlack !== null}
					aria-describedby={khoaSlack ? idSlack : undefined}
				>
					{t.slack}
				</ToggleGroupItem>
			</ToggleGroup>
			<p className="text-sm">{moTa[hienTai]}</p>
			{khoaZalo || khoaSlack ? (
				<ul className="flex flex-col gap-1 text-muted-foreground text-xs">
					{khoaZalo ? (
						<li id={idZalo}>
							{t.zalo}: {khoaZalo}
						</li>
					) : null}
					{khoaSlack ? (
						<li id={idSlack}>
							{t.slack}: {khoaSlack}
						</li>
					) : null}
				</ul>
			) : null}
			{du.lech && du.kenhSeDung ? (
				<Alert variant="warning">
					<Icon icon={Warning} />
					<AlertTitle>
						{du.kenhSeDung === "zalo" ? t.lechQuaZalo : t.lechQuaSlack}
					</AlertTitle>
					<AlertDescription>{t.lechMoTa}</AlertDescription>
				</Alert>
			) : null}
			{loi ? (
				<p role="alert" className="text-destructive text-xs">
					{t.luuLoi}
				</p>
			) : null}
		</div>
	);
}

export function KhoiDongTroLyOkr() {
	const t = nhacQuaZaloMessages(useLocale());
	const trpc = useTRPC();
	const queryClient = useQueryClient();
	const idCongTac = useId();
	const idTieuDe = useId();
	const [dangChon, setDangChon] = useState<boolean | null>(null);
	const [loi, setLoi] = useState(false);

	const trangThai = useQuery(trpc.zalo.cuaToi.queryOptions());

	const luu = useMutation(
		trpc.zalo.luuDongTroLyOkr.mutationOptions({
			onMutate: (v) => {
				setLoi(false);
				setDangChon(v.bat);
			},
			onSuccess: (kq) => {
				queryClient.setQueryData(trpc.zalo.cuaToi.queryKey(), (cu) =>
					cu ? { ...cu, dongTroLyOkr: kq.bat } : cu,
				);
				setDangChon(null);
			},
			onError: () => {
				setDangChon(null);
				setLoi(true);
			},
		}),
	);

	const du = trangThai.data;
	if (!du?.laTruongPhong) return null;
	const bat = dangChon ?? du.dongTroLyOkr;

	return (
		<section
			aria-labelledby={idTieuDe}
			className="flex flex-col gap-3 border-t pt-5"
			data-khoi="dong-tro-ly-okr"
			data-trang-thai="ST-nhac-dong-tomtat"
		>
			<h2 className="font-medium text-sm" id={idTieuDe}>
				{t.troLy.tieuDe}
			</h2>
			<Field orientation="horizontal">
				<FieldContent>
					<FieldLabel htmlFor={idCongTac}>{t.troLy.dongTomTat}</FieldLabel>
					<FieldDescription>{t.troLy.dongTomTatMoTa}</FieldDescription>
					{loi ? <FieldError>{t.kenh.luuLoi}</FieldError> : null}
				</FieldContent>
				<Switch
					checked={bat}
					data-cong-tac="dong-tom-tat"
					disabled={luu.isPending}
					id={idCongTac}
					onCheckedChange={(v) => luu.mutate({ bat: v })}
				/>
			</Field>
		</section>
	);
}
