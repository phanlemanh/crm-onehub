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
import { useLocale } from "@crm/ui/components/locale-provider";
import { SectionHeading } from "@crm/ui/components/section-heading";
import { Skeleton } from "@crm/ui/components/skeleton";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { khoaDonOkr } from "@crm/validation/okr-tham-so";
import { skipToken, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { okrMessages } from "@/lib/messages/okr";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { giaiDon } from "./don-dich";
import type { CayDuLieu, MucTieu } from "./kieu";
import { LoiPhan } from "./loi-phan";
import type { DonChonOkr } from "./okr-search-params";
import { nhipCua } from "./tien-do-kr";

/** Thẻ đơn vị đọc trọn bộ OKR của đơn vị — không bộ lọc nào của trang Theo đơn vị. */
const LOC_TRONG = {
	phuTrach: [],
	loai: [],
	trangThai: [],
	tuTin: [],
	gopY: [],
};

export type SoDonVi = {
	soMucTieu: number;
	soKr: number;
	tienDoTb: number;
	dungNhip: number;
	chamNhip: number;
	truot: number;
};

/** Sáu con số của một thẻ đơn vị, tính bằng đúng phép tính nhịp KR của trang Theo đơn vị. */
export function demNhip(ds: readonly MucTieu[]): SoDonVi {
	const kr = ds.flatMap((mt) =>
		mt.keyResults.map((k) => ({
			progress: k.progress,
			nhip: nhipCua(k.progress, mt.expected, mt.kind, k.kind === "moc"),
		})),
	);
	const dem = (n: string) => kr.filter((k) => k.nhip === n).length;
	return {
		soMucTieu: ds.length,
		soKr: kr.length,
		tienDoTb:
			kr.length === 0
				? 0
				: Math.round(kr.reduce((t, k) => t + k.progress, 0) / kr.length),
		dungNhip: dem("dung-nhip"),
		chamNhip: dem("cham-nhip"),
		truot: dem("truot"),
	};
}

/** Đơn vị người xem dẫn: bộ phận trước phòng ban, mỗi nhóm theo thứ tự cây tổ chức. */
export function thuTuDan(
	headOf: { divisions: string[]; departments: string[] },
	cay: CayDuLieu | undefined,
): DonChonOkr[] {
	const viTri = (ds: readonly { id: string }[], id: string) => {
		const i = ds.findIndex((x) => x.id === id);
		return i < 0 ? Number.MAX_SAFE_INTEGER : i;
	};
	const bpCay = cay?.divisions ?? [];
	const pbCay = [
		...(cay?.divisions.flatMap((x) => x.departments) ?? []),
		...(cay?.chuaXep ?? []),
	];
	const theo = (ds: string[], cayDs: readonly { id: string }[]) =>
		ds
			.map((id, i) => ({ id, i }))
			.sort((a, b) => viTri(cayDs, a.id) - viTri(cayDs, b.id) || a.i - b.i)
			.map((x) => x.id);
	return [
		...theo(headOf.divisions, bpCay).map((id) => ({ loai: "bp" as const, id })),
		...theo(headOf.departments, pbCay).map((id) => ({
			loai: "pb" as const,
			id,
		})),
	];
}

export function PhanDonViDan({
	cycleId,
	tenKy,
	ky,
}: {
	cycleId: string | null;
	tenKy: string;
	ky: string | null;
}) {
	const m = okrMessages(useLocale()).baPhan;
	const trpc = useTRPC();
	const access = useQuery(trpc.okr.access.queryOptions());
	const cay = useQuery(trpc.org.tree.queryOptions());
	if (access.isPending)
		return (
			<VoPhan tieuDe={m.phan2}>
				<Skeleton className="h-24 w-full" data-khung-xuong="" />
			</VoPhan>
		);
	if (access.isError)
		return (
			<VoPhan tieuDe={m.phan2}>
				<LoiPhan thuLai={() => void access.refetch()} />
			</VoPhan>
		);
	const dan = thuTuDan(access.data.headOf, cay.data);
	if (dan.length === 0) return null;
	return (
		<VoPhan tieuDe={m.phan2}>
			<div className="grid gap-3 md:grid-cols-2">
				{dan.map((don) => (
					<TheDonVi
						cay={cay.data}
						cycleId={cycleId}
						don={don}
						key={khoaDonOkr(don)}
						ky={ky}
						tenKy={tenKy}
					/>
				))}
			</div>
		</VoPhan>
	);
}

function TheDonVi({
	don,
	cay,
	cycleId,
	tenKy,
	ky,
}: {
	don: DonChonOkr;
	cay: CayDuLieu | undefined;
	cycleId: string | null;
	tenKy: string;
	ky: string | null;
}) {
	const m = okrMessages(useLocale()).baPhan;
	const trpc = useTRPC();
	const url = useWorkspaceUrl();
	const ds = useQuery(
		trpc.okr.danhSach.queryOptions(
			cycleId === null
				? skipToken
				: {
						cycleId,
						unit: don,
						loc: LOC_TRONG,
					},
		),
	);
	const ten = (cay && giaiDon(don, cay, "")?.ten) || "";
	const thamSo = new URLSearchParams({
		[SEARCH_PARAM.okr.don]: khoaDonOkr(don),
	});
	if (ky) thamSo.set(SEARCH_PARAM.okr.ky, ky);
	const so = ds.data ? demNhip(ds.data.rows) : null;
	return (
		<Card data-don-vi-dan={khoaDonOkr(don)}>
			<CardHeader>
				<CardTitle translate="no">{ten}</CardTitle>
				<CardDescription>
					{ds.isError ? null : so === null ? (
						<Skeleton className="h-4 w-40" data-khung-xuong="" />
					) : so.soMucTieu === 0 ? (
						m.donViRong(tenKy)
					) : (
						<span data-so-tom-tat="">
							{m.tomTatDonVi(so.soMucTieu, so.soKr, so.tienDoTb)}
						</span>
					)}
				</CardDescription>
				<CardAction>
					<Button asChild size="sm" variant="outline">
						<Link
							data-nut="mo-don-vi"
							href={`${url("/okr/theo-don-vi")}?${thamSo}`}
						>
							{m.moDonVi}
						</Link>
					</Button>
				</CardAction>
			</CardHeader>
			{ds.isError ? (
				<CardContent>
					<LoiPhan thuLai={() => void ds.refetch()} />
				</CardContent>
			) : so && so.soKr > 0 ? (
				<CardContent>
					<span
						className="flex flex-wrap items-center gap-x-4 gap-y-1"
						data-so-muc-tieu={so.soMucTieu}
						data-so-kr={so.soKr}
						data-so-tien-do={so.tienDoTb}
					>
						<StatusIndicator
							data-so-dung-nhip={so.dungNhip}
							label={m.dungNhip(so.dungNhip)}
							size="sm"
							tone="success"
						/>
						<StatusIndicator
							data-so-cham-nhip={so.chamNhip}
							label={m.chamNhip(so.chamNhip)}
							size="sm"
							tone="warning"
						/>
						<StatusIndicator
							data-so-truot={so.truot}
							label={m.truot(so.truot)}
							size="sm"
							tone="error"
						/>
					</span>
				</CardContent>
			) : null}
		</Card>
	);
}

function VoPhan({
	tieuDe,
	children,
}: {
	tieuDe: string;
	children: React.ReactNode;
}) {
	return (
		<section className="flex flex-col gap-3" data-phan="don-vi-dan">
			<SectionHeading level={2}>{tieuDe}</SectionHeading>
			{children}
		</section>
	);
}
