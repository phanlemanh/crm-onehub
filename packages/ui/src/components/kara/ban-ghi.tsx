"use client";

import AiGenerate from "@carbon/icons-react/es/AiGenerate";
import { Button } from "@crm/ui/components/button";
import { Icon } from "@crm/ui/components/icon";
import type { ComponentProps } from "react";

export type NutKaraProps = Omit<
	ComponentProps<typeof Button>,
	"children" | "variant" | "aria-label"
> & {
	nhan: string;
	dangChay?: string | null;
	gonTrenDienThoai?: boolean;
};

export function NutKara({
	nhan,
	dangChay = null,
	gonTrenDienThoai = false,
	disabled,
	size = "sm",
	...props
}: NutKaraProps) {
	const chay = dangChay !== null;
	return (
		<Button
			{...props}
			variant="outline"
			size={size}
			data-slot="nut-kara"
			aria-busy={chay || undefined}
			aria-label={gonTrenDienThoai && !chay ? nhan : undefined}
			disabled={disabled || chay}
		>
			{chay ? null : <Icon icon={AiGenerate} data-icon="inline-start" />}
			{chay ? (
				dangChay
			) : gonTrenDienThoai ? (
				<span className="hidden sm:inline">{nhan}</span>
			) : (
				nhan
			)}
		</Button>
	);
}
