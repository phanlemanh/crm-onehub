import {
	currentTree,
	MeasureDatabaseError,
	treeSlug,
} from "@crm/db/measure-database";

export function dauMocCay(cwd = process.cwd()): string | null {
	try {
		return treeSlug(currentTree(cwd));
	} catch (loi) {
		if (loi instanceof MeasureDatabaseError) return null;
		throw loi;
	}
}
