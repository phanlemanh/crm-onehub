const giamChuyenDong = (): boolean =>
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function cuonToi(o: Element | null | undefined): boolean {
	if (!o) return false;
	o.scrollIntoView({
		block: "center",
		behavior: giamChuyenDong() ? "auto" : "smooth",
	});
	return true;
}

export function cuonToiMocCuoi(): boolean {
	return cuonToi(
		[...document.querySelectorAll('[data-kara-turn="checkpoint"]')].at(-1),
	);
}

export function cuonToiDong(khoa: string): boolean {
	const dong = [...document.querySelectorAll("[data-khoa-dong]")].find(
		(o) => o.getAttribute("data-khoa-dong") === khoa,
	);
	return cuonToi(dong ?? document.querySelector("[data-ban-nhap]"));
}

export function sauMotNhip(viec: () => void): void {
	setTimeout(viec, 0);
}
