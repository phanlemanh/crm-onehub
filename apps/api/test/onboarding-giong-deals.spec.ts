import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import {
	planListInput,
	planOutput,
} from "../src/onboarding/onboarding.contracts";
import {
	batHttp,
	dichVu,
	donDep,
	gieoBoPhan,
	gieoCongTy,
	gieoThanhVien,
	moXuong,
} from "./support/ke-hoach-gieo";

beforeAll(moXuong);
afterAll(donDep);

async function gieoKhuon() {
	const bp = await gieoBoPhan();
	return dichVu().createTemplate({
		name: `khuon ${bp.name}`,
		partnerType: null,
		steps: [
			{ label: "Buoc mot", departmentId: bp.id, position: 0, offsetDays: 0 },
			{ label: "Buoc hai", departmentId: bp.id, position: 1, offsetDays: 3 },
		],
	});
}

describe("tao-tra-id", () => {
	test("tao-tra-id: createFromTemplate tra ban ghi dung planOutput, planById doc lai dung id", async () => {
		const khuon = await gieoKhuon();
		const congTy = await gieoCongTy();
		const chu = await gieoThanhVien();

		const tao = await dichVu().createFromTemplate({
			companyId: congTy.id,
			templateId: khuon.id,
			startedAt: new Date("2026-09-01T00:00:00.000Z"),
			ownerId: chu.id,
		});
		const daParse = planOutput.parse(tao);
		const doc = await dichVu().planById({ id: daParse.id }, chu.id);

		expect(
			`id=${doc.id === daParse.id} congTy=${doc.companyName === congTy.name} khuon=${doc.templateId === khuon.id}`,
		).toBe("id=true congTy=true khuon=true");

		const loi = await batHttp(
			() => dichVu().planById({ id: `${daParse.id}-khong-co` }, chu.id),
			"id khong ton tai",
		);
		expect(`id khong ton tai: ${loi.getStatus()}`).toBe(
			"id khong ton tai: 404",
		);
	});
});

describe("sap-hai-chieu", () => {
	test("sap-hai-chieu: sap rong va asc theo ngay bat dau tang dan, desc la dao nguoc cua asc", async () => {
		const khuon = await gieoKhuon();
		const chu = await gieoThanhVien();
		const NGAY = ["2026-09-05", "2026-09-01", "2026-09-10"];
		const taoRa = [];
		for (const ngay of NGAY) {
			const congTy = await gieoCongTy();
			taoRa.push(
				await dichVu().createFromTemplate({
					companyId: congTy.id,
					templateId: khuon.id,
					startedAt: new Date(`${ngay}T00:00:00.000Z`),
					ownerId: chu.id,
				}),
			);
		}
		const tangDan = [...taoRa]
			.sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime())
			.map((k) => k.id);

		const lay = async (sap: { sort?: string; dir?: "asc" | "desc" }) =>
			(
				await dichVu().manDanhMuc(
					planListInput.parse({ nguoiCam: [chu.id], ...sap }),
				)
			).rows.map((h) => h.id);

		const rong = await lay({});
		const asc = await lay({ sort: "startedAt", dir: "asc" });
		const desc = await lay({ sort: "startedAt", dir: "desc" });

		expect({ rong, asc }).toEqual({ rong: tangDan, asc: tangDan });
		expect({ "desc la dao nguoc cua asc": desc }).toEqual({
			"desc la dao nguoc cua asc": [...asc].reverse(),
		});
	});
});
