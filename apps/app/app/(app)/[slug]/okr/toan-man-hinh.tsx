"use client";

import { useIsMobile } from "@crm/ui/hooks/use-mobile";
import { usePathname } from "next/navigation";
import {
	createContext,
	type ReactNode,
	useContext,
	useMemo,
	useState,
} from "react";
import { laDuongSoDo } from "./toan-man-hinh-luat";

type ToanManHinh = { bat: boolean; dat: (bat: boolean) => void };

const ToanManHinhContext = createContext<ToanManHinh>({
	bat: false,
	dat: () => {},
});

export function ToanManHinhProvider({ children }: { children: ReactNode }) {
	const duocBat = laDuongSoDo(usePathname() ?? "") && !useIsMobile();
	const [xin, datXin] = useState(false);
	if (xin && !duocBat) datXin(false);
	const bat = xin && duocBat;
	const giaTri = useMemo<ToanManHinh>(() => ({ bat, dat: datXin }), [bat]);
	return (
		<ToanManHinhContext.Provider value={giaTri}>
			{children}
		</ToanManHinhContext.Provider>
	);
}

export function useToanManHinh(): ToanManHinh {
	return useContext(ToanManHinhContext);
}
