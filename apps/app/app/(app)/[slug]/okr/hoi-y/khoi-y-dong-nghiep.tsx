"use client";

import Locked from "@carbon/icons-react/es/Locked";
import ThumbsUp from "@carbon/icons-react/es/ThumbsUp";
import { Button } from "@crm/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@crm/ui/components/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemGroup,
} from "@crm/ui/components/item";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Toggle } from "@crm/ui/components/toggle";
import { OKR_HOI_Y } from "@crm/validation/okr-hoi-y";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { okrHoiYMessages } from "@/lib/messages/okr-hoi-y";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { ChuNguoi, demSo, dien, ghep } from "./chu";
import { ChiTietY } from "./khoi-gop";
import { coTen, type HoiY, type YXem, yNguoiKhac } from "./man-hoi-y";

function DongY({ y, bamDuoc }: { y: YXem; bamDuoc: boolean }) {
	const m = okrHoiYMessages(useLocale()).dongNghiep;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const [bat, setBat] = useState(y.daDongY);
	const dongY = useMutation(
		trpc.okr.dongY.mutationOptions({
			onSuccess: () => cache.hoiY(),
			onError: (error) => {
				setBat(y.daDongY);
				toast.error(error.message);
			},
		}),
	);
	return (
		<Item data-y={y.id} variant="outline">
			<ItemContent>
				<ChiTietY y={y} />
				{coTen(y) ? (
					<ItemDescription data-tac-gia>
						{ghep(m.tacGia, {
							ten: <ChuNguoi>{y.tacGia.ten}</ChuNguoi>,
							n: y.soDongY,
						})}
					</ItemDescription>
				) : null}
			</ItemContent>
			{bamDuoc ? (
				<ItemActions>
					<Toggle
						aria-label={dien(m.cungNghiNhan, { chu: y.noiDung })}
						disabled={dongY.isPending}
						onPressedChange={(p) => {
							setBat(p);
							dongY.mutate({ yId: y.id, bat: p });
						}}
						pressed={bat}
						size="sm"
						variant="outline"
					>
						<Icon data-icon="inline-start" icon={ThumbsUp} />
						{m.cungNghi}
					</Toggle>
				</ItemActions>
			) : null}
		</Item>
	);
}

export function KhoiYDongNghiep({ h }: { h: HoiY }) {
	const m = okrHoiYMessages(useLocale()).dongNghiep;
	const [hienHet, setHienHet] = useState(false);
	const khac = yNguoiKhac(h);
	const dayDu = khac.some(coTen);
	const bamDuoc = h.trangThai === "dang-mo";

	const khoa = h.y.lyDoKhoa === null ? null : m.khoa[h.y.lyDoKhoa];
	if (h.y.khoa) {
		return (
			<Card data-khoi="y-bi-khoa">
				<CardHeader>
					<CardTitle>{m.tieuDeKhoa}</CardTitle>
				</CardHeader>
				<CardContent>
					<Empty>
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<Icon icon={Locked} />
							</EmptyMedia>
							<EmptyTitle>{khoa?.tieuDe}</EmptyTitle>
							<EmptyDescription>{khoa?.moTa}</EmptyDescription>
						</EmptyHeader>
					</Empty>
				</CardContent>
			</Card>
		);
	}

	const dangHien = hienHet ? khac : khac.slice(0, OKR_HOI_Y.hienTruoc);
	const conAn = khac.length - dangHien.length;

	return (
		<Card data-khoi="y-dong-nghiep">
			<CardHeader>
				<CardTitle>
					{dien(dayDu ? m.tieuDeDayDu : m.tieuDe, { n: khac.length })}
				</CardTitle>
				<CardDescription>{dayDu ? m.moTaDayDu : m.moTa}</CardDescription>
			</CardHeader>
			<CardContent>
				{khac.length === 0 ? (
					<Empty>
						<EmptyHeader>
							<EmptyTitle>{m.rong}</EmptyTitle>
							<EmptyDescription>{m.rongMoTa}</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : (
					<ItemGroup>
						{dangHien.map((y) => (
							<DongY bamDuoc={bamDuoc} key={y.id} y={y} />
						))}
					</ItemGroup>
				)}
			</CardContent>
			{conAn > 0 ? (
				<CardContent>
					<Button
						data-nut="hien-them"
						onClick={() => setHienHet(true)}
						variant="outline"
					>
						{demSo(m.hienThem.mot, m.hienThem.nhieu, conAn)}
					</Button>
				</CardContent>
			) : null}
		</Card>
	);
}
