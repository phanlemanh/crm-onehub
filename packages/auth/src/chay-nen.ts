import { waitUntil } from "@vercel/functions";

export function chayNen(viec: Promise<unknown>): void {
	const daBat = viec.then(
		() => undefined,
		(loi: unknown) => {
			console.error(
				`[auth] viec nen that bai: ${(loi as Error)?.name ?? "loi"}`,
			);
		},
	);
	waitUntil(daBat);
}
