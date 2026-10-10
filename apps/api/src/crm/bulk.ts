import type { Db } from "@crm/db";
import { BadRequestException } from "@nestjs/common";
import { z } from "zod";

export const MAX_BULK_IDS = 100;

export const bulkIdsInput = z.object({
	ids: z
		.array(z.string())
		.min(1, "Nothing was selected.")
		.max(MAX_BULK_IDS, "Too many records at once — select a page at a time."),
});

export const crmBulkResultOutput = z.object({
	requested: z.number(),
	succeeded: z.number(),
	skipped: z.number(),
	failed: z.number(),
	message: z.string().nullable(),
	changedIds: z.array(z.string()),
});

export type BulkResult = z.infer<typeof crmBulkResultOutput>;

export function inRequestOrder(
	ids: string[],
	rows: { id: string }[],
): string[] {
	const changed = new Set(rows.map((row) => row.id));
	return ids.filter((id) => changed.has(id));
}

export async function requireOwner(
	db: Db,
	ownerId: string | null,
): Promise<void> {
	if (!ownerId) return;

	const owner = await db.user.findUnique({
		where: { id: ownerId },
		select: { id: true },
	});

	if (!owner) {
		throw new BadRequestException("That owner does not work here any more.");
	}
}

export async function runBulk(
	ids: string[],
	act: (id: string) => Promise<unknown>,
): Promise<BulkResult> {
	const unique = [...new Set(ids)];
	const changedIds: string[] = [];
	let skipped = 0;
	let message: string | null = null;

	for (const id of unique) {
		try {
			const outcome = await act(id);
			if (outcome === null) {
				skipped += 1;
			} else {
				changedIds.push(id);
			}
		} catch (error) {
			message ??=
				error instanceof Error ? error.message : "Something went wrong.";
		}
	}

	return {
		requested: unique.length,
		succeeded: changedIds.length,
		skipped,
		failed: unique.length - changedIds.length - skipped,
		message,
		changedIds,
	};
}
