import { afterAll, beforeAll, describe, expect, spyOn, test } from "bun:test";
import * as loi from "@crm/db/onboarding-buoc";
import { ConflictException, NotFoundException } from "@nestjs/common";
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

async function gieo(dong = false) {
	const O = await gieoThanhVien("Oanh");
	const bp = await gieoBoPhan();
	const { plan } = await gieoKeHoach({
		camTrich: O.id,
		dong,
		buoc: [
			{ nhan: "Chua xong", boPhanId: bp.id, giao: O.id },
			{ nhan: "Da xong", boPhanId: bp.id, giao: O.id, xong: true },
		],
	});
	const buoc = await buocCua(plan.id);
	return { O, plan, chua: phan(buoc, 0), roi: phan(buoc, 1) };
}

async function batLoi(chay: () => Promise<unknown>): Promise<unknown> {
	try {
		await chay();
	} catch (e) {
		return e;
	}
	throw new Error("setStepDone khong nem loi nhu mong doi");
}

beforeAll(moXuong);
afterAll(donDep);

describe("loi-chung-api", () => {
	test("loi-chung-api: chua-xong di qua datBuocXong, dau vet khong co source", async () => {
		const { O, plan, chua } = await gieo();
		const truoc = (await vetCua(plan.id)).length;
		const nghe = spyOn(loi, "datBuocXong");
		try {
			await dichVu().setStepDone({ stepId: chua.id, done: true }, O.id);
			expect(nghe, "setStepDone di qua datBuocXong").toHaveBeenCalledTimes(1);
		} finally {
			nghe.mockRestore();
		}
		const sau = phan(await buocCua(plan.id), 0);
		expect(sau.completedAt, "buoc chua xong nay da xong").not.toBeNull();
		const vet = await vetCua(plan.id);
		expect(vet.length - truoc, "dung mot dau vet moi").toBe(1);
		const meta = phan(vet, -1).meta;
		expect(meta).toMatchObject({ kind: "buoc.xong", stepId: chua.id });
		expect(
			Object.keys(Object(meta)),
			"man ke hoach khong ghi source",
		).not.toContain("source");
	});

	test("loi-chung-api: da-xong khong ghi dau vet moi", async () => {
		const { O, plan, roi } = await gieo();
		const truoc = (await vetCua(plan.id)).length;
		await dichVu().setStepDone({ stepId: roi.id, done: true }, O.id);
		expect((await vetCua(plan.id)).length, "khong dau vet moi").toBe(truoc);
	});

	test("loi-chung-api: khong-co nem NotFoundException", async () => {
		const { O } = await gieo();
		const loiNem = await batLoi(() =>
			dichVu().setStepDone({ stepId: "khong-co-buoc-nay", done: true }, O.id),
		);
		expect(loiNem, "buoc khong co").toBeInstanceOf(NotFoundException);
	});

	test("loi-chung-api: dong nem ConflictException", async () => {
		const { O, chua } = await gieo(true);
		const loiNem = await batLoi(() =>
			dichVu().setStepDone({ stepId: chua.id, done: true }, O.id),
		);
		expect(loiNem, "ke hoach da dong").toBeInstanceOf(ConflictException);
	});
});
