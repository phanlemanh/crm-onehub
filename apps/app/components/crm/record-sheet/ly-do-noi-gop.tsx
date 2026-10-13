"use client";

import { KaraTrace } from "@crm/ui/components/kara";
import { useLocale } from "@crm/ui/components/locale-provider";
import { StatusIndicator } from "@crm/ui/components/status-indicator";
import { type NghiaTrangThai, toneTheoNghia } from "@crm/ui/lib/status-tone";
import { okrMessages } from "@/lib/messages/okr";

export type MucTinNoiGop = "chua-co-ly-do" | "dat-cuoc" | "co-so-lieu";

export type NoiGopHien = {
	lyDo: string | null;
	canCu: string | null;
	lyDoTuKara: boolean;
	mucTin: MucTinNoiGop;
};

export const NGHIA_MUC_TIN = {
	"chua-co-ly-do": "cho",
	"dat-cuoc": "nhap",
	"co-so-lieu": "xong",
} as const satisfies Record<MucTinNoiGop, NghiaTrangThai>;

export function LyDoNoiGop({ g }: { g: NoiGopHien }) {
	const m = okrMessages(useLocale()).sheet;
	return (
		<div className="flex min-w-0 flex-col gap-1 text-sm" data-ly-do>
			{g.lyDo ? (
				<p className="text-pretty break-words">
					<span data-ly-do-cau translate="no">
						{g.lyDo}
					</span>
					{g.lyDoTuKara ? (
						<>
							{" "}
							<KaraTrace />
						</>
					) : null}
				</p>
			) : null}
			{g.lyDo && g.canCu ? (
				<p
					className="text-pretty break-words text-muted-foreground"
					data-ly-do-can-cu
				>
					{m.canCu.split("{cau}").flatMap((phan, i) =>
						i === 0
							? [phan]
							: [
									<span key="can-cu" translate="no">
										{g.canCu}
									</span>,
									phan,
								],
					)}
				</p>
			) : null}
			<StatusIndicator
				data-muc-tin={g.mucTin}
				label={m.mucTin[g.mucTin]}
				size="sm"
				tone={toneTheoNghia(NGHIA_MUC_TIN[g.mucTin])}
			/>
		</div>
	);
}
