"use client";

import { useSyncExternalStore } from "react";

export function useKhoHep(truyVan: string): boolean {
	return useSyncExternalStore(
		(bao) => {
			const q = window.matchMedia(truyVan);
			q.addEventListener("change", bao);
			return () => q.removeEventListener("change", bao);
		},
		() => window.matchMedia(truyVan).matches,
		() => false,
	);
}
