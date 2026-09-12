"use client";

import { useLocale } from "@crm/ui/components/locale-provider";
import { ToggleGroup, ToggleGroupItem } from "@crm/ui/components/toggle-group";
import { useQueryState } from "nuqs";
import { tongQuanMessages } from "@/lib/messages/tong-quan";
import { SEARCH_PARAM } from "@/lib/search-param-keys";
import {
	OVERVIEW_SCOPES,
	type OverviewScope,
	overviewParsers,
} from "./overview-search-params";

function isScope(value: string): value is OverviewScope {
	return (OVERVIEW_SCOPES as readonly string[]).includes(value);
}

export function OverviewScopeToggleFallback() {
	const m = tongQuanMessages(useLocale()).scope;
	return (
		<ToggleGroup
			type="single"
			variant="outline"
			size="sm"
			spacing={0}
			disabled
			aria-label={m.label}
		>
			{OVERVIEW_SCOPES.map((value) => (
				<ToggleGroupItem key={value} value={value}>
					{m[value]}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}

export function OverviewScopeToggle() {
	const m = tongQuanMessages(useLocale()).scope;
	const [scope, setScope] = useQueryState(
		SEARCH_PARAM.overview.scope,
		overviewParsers[SEARCH_PARAM.overview.scope],
	);

	return (
		<ToggleGroup
			type="single"
			variant="outline"
			size="sm"
			spacing={0}
			value={scope}
			onValueChange={(next) => {
				if (isScope(next)) void setScope(next);
			}}
			aria-label={m.label}
		>
			{OVERVIEW_SCOPES.map((value) => (
				<ToggleGroupItem key={value} value={value}>
					{m[value]}
				</ToggleGroupItem>
			))}
		</ToggleGroup>
	);
}
