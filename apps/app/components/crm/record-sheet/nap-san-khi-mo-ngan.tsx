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
	return stack.length > 0 ? (
		<HydrationBoundary state={state}>{children}</HydrationBoundary>
	) : (
		children
	);
}
