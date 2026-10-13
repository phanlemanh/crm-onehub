"use client";

import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@crm/ui/components/command";
import { useMessages } from "@crm/ui/components/locale-provider";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@crm/ui/components/popover";
import { selectTriggerVariants } from "@crm/ui/components/select";
import { cn } from "@crm/ui/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import type * as React from "react";
import { useState } from "react";

type ComboboxMultiOption = {
	value: string;
	label: string;
	hint?: string;
	disabled?: boolean;
};

function ComboboxMulti({
	options,
	values,
	onValuesChange,
	placeholder,
	searchPlaceholder,
	empty,
	max,
	disabled,
	translate,
	className,
	...props
}: Omit<React.ComponentProps<"button">, "onChange" | "value" | "disabled"> & {
	options: ComboboxMultiOption[];
	values: string[];
	onValuesChange: (values: string[]) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	empty?: React.ReactNode;
	max?: number;
	disabled?: boolean;
}) {
	const [open, setOpen] = useState(false);
	const msg = useMessages();
	const chosen = new Set(values);
	const summary = options
		.filter((option) => chosen.has(option.value))
		.map((option) => option.label)
		.join(", ");
	const full = max !== undefined && values.length >= max;

	const toggle = (value: string) => {
		if (chosen.has(value)) {
			onValuesChange(values.filter((v) => v !== value));
			return;
		}
		if (full) return;
		onValuesChange([...values, value]);
	};

	return (
		<Popover open={open && !disabled} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					role="combobox"
					aria-expanded={open}
					disabled={disabled}
					data-slot="combobox-trigger"
					data-size="default"
					data-placeholder={summary === "" ? "" : undefined}
					translate={translate}
					className={cn(selectTriggerVariants(), className)}
					{...props}
				>
					<span data-slot="select-value">
						<span className="min-w-0 truncate" title={summary}>
							{summary === "" ? (placeholder ?? msg.macDinh.chonMuc) : summary}
						</span>
					</span>
					<ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
				</button>
			</PopoverTrigger>

			<PopoverContent align="start" size="panel" translate={translate}>
				<Command>
					<CommandInput
						placeholder={searchPlaceholder ?? msg.macDinh.timMuc}
					/>
					<CommandList>
						<CommandEmpty>{empty ?? msg.macDinh.khongKhop}</CommandEmpty>
						<CommandGroup>
							{options.map((option) => {
								const isChosen = chosen.has(option.value);
								const off = option.disabled === true || (full && !isChosen);
								return (
									<CommandItem
										key={option.value}
										value={option.label}
										disabled={off}
										aria-disabled={off}
										data-checked={isChosen}
										onSelect={() => toggle(option.value)}
									>
										<span className="min-w-0 flex-1 truncate">
											{option.label}
										</span>
										{option.hint ? (
											<span className="shrink-0 truncate text-muted-foreground text-xs">
												{option.hint}
											</span>
										) : null}
									</CommandItem>
								);
							})}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}

export { ComboboxMulti, type ComboboxMultiOption };
