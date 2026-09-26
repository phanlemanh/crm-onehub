"use client";

import { createContext, type ReactNode, useContext } from "react";

const ApiOrigin = createContext<string | null>(null);

export function ApiOriginProvider({
	origin,
	children,
}: {
	origin: string;
	children: ReactNode;
}) {
	return <ApiOrigin.Provider value={origin}>{children}</ApiOrigin.Provider>;
}

export function useApiOrigin(): string | null {
	return useContext(ApiOrigin);
}
