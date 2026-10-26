"use client";

import { type DehydratedState, HydrationBoundary } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useRecordStack } from "./record-stack";

export function NapSanKhiMoNgan({
	state,
	children,
}: {
	state: DehydratedState;
	children: ReactNode;
}) {
	const { stack } = useRecordStack();
	return (
		<HydrationBoundary state={stack.length > 0 ? state : undefined}>
			{children}
		</HydrationBoundary>
	);
}
