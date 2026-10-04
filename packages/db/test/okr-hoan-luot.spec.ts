import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { db } from "../src/client";
import { hoanLuot, moCuoc } from "../src/okr-cuoc-soan";

const T = `hoan${(process.env.TEST_RUN_ID ?? "x").slice(0, 8)}`;
const id = (phan: string) => `${T}-${phan}`;
const SAN_O = 5;
const DOI_CHUNG_LUOT = 5;

const MA_TRAN = [
	{ truoc: 0, sau: 0, tru: false },
	{ truoc: 1, sau: 0, tru: true },
	{ truoc: 3, sau: 2, tru: true },
] as const;

async function don() {
	await db.okrCuocSoan.deleteMany({ where: { sessionId: { startsWith: T } } });
	await db.okrCycle.deleteMany({ where: { id: { startsWith: T } } });
	await db.user.deleteMany({ where: { id: { startsWith: T } } });
}

let soCuoc = 0;
async function gieo(soLuot: number): Promise<string> {
	const cuoc = await moCuoc(db, {
		cycleId: id("ky"),
		level: "phong-ban",
		divisionId: null,
		departmentId: id(`pb-${++soCuoc}`),
		nguoiMoUserId: id("u"),
		sessionId: id(`phien-${soCuoc}`),
		nac: "bat",
	});
	await db.okrCuocSoan.update({ where: { id: cuoc.id }, data: { soLuot } });
	return cuoc.id;
}

const doc = async (cuocId: string) =>
	(
		await db.okrCuocSoan.findUniqueOrThrow({
			where: { id: cuocId },
			select: { soLuot: true },
		})
	).soLuot;

let doiChung = "";

beforeAll(async () => {
	await don();
	await db.user.create({
		data: {
			id: id("u"),
			name: "Người Mở",
			email: `${id("u")}@thu.test`,
			emailVerified: true,
		},
	});
	await db.okrCycle.create({
		data: {
			id: id("ky"),
			kind: "quy",
			name: `Quý ${T}`,
			startsOn: new Date("2033-01-01"),
			endsOn: new Date("2033-03-31"),
		},
	});
	doiChung = await gieo(DOI_CHUNG_LUOT);
});

afterAll(don);

describe("hoan-luot", () => {
	test("hoan-luot: san ma tran", () => {
		if (MA_TRAN.length + 2 < SAN_O) throw new Error("ma tran rong");
	});

	for (const o of MA_TRAN) {
		test(`hoan-luot: ${o.truoc} -> ${o.sau}`, async () => {
			const cuocId = await gieo(o.truoc);
			expect(await hoanLuot(db, cuocId), `so-luot-am ${o.truoc}`).toEqual({
				tru: o.tru,
			});
			expect(await doc(cuocId), `so-luot-am ${o.truoc}`).toBe(o.sau);
			expect(await doc(doiChung), "cuoc doi chung bi tru").toBe(DOI_CHUNG_LUOT);
		});
	}

	test("hoan-luot: hai lan song song tren soLuot 1 chi tru mot lan", async () => {
		const cuocId = await gieo(1);
		const kq = await Promise.all([hoanLuot(db, cuocId), hoanLuot(db, cuocId)]);
		expect(kq.filter((k) => k.tru).length, "so-luot-am 1 song song").toBe(1);
		expect(await doc(cuocId), "so-luot-am 1 song song").toBe(0);
		expect(await doc(doiChung), "cuoc doi chung bi tru").toBe(DOI_CHUNG_LUOT);
	});
});
