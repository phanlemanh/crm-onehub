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
import { skipToken, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { okrMessages } from "@/lib/messages/okr";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";
import { BangMucTieu } from "./bang-muc-tieu";
import { DIEM_CAM_GOP_Y } from "./chip-gop-y";
import { useChuKy } from "./chon-chu-ky";
import { NhomDaBo, NhomDangTheoDoi } from "./nhom-da-bo";
import { ChuaChuKy, DangTai, Loi } from "./trang-thai-okr";
import { ViecOkrCuaToi } from "./viec-cua-toi";

export function CuaToi() {
	return (
		<div className="flex flex-col gap-6">
			<ViecOkrCuaToi noi="cua-toi" khiHien="khi-co-viec" anKhiLoi={false} />
			<MucTieuCuaToi />
		</div>
	);
}

function MucTieuCuaToi() {
	const m = okrMessages(useLocale());
	const trpc = useTRPC();
	const url = useWorkspaceUrl();
	const { cycles, currentId, ky } = useChuKy();
	const access = useQuery(trpc.okr.access.queryOptions());
	const mine = useQuery(
		trpc.okr.mine.queryOptions(
			currentId === null ? skipToken : { cycleId: currentId },
		),
	);

	if (cycles.isPending || access.isPending) return <DangTai />;
	if (cycles.isError)
		return (
			<Loi
				thuLai={() => {
					void cycles.refetch();
					void access.refetch();
				}}
			/>
		);
	if (currentId === null)
		return <ChuaChuKy quanTri={access.data?.canManageProgram === true} />;
	if (mine.isPending) return <DangTai />;
	if (mine.isError) return <Loi thuLai={() => void mine.refetch()} />;

	const ds = mine.data.objectives;
	const nhomTheoDoi = <NhomDangTheoDoi ds={mine.data.dangTheoDoi} />;
	const nhomDaBo = <NhomDaBo danhDauCuaToi ds={mine.data.daBo} hienDonVi />;
	if (ds.length === 0) {
		const sang = url("/okr/theo-don-vi");
		return (
			<div className="flex flex-col gap-6">
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
				{nhomTheoDoi}
				{nhomDaBo}
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6" data-trang-thai="ST-cuatoi-codulieu">
			<BangMucTieu danhDauCuaToi diemCam={DIEM_CAM_GOP_Y} ds={ds} hienDonVi />
			{nhomTheoDoi}
			{nhomDaBo}
		</div>
	);
}
