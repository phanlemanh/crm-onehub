import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function laTuThongBao(event: { target: EventTarget | null }) {
	return (
		event.target instanceof Element &&
		event.target.closest("[data-sonner-toaster]") !== null
	);
}

export function laEscTuOSuaDeXuat(event: { target: EventTarget | null }) {
	return (
		event.target instanceof Element &&
		event.target.closest(
			'[data-slot="suggestion-edit"], [data-slot="proposed-change-edit"]',
		) !== null
	);
}
