"use client";

import Renew from "@carbon/icons-react/es/Renew";
import WarningAlt from "@carbon/icons-react/es/WarningAlt";
import { Button } from "@crm/ui/components/button";
import { CardContent } from "@crm/ui/components/card";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@crm/ui/components/empty";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Skeleton } from "@crm/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { PageShellDescription } from "@/components/page-shell";
import { okrMessages } from "@/lib/messages/okr";
import { useTRPC } from "@/lib/trpc/client";

export const LY_DO_KHONG_QUYEN = "okr-cai-dat-ly-do";

export function useQuyenChuongTrinh() {
	const trpc = useTRPC();
	const program = useQuery(trpc.okr.program.queryOptions());
	const canManage = program.data?.canManage === true;
	return {
		canManage,
		lyDo: canManage ? undefined : LY_DO_KHONG_QUYEN,
	};
}

export function LyDoKhongQuyen() {
	const m = okrMessages(useLocale());
	const trpc = useTRPC();
	const program = useQuery(trpc.okr.program.queryOptions());
	if (!program.data || program.data.canManage) return null;
	return (
		<PageShellDescription
			id={LY_DO_KHONG_QUYEN}
			className="row-start-3"
			data-ly-do-khong-quyen
		>
			{m.caiDat.khongQuyen}
		</PageShellDescription>
	);
}

export function DangTaiThe() {
	return (
		<CardContent aria-busy="true" className="flex flex-col gap-3">
			<Skeleton className="h-4 w-2/3" />
			<Skeleton className="h-3 w-full" />
			<Skeleton className="h-3 w-1/2" />
		</CardContent>
	);
}

export function LoiThe({ thuLai }: { thuLai: () => void }) {
	const m = okrMessages(useLocale());
	return (
		<CardContent>
			<Empty data-trang-thai="ST-caidat-loi">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Icon icon={WarningAlt} />
					</EmptyMedia>
					<EmptyTitle>{m.loi.title}</EmptyTitle>
					<EmptyDescription>{m.caiDat.loiTai}</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button variant="outline" onClick={thuLai}>
						<Icon icon={Renew} data-icon="inline-start" />
						{m.loi.action}
					</Button>
				</EmptyContent>
			</Empty>
		</CardContent>
	);
}
