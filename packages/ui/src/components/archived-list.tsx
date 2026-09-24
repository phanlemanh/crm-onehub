"use client";

import ChevronRight from "@carbon/icons-react/es/ChevronRight";
import { Button } from "@crm/ui/components/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@crm/ui/components/collapsible";
import { Icon } from "@crm/ui/components/icon";

type ArchivedItem = {
	id: string;
	name: string;
	kind?: string;
	purgeable: boolean;
};

function ArchivedList({
	label,
	items,
	restoreLabel,
	purgeLabel,
	onRestore,
	onPurge,
	disabled = false,
	pending = false,
}: {
	label: string;
	items: ArchivedItem[];
	restoreLabel: string;
	purgeLabel: string;
	onRestore: (id: string) => void;
	onPurge: (item: ArchivedItem) => void;
	disabled?: boolean;
	pending?: boolean;
}) {
	if (items.length === 0) return null;
	return (
		<Collapsible data-slot="archived-list">
			<CollapsibleTrigger asChild>
				<Button variant="ghost" size="sm" className="group justify-start">
					<Icon
						icon={ChevronRight}
						data-icon="inline-start"
						className="transition-transform group-aria-expanded:rotate-90"
					/>
					{`${label} (${items.length})`}
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent>
				<ul className="mt-2 divide-y rounded-lg border">
					{items.map((m) => (
						<li
							key={m.id}
							data-luu-tru={m.id}
							className="flex items-center justify-between gap-3 px-3 py-2"
						>
							<span className="flex min-w-0 flex-col">
								<span className="truncate text-sm" translate="no">
									{m.name}
								</span>
								{m.kind ? (
									<span className="text-muted-foreground text-xs">
										{m.kind}
									</span>
								) : null}
							</span>
							<span className="flex shrink-0 items-center gap-2">
								<Button
									variant="outline"
									size="xs"
									disabled={disabled || pending}
									onClick={() => onRestore(m.id)}
								>
									{restoreLabel}
								</Button>
								{m.purgeable ? (
									<Button
										variant="ghost"
										size="xs"
										disabled={disabled || pending}
										onClick={() => onPurge(m)}
									>
										{purgeLabel}
									</Button>
								) : null}
							</span>
						</li>
					))}
				</ul>
			</CollapsibleContent>
		</Collapsible>
	);
}

export { ArchivedList, type ArchivedItem };
