"use client";

import Edit from "@carbon/icons-react/es/Edit";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { SectionHeading } from "@crm/ui/components/section-heading";
import {
	SimpleTable,
	SimpleTableCell,
	type SimpleTableColumn,
	SimpleTableRow,
} from "@crm/ui/components/simple-table";
import { Skeleton } from "@crm/ui/components/skeleton";
import { LOI_VAO, type LoiVao } from "@crm/validation/okr-cap-nhat";
import { useMutation, useQuery } from "@tanstack/react-query";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useEffect, useRef, useState } from "react";
import { okrMessages } from "@/lib/messages/okr";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import { giaTri } from "./bang-kr";
import {
	BangCapNhat,
	congNgay,
	ngayThang,
	TUAN,
} from "./cap-nhat-tuan/cap-nhat-tuan";
import { LoiPhan } from "./loi-phan";

/** Lối vào từ ngoài Của tôi mở sẵn bảng cập nhật; lối khác (hoặc vắng) không mở phiên. */
const LOI_MO_SAN = ["nhac", "viec-cua-toi"] as const satisfies LoiVao[];

function moSan(tu: LoiVao | null): tu is (typeof LOI_MO_SAN)[number] {
	return LOI_MO_SAN.some((l) => l === tu);
}

export function PhanCanCapNhat() {
	const locale = useLocale();
	const m = okrMessages(locale).baPhan;
	const trpc = useTRPC();
	const ds = useQuery(trpc.okr.capNhatTuan.queryOptions());
	const [tu, datTu] = useQueryState(
		SEARCH_PARAM.okr.tu,
		parseAsStringLiteral(LOI_VAO),
	);
	const [phien, setPhien] = useState<string | null>(null);
	const [sua, setSua] = useState(false);
	const daMoTuNgoai = useRef(false);
	const moPhien = useMutation(
		trpc.okr.moCapNhat.mutationOptions({
			onSuccess: (kq) => setPhien(kq.sessionId),
		}),
	);
	const coKr = (ds.data?.items.length ?? 0) > 0;

	useEffect(() => {
		if (!coKr || !moSan(tu) || daMoTuNgoai.current) return;
		daMoTuNgoai.current = true;
		moPhien.mutate({ entry: tu });
		void datTu(null);
	}, [coKr, tu, moPhien, datTu]);

	const mo = (laSua: boolean) => {
		setSua(laSua);
		moPhien.mutate({ entry: "cua-toi" });
	};

	if (ds.isPending)
		return (
			<VoPhan tieuDe={m.phan1}>
				<Skeleton className="h-24 w-full" data-khung-xuong="" />
			</VoPhan>
		);
	if (ds.isError || !ds.data)
		return (
			<VoPhan tieuDe={m.phan1}>
				<LoiPhan thuLai={() => void ds.refetch()} />
			</VoPhan>
		);

	const duLieu = ds.data;
	const thieu = duLieu.items.filter((kr) => !kr.updatedThisWeek);
	const tuan = ngayThang(duLieu.weekStart);

	if (phien !== null)
		return (
			<VoPhan tieuDe={m.phan1}>
				<BangCapNhat
					duLieu={duLieu}
					focusDau
					sessionId={phien}
					suaNgay={sua}
					taiCho
				/>
			</VoPhan>
		);

	if (!coKr)
		return (
			<VoPhan tieuDe={m.phan1}>
				<p className="text-muted-foreground text-sm">{m.khongKr}</p>
			</VoPhan>
		);

	if (thieu.length === 0)
		return (
			<VoPhan
				hanhDong={
					<Button
						data-nut="sua-lan-gui"
						disabled={moPhien.isPending}
						onClick={() => mo(true)}
						size="sm"
						variant="outline"
					>
						{m.suaLanGui}
					</Button>
				}
				tieuDe={m.phan1}
			>
				<p className="text-muted-foreground text-sm">{m.daDu(tuan)}</p>
			</VoPhan>
		);

	const cot: SimpleTableColumn[] = [
		{ id: "kr", header: m.cotKr },
		{ id: "hien-tai", header: m.cotHienTai, width: "w-32" },
	];
	return (
		<VoPhan
			hanhDong={
				<Button
					data-nut="cap-nhat-tai-cho"
					disabled={moPhien.isPending}
					onClick={() => mo(false)}
					size="sm"
				>
					<Icon data-icon="inline-start" icon={Edit} />
					{m.capNhatN(thieu.length)}
				</Button>
			}
			tieuDe={m.phan1}
		>
			<p className="text-muted-foreground text-sm">
				{m.conThieu(
					thieu.length,
					tuan,
					ngayThang(congNgay(duLieu.weekStart, TUAN.chuNhat)),
				)}
			</p>
			<SimpleTable columns={cot} surface="page">
				{thieu.map((kr) => (
					<SimpleTableRow data-kr={kr.keyResultId} key={kr.keyResultId}>
						<SimpleTableCell>
							<span className="flex flex-col gap-0.5">
								<span translate="no">{kr.title}</span>
								<span className="text-muted-foreground text-xs" translate="no">
									{kr.unitName} · {kr.objectiveTitle}
								</span>
							</span>
						</SimpleTableCell>
						<SimpleTableCell className="text-sm tabular-nums">
							{giaTri(kr, kr.currentValue, locale)}
						</SimpleTableCell>
					</SimpleTableRow>
				))}
			</SimpleTable>
		</VoPhan>
	);
}

function VoPhan({
	tieuDe,
	hanhDong,
	children,
}: {
	tieuDe: string;
	hanhDong?: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<section className="flex flex-col gap-3" data-phan="can-cap-nhat">
			<SectionHeading actions={hanhDong ?? null} level={2}>
				{tieuDe}
			</SectionHeading>
			{children}
		</section>
	);
}
