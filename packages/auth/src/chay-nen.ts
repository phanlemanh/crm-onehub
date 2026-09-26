import { waitUntil } from "@vercel/functions";

export function chayNen(viec: Promise<unknown>): void {
	const daBat = viec.then(
		() => undefined,
		(loi: Error | undefined) => {
			console.error(`[auth] viec nen that bai: ${loi?.name ?? "loi"}`);
		},
	);
	waitUntil(daBat);
}
