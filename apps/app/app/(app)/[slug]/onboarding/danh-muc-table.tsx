"use client";

import { Badge } from "@crm/ui/components/badge";
import { Button } from "@crm/ui/components/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@crm/ui/components/table";
import { useQuery } from "@tanstack/react-query";
import { useQueryState } from "nuqs";
import { onboardingMessages } from "@/lib/messages/onboarding";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import {
	ONBOARDING_TRANG_THAI,
	onboardingParsers,
} from "./onboarding-search-params";

export function DanhMucTable() {
	const locale = useLocale();
	const m = onboardingMessages(locale);
	const trpc = useTRPC();

	const [boPhan, setBoPhan] = useQueryState(
		SEARCH_PARAM.onboarding.boPhan,
		onboardingParsers[SEARCH_PARAM.onboarding.boPhan],
	);
	const [trangThai, setTrangThai] = useQueryState(
		SEARCH_PARAM.onboarding.trangThai,
		onboardingParsers[SEARCH_PARAM.onboarding.trangThai],
	);

	const truyVan = {
		q: "",
		sort: "",
		dir: "asc" as const,
		page: 1,
		pageSize: 25,
		status: trangThai,
		departmentId: boPhan === "" ? undefined : boPhan,
	};
	const danhMuc = useQuery(trpc.onboarding.manDanhMuc.queryOptions(truyVan));
	const boPhanList = useQuery(trpc.onboarding.listDepartments.queryOptions());

	if (danhMuc.isPending) {
		return (
			<div aria-live="polite" className="flex flex-col gap-2">
				<span className="text-muted-foreground text-sm">{m.loading}</span>
				<Skeleton className="h-9 w-full" />
				<Skeleton className="h-12 w-full" />
				<Skeleton className="h-12 w-full" />
			</div>
		);
	}

	if (danhMuc.isError) {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>{m.error.title}</EmptyTitle>
					<EmptyDescription>{m.error.body}</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button onClick={() => danhMuc.refetch()} variant="outline">
						{m.error.action}
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	const data = danhMuc.data;

	if (data.trangThai === "ST-danhmuc-chuacokhuon") {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>{m.empty.noTemplate.title}</EmptyTitle>
					<EmptyDescription>{m.empty.noTemplate.body}</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button asChild>
						<a href="settings/onboarding">{m.empty.noTemplate.action}</a>
					</Button>
				</EmptyContent>
			</Empty>
		);
	}

	if (data.trangThai === "ST-danhmuc-empty") {
		return (
			<Empty>
				<EmptyHeader>
					<EmptyTitle>{m.empty.noPlan.title}</EmptyTitle>
					<EmptyDescription>{m.empty.noPlan.body}</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button>{m.empty.noPlan.action}</Button>
				</EmptyContent>
			</Empty>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			<nav aria-label={m.facets.running} className="flex flex-wrap gap-2">
				{ONBOARDING_TRANG_THAI.map((tt) => (
					<Badge
						key={tt}
						onClick={() => setTrangThai(tt)}
						variant={tt === trangThai ? "default" : "outline"}
					>
						{tt === "dang-chay" ? m.facets.running : m.facets.closed}
					</Badge>
				))}
				<Badge
					onClick={() => setBoPhan("")}
					variant={boPhan === "" ? "default" : "outline"}
				>
					{m.facets.allDepartments}
				</Badge>
				{(boPhanList.data ?? []).map((bp) => (
					<Badge
						key={bp.id}
						onClick={() => setBoPhan(bp.id)}
						variant={bp.id === boPhan ? "default" : "outline"}
					>
						{bp.name} {data.facetCounts.boPhan?.[bp.id] ?? 0}
					</Badge>
				))}
			</nav>
			<p className="text-muted-foreground text-xs">{m.urlHint}</p>

			<div className="rounded-lg border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>{m.columns.partner}</TableHead>
							<TableHead>{m.columns.stuckOn}</TableHead>
							<TableHead className="text-right tabular-nums">
								{m.columns.silent}
							</TableHead>
							<TableHead className="text-right tabular-nums">
								{m.columns.steps}
							</TableHead>
							<TableHead className="text-right tabular-nums">
								{m.columns.days}
							</TableHead>
							<TableHead>{m.columns.department}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.rows.map((hang) => (
							<TableRow key={hang.id}>
								<TableCell
									className="whitespace-normal break-words font-medium"
									translate="no"
								>
									{hang.companyName}
								</TableCell>
								<TableCell
									className="whitespace-normal break-words"
									translate="no"
								>
									{hang.tacO}
								</TableCell>
								<TableCell className="whitespace-nowrap text-right tabular-nums">
									{hang.imNgay === 0 ? "—" : `${hang.imNgay}n`}
								</TableCell>
								<TableCell className="whitespace-nowrap text-right tabular-nums">
									{hang.buocXong}/{hang.buocTong}
								</TableCell>
								<TableCell className="whitespace-nowrap text-right tabular-nums">
									{hang.ngayThu}/{hang.targetDays}
								</TableCell>
								<TableCell
									className="whitespace-normal break-words text-muted-foreground"
									translate="no"
								>
									{hang.boPhanTac}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
