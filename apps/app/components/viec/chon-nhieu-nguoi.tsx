"use client";

import ChevronDown from "@carbon/icons-react/es/ChevronDown";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@crm/ui/components/command";
import { Icon } from "@crm/ui/components/icon";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@crm/ui/components/popover";
import { selectTriggerVariants } from "@crm/ui/components/select";
import { type ComponentProps, useState } from "react";

export type NguoiChon = { value: string; label: string };

export function ChonNhieuNguoi({
	options,
	value,
	onValueChange,
	toiDa,
	placeholder,
	searchPlaceholder,
	empty,
	...props
}: Omit<ComponentProps<"button">, "onChange" | "value"> & {
	options: NguoiChon[];
	value: string[];
	onValueChange: (value: string[]) => void;
	toiDa: number;
	placeholder: string;
	searchPlaceholder: string;
	empty: string;
}) {
	const [open, setOpen] = useState(false);
	const chon = new Set(value);
	const nhan = options
		.filter((o) => chon.has(o.value))
		.map((o) => o.label)
		.join(", ");
	const daDay = value.length >= toiDa;

	const doi = (ma: string) => {
		if (chon.has(ma)) {
			onValueChange(value.filter((v) => v !== ma));
			return;
		}
		if (daDay) return;
		onValueChange([...value, ma]);
	};

	return (
		<Popover onOpenChange={setOpen} open={open}>
			<PopoverTrigger asChild>
				<button
					aria-expanded={open}
					className={selectTriggerVariants()}
					data-placeholder={nhan === "" ? "" : undefined}
					data-size="default"
					data-slot="combobox-trigger"
					role="combobox"
					translate="no"
					type="button"
					{...props}
				>
					<span data-slot="select-value">
						<span className="min-w-0 truncate" title={nhan}>
							{nhan === "" ? placeholder : nhan}
						</span>
					</span>
					<Icon
						className="pointer-events-none size-4 text-muted-foreground"
						icon={ChevronDown}
					/>
				</button>
			</PopoverTrigger>
			<PopoverContent align="start" size="panel" translate="no">
				<Command>
					<CommandInput placeholder={searchPlaceholder} />
					<CommandList>
						<CommandEmpty>{empty}</CommandEmpty>
						<CommandGroup>
							{options.map((o) => (
								<CommandItem
									data-checked={chon.has(o.value)}
									disabled={daDay && !chon.has(o.value)}
									key={o.value}
									onSelect={() => doi(o.value)}
									value={o.label}
								>
									<span className="min-w-0 flex-1 truncate">{o.label}</span>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
