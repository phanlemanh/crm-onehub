import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { taoCuocHoi } from "@crm/db/okr-cuoc-hoi";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { TRO_LY_OKR_HOI } from "../agent/lib/config";
import { repTuCuaOkr } from "../agent/lib/kenh-cua";
import { donDep, gieoNguoi, moXuong } from "./support/gieo";
import {
	BI_MAT_THU,
	mintOkr,
	type YeuSachCua,
	yeuCau,
} from "./support/the-cua";

const auth = repTuCuaOkr(BI_MAT_THU);
const nguoi: Record<string, string> = {};
const cuoc: Record<string, string> = {};

const theHoi = (sub: string, cuocHoiId: string) => {
	const now = Math.floor(Date.now() / 1000);
	return mintOkr({
		iss: "crm-app",
		aud: "crm-okr-agent",
		sub,
		purpose: "okr-hoi",
		cuocHoiId,
		iat: now,
		nbf: now - 5,
		exp: now + 120,
	} as unknown as YeuSachCua);
};

beforeAll(async () => {
	await moXuong();
	for (const vai of ["owner", "admin", "member", "okr"] as const) {
		nguoi[vai] = (await gieoNguoi(`Người hỏi ${vai}`, vai)).id;
		cuoc[vai] = (await taoCuocHoi(db, nguoi[vai] ?? "")).id;
	}
	nguoi.goKhoi = (await gieoNguoi("Người bị gỡ", "member")).id;
	cuoc.goKhoi = (await taoCuocHoi(db, nguoi.goKhoi ?? "")).id;
	nguoi.doiVai = (await gieoNguoi("Người đổi vai", "member")).id;
	cuoc.doiVai = (await taoCuocHoi(db, nguoi.doiVai ?? "")).id;
});

afterAll(async () => {
	await db.okrCuocHoi.deleteMany({
		where: { nguoiHoiUserId: { in: Object.values(nguoi) } },
	});
	await donDep();
});

describe("hdo kenh cua hoi", () => {
	test.each(["owner", "admin", "member", "okr"] as const)(
		"vai %s mo cuoc hoi cua minh",
		async (vai) => {
			const kq = await auth(
				yeuCau(await theHoi(nguoi[vai] ?? "", cuoc[vai] ?? "")),
			);
			expect(kq).toMatchObject({
				authenticator: "crm-okr-cua",
				principalId: nguoi[vai],
				principalType: "user",
				attributes: { purpose: "okr-hoi", cuocHoiId: cuoc[vai], vai },
			});
		},
	);

	test("cuoc hoi cua nguoi khac bi chan", async () => {
		await expect(
			auth(yeuCau(await theHoi(nguoi.okr ?? "", cuoc.member ?? ""))),
		).rejects.toThrow(TRO_LY_OKR_HOI.tuChoi.cuocKhongThuocPhien);
	});

	test("cuoc hoi khong ton tai bi chan", async () => {
		await expect(
			auth(yeuCau(await theHoi(nguoi.okr ?? "", "cuoc-khong-co"))),
		).rejects.toThrow(TRO_LY_OKR_HOI.tuChoi.cuocKhongThuocPhien);
	});

	test("the-con-han: nguoi bi go khoi workspace", async () => {
		const the = await theHoi(nguoi.goKhoi ?? "", cuoc.goKhoi ?? "");
		expect(await auth(yeuCau(the))).not.toBeNull();
		await db.member.deleteMany({
			where: { organizationId: WORKSPACE_ID, userId: nguoi.goKhoi },
		});
		expect(await auth(yeuCau(the))).toBeNull();
	});

	test("the-con-han: nguoi doi sang vai ngoai danh sach", async () => {
		const the = await theHoi(nguoi.doiVai ?? "", cuoc.doiVai ?? "");
		expect(await auth(yeuCau(the))).not.toBeNull();
		await db.member.updateMany({
			where: { organizationId: WORKSPACE_ID, userId: nguoi.doiVai },
			data: { role: "khach" },
		});
		expect(await auth(yeuCau(the))).toBeNull();
	});
});
