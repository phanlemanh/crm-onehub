"use client";

import { Field } from "@crm/ui/components/field";
import { cn } from "@crm/ui/lib/utils";
import type * as React from "react";

const KHO_BAM = "(width < 48rem)";
const KHOANG_TRONG_PX = 8;
const KIEM_LAI_MS = [150, 400, 700];

function vungCuon(tu: HTMLElement): Element | null {
	let el = tu.parentElement;
	while (el) {
		const oy = getComputedStyle(el).overflowY;
		if ((oy === "auto" || oy === "scroll") && el.scrollHeight > el.clientHeight)
			return el;
		el = el.parentElement;
	}
	return document.scrollingElement;
}

function giuKhoiBiChe(hang: HTMLDivElement) {
	const khung = hang.closest("form") ?? hang.parentElement;
	if (!khung) return;
	const khiTro = (e: FocusEvent, dichBam?: HTMLElement) => {
		if (!window.matchMedia(KHO_BAM).matches) return;
		const dich = dichBam ?? e.target;
		if (!(dich instanceof HTMLElement) || hang.contains(dich)) return;
		const dayLen = () => {
			if (document.activeElement !== dich) return;
			const khoi = dich.closest<HTMLElement>("[data-slot='field']") ?? dich;
			const thua =
				khoi.getBoundingClientRect().bottom -
				hang.getBoundingClientRect().top +
				KHOANG_TRONG_PX;
			if (thua <= 0) return;
			vungCuon(hang)?.scrollBy({ top: thua });
		};
		requestAnimationFrame(dayLen);
		for (const ms of KIEM_LAI_MS) setTimeout(dayLen, ms);
	};
	const khiBam = (e: MouseEvent) => {
		const dich = e.target;
		if (dich instanceof HTMLElement && dich === document.activeElement)
			khiTro(new FocusEvent("focusin", { relatedTarget: null }), dich);
	};
	khung.addEventListener("focusin", khiTro);
	khung.addEventListener("click", khiBam);
	return () => {
		khung.removeEventListener("focusin", khiTro);
		khung.removeEventListener("click", khiBam);
	};
}

function HangHanhDongBamDay({
	className,
	...props
}: Omit<React.ComponentProps<typeof Field>, "orientation" | "ref">) {
	return (
		<Field
			className={cn(
				"max-md:sticky max-md:bottom-0 max-md:z-10 max-md:border-t max-md:bg-background max-md:py-3",
				className,
			)}
			data-slot="hang-hanh-dong-bam-day"
			orientation="horizontal"
			ref={(hang: HTMLDivElement | null) =>
				hang ? giuKhoiBiChe(hang) : undefined
			}
			{...props}
		/>
	);
}

export { HangHanhDongBamDay };
