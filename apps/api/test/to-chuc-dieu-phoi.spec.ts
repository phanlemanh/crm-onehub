import { describe, expect, test } from "bun:test";
import { db } from "@crm/db";
import { doc, dungSan, ma, pbMoi, phien, tao } from "./to-chuc-san";

dungSan();

type DanhMuc = {
	rows: { id: string }[];
	facetCounts: Record<string, Record<string, number>>;
};

describe("loc-bo-phan", () => {
	test("loc-bo-phan: loc theo bo phan cua phong ban dang cam, dem khop so dong", async () => {
		const q = ma("loc");
		const bpA = await tao("org.createDivision", { name: ma("loc-A") }, "A");
		const bpB = await tao("org.createDivision", { name: ma("loc-B") }, "B");
		const pA1 = await pbMoi("loc-a1", bpA);
		const pA2 = await pbMoi("loc-a2", bpA);
		const pB1 = await pbMoi("loc-b1", bpB);
		const pX = await pbMoi("loc-x");
		const FIXTURE: [phongBanDangCam: string, boPhan: string | null][] = [
			[pA1, bpA],
			[pA1, bpA],
			[pA2, bpA],
			[pB1, bpB],
			[pB1, bpB],
			[pX, null],
		];
		const keHoach: { id: string; pb: string; bp: string | null }[] = [];
		for (const [i, [pb, bp]] of FIXTURE.entries()) {
			const cty = await db.company.create({
				data: { name: `${q}-${i}` },
				select: { id: true },
			});
			const kh = await db.onboardingPlan.create({
				data: {
					companyId: cty.id,
					startedAt: new Date(),
					targetDays: 30,
					ownerId: phien.quan.nguoi,
					steps: {
						create: [
							{
								label: "xong",
								departmentId: pX,
								dueAt: new Date(),
								position: 0,
								completedAt: new Date(),
							},
							{
								label: "dang tac",
								departmentId: pb,
								dueAt: new Date(),
								position: 1,
							},
						],
					},
				},
				select: { id: true },
			});
			keHoach.push({ id: kh.id, pb, bp });
		}
		const kyVong = (bo: string[], pb: string[] = []) =>
			keHoach
				.filter((k) => bo.length === 0 || (k.bp !== null && bo.includes(k.bp)))
				.filter((k) => pb.length === 0 || pb.includes(k.pb))
				.map((k) => k.id)
				.sort();
		const loc = (vao: { division?: string[]; boPhan?: string[] }) =>
			doc<DanhMuc>("onboarding.manDanhMuc", "quan", {
				q,
				status: "tat-ca",
				pageSize: 100,
				...vao,
			});

		for (const [nhan, chon] of [
			["A", [bpA]],
			["B", [bpB]],
			["A+B", [bpA, bpB]],
		] as const) {
			const kq = await loc({ division: [...chon] });
			expect(
				`loc bo phan ${nhan}: ${kq.rows
					.map((r) => r.id)
					.sort()
					.join(",")}`,
			).toBe(`loc bo phan ${nhan}: ${kyVong([...chon]).join(",")}`);
			expect({
				nhan,
				dem: chon.map((b) => kq.facetCounts.division?.[b] ?? 0),
			}).toEqual({
				nhan,
				dem: chon.map((b) => kyVong([b]).length),
			});
		}
		const giao = await loc({ division: [bpA], boPhan: [pA1] });
		expect(giao.rows.map((r) => r.id).sort()).toEqual(kyVong([bpA], [pA1]));
		const tatCa = await loc({});
		expect(`khong chon: ${tatCa.rows.length}`).toBe("khong chon: 6");

		await db.onboardingPlan.deleteMany({
			where: { company: { name: { startsWith: q } } },
		});
		await db.company.deleteMany({ where: { name: { startsWith: q } } });
	});
});
