import type { MocNgay } from "@crm/validation/bo-loc-truong";

export type KhoangNgay = { gte?: Date; lt?: Date };

export function khoangMoc(moc: MocNgay, now: Date = new Date()): KhoangNgay {
	const dauThangNay = new Date(now.getFullYear(), now.getMonth(), 1);
	const dauThangSau = new Date(now.getFullYear(), now.getMonth() + 1, 1);
	const dauThangKe = new Date(now.getFullYear(), now.getMonth() + 2, 1);

	switch (moc) {
		case "overdue":
			return { lt: now };
		case "this-month":
			return { gte: dauThangNay, lt: dauThangSau };
		case "next-month":
			return { gte: dauThangSau, lt: dauThangKe };
		case "later":
			return { gte: dauThangKe };
	}
}
