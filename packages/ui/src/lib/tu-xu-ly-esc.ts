export const TU_XU_LY_ESC = { "data-tu-xu-ly-esc": "" } as const;

export function escTuXuLy(dich: EventTarget | null): boolean {
	return (
		dich instanceof Element && dich.closest("[data-tu-xu-ly-esc]") !== null
	);
}
