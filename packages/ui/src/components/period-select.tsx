"use client";

import { useMessages } from "@crm/ui/components/locale-provider";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";

export type PeriodItem = {
	value: string;
	label: string;
	current?: boolean;
	closed?: boolean;
};

export type PeriodGroup = { label: string; items: PeriodItem[] };

function PeriodSelect({
	label,
	groups,
	value,
	onValueChange,
	size,
	triggerAttrs,
}: {
	label: string;
	groups: PeriodGroup[];
	value: string | null;
	onValueChange: (value: string) => void;
	size?: "sm" | "default";
	triggerAttrs?: { [k: `data-${string}`]: string | undefined };
}) {
	const msg = useMessages();
	const chon = groups
		.flatMap((g) => g.items)
		.find((it) => it.value === value);
	return (
		<Select onValueChange={onValueChange} value={value ?? undefined}>
			<SelectTrigger aria-label={label} size={size ?? "sm"} {...triggerAttrs}>
				<SelectValue>
					{chon ? <span translate="no">{chon.label}</span> : null}
				</SelectValue>
			</SelectTrigger>
			<SelectContent align="end">
				{groups.map((g) => (
					<SelectGroup key={g.label}>
						<SelectLabel>{g.label}</SelectLabel>
						{g.items.map((it) => (
							<SelectItem
								data-closed={it.closed ? "" : undefined}
								data-current={it.current ? "" : undefined}
								key={it.value}
								value={it.value}
							>
								<span translate="no">{it.label}</span>
								{it.current ? (
									<span className="text-muted-foreground">
										{" · "}
										{msg.chuKy.hienTai}
									</span>
								) : null}
								{it.closed ? (
									<span className="text-muted-foreground">
										{" · "}
										{msg.chuKy.daDong}
									</span>
								) : null}
							</SelectItem>
						))}
					</SelectGroup>
				))}
			</SelectContent>
		</Select>
	);
}

export { PeriodSelect };
