"use client";

import { useMutation } from "@tanstack/react-query";
import { useEveAgent } from "eve/react";
import { useState } from "react";
import { useRecordStack } from "@/components/crm/record-sheet/record-stack";
import { CUA_OKR_HOI } from "@/lib/cua-okr-config";
import { OKR_SOAN_CUA } from "@/lib/okr-soan-record";
import { useTRPC } from "@/lib/trpc/client";
import { KhungHoi } from "./khung-hoi";
import { lyDoKhoaTu } from "./loi-hoi";

export function CotHoiKara({ cuocHoiId }: { cuocHoiId: string }) {
	const trpc = useTRPC();
	const { open } = useRecordStack();
	const [daPhanHoi, setDaPhanHoi] = useState<Record<string, boolean>>({});
	const luuPhanHoi = useMutation(trpc.okr.hoiPhanHoi.mutationOptions());
	const agent = useEveAgent({
		host: OKR_SOAN_CUA.host,
		headers: { [CUA_OKR_HOI.header]: cuocHoiId },
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
