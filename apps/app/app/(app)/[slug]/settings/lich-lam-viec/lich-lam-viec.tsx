"use client";

import TrashCan from "@carbon/icons-react/es/TrashCan";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import { DatePicker } from "@crm/ui/components/date-picker";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Field, FieldError, FieldLabel } from "@crm/ui/components/field";
import { Input } from "@crm/ui/components/input";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { formatDay } from "@crm/ui/lib/format";
import { DU_AN } from "@crm/validation/du-an-lich";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { settingsMessages } from "@/lib/messages/settings";
import { useTRPC } from "@/lib/trpc/client";

const THU = [1, 2, 3, 4, 5, 6, 7] as const;

function HopThemLe({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const t = settingsMessages(useLocale()).lichLamViec;
	const trpc = useTRPC();
	const get = useQuery(trpc.lichLamViec.get.queryOptions());
	const them = useMutation(trpc.lichLamViec.themNgayLe.mutationOptions());
	const [ngay, setNgay] = useState<string | null>(null);
	const [ten, setTen] = useState("");
	const [loi, setLoi] = useState<string | null>(null);

	const gui = async () => {
		if (!ngay) {
			setLoi(t.thieuNgay);
			return;
		}
		if (ten.trim() === "") {
			setLoi(t.thieuTen);
			return;
		}
		setLoi(null);
		try {
			await them.mutateAsync({ ngay, ten: ten.trim() });
			await get.refetch();
			setNgay(null);
			setTen("");
			onOpenChange(false);
		} catch (e) {
			setLoi(e instanceof Error ? e.message : t.thieuNgay);
		}
	};

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent>
				<form
					className="flex flex-col gap-4"
					onSubmit={(event) => {
						event.preventDefault();
						void gui();
					}}
				>
					<DialogHeader>
						<DialogTitle>{t.hopThem}</DialogTitle>
					</DialogHeader>
					<Field>
						<FieldLabel>{t.ngay}</FieldLabel>
						<DatePicker onChange={setNgay} value={ngay} />
					</Field>
					<Field>
						<FieldLabel htmlFor="ten-ngay-le">{t.ten}</FieldLabel>
						<Input
							autoComplete="off"
							id="ten-ngay-le"
							maxLength={DU_AN.tenNgayLeToiDa}
							onChange={(event) => setTen(event.target.value)}
							placeholder={t.tenGoiY}
							translate="no"
							value={ten}
						/>
						{loi ? <FieldError>{loi}</FieldError> : null}
					</Field>
					<DialogFooter>
						<DialogClose asChild>
							<Button type="button" variant="outline">
								{t.huy}
							</Button>
						</DialogClose>
						<Button disabled={them.isPending} type="submit">
							{t.them}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export function LichLamViec() {
	const locale = useLocale();
	const t = settingsMessages(locale).lichLamViec;
	const trpc = useTRPC();
	const q = useQuery(trpc.lichLamViec.get.queryOptions());
	const datTuan = useMutation(
		trpc.lichLamViec.datNgayNghiTuan.mutationOptions(),
	);
	const themLe = useMutation(trpc.lichLamViec.themNgayLe.mutationOptions());
	const xoaLe = useMutation(trpc.lichLamViec.xoaNgayLe.mutationOptions());
	const [moThem, setMoThem] = useState(false);

	if (q.isPending) {
		return (
			<div
				aria-busy="true"
				className="flex flex-col gap-6"
				data-lich-cho-tai=""
			>
				<Skeleton className="h-32 w-full" />
				<Skeleton className="h-48 w-full" />
			</div>
		);
	}
	if (!q.data) {
		return (
			<VungTaiLoi
				dangTai={q.isFetching}
				moTa={t.loiTaiMoTa}
				onThuLai={() => void q.refetch()}
				tieuDe={t.loiTai}
			/>
		);
	}
	const du = q.data;
	const khoa = !du.sua;

	const luuTuan = async (moi: number[], cu: number[]) => {
		try {
			await datTuan.mutateAsync({ ngayNghiTuan: moi });
			await q.refetch();
			let daTra = false;
			toast.success(t.daLuuTuan, {
				action: {
					label: t.hoanTac,
					onClick: () => {
						if (daTra) return;
						daTra = true;
						void datTuan
							.mutateAsync({ ngayNghiTuan: cu })
							.then(() => q.refetch());
					},
				},
			});
		} catch (e) {
			toast.error(e instanceof Error ? e.message : t.loiTai);
			await q.refetch();
		}
	};

	const xoa = async (le: { id: string; ngay: string; ten: string }) => {
		try {
			await xoaLe.mutateAsync({ id: le.id });
			await q.refetch();
			let daTra = false;
			toast.success(t.daXoaLe.replace("{ten}", le.ten), {
				action: {
					label: t.hoanTac,
					onClick: () => {
						if (daTra) return;
						daTra = true;
						void themLe
							.mutateAsync({ ngay: le.ngay, ten: le.ten })
							.then(() => q.refetch());
					},
				},
			});
		} catch (e) {
			toast.error(e instanceof Error ? e.message : t.loiTai);
		}
	};

	return (
		<div className="flex flex-col gap-6">
			{khoa ? (
				<p className="text-muted-foreground text-sm" data-khong-du-quyen="">
					{t.khongDuQuyen}
				</p>
			) : null}
			<Card data-the-nghi-tuan="">
				<CardHeader>
					<CardTitle>{t.nghiTuan}</CardTitle>
					<CardDescription>{t.nghiTuanMoTa}</CardDescription>
				</CardHeader>
				<CardContent>
					<ToggleGroup
						disabled={khoa || datTuan.isPending}
						onValueChange={(gia: string[]) => {
							const moi = THU.filter((thu) => gia.includes(String(thu)));
							void luuTuan([...moi], du.ngayNghiTuan);
						}}
						size="sm"
						type="multiple"
						value={du.ngayNghiTuan.map(String)}
						variant="outline"
					>
						{THU.map((thu, i) => (
							<ToggleGroupItem
								aria-label={t.thuDayDu[i]}
								data-thu={thu}
								key={thu}
								value={String(thu)}
							>
								{t.thu[i]}
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				</CardContent>
			</Card>
			<Card data-the-ngay-le="">
				<CardHeader>
					<CardTitle>{t.ngayLe}</CardTitle>
					<CardDescription>{t.ngayLeMoTa}</CardDescription>
					<CardAction>
						<Button
							disabled={khoa}
							onClick={() => setMoThem(true)}
							size="sm"
							variant="outline"
						>
							{t.themLe}
						</Button>
					</CardAction>
				</CardHeader>
				<CardContent>
					{du.ngayLe.length === 0 ? (
						<Empty>
							<EmptyHeader>
								<EmptyTitle>{t.chuaCoLe}</EmptyTitle>
								<EmptyDescription>{t.chuaCoLeMoTa}</EmptyDescription>
							</EmptyHeader>
						</Empty>
					) : (
						<ItemGroup className="gap-2">
							{du.ngayLe.map((le) => (
								<Item
									data-ngay-le={le.ngay}
									key={le.id}
									size="sm"
									variant="outline"
								>
									<ItemContent>
										<ItemTitle translate="no">{le.ten}</ItemTitle>
										<ItemDescription className="tabular-nums">
											{formatDay(le.ngay, locale)}
										</ItemDescription>
									</ItemContent>
									<ItemActions>
										<Button
											aria-label={t.xoaLe.replace("{ten}", le.ten)}
											disabled={khoa || xoaLe.isPending}
											onClick={() => void xoa(le)}
											size="icon"
											variant="ghost"
										>
											<TrashCan aria-hidden="true" />
										</Button>
									</ItemActions>
								</Item>
							))}
						</ItemGroup>
					)}
				</CardContent>
			</Card>
			<HopThemLe onOpenChange={setMoThem} open={moThem} />
		</div>
	);
}
