"use client";

import {
	InlineCitation,
	InlineCitationCard,
	InlineCitationCardBody,
	InlineCitationCardTrigger,
	InlineCitationSource,
	InlineCitationText,
} from "@crm/ui/components/ai-elements/inline-citation";
import { AiFeedback } from "@crm/ui/components/ai-feedback";
import { Button } from "@crm/ui/components/button";
import { KaraState } from "@crm/ui/components/kara/state";
import { KaraTurn } from "@crm/ui/components/kara/transcript";
import type { CauTraLoiDung } from "@crm/validation/okr-tra-loi";
import type { OkrHoiMessages } from "@/lib/messages/okr-hoi";
import type { TrichMo } from "./khung-hoi";

export function TheTraLoi({
	traLoi,
	m,
	phanHoi,
	onPhanHoi,
	onMoTrich,
}: {
	traLoi: CauTraLoiDung;
	m: OkrHoiMessages;
	phanHoi: boolean | null;
	onPhanHoi: (huuIch: boolean) => void;
	onMoTrich: (trich: TrichMo) => void;
}) {
	return (
		<KaraTurn
			from="kara"
			actions={
				<AiFeedback
					label={m.phanHoi.nhan}
					value={phanHoi}
					onChange={onPhanHoi}
					thanks={m.phanHoi.camOn}
				/>
			}
		>
			<div className="flex flex-col gap-2" data-tra-loi-okr={traLoi.loai}>
				{traLoi.cau.length === 0 ? (
					<KaraState
						kind="empty"
						title={m.khongThay.tieuDe}
						description={m.khongThay.moTa}
					/>
				) : null}
				{traLoi.cau.map((cau) => (
					<p key={cau.chu}>
						<InlineCitation>
							<InlineCitationText>{cau.chu}</InlineCitationText>
							{cau.trich.map((t) => (
								<InlineCitationCard key={`${t.loai}:${t.id}`}>
									<InlineCitationCardTrigger
										nhan={t.ten}
										data-nhan-trich={t.loai}
										translate="no"
									/>
									<InlineCitationCardBody>
										<InlineCitationSource description={m.trich[t.loai]}>
											<p className="font-medium text-sm" translate="no">
												{t.ten}
											</p>
											<Button
												size="sm"
												variant="outline"
												data-trich-okr={t.loai}
												onClick={() => onMoTrich({ kind: t.loai, id: t.id })}
											>
												{m.trich.mo}
											</Button>
										</InlineCitationSource>
									</InlineCitationCardBody>
								</InlineCitationCard>
							))}
						</InlineCitation>
					</p>
				))}
			</div>
		</KaraTurn>
	);
}
