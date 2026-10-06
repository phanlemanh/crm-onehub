import {
	afterAll,
	afterEach,
	beforeEach,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { join } from "node:path";
import { db } from "@crm/db";
import { datBuocXong } from "@crm/db/onboarding-buoc";
import { doNguong } from "../../../_acceptance/tra-loi-tin-nhac/rang/nguong";
import { VET_ZALO } from "../agent/lib/tra-loi-nhac";
import { donDep, xongBuoc } from "./support/nhac-gieo";
import { lucVN, NGAY_NHAC, PHUT_SAU } from "./support/nhac-gui-gieo";
import {
	batBot,
	buocCuaMuc,
	donTraLoi,
	gieoNhac,
	guiNhac,
	nhan,
	noiZalo,
} from "./support/tra-loi-gieo";

const GOC = lucVN(NGAY_NHAC, PHUT_SAU);
const LUC = lucVN(NGAY_NHAC, PHUT_SAU + 30);
const TU = lucVN(NGAY_NHAC, -60);
const DEN = lucVN(NGAY_NHAC, 600);
const SCRIPT = join(
	import.meta.dir,
	"../../../_acceptance/tra-loi-tin-nhac/rang/nguong.ts",
);

async function chay(): Promise<string> {
	const p = Bun.spawn(
		["bun", SCRIPT, "--tu", TU.toISOString(), "--den", DEN.toISOString()],
		{ env: process.env, stdout: "pipe", stderr: "pipe" },
	);
	const [ra, ma] = await Promise.all([new Response(p.stdout).text(), p.exited]);
	expect(ma, `script thoat 0: ${await new Response(p.stderr).text()}`).toBe(0);
	return ra;
}

beforeEach(async () => {
	await donTraLoi();
	await batBot();
});

afterEach(() => {
	setSystemTime();
});

afterAll(async () => {
	await donTraLoi();
	await donDep();
});

describe("nguong", () => {
	test("nguong: ti le tin nhac Zalo co xong, dem danh dau nham", async () => {
		const r1 = await gieoNhac(GOC, { quaHan: 1 }, "Rmot");
		await noiZalo(r1.A.id, "ZR1");
		const g1 = await guiNhac(r1.A.id, GOC);
		const r2 = await gieoNhac(GOC, { quaHan: 1 }, "Rhai");
		await noiZalo(r2.A.id, "ZR2");
		const g2 = await guiNhac(r2.A.id, GOC);
		const r3 = await gieoNhac(GOC, { quaHan: 1 }, "Rba");
		const g3 = await guiNhac(r3.A.id, GOC, { slack: true });
		expect([g1.kenh, g2.kenh, g3.kenh], "hai Zalo, mot Slack").toEqual([
			"zalo",
			"zalo",
			"slack",
		]);
		await nhan("ZR1", "xong 1", LUC);
		await xongBuoc(buocCuaMuc(g3.daGui, 1), r3.A.id);
		const nhamKet = await datBuocXong(
			db,
			{
				stepId: buocCuaMuc(g2.daGui, 1),
				done: true,
				nguoiId: r1.A.id,
				now: LUC,
			},
			VET_ZALO,
		);
		expect(nhamKet.ket, "dau vet nham duoc ghi").toBe("da-doi");
		const nham = await db.activity.findFirstOrThrow({
			where: { createdById: r1.A.id, planId: g2.daGui[0]?.planId },
		});

		const ra = await chay();
		expect(ra, "mau so chi tin Zalo").toContain("ti_le_co_xong: 1/2");
		expect(ra).toContain("danh_dau_nham: 1");
		expect(ra, "id dau vet nham").toContain(`nham: ${nham.id}`);

		await db.activity.delete({ where: { id: nham.id } });
		const sau = await chay();
		expect(sau).toContain("danh_dau_nham: 0");
		expect(sau).toContain("ti_le_co_xong: 1/2");
	});
});

describe("ngay-cuoi-ky", () => {
	const D1 = "2026-10-10";
	const D2 = "2026-10-11";
	const D3 = "2026-10-12";
	const D4 = "2026-10-13";
	const NUA_GIO = 30;

	async function mot(ngay: string, ten: string, zaloId: string) {
		const r = await gieoNhac(lucVN(ngay, PHUT_SAU), { quaHan: 2 }, ten);
		await noiZalo(r.A.id, zaloId);
		const g = await guiNhac(r.A.id, lucVN(ngay, PHUT_SAU));
		await nhan(zaloId, "xong 1", lucVN(ngay, PHUT_SAU + NUA_GIO));
		return { r, g };
	}

	test("ngay-cuoi-ky: xong ngay cuoi ky duoc dem, xong sau ky khong dem", async () => {
		const n1 = await mot(D1, "Ngay Mot", "ZN1");
		await mot(D3, "Ngay Ba", "ZN3");
		await mot(D4, "Ngay Bon", "ZN4");
		await datBuocXong(
			db,
			{
				stepId: buocCuaMuc(n1.g.daGui, 2),
				done: true,
				nguoiId: n1.r.A.id,
				now: lucVN(D2, PHUT_SAU),
			},
			VET_ZALO,
		);
		const nham = await db.activity.findFirstOrThrow({
			where: {
				createdById: n1.r.A.id,
				occurredAt: { gte: new Date(`${D2}T00:00:00+07:00`) },
			},
		});
		const ket = await doNguong(db, {
			tu: new Date(`${D1}T00:00:00+07:00`),
			den: new Date(`${D3}T00:00:00+07:00`),
		});
		expect(ket.nham, "ngay-cuoi-ky: xong ngay D3 bi dem nham").toEqual([
			nham.id,
		]);
		expect({ coXong: ket.coXong, mau: ket.mau }).toEqual({ coXong: 2, mau: 2 });
	});
});
