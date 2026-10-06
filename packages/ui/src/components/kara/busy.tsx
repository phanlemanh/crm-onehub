"use client";

import { createContext, type ReactNode, useContext } from "react";

export type KaraBusyState = { label: ReactNode } | null;

const KaraBusyContext = createContext<KaraBusyState>(null);

export function KaraBusyProvider({
	busy,
	children,
}: {
	busy: KaraBusyState;
	children: ReactNode;
}) {
	const cha = useContext(KaraBusyContext);
	return (
		<KaraBusyContext.Provider value={busy ?? cha}>
			{children}
		</KaraBusyContext.Provider>
	);
}

export function useKaraBusy(): KaraBusyState {
	return useContext(KaraBusyContext);
}
