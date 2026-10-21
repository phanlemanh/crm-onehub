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

export function moTaTruongTuTao(
	field: RecordFieldEntry,
	luu: (khoa: string, giaTri: FieldValueJson) => void,
	dangLuu: (khoa: string) => boolean,
	nguoiDung: Owner[] | undefined,
): MoTaTruong {
	return {
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
}

export function RecordFields({
	fields,
	saving,
	onSave,
}: {
	fields: RecordFieldEntry[];
	saving: (key: string) => boolean;
	onSave: (values: Record<string, FieldValueJson>, khoa: string) => void;
}) {
	const trpc = useTRPC();
	const users = useQuery(trpc.users.list.queryOptions());

	return (
		<>
			{fields
				.filter((field) => field.showOnSheet)
				.map((field) => (
					<OTruongPhieu
						key={field.id}
						moTa={moTaTruongTuTao(
							field,
							(khoa, giaTri) => onSave({ [khoa]: giaTri }, khoa),
							saving,
							users.data,
						)}
					/>
				))}
		</>
	);
}
