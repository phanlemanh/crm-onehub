import { toDay } from "@crm/ui/lib/format";

export function quaHan(
	dueAt: Date,
	completedAt: Date | null,
	now: Date,
): boolean {
	return completedAt === null && toDay(dueAt) < toDay(now);
}
