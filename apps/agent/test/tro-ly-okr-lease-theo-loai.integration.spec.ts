import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { db } from "@crm/db";
import { VIEC_OKR } from "@crm/db/agent-tasks";
import hookGoc from "../agent/hooks/okr-uy-quyen";
import { giaHanLease } from "../agent/lib/okr/viec";
import hookPhienCon from "../agent/subagents/tro_ly_okr/hooks/giu-viec";
import { nguCanhCon, nguCanhGoc } from "./support/tro-ly-phien-con";

const MOC = new Date("2033-06-01T03:00:00Z");
const DE_XUAT = "okr-de-xuat";
const TOM_TAT = "okr-tom-tat-tuan";
const SU_KIEN = { type: "step.started", data: {} } as never;

type XuLy = (event: never, ctx: never) => unknown;

const tienTo = `ltl-${(process.env.TEST_RUN_ID ?? "").slice(0, 8)}-`;
const goc = hookGoc.events as unknown as Record<string, XuLy>;
const con = hookPhienCon.events as unknown as Record<string, XuLy>;

async function gieoViec(kind: string, ten: string) {
	const phienGoc = `${tienTo}${ten}`;
	const hang = await db.agentTask.create({
		data: {
			kind,
			reason: `${tienTo}${ten}`,
			subject: `${tienTo}${ten}`,
			sessionId: phienGoc,
			attempts: 1,
			startedAt: MOC,
			leasedUntil: new Date(MOC.getTime() + 1),
			dueAt: MOC,
		},
		select: { id: true },
	});
	return { id: hang.id, phienGoc };
}

async function conLai(id: string): Promise<number> {
	const hang = await db.agentTask.findUniqueOrThrow({
		where: { id },
		select: { leasedUntil: true },
	});
	return (hang.leasedUntil?.getTime() ?? 0) - MOC.getTime();
}

beforeAll(() => setSystemTime(MOC));
afterEach(() => setSystemTime(MOC));

afterAll(async () => {
	setSystemTime();
	await db.agentTask.deleteMany({ where: { subject: { startsWith: tienTo } } });
});

describe("lease-theo-loai", () => {
	test("giaHanLease: tóm tắt 3 phút, góp ý 30 giây", async () => {
		const tomTat = await gieoViec(TOM_TAT, "gh-tt");
		const deXuat = await gieoViec(DE_XUAT, "gh-dx");
		await giaHanLease(tomTat.id, MOC);
		await giaHanLease(deXuat.id, MOC);
		expect(await conLai(tomTat.id)).toBe(VIEC_OKR.leaseTomTatMs);
		expect(await conLai(deXuat.id)).toBe(VIEC_OKR.leaseMs);
		expect(VIEC_OKR.leaseTomTatMs).toBeGreaterThan(VIEC_OKR.leaseMs);
	});

	test("giaHanLease không chạm việc đã đóng", async () => {
		const tomTat = await gieoViec(TOM_TAT, "gh-dong");
		await db.agentTask.update({
			where: { id: tomTat.id },
			data: { finishedAt: MOC, outcome: "da-nop" },
		});
		await giaHanLease(tomTat.id, MOC);
		expect(await conLai(tomTat.id)).toBe(1);
	});

	test("hook giu-viec của phiên con: tóm tắt 3 phút, góp ý 30 giây", async () => {
		const tomTat = await gieoViec(TOM_TAT, "con-tt");
		const deXuat = await gieoViec(DE_XUAT, "con-dx");
		await con["*"]?.(SU_KIEN, nguCanhCon(tomTat.phienGoc) as never);
		await con["*"]?.(SU_KIEN, nguCanhCon(deXuat.phienGoc) as never);
		expect(await conLai(tomTat.id)).toBe(VIEC_OKR.leaseTomTatMs);
		expect(await conLai(deXuat.id)).toBe(VIEC_OKR.leaseMs);
	});

	test("hook okr-uy-quyen ở gốc: tóm tắt 3 phút, góp ý 30 giây", async () => {
		const tomTat = await gieoViec(TOM_TAT, "goc-tt");
		const deXuat = await gieoViec(DE_XUAT, "goc-dx");
		await goc["*"]?.(SU_KIEN, nguCanhGoc(tomTat.id, tomTat.phienGoc) as never);
		await goc["*"]?.(SU_KIEN, nguCanhGoc(deXuat.id, deXuat.phienGoc) as never);
		expect(await conLai(tomTat.id)).toBe(VIEC_OKR.leaseTomTatMs);
		expect(await conLai(deXuat.id)).toBe(VIEC_OKR.leaseMs);
	});
});
