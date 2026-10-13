"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { baoDaLuuTru } from "@crm/ui/lib/bao-luu-tru";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { crmMessages } from "@/lib/messages/crm";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { type FieldEntity, kindOf } from "./fields-entity";

export type TruongLuuTru = { id: string; label: string };

export function useLuuTruTruong(
	entity: FieldEntity,
): (field: TruongLuuTru) => void {
	const trpc = useTRPC();
	const cache = useCrmCache();
	const m = crmMessages(useLocale());

	const restore = useMutation(
		trpc.fields.restore.mutationOptions({
			onSuccess: (field) => {
				toast.success(m.fields.restored(field.label));
				void cache.fields(kindOf(entity));
			},
			onError: () => toast.error(m.fields.hoanTacLoi),
		}),
	);

	const archive = useMutation(
		trpc.fields.archive.mutationOptions({
			onSuccess: (field) => {
				void cache.fields(kindOf(entity));
				baoDaLuuTru({
					thongDiep: m.fields.archived(field.label),
					nhanHoanTac: m.sheet.hoanTac,
					onHoanTac: () => restore.mutate({ id: field.id }),
				});
			},
			onError: (error) => toast.error(error.message),
		}),
	);

	return (field) => archive.mutate({ id: field.id });
}
