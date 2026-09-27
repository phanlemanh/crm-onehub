"use client";

import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@crm/ui/components/select";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";

export type ViewSwitchItem = { value: string; label: string };

export function ViewSwitch({
	label,
	value,
	items,
	onValueChange,
}: {
	label: string;
	value: string;
	items: ViewSwitchItem[];
	onValueChange: (value: string) => void;
}) {
	return (
		<>
			<ToggleGroup
				aria-label={label}
				className="hidden md:flex"
				data-view-switch="nut"
				size="sm"
				type="single"
				value={value}
				variant="outline"
				onValueChange={(v) => {
					if (v) onValueChange(v);
				}}
			>
				{items.map((i) => (
					<ToggleGroupItem key={i.value} value={i.value}>
						{i.label}
					</ToggleGroupItem>
				))}
			</ToggleGroup>
			<div className="md:hidden" data-view-switch="chon">
				<Select value={value} onValueChange={onValueChange}>
					<SelectTrigger aria-label={label} size="sm">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						{items.map((i) => (
							<SelectItem key={i.value} value={i.value}>
								{i.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</>
	);
}
