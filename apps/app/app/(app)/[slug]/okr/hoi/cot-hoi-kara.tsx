"use client";

import { KaraState } from "@crm/ui/components/kara/state";
import { useLocale } from "@crm/ui/components/locale-provider";
import { VungTaiLoi } from "@crm/ui/components/vung-tai-loi";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEveAgent } from "eve/react";
import { useState } from "react";
import { useRecordStack } from "@/components/crm/record-sheet/record-stack";
import { eventsOf, loadThread, type Thread } from "@/lib/agent-session";
import { CUA_OKR_HOI } from "@/lib/cua-okr-config";
import { okrHoiMessages } from "@/lib/messages/okr-hoi";
import { OKR_SOAN_CUA } from "@/lib/okr-soan-record";
import { useTRPC } from "@/lib/trpc/client";
import { KhungHoi } from "./khung-hoi";
import { lyDoKhoaTu } from "./loi-hoi";

const dauCuoc = (cuocHoiId: string) => ({ [CUA_OKR_HOI.header]: cuocHoiId });

export function CotHoiKara({ cuocHoiId }: { cuocHoiId: string }) {
	const m = okrHoiMessages(useLocale());
	const trpc = useTRPC();
	const phien = useQuery({
		...trpc.okr.hoiPhien.queryOptions({ cuocHoiId }),
		staleTime: Number.POSITIVE_INFINITY,
		gcTime: 0,
		refetchOnWindowFocus: false,
		retry: false,
	});
	const maPhien = phien.data?.phien ?? null;
	const thread = useQuery<Thread>({
		queryKey: ["hoi-thread", cuocHoiId, maPhien],
		enabled: maPhien !== null,
		staleTime: Number.POSITIVE_INFINITY,
		gcTime: 0,
		refetchOnWindowFocus: false,
		queryFn: ({ signal }) =>
			loadThread(
				maPhien ?? "",
				dauCuoc(cuocHoiId),
				signal,
				OKR_SOAN_CUA.host,
			),
	});

	if (phien.isError || thread.data?.status === "offline")
		return (
			<VungTaiLoi
				tieuDe={m.nap.loiTieuDe}
				moTa={m.nap.loiMoTa}
				dangTai={phien.isFetching || thread.isFetching}
				onThuLai={() => void (phien.isError ? phien : thread).refetch()}
			/>
		);
	if (phien.isPending || (maPhien !== null && thread.isPending))
		return <KaraState kind="working" label={m.nap.dangMo} delayMs={0} />;
	return (
		<CuocHoiDang
			key={maPhien ?? "moi"}
			cuocHoiId={cuocHoiId}
			thread={thread.data}
		/>
	);
}

function CuocHoiDang({
	cuocHoiId,
	thread,
}: {
	cuocHoiId: string;
	thread: Thread | undefined;
}) {
	const trpc = useTRPC();
	const { open } = useRecordStack();
	const [daPhanHoi, setDaPhanHoi] = useState<Record<string, boolean>>({});
	const luuPhanHoi = useMutation(trpc.okr.hoiPhanHoi.mutationOptions());
	const agent = useEveAgent({
		host: OKR_SOAN_CUA.host,
		headers: dauCuoc(cuocHoiId),
		...(thread && "session" in thread
			? { initialSession: thread.session, initialEvents: eventsOf(thread) }
			: { initialEvents: eventsOf(thread) }),
	});
	const dangChay = agent.status === "submitted" || agent.status === "streaming";
	const loi = agent.status === "error" ? agent.error : undefined;
	const lyDoKhoa = lyDoKhoaTu(loi);

	const gui = (chu: string) => {
		const cau = chu.trim();
		if (!cau || dangChay || lyDoKhoa) return;
		void agent.send({ message: cau }).catch(() => undefined);
	};

	return (
		<KhungHoi
			messages={agent.data.messages}
			dangChay={dangChay}
			loi={loi !== undefined && lyDoKhoa === null}
			lyDoKhoa={lyDoKhoa}
			daPhanHoi={daPhanHoi}
			onGui={gui}
			onThuLai={gui}
			onMoTrich={(t) => open({ kind: t.kind, id: t.id })}
			onPhanHoi={(maTraLoi, huuIch) => {
				setDaPhanHoi((cu) => ({ ...cu, [maTraLoi]: huuIch }));
				luuPhanHoi.mutate({ cuocHoiId, maTraLoi, huuIch });
			}}
		/>
	);
}
