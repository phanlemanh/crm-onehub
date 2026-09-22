import type { ReactNode } from "react";
import type { Locale } from "../lib/locale";

export function ForeignText({
	lang,
	className,
	children,
}: {
	lang: Locale;
	className?: string;
	children: ReactNode;
}) {
	return (
		<span lang={lang} className={className}>
			{children}
		</span>
	);
}
