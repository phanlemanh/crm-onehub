"use client";

import { createContext, useContext } from "react";

const KhoSanPham = createContext<string | null>(null);

export const KhoSanPhamProvider = KhoSanPham.Provider;

export function useKhoSanPham(): string | null {
	return useContext(KhoSanPham);
}
