import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { docDichCanChinh } from "../agent/lib/okr/doc";
import { gieoNguoi, moXuong } from "./support/nhac-gieo";
import { donOkr, gieoChuKy, gieoMucTieu } from "./support/okr-gieo";

const AN_LUC = new Date("2026-10-08T02:00:00Z");
const CONG_BO = new Date("2026-10-02T02:00:00Z");

beforeAll(moXuong);

afterAll(async () => {
	await donOkr();
}, 30_000);

describe("ky-an", () => {
	test("ky-an: dich can chinh tro ly doc cho muc tieu o chu ky an X rong, o V co dung muc tieu cong bo cua V", async () => {
		const chu = (await gieoNguoi("Chu dich")).id;
		const gieoKy = async (anLuc: Date | null) => {
			const cycleId = await gieoChuKy("dang-chay", 1, undefined, anLuc);
			const dich = await gieoMucTieu({ cycleId, chu, congBo: CONG_BO });
			return { cycleId, dich };
		};
		const X = await gieoKy(AN_LUC);
		const V = await gieoKy(null);
		const dichCua = async (cycleId: string) =>
			(
				await docDichCanChinh({
					level: "phong-ban",
					cycleId,
					cycleParentId: null,
				})
			).map((d) => d.id);
		expect({
			x: await dichCua(X.cycleId),
			v: await dichCua(V.cycleId),
		}).toEqual({ x: [], v: [V.dich] });
	});
});
