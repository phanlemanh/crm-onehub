import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { parseOnboardingActivityMeta } from "@crm/validation/onboarding-activity";
import {
	buocCua,
	dichVu,
	donDep,
	gieoBoPhan,
	gieoKeHoach,
	gieoThanhVien,
	moXuong,
	phan,
	vetCua,
} from "./support/ke-hoach-gieo";

const CAU_DUONG_DO = readFileSync(
	join(
		import.meta.dir,
		"../../../_acceptance/moi-phia-deu-thay-ke-hoach/rang/ty-le-tu-danh-dau.sql",
	),
	"utf8",
);

type SoDuongDo = { tu_danh_dau: number; mau: number; khong_giao: number };

async function doDuongDo(tu: Date, den: Date): Promise<SoDuongDo> {
	const hang = await db.$queryRawUnsafe<SoDuongDo[]>(CAU_DUONG_DO, tu, den);
	return phan(hang, 0);
}

beforeAll(moXuong);
afterAll(donDep);

describe("vet-giao-luc-xong", () => {
	test("vet-giao-luc-xong: vet xong mang nguoi duoc giao luc bam, cau truy van do dung ti le", async () => {
		const tu = new Date(Date.now() - 1000);
		const [O, A, B, C] = [
			await gieoThanhVien(),
			await gieoThanhVien(),
			await gieoThanhVien(),
			await gieoThanhVien(),
		];
		const bp = await gieoBoPhan();
		const { plan } = await gieoKeHoach({
			camTrich: O.id,
			buoc: [
				{ nhan: "S1", boPhanId: bp.id, giao: A.id },
				{ nhan: "S2", boPhanId: bp.id },
				{ nhan: "S3", boPhanId: bp.id, giao: A.id },
				{ nhan: "S4", boPhanId: bp.id, giao: A.id },
				{ nhan: "S5", boPhanId: bp.id, giao: C.id },
				{ nhan: "S6", boPhanId: bp.id, giao: A.id },
				{ nhan: "S7", boPhanId: bp.id, giao: A.id },
			],
		});
		const buoc = await buocCua(plan.id);
		const xong = (i: number, ai: string) =>
			dichVu().setStepDone({ stepId: phan(buoc, i).id, done: true }, ai);

		await xong(0, B.id);
		await xong(1, B.id);

		const [vet1, vet2] = (await vetCua(plan.id)).map((v) => ({
			nguoiTao: v.createdById,
			meta: parseOnboardingActivityMeta(v.meta),
		}));
		expect(vet1?.meta.kind).toBe("buoc.xong");
		expect(vet1?.nguoiTao, "vet 1: nguoi tao mong B").toBe(B.id);
		expect(
			vet1?.meta.kind === "buoc.xong"
				? vet1.meta.giaoLucXong
				: "khong phai buoc.xong",
			"giaoLucXong mong A",
		).toBe(A.id);
		expect(
			vet2?.meta.kind === "buoc.xong"
				? vet2.meta.giaoLucXong
				: "khong phai buoc.xong",
			"giaoLucXong mong null cho buoc chua giao",
		).toBeNull();

		const den = () => new Date(Date.now() + 60_000);
		expect(
			await doDuongDo(tu, den()),
			"hai vet phan 1: B danh dau ho buoc giao A, va mot buoc chua giao",
		).toEqual({ tu_danh_dau: 0, mau: 1, khong_giao: 1 });

		await xong(2, A.id);
		await xong(3, A.id);
		await xong(4, C.id);
		await xong(5, B.id);

		const metaDau = parseOnboardingActivityMeta(
			phan(await vetCua(plan.id), 0).meta,
		);
		if (metaDau.kind !== "buoc.xong") {
			throw new Error(`vet dau mong buoc.xong, nhan ${metaDau.kind}`);
		}
		const { giaoLucXong: _boDi, ...metaCu } = metaDau;
		await db.activity.create({
			data: {
				type: "PLAN_CHANGE",
				occurredAt: new Date(),
				planId: plan.id,
				createdById: A.id,
				meta: metaCu,
			},
		});

		expect(await doDuongDo(tu, den()), "mau mong 5").toEqual({
			tu_danh_dau: 3,
			mau: 5,
			khong_giao: 1,
		});

		await xong(6, B.id);
		expect(
			await doDuongDo(tu, den()),
			"them mot vet danh dau ho: mau mong 6",
		).toEqual({ tu_danh_dau: 3, mau: 6, khong_giao: 1 });
	});
});
