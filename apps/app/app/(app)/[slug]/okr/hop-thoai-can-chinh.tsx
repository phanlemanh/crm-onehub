"use client";

import { Button } from "@crm/ui/components/button";
import { Combobox } from "@crm/ui/components/combobox";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@crm/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@crm/ui/components/field";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useId, useState } from "react";
import { toast } from "sonner";
import { okrMessages } from "@/lib/messages/okr";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";

type DaGop = { targetObjectiveId: string; targetKeyResultId: string | null };

const khoaDich = (objectiveId: string, keyResultId: string | null) =>
	`${objectiveId}|${keyResultId ?? ""}`;

export function HopThoaiCanChinh({
	objectiveId,
	daGop,
	dong,
}: {
	objectiveId: string;
	daGop: DaGop[];
	dong: () => void;
}) {
	const m = okrMessages(useLocale());
	const h = m.hopThoai;
	const trpc = useTRPC();
	const cache = useCrmCache();
	const ma = useId();
	const [chon, setChon] = useState("");
	const [loi, setLoi] = useState<string | null>(null);

	const ungVien = useQuery(
		trpc.okr.alignmentTargets.queryOptions({ objectiveId }),
	);
	const gan = useMutation(
		trpc.okr.addAlignment.mutationOptions({
			onSuccess: (kq) => {
				if (kq.canhBao) toast.warning(kq.canhBao);
				toast.success(h.daGan);
				void cache.okr(objectiveId);
				dong();
			},
			onError: (e) => setLoi(e.message),
		}),
	);

	const coRoi = new Set(
		daGop.map((g) => khoaDich(g.targetObjectiveId, g.targetKeyResultId)),
	);
	const dich = (ungVien.data?.targets ?? []).filter(
		(t) => !coRoi.has(khoaDich(t.objectiveId, t.keyResultId)),
	);
	const luaChon = dich.map((t) => ({
		value: khoaDich(t.objectiveId, t.keyResultId),
		label: t.label,
		hint: t.unitName,
		keywords: [t.unitName],
	}));
	const daChon = dich.find(
		(t) => khoaDich(t.objectiveId, t.keyResultId) === chon,
	);

	const gui = () => {
		if (!daChon || gan.isPending) return;
		setLoi(null);
		gan.mutate({
			objectiveId,
			targetObjectiveId:
				daChon.keyResultId === null ? daChon.objectiveId : null,
			targetKeyResultId: daChon.keyResultId,
		});
	};

	return (
		<Dialog
			open
			onOpenChange={(mo) => {
				if (!mo && !gan.isPending) dong();
			}}
		>
			<DialogContent data-hop-thoai-can-chinh>
				<DialogHeader>
					<DialogTitle>{h.ganCanChinh}</DialogTitle>
					<DialogDescription>{h.moTaCanChinh}</DialogDescription>
				</DialogHeader>
				<form
					id={`${ma}-form`}
					onSubmit={(e) => {
						e.preventDefault();
						gui();
					}}
				>
					<Field>
						<FieldLabel htmlFor={`${ma}-dich`}>{h.ganVao}</FieldLabel>
						<Combobox
							id={`${ma}-dich`}
							translate="no"
							disabled={ungVien.isPending || luaChon.length === 0}
							options={luaChon}
							value={chon}
							onValueChange={setChon}
							placeholder={
								ungVien.isPending
									? h.dangTai
									: luaChon.length === 0
										? h.khongDich
										: h.chonDich
							}
							searchPlaceholder={h.timDich}
							empty={h.khongDich}
						/>
						{loi ? <FieldError>{loi}</FieldError> : null}
					</Field>
				</form>
				<DialogFooter>
					<Button variant="outline" onClick={dong} disabled={gan.isPending}>
						{h.huy}
					</Button>
					<Button
						type="submit"
						form={`${ma}-form`}
						disabled={gan.isPending || !daChon}
					>
						{gan.isPending ? <Spinner /> : null}
						{h.gan}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
