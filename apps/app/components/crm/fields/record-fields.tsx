"use client";

import Settings from "@carbon/icons-react/es/Settings";
import type { FieldTypeName, FieldValueJson } from "@crm/db/fields";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@crm/ui/components/tooltip";
import { useQuery } from "@tanstack/react-query";
import type { Owner } from "@/components/crm/owner-cell";
import {
	type EntityKind,
	useFieldsSheet,
} from "@/components/crm/record-sheet/record-stack";
import { crmMessages } from "@/lib/messages/crm";
import { useTRPC } from "@/lib/trpc/client";
import { type MoTaTruong, OTruongPhieu } from "./kieu-truong";
import type { DichOTep, TepOTep } from "./o-tep";

type RecordFieldOption = { id: string; label: string };

export type RecordFieldEntry = {
	id: string;
	key: string;
	label: string;
	type: FieldTypeName;
	showOnSheet: boolean;
	required: boolean;
	options: RecordFieldOption[];
	value: FieldValueJson;
};

export function FieldsCog({ kind }: { kind: EntityKind }) {
	const locale = useLocale();
	const m = crmMessages(locale);
	const { open } = useFieldsSheet();

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button variant="ghost" size="icon-sm" onClick={() => open(kind)}>
					<Icon icon={Settings} />
					<span className="sr-only">{m.sheet.fields}</span>
				</Button>
			</TooltipTrigger>
			<TooltipContent>{m.sheet.fields}</TooltipContent>
		</Tooltip>
	);
}

export type NguCanhTep = DichOTep & { tep: Record<string, TepOTep[]> };

export function nguCanhTepCua(
	entity: DichOTep["entity"],
	banGhi: {
		id: string;
		archivedAt: string | null;
		owner: { name: string } | null;
		tepTheoTruong: Record<string, TepOTep[]>;
	},
): NguCanhTep {
	return {
		entity,
		recordId: banGhi.id,
		luuTru: banGhi.archivedAt !== null,
		phuTrach: banGhi.owner?.name ?? null,
		tep: banGhi.tepTheoTruong,
	};
}

export function moTaTruongTuTao(
	field: RecordFieldEntry,
	luu: (khoa: string, giaTri: FieldValueJson) => void,
	dangLuu: (khoa: string) => boolean,
	nguoiDung: Owner[] | undefined,
	nguCanhTep?: NguCanhTep,
): MoTaTruong {
	const moTa: MoTaTruong = {
		khoa: field.key,
		nhan: field.label,
		kieu: field.type,
		giaTri: field.value,
		batBuoc: field.required,
		luaChon: field.options.map((option) => ({
			value: option.id,
			label: option.label,
		})),
		nguoiDung,
		luu: (giaTri) => luu(field.key, giaTri),
		dangLuu: dangLuu(field.key),
	};
	if (!nguCanhTep) return moTa;
	moTa.tep = nguCanhTep.tep[field.key] ?? [];
	moTa.dichTep = {
		entity: nguCanhTep.entity,
		recordId: nguCanhTep.recordId,
		luuTru: nguCanhTep.luuTru,
		phuTrach: nguCanhTep.phuTrach ?? null,
	};
	return moTa;
}

export function OTruongTuTao({
	field,
	saving,
	onSave,
	nguoiDung,
	nguCanhTep,
}: {
	field: RecordFieldEntry;
	saving: (key: string) => boolean;
	onSave: (values: Record<string, FieldValueJson>, khoa: string) => void;
	nguoiDung: Owner[] | undefined;
	nguCanhTep?: NguCanhTep;
}) {
	if (!field.showOnSheet) return null;

	return (
		<OTruongPhieu
			moTa={moTaTruongTuTao(
				field,
				(khoa, giaTri) => onSave({ [khoa]: giaTri }, khoa),
				saving,
				nguoiDung,
				nguCanhTep,
			)}
		/>
	);
}
