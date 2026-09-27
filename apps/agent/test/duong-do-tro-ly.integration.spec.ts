import {
	afterAll,
	beforeAll,
	describe,
	expect,
	setSystemTime,
	test,
} from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { db } from "@crm/db";
import { xepViecTroLy } from "@crm/db/okr-tro-ly";
import { completeTask } from "../agent/lib/tasks";
import { donDep, gieoNguoi, moXuong } from "./support/nhac-gieo";
import { donOkr, gieoChuKy, gieoMucTieu } from "./support/okr-gieo";
import { donTroLy, gieoCauHinhAi, gieoChiPhi } from "./support/tro-ly-gieo";

const RANG = resolve(
	import.meta.dir,
	"../../../_acceptance/tro-ly-okr-nen/rang",
);
const GIAY = 1000;
const khoaCu = process.env.AI_GATEWAY_API_KEY;
let nguoi = "";
let mucTieu: string[] = [];

async function cauSql(tep: string): Promise<Record<string, unknown>[]> {
	return db.$queryRawUnsafe(readFileSync(resolve(RANG, tep), "utf8"));
}

async function idCua(tep: string): Promise<string[]> {
	return (await cauSql(tep)).map((d) => String(d.id));
}

async function xep(i: number, luc: Date): Promise<string> {
	setSystemTime(luc);
	const kq = await xepViecTroLy(db, {
		viec: "de-xuat",
		objectiveId: mucTieu[i] ?? "",
		keyResultId: null,
		nguoiYeuCau: nguoi,
		now: luc,
	});
	if (!kq.xep) throw new Error(`khong xep duoc viec ${i}: ${kq.lyDo}`);
	return kq.taskId;
}

async function mo(id: string, luc: Date): Promise<void> {
	await db.agentTask.update({
		where: { id },
		data: {
			startedAt: luc,
			attempts: 1,
			leasedUntil: new Date(luc.getTime() + 30 * GIAY),
			sessionId: `ses-e26-${id}`,
		},
	});
}

async function dong(id: string, luc: Date): Promise<void> {
	setSystemTime(luc);
	await completeTask(id, "da-nop");
}

beforeAll(async () => {
	process.env.AI_GATEWAY_API_KEY = "khoa-thu";
	setSystemTime(new Date("2032-01-01T00:00:00Z"));
	await moXuong();
	nguoi = (await gieoNguoi("Người gieo đường đo")).id;
	const ck = await gieoChuKy("dang-chay");
	mucTieu = await Promise.all(
		[0, 1, 2, 3].map(() =>
			gieoMucTieu({ cycleId: ck, chu: nguoi, congBo: new Date() }),
		),
	);
	await gieoCauHinhAi(new Date("2032-01-01T00:00:00+07:00"), {
		aiOn: true,
		aiDeXuatPhamVi: "toan-cong-ty",
		aiTranThangUsd: 9,
	});
}, 30_000);

afterAll(async () => {
	setSystemTime();
	if (khoaCu === undefined) delete process.env.AI_GATEWAY_API_KEY;
	else process.env.AI_GATEWAY_API_KEY = khoaCu;
	await donTroLy();
	await donOkr();
	await donDep();
}, 30_000);

describe("duong-do", () => {
	test("phien-khi-tat: mở hợp lệ rồi tháng vượt nhẹ không bị đếm; mở khi đã ≥ trần thì đếm", async () => {
		await gieoChiPhi(
			new Date("2032-01-10T10:00:00+07:00"),
			"okr.de-xuat",
			8.99,
		);
		const batDau = new Date("2032-01-15T10:00:00+07:00");
		const hopLe = await xep(0, batDau);
		await mo(hopLe, batDau);
		await dong(hopLe, new Date(batDau.getTime() + 3 * GIAY));
		await gieoChiPhi(
			new Date(batDau.getTime() + 2 * GIAY),
			"okr.de-xuat",
			0.04,
		);

		const vuot = await xep(1, new Date("2032-01-14T10:00:00+07:00"));
		const moMuon = new Date("2032-01-20T10:00:00+07:00");
		await mo(vuot, moMuon);
		await dong(vuot, new Date(moMuon.getTime() + 4 * GIAY));

		const ra = await idCua("phien-khi-tat.sql");
		expect(
			ra.includes(hopLe),
			"phien-khi-tat.sql: ca mo hop le roi vuot nhe",
		).toBe(false);
		expect(ra.includes(vuot), "phien-khi-tat.sql: ca mo khi da cham tran").toBe(
			true,
		);
		const treo = await idCua("treo-qua-han.sql");
		expect(treo.includes(hopLe), "treo-qua-han.sql: ca dong trong 5 giay").toBe(
			false,
		);
		expect(treo.includes(vuot), "treo-qua-han.sql: ca dong trong 5 giay").toBe(
			false,
		);
	});

	test("treo-qua-han: hàng mở hơn 90 giây chưa đóng thì đếm; hàng đóng trong vài giây thì không", async () => {
		setSystemTime();
		const bayGio = Date.now();
		const truoc = (giay: number) => new Date(bayGio - giay * GIAY);
		await gieoCauHinhAi(truoc(3600), {
			aiOn: true,
			aiDeXuatPhamVi: "toan-cong-ty",
			aiTranThangUsd: 9,
		});
		const treo = await xep(2, truoc(200));
		await mo(treo, truoc(120));
		const nhanh = await xep(3, truoc(20));
		await mo(nhanh, truoc(10));
		setSystemTime();
		await completeTask(nhanh, "da-nop");

		const ra = await idCua("treo-qua-han.sql");
		expect(ra.includes(treo), "treo-qua-han.sql: ca treo qua 90 giay").toBe(
			true,
		);
		expect(ra.includes(nhanh), "treo-qua-han.sql: ca dong trong 10 giay").toBe(
			false,
		);
		const tat = await idCua("phien-khi-tat.sql");
		expect(tat.includes(nhanh), "phien-khi-tat.sql: ca dong dung han").toBe(
			false,
		);
	});

	test("ty-le-chua-gan: 95 xu có tên cộng 5 xu khac ra 0,05", async () => {
		await gieoChiPhi(new Date("2032-02-10T10:00:00+07:00"), "okr.de-xuat", 0.5);
		await gieoChiPhi(
			new Date("2032-02-11T10:00:00+07:00"),
			"crm.nghien-cuu",
			0.45,
		);
		await gieoChiPhi(new Date("2032-02-12T10:00:00+07:00"), "khac", 0.05);
		const dong = (await cauSql("ty-le-chua-gan.sql")).find(
			(d) => d.thang === "2032-02",
		);
		expect(Number(dong?.tyLe), "ty-le-chua-gan.sql: thang 2032-02").toBe(0.05);
	});
});
