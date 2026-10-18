"use client";

import { useState } from "react";
import { CotHoiKara } from "@/app/(app)/[slug]/okr/hoi/cot-hoi-kara";
import { FieldsSheetHost } from "@/components/crm/fields/fields-sheet";
import { CloseReasonDialog } from "@/components/crm/stage-change";
import { DetailSheet } from "@/components/detail-sheet";
import { KhungViec } from "@/components/viec/khung-viec";
import { CompanySheet } from "./company-sheet";
import { ContactSheet } from "./contact-sheet";
import { DealSheet } from "./deal-sheet";
import { KrSheet } from "./kr-sheet";
import { ObjectiveSheet } from "./objective-sheet";
import { PlanSheet } from "./plan-sheet";
import { type RecordRef, recordKey, useRecordStack } from "./record-stack";
import { useSauKhiTaiXong } from "./sau-khi-tai-xong";
import { SoKrSheet } from "./so-kr-sheet";
import { SoanSheet } from "./soan-sheet";

export function RecordSheetHost({
	cauNoiOkr = false,
}: {
	cauNoiOkr?: boolean;
}) {
	const { stack, top, closeAll } = useRecordStack();
	const daTaiXong = useSauKhiTaiXong();

	const [shown, setShown] = useState<RecordRef | null>(top);
	if (top && (!shown || recordKey(shown) !== recordKey(top))) {
		setShown(top);
	}

	return (
		<>
			<DetailSheet
				open={daTaiXong && stack.length > 0}
				size={
					shown?.kind === "soan" || shown?.kind === "hoi-okr"
						? "kara"
						: undefined
				}
				onOpenChange={(next) => {
					if (!next) closeAll();
				}}
			>
				{shown?.kind === "company" ? (
					<CompanySheet key={recordKey(shown)} companyId={shown.id} />
				) : null}

				{shown?.kind === "contact" ? (
					<ContactSheet key={recordKey(shown)} contactId={shown.id} />
				) : null}

				{shown?.kind === "deal" ? (
					<DealSheet key={recordKey(shown)} dealId={shown.id} />
				) : null}

				{shown?.kind === "plan" ? (
					<PlanSheet key={recordKey(shown)} planId={shown.id} />
				) : null}

				{shown?.kind === "objective" ? (
					<ObjectiveSheet key={recordKey(shown)} objectiveId={shown.id} />
				) : null}

				{shown?.kind === "so-kr" ? (
					<SoKrSheet key={recordKey(shown)} keyResultId={shown.id} />
				) : null}

				{shown?.kind === "kr" ? (
					<KrSheet key={recordKey(shown)} keyResultId={shown.id} />
				) : null}

				{shown?.kind === "soan" ? (
					<SoanSheet
						key={recordKey(shown)}
						cuocSoanId={shown.id}
						cauNoi={cauNoiOkr}
					/>
				) : null}

				{shown?.kind === "hoi-okr" ? (
					<CotHoiKara key={recordKey(shown)} cuocHoiId={shown.id} />
				) : null}

				{shown?.kind === "viec" ? (
					<KhungViec key={recordKey(shown)} viecId={shown.id} />
				) : null}
			</DetailSheet>

			<FieldsSheetHost />

			<CloseReasonDialog />
		</>
	);
}
