"use client";

import Book from "@carbon/icons-react/es/Book";

import {
	Command,
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@crm/ui/components/command";
import {
	EntityLogo,
	type EntityLogoTone,
} from "@crm/ui/components/entity-logo";
import { Icon } from "@crm/ui/components/icon";
import { useLocale } from "@crm/ui/components/locale-provider";
import { PersonAvatar } from "@crm/ui/components/person-avatar";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { useOpenRecord } from "@/components/crm/record-sheet/record-stack";
import { lyDoLoi } from "@/lib/ly-do-loi";
import { khungUngDungMessages } from "@/lib/messages/khung-ung-dung";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import { duongTrang } from "@/lib/tai-lieu-man";
import { useTRPC } from "@/lib/trpc/client";
import { useWorkspaceUrl } from "@/lib/use-workspace-url";

const KINDS = ["company", "contact", "deal"] as const;

type DoanTrich = { truoc: string; khop: string; sau: string };

function Trich({ doan }: { doan: DoanTrich }) {
	return (
		<span className="truncate text-muted-foreground text-xs" translate="no">
			{doan.truoc}
			<strong>{doan.khop}</strong>
			{doan.sau}
		</span>
	);
}

export function QuickSwitcher({ coDoiTac }: { coDoiTac: boolean }) {
	const openRecord = useOpenRecord();
	const router = useRouter();
	const url = useWorkspaceUrl();
	const trpc = useTRPC();
	const m = khungUngDungMessages(useLocale()).switcher;

	const [open, setOpen] = useQueryState(
		SEARCH_PARAM.dialog.switcher,
		parseAsBoolean.withDefault(false),
	);
	const [query, setQuery] = useState("");

	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				void setOpen((current) => (current ? null : true));
			}
		};

		document.addEventListener("keydown", onKeyDown);
		return () => document.removeEventListener("keydown", onKeyDown);
	}, [setOpen]);

	const duChu = query.trim().length >= 2;
	const results = useQuery({
		...trpc.search.quick.queryOptions({ q: query }),
		enabled: open && coDoiTac && duChu,
		placeholderData: (previous) => previous,
	});
	const taiLieu = useQuery({
		...trpc.taiLieu.tim.queryOptions({ q: query }),
		enabled: open && duChu,
		placeholderData: (previous) => previous,
	});

	const hits = coDoiTac && !results.isError ? (results.data?.hits ?? []) : [];
	const crmLoi =
		coDoiTac &&
		duChu &&
		results.isError &&
		lyDoLoi(results.error) !== "khong-quyen";
	const trang = taiLieu.data?.rows ?? [];

	const moTrang = (slug: string) => {
		setQuery("");
		router.push(url(duongTrang(slug)));
	};

	const go = (kind: (typeof KINDS)[number], id: string) => {
		setQuery("");
		void setOpen(null);
		openRecord({ kind, id });
	};

	return (
		<CommandDialog
			open={open}
			onOpenChange={(next) => setOpen(next || null)}
			title={m.title}
			description={coDoiTac ? m.description : m.descriptionTaiLieu}
		>
			<Command shouldFilter={false}>
				<CommandInput
					placeholder={coDoiTac ? m.placeholder : m.placeholderTaiLieu}
					value={query}
					onValueChange={setQuery}
				/>
				<CommandList label={m.results}>
					<CommandEmpty>
						{query.trim().length < 2 ? m.typeMore : m.noMatch}
					</CommandEmpty>

					{duChu && taiLieu.isError ? (
						<CommandGroup heading={m.taiLieu}>
							<CommandItem data-tai-lieu-loi="" disabled value="tai-lieu-loi">
								{m.taiLieuLoi}
							</CommandItem>
						</CommandGroup>
					) : null}

					{crmLoi ? (
						<CommandGroup heading={m.crm}>
							<CommandItem data-crm-loi="" disabled value="crm-loi">
								{m.crmLoi}
							</CommandItem>
						</CommandGroup>
					) : null}

					{KINDS.map((kind) => {
						const group = hits.filter((hit) => hit.kind === kind);
						if (group.length === 0) return null;

						return (
							<CommandGroup key={kind} heading={m.groups[kind]}>
								{group.map((hit) => (
									<CommandItem
										key={`${hit.kind}:${hit.id}`}
										value={`${hit.kind}:${hit.id}`}
										onSelect={() => go(kind, hit.id)}
									>
										{hit.kind === "contact" ? (
											<PersonAvatar
												src={hit.imageUrl}
												name={hit.label}
												size="sm"
											/>
										) : (
											<EntityLogo
												src={hit.iconUrl}
												darkSrc={hit.iconDarkUrl}
												tone={hit.iconTone as EntityLogoTone | null | undefined}
												name={hit.label}
												size="sm"
											/>
										)}
										<span className="flex min-w-0 flex-col" translate="no">
											<span className="truncate">{hit.label}</span>
											{hit.detail ? (
												<span className="truncate text-muted-foreground text-xs">
													{hit.detail}
												</span>
											) : null}
										</span>
									</CommandItem>
								))}
							</CommandGroup>
						);
					})}
					{duChu && !taiLieu.isError && trang.length > 0 ? (
						<CommandGroup heading={m.taiLieu}>
							{trang.map((t) => (
								<CommandItem
									data-tai-lieu={t.slug}
									key={`tai-lieu:${t.slug}`}
									onSelect={() => moTrang(t.slug)}
									value={`tai-lieu:${t.slug}`}
								>
									<Icon icon={Book} />
									<span className="flex min-w-0 flex-col">
										<span className="truncate" translate="no">
											{t.ten}
										</span>
										<Trich doan={t.doanTrich} />
									</span>
								</CommandItem>
							))}
						</CommandGroup>
					) : null}
				</CommandList>
			</Command>
		</CommandDialog>
	);
}
