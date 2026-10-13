import { z } from "zod";

export const caNhanDaLuuTruOutput = z.object({
	id: z.string(),
	firstName: z.string(),
	lastName: z.string().nullable(),
	email: z.string().nullable(),
	archivedAt: z.string(),
});

export const thoaThuanDaLuuTruOutput = z.object({
	id: z.string(),
	name: z.string(),
	archivedAt: z.string(),
});

type CoLuuTru = { id: string; archivedAt: Date | null };

export function tachDaLuuTru<T extends CoLuuTru>(rows: T[]) {
	const dangDung = rows.filter((row) => row.archivedAt === null);
	const daLuuTru = rows
		.filter((row): row is T & { archivedAt: Date } => row.archivedAt !== null)
		.sort(
			(a, b) =>
				b.archivedAt.getTime() - a.archivedAt.getTime() ||
				a.id.localeCompare(b.id),
		);
	return { dangDung, daLuuTru };
}

export function caNhanDaLuuTru(row: {
	id: string;
	firstName: string;
	lastName: string | null;
	email: string | null;
	archivedAt: Date;
}) {
	return {
		id: row.id,
		firstName: row.firstName,
		lastName: row.lastName,
		email: row.email,
		archivedAt: row.archivedAt.toISOString(),
	};
}

export function thoaThuanDaLuuTru(row: {
	id: string;
	name: string;
	archivedAt: Date;
}) {
	return {
		id: row.id,
		name: row.name,
		archivedAt: row.archivedAt.toISOString(),
	};
}
