"use client";

import Checkmark from "@carbon/icons-react/es/Checkmark";
import { Icon } from "@crm/ui/components/icon";
import { cn } from "@crm/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Toggle as TogglePrimitive } from "radix-ui";
import type * as React from "react";

const toggleVariants = cva(
	"group/toggle inline-flex items-center justify-center gap-1 rounded-md text-muted-foreground text-xs font-medium whitespace-nowrap transition-all outline-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 aria-pressed:bg-muted aria-pressed:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	{
		variants: {
			variant: {
				default: "bg-transparent",
				outline:
					"border border-input bg-transparent hover:bg-muted data-[state=on]:border-ring data-[state=on]:bg-background data-[state=on]:ring-1 data-[state=on]:ring-ring/30",
				"outline-check":
					"border border-input bg-transparent hover:bg-muted aria-pressed:bg-accent data-[state=on]:bg-accent data-[state=on]:text-accent-foreground data-[state=on]:[&>[data-icon=inline-start]]:hidden",
			},
			size: {
				default:
					"h-8 min-w-8 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
				sm: "h-7 min-w-7 rounded-md px-2.5 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5",
				lg: "h-9 min-w-9 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

type ToggleVariant = VariantProps<typeof toggleVariants>["variant"];

function ToggleCheck({ variant }: { variant: ToggleVariant }) {
	if (variant !== "outline-check") return null;
	return (
		<Icon
			className="hidden group-data-[state=on]/toggle:inline-block"
			data-slot="toggle-check"
			icon={Checkmark}
			motion="none"
		/>
	);
}

function Toggle({
	className,
	variant = "default",
	size = "default",
	children,
	...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
	VariantProps<typeof toggleVariants>) {
	return (
		<TogglePrimitive.Root
			data-slot="toggle"
			data-variant={variant}
			className={cn(toggleVariants({ variant, size, className }))}
			{...props}
		>
			<ToggleCheck variant={variant} />
			{children}
		</TogglePrimitive.Root>
	);
}

export { Toggle, ToggleCheck, toggleVariants };
