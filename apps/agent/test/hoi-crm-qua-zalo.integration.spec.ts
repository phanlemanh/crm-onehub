import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { thanhVienPrincipal } from "../agent/lib/thanh-vien-principal";
import { boThanhVien, donHoi, gieoVai } from "./support/hoi-gieo";
import { donDep, moXuong } from "./support/nhac-gieo";

const GOC_AGENT = resolve(import.meta.dir, "..");

beforeAll(async () => {
	await moXuong();
});

beforeEach(async () => {
	await donHoi();
});

afterAll(async () => {
	await donHoi();
	await donDep();
});

describe("tu-choi-vai", () => {
	test("tu-choi-vai: thanhVienPrincipal cho vai kinh doanh, null cho okr va nguoi mat member", async () => {
		const A = await gieoVai("An", "member");
		const Q = await gieoVai("Quan", "admin");
		const B = await gieoVai("Binh", "okr");
		const C = await gieoVai("Cuong", "member");
		await boThanhVien(C.id);

		expect(await thanhVienPrincipal(A.id, "zalo")).toEqual({
			authenticator: "zalo",
			principalId: A.id,
			principalType: "user",
		});
		expect((await thanhVienPrincipal(Q.id, "zalo"))?.principalId).toBe(Q.id);
		expect(await thanhVienPrincipal(B.id, "zalo")).toBeNull();
		expect(await thanhVienPrincipal(C.id, "zalo")).toBeNull();
	});

	test("tu-choi-vai: cau noi web va kenh Zalo goi cung mot ham cong vai", () => {
		const eve = readFileSync(resolve(GOC_AGENT, "agent/channels/eve.ts"), "utf8");
		expect(eve).toContain("thanhVienPrincipal(");
		expect(eve).not.toContain("laVaiChiOkr");
	});
});
