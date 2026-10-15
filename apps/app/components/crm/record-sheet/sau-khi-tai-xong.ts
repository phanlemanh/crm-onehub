"use client";

import { useMountEffect } from "@crm/ui/hooks/use-mount-effect";
import { useState } from "react";
import { NGAN_BAN_GHI } from "@/lib/ngan-ban-ghi-nap-san";

export function useSauKhiTaiXong(): boolean {
	const [xong, datXong] = useState(false);
	useMountEffect(() => {
		let huy = () => {};
		const ranh = () => {
			const xongNgay = () => datXong(true);
			if ("requestIdleCallback" in window) {
				const id = window.requestIdleCallback(xongNgay, {
					timeout: NGAN_BAN_GHI.moSau.choRanhToiDaMs,
				});
				huy = () => window.cancelIdleCallback(id);
				return;
			}
			const id = window.setTimeout(xongNgay, NGAN_BAN_GHI.moSau.choRanhMs);
			huy = () => window.clearTimeout(id);
		};
		if (document.readyState === "complete") ranh();
		else window.addEventListener("load", ranh, { once: true });
		return () => {
			window.removeEventListener("load", ranh);
			huy();
		};
	});
	return xong;
}
