"use client";

import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupTextarea,
} from "@crm/ui/components/input-group";
import { useLocale } from "@crm/ui/components/locale-provider";
import { Spinner } from "@crm/ui/components/spinner";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { OSoanViec } from "@/components/viec/o-soan-viec";
import { activityLabel } from "@/lib/activity-presentation";
import { type CrmMessages, crmMessages } from "@/lib/messages/crm";
import { viecMessages } from "@/lib/messages/viec";
import { useCrmCache } from "@/lib/trpc/cache";
import { useTRPC } from "@/lib/trpc/client";
import { ActivityIcon } from "./activity-icon";
import type { TimelineAnchor } from "./timeline";

const LOAI = ["NOTE", "CALL", "EMAIL", "MEETING", "VIEC"] as const;

type LoaiSoan = (typeof LOAI)[number];

type LoaiHoatDong = Exclude<LoaiSoan, "VIEC">;

function placeholders(m: CrmMessages) {
	const c = m.timeline.composer;
	return {
		NOTE: c.placeholder,
		CALL: c.call,
		EMAIL: c.note,
		MEETING: c.meeting,
	} satisfies Record<LoaiHoatDong, string>;
}

export function ActivityComposer({ anchor }: { anchor: TimelineAnchor }) {
	const locale = useLocale();
	const m = crmMessages(locale);
	const v = viecMessages(locale);
	const trpc = useTRPC();
	const cache = useCrmCache();

	const [type, setType] = useState<LoaiSoan>("NOTE");
	const [draft, setDraft] = useState("");
	const text = draft.trim();

	const create = useMutation(
		trpc.activities.create.mutationOptions({
			onSuccess: async () => {
				await cache.activity();
				setDraft("");
			},
			onError: (error) =>
				toast.error(error.data ? error.message : m.timeline.composer.failed),
		}),
	);

	const nhanLoai = (loai: LoaiSoan) =>
		loai === "VIEC" ? v.oSoan.loai : activityLabel(loai, locale);

	const chonLoai = (
		<div className="min-w-0 overflow-x-auto">
			<ToggleGroup
				onValueChange={(next) => next && setType(next as LoaiSoan)}
				size="sm"
				spacing={0}
				type="single"
				value={type}
			>
				{LOAI.map((option) => (
					<ToggleGroupItem
						aria-label={nhanLoai(option)}
						key={option}
						value={option}
					>
						<ActivityIcon type={option === "VIEC" ? "TASK" : option} />
						{nhanLoai(option)}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
		</div>
	);

	if (type === "VIEC") return <OSoanViec anchor={anchor} loaiChon={chonLoai} />;

	const submit = () => {
		if (text === "" || create.isPending) return;
		create.mutate({ ...anchor, type, body: text });
	};

	return (
		<form
			onSubmit={(event) => {
				event.preventDefault();
				submit();
			}}
		>
			<InputGroup>
				<InputGroupTextarea
					aria-label={m.timeline.composer.happened}
					onChange={(event) => setDraft(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
							event.preventDefault();
							submit();
						}
						if (event.key === "Escape") setDraft("");
					}}
					placeholder={placeholders(m)[type]}
					value={draft}
				/>
				<InputGroupAddon align="block-end" className="gap-2 border-t">
					{chonLoai}
					{text === "" ? null : (
						<InputGroupButton
							className="ml-auto"
							disabled={create.isPending}
							size="xs"
							type="submit"
							variant="default"
						>
							{create.isPending ? <Spinner /> : null}
							{m.timeline.composer.log(
								activityLabel(type, locale).toLowerCase(),
							)}
						</InputGroupButton>
					)}
				</InputGroupAddon>
			</InputGroup>
		</form>
	);
}
