"use client";

import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Empty,
	EmptyContent,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { Spinner } from "@crm/ui/components/spinner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { type ReactNode, useId, useState } from "react";
import { toast } from "sonner";
import {
	type ThanhVienMessages,
	thanhVienMessages,
} from "@/lib/messages/settings-thanh-vien";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

const FORM_ID = "ten-mien-noi-bo";

function tachTenMien(chu: string): string[] {
	return chu.split(/[,\s]+/).filter((muc) => muc !== "");
}

function DauThe({
	t,
	hanhDong,
}: {
	t: ThanhVienMessages;
	hanhDong?: ReactNode;
}) {
	return (
		<CardHeader>
			<CardTitle>{t.tenMienNoiBo.tieuDe}</CardTitle>
			<CardDescription>{t.tenMienNoiBo.moTa}</CardDescription>
			{hanhDong ? <CardAction>{hanhDong}</CardAction> : null}
		</CardHeader>
	);
}

export function TenMienNoiBo() {
	const t = thanhVienMessages(useLocale());
	const trpc = useTRPC();
	const cache = useCrmCache();
	const oId = useId();
	const loiId = useId();

	const [nhap, setNhap] = useState<string | null>(null);
	const [loi, setLoi] = useState<string | null>(null);

	const tenMien = useQuery(trpc.workspace.staffDomains.queryOptions());

	const luu = useMutation(
		trpc.workspace.setStaffDomains.mutationOptions({
			onSuccess: async () => {
				await cache.workspace();
				setNhap(null);
				setLoi(null);
				toast.success(t.tenMienNoiBo.daLuu);
			},
			onError: (error) => setLoi(error.message),
		}),
	);

	if (tenMien.isPending) {
		return (
			<Card aria-busy>
				<DauThe t={t} hanhDong={<Skeleton className="h-9 w-16" />} />
				<CardContent>
					<div className="flex flex-col gap-2">
						<Skeleton className="h-4 w-32" />
						<Skeleton className="h-9 w-full" />
						<Skeleton className="h-4 w-2/3" />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (tenMien.isError) {
		return (
			<Card>
				<DauThe t={t} />
				<CardContent>
					<Empty>
						<EmptyHeader>
							<EmptyTitle>{t.tenMienNoiBo.loiTai}</EmptyTitle>
						</EmptyHeader>
						<EmptyContent>
							<Button variant="outline" onClick={() => tenMien.refetch()}>
								{t.tenMienNoiBo.thuLai}
							</Button>
						</EmptyContent>
					</Empty>
				</CardContent>
			</Card>
		);
	}

	const { domains, canEdit } = tenMien.data;
	const daLuu = domains.join(", ");
	const giaTri = nhap ?? daLuu;
	const daSua = nhap !== null && nhap !== daLuu;
	const khoa = !canEdit || luu.isPending;

	return (
		<Card>
			<DauThe
				t={t}
				hanhDong={
					<Button type="submit" form={FORM_ID} disabled={khoa || !daSua}>
						{luu.isPending ? <Spinner data-icon="inline-start" /> : null}
						{t.tenMienNoiBo.luu}
					</Button>
				}
			/>
			<CardContent>
				<form
					id={FORM_ID}
					onSubmit={(event) => {
						event.preventDefault();
						if (khoa || !daSua) return;
						luu.mutate({ domains: tachTenMien(giaTri) });
					}}
				>
					<FieldGroup>
						<Field data-invalid={loi !== null || undefined}>
							<FieldLabel htmlFor={oId}>{t.tenMienNoiBo.nhan}</FieldLabel>
							<Input
								id={oId}
								value={giaTri}
								onChange={(event) => {
									setNhap(event.target.value);
									setLoi(null);
								}}
								placeholder={t.tenMienNoiBo.goiY}
								translate="no"
								autoComplete="off"
								autoCapitalize="off"
								autoCorrect="off"
								spellCheck={false}
								disabled={khoa}
								aria-invalid={loi !== null || undefined}
								aria-describedby={loi ? loiId : undefined}
							/>
							{loi ? <FieldError id={loiId}>{loi}</FieldError> : null}
							<FieldDescription>
								{!canEdit
									? t.tenMienNoiBo.khoa
									: giaTri.trim() === ""
										? t.tenMienNoiBo.rong
										: t.tenMienNoiBo.huongDan}
							</FieldDescription>
						</Field>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
}
