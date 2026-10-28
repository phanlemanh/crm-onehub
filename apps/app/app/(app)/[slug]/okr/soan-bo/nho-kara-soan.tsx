"use client";

import { Button } from "@crm/ui/components/button";
import { FieldDescription } from "@crm/ui/components/field";
import { KaraMark } from "@crm/ui/components/kara";
import { useLocale } from "@crm/ui/components/locale-provider";
import { useQuery } from "@tanstack/react-query";
import { type ReactNode, useId } from "react";
import { okrSoanBoMessages } from "@/lib/messages/okr-soan-bo";
import { useTRPC } from "@/lib/trpc/client";
import type { QuyenKhu } from "../hanh-dong-khu";
import { useDuongSoan } from "../soan/duong-soan";
import type { BoSoan } from "./use-bo-soan";

type BoXong = Extract<BoSoan, { trang: "xong" }>;

function HangNut({ children }: { children: ReactNode }) {
	return <div className="flex flex-wrap items-center gap-2">{children}</div>;
}

function KhoiNhoKaraSoan({
	bo,
	cauNoi,
	them,
}: {
	bo: BoXong;
	cauNoi: boolean;
	them: ReactNode;
}) {
	const m = okrSoanBoMessages(useLocale()).taiLieu;
	const trpc = useTRPC();
	const id = useId();
	const access = useQuery(trpc.okr.access.queryOptions());
	const q: Extract<QuyenKhu, { kieu: "xong" }> = {
		kieu: "xong",
		dich: { don: bo.khoa.don, nguon: "chon" },
		duoc: true,
		lyDo: null,
		cycleId: bo.khoa.cycleId,
		phaKy: bo.pha,
		quanTri: access.data?.canManageProgram === true,
		canEdit: bo.quyen.loai === "soan",
	};
	const soan = useDuongSoan({ q, cauNoi });
	const lyDo = soan.duong.loai === "khoa" ? soan.duong.lyDo : null;
	const khoa = soan.dangMo || lyDo !== null || soan.duong.loai === "dang-tai";
	return (
		<div className="flex flex-col gap-2" data-loi-kara-soan={soan.duong.loai}>
			<HangNut>
				{them}
				<Button
					aria-describedby={id}
					data-nut="nho-kara-soan"
					disabled={khoa}
					onClick={soan.chon}
					size="sm"
					type="button"
					variant="ghost"
				>
					<KaraMark />
					{m.nhoKara}
				</Button>
			</HangNut>
			<FieldDescription id={id}>{lyDo ?? m.nhoKaraMoTa}</FieldDescription>
		</div>
	);
}

export function NhoKaraSoan({
	bo,
	cauNoi,
	hien,
	them,
}: {
	bo: BoXong;
	cauNoi: boolean;
	hien: boolean;
	them: ReactNode;
}) {
	if (!hien) return <HangNut>{them}</HangNut>;
	return <KhoiNhoKaraSoan bo={bo} cauNoi={cauNoi} them={them} />;
}
