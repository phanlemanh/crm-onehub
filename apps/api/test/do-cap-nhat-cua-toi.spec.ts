import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { doCapNhatCuaToi, inKetQua } from "../scripts/okr/do-cap-nhat-cua-toi";
import { bpMoi, dungSan, nguoiMoi, pbMoi, truongMoi } from "./okr-san";

dungSan();

const TU = new Date("2027-01-04T00:00:00+07:00");
const DEN = new Date("2027-01-18T00:00:00+07:00");
const TRONG = new Date("2027-01-06T03:00:00.000Z");
const NGOAI = new Date("2026-12-20T03:00:00.000Z");

async function gieo(
	userId: string,
	entry: string,
	soLan: number,
	submittedAt: Date | null,
): Promise<void> {
	for (let i = 0; i < soLan; i += 1)
		await db.okrCheckInSession.create({
			data: {
				userId,
				entry,
				openedAt: submittedAt ?? TRONG,
				submittedAt,
				seconds: submittedAt ? 30 : null,
			},
		});
}

const demBang = async () => [
	await db.okrCheckInSession.count(),
	await db.division.count(),
	await db.department.count(),
];

describe("ctbp-do-nguong", () => {
	test("ctbp-do-nguong: chi doc, dem phien da gui cua truong don vi trong cua so, moi loi tru sheet la o Cua toi, san 10 phien", async () => {
		const bp = await bpMoi("ctbp-bp");
		const pb = await pbMoi("ctbp-pb", bp);
		const t1 = (await truongMoi("division", bp, "ctbp-t1")).nguoi;
		const t2 = (await truongMoi("department", pb, "ctbp-t2")).nguoi;
		const m = await nguoiMoi("ctbp-m");

		await gieo(t1, "cua-toi", 4, TRONG);
		await gieo(t1, "nhac", 2, TRONG);
		await gieo(t1, "sheet", 2, TRONG);
		await gieo(t2, "viec-cua-toi", 1, TRONG);
		await gieo(t2, "cua-toi", 3, null);
		await gieo(m, "cua-toi", 5, TRONG);
		await gieo(t1, "sheet", 4, NGOAI);

		const truoc = await demBang();
		const lan1 = await doCapNhatCuaToi(db, TU, DEN);
		const sau = await demBang();
		if (lan1.n !== 9) throw new Error(`ctbp-do-nguong: n ${lan1.n}, mong 9`);
		expect({ ...lan1, chiDoc: Bun.deepEquals(truoc, sau) }).toEqual({
			n: 9,
			k: 7,
			p: 77.8,
			duMau: false,
			donViSua: 0,
			chiDoc: true,
		});
		expect(inKetQua(lan1)).toBe(
			[
				"7/9 phiên đã gửi của trưởng đơn vị mở ở Của tôi (77.8 %)",
				"không đủ mẫu (dưới 10 phiên)",
				"0 đơn vị sửa trong cửa sổ",
			].join("\n"),
		);

		await gieo(t2, "cua-toi", 1, TRONG);
		await db.department.update({
			where: { id: pb },
			data: { updatedAt: TRONG },
		});
		const lan2 = await doCapNhatCuaToi(db, TU, DEN);
		expect(lan2).toEqual({ n: 10, k: 8, p: 80, duMau: true, donViSua: 1 });
		expect(inKetQua(lan2)).toBe(
			[
				"8/10 phiên đã gửi của trưởng đơn vị mở ở Của tôi (80.0 %)",
				"đủ mẫu",
				"1 đơn vị sửa trong cửa sổ",
			].join("\n"),
		);
	});
});
