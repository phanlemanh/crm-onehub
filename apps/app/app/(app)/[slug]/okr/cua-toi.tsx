"use client";

import UserMultiple from "@carbon/icons-react/es/UserMultiple";
import { Button } from "@crm/ui/components/button";
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
import { SectionHeading } from "@crm/ui/components/section-heading";
import { skipToken, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { okrMessages } from "@/lib/messages/okr";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { useChuKy } from "./chon-chu-ky";
import { NhomDaBo, NhomDangTheoDoi } from "./nhom-da-bo";
import { PhanCanCapNhat } from "./phan-can-cap-nhat";
import { PhanDonViDan } from "./phan-don-vi-dan";
import { PhanKrPhuTrach } from "./phan-kr-phu-trach";
import { ChuaChuKy, DangTai, Loi } from "./trang-thai-okr";
import { ViecOkrCuaToi } from "./viec-cua-toi";

/**
 * Của tôi là hộp việc ba phần, đọc từ trên xuống: KR cần cập nhật tuần này (gửi ngay tại
 * chỗ), đơn vị người xem dẫn, KR người xem phụ trách. Mỗi phần tự tải và tự báo lỗi.
 */
export function CuaToi() {
	return (
		<div className="flex flex-col gap-8">
			<PhanCanCapNhat />
			<ViecOkrCuaToi
				anCapNhat
				anKhiLoi={false}
				khiHien="khi-co-viec"
				noi="cua-toi"
			/>
			<TheoKy />
		</div>
	);
}

function TheoKy() {
	const trpc = useTRPC();
	const url = useWorkspaceUrl();
	const { cycles, currentId, ky } = useChuKy();
	const access = useQuery(trpc.okr.access.queryOptions());
	const mine = useQuery(
		trpc.okr.mine.queryOptions(
			currentId === null ? skipToken : { cycleId: currentId },
		),
	);

	if (cycles.isPending) return <DangTai />;
	if (cycles.isError) return <Loi thuLai={() => void cycles.refetch()} />;
	if (currentId === null)
		return <ChuaChuKy quanTri={access.data?.canManageProgram === true} />;
	const tenKy = cycles.data.cycles.find((c) => c.id === currentId)?.name ?? "";

	const nhomSau = mine.data ? (
		<>
			<NhomDangTheoDoi ds={mine.data.dangTheoDoi} />
			<NhomDaBo danhDauCuaToi ds={mine.data.daBo} hienDonVi />
		</>
	) : null;
	const phanBa = mine.isPending ? (
		<VoPhanBa>
			<DangTai />
		</VoPhanBa>
	) : mine.isError ? (
		<VoPhanBa>
			<Loi thuLai={() => void mine.refetch()} />
		</VoPhanBa>
	) : mine.data.objectives.length === 0 ? (
		<RongCuaToi ky={ky} nhomSau={nhomSau} url={url} />
	) : (
		<PhanKrPhuTrach ds={mine.data.objectives} nhomSau={nhomSau} tenKy={tenKy} />
	);

	return (
		<>
			<PhanDonViDan cycleId={currentId} ky={ky} tenKy={tenKy} />
			{phanBa}
		</>
	);
}

function VoPhanBa({ children }: { children: React.ReactNode }) {
	const m = okrMessages(useLocale());
	return (
		<section className="flex flex-col gap-3" data-phan="kr-phu-trach">
			<SectionHeading level={2}>{m.baPhan.phan3}</SectionHeading>
			{children}
		</section>
	);
}

function RongCuaToi({
	ky,
	url,
	nhomSau,
}: {
	ky: string | null;
	url: ReturnType<typeof useWorkspaceUrl>;
	nhomSau: React.ReactNode;
}) {
	const m = okrMessages(useLocale());
	const sang = url("/okr/theo-don-vi");
	return (
		<section className="flex flex-col gap-3" data-phan="kr-phu-trach">
			<SectionHeading level={2}>{m.baPhan.phan3}</SectionHeading>
			<Empty data-trang-thai="ST-cuatoi-rong">
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Icon icon={UserMultiple} />
					</EmptyMedia>
					<EmptyTitle>{m.cuaToiRong.title}</EmptyTitle>
					<EmptyDescription>{m.cuaToiRong.body}</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button asChild variant="outline">
						<Link
							href={
								ky
									? `${sang}?${new URLSearchParams({ [SEARCH_PARAM.okr.ky]: ky })}`
									: sang
							}
						>
							{m.cuaToiRong.action}
						</Link>
					</Button>
				</EmptyContent>
			</Empty>
			{nhomSau}
		</section>
	);
}
