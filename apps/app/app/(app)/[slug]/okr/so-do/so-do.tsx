"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { useQuery } from "@tanstack/react-query";
import { okrMessages } from "@/lib/messages/okr";
import { useTRPC } from "@/lib/trpc/client";
import { useChuKy } from "../chon-chu-ky";
import { XemCay } from "../theo-don-vi/theo-don-vi";
import { ChuaChuKy, DangTai, Loi } from "../trang-thai-okr";

export function SoDo() {
	const m = okrMessages(useLocale());
	const trpc = useTRPC();
	const { cycles, currentId } = useChuKy();
	const access = useQuery(trpc.okr.access.queryOptions());
	const workspace = useQuery(trpc.workspace.get.queryOptions());
	if (cycles.isError) return <Loi thuLai={() => void cycles.refetch()} />;
	if (cycles.isPending) return <DangTai />;
	if (currentId === null)
		return <ChuaChuKy quanTri={access.data?.canManageProgram === true} />;
	const tenKy = cycles.data.cycles.find((c) => c.id === currentId)?.name ?? "";
	return (
		<div data-so-do-gop-vao="">
			<XemCay
				cycleId={currentId}
				tenGoc={workspace.data?.name || m.goc}
				tenKy={tenKy}
			/>
		</div>
	);
}
