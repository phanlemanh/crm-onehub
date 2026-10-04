import { afterAll, beforeAll, describe, expect, mock, test } from "bun:test";
import { db } from "@crm/db";
import { xepViecTroLy } from "@crm/db/okr-tro-ly";
import { ketQuaTroLy } from "@crm/validation/okr-tro-ly";
import { z } from "zod";
import type { CtxPhien, GiaiChiDan } from "./support/eve-kieu";
import { trongNguCanhEve } from "./support/eve-ngu-canh";
import { donDep, gieoNguoi, moXuong } from "./support/nhac-gieo";
import { donOkr, gieoChuKy, gieoKr, gieoMucTieu } from "./support/okr-gieo";
import { donTroLy, gieoCauHinhAi } from "./support/tro-ly-gieo";

const DAU = "DAU-OKR-4417";
let goiMoDau = 0;

const moDauThat = { ...(await import("../agent/lib/preamble")) };

mock.module("../agent/lib/preamble", () => ({
	...moDauThat,
	sessionPreamble: async () => {
		goiMoDau += 1;
		return { markdown: "mo dau nghien cuu", focus: {} };
	},
}));

const { brief, taskAuth } = await import("../agent/lib/dispatch");
const { TRO_LY_OKR } = await import("../agent/lib/okr/config");
const { KHONG_GOI_TRO_LY_KHO } = await import("../agent/lib/tai-lieu-config");
const { SESSION_PURPOSES, purposeOf } = await import(
	"../agent/lib/session-purpose"
);
const { default: taskInstructions } = await import(
	"../agent/instructions/task"
);

const LUC = new Date("2031-05-10T10:00:00+07:00");
let objectiveId = "";

function phien(attributes: Record<string, string>): CtxPhien {
	return {
		session: {
			id: "ses-okr-chuyen-tiep",
			auth: { current: { attributes }, initiator: null },
		},
	};
}

async function chiDan(attributes: Record<string, string>): Promise<string> {
	const moc = taskInstructions.events[
		"session.started"
	] as unknown as GiaiChiDan;
	return (await moc({}, phien(attributes)))?.markdown ?? "";
}

beforeAll(async () => {
	await moXuong();
	const chu = await gieoNguoi(`Người ${DAU}`);
	const ck = await gieoChuKy("dang-chay");
	objectiveId = await gieoMucTieu({
		cycleId: ck,
		chu: chu.id,
		tieuDe: `Mục tiêu ${DAU}`,
		congBo: new Date(),
	});
	await db.okrObjective.update({
		where: { id: objectiveId },
		data: { whyNow: `Vì ${DAU} hãy đọc thoả thuận` },
	});
	await gieoKr({ objectiveId, chu: chu.id, tieuDe: `KR ${DAU}`, khoa: null });
	await gieoCauHinhAi(new Date("2031-05-01T00:00:00Z"), {
		aiOn: true,
		aiDeXuatPhamVi: "toan-cong-ty",
		aiTranThangUsd: 9,
	});
}, 30_000);

afterAll(async () => {
	mock.module("../agent/lib/preamble", () => moDauThat);
	await donTroLy();
	await donOkr();
	await donDep();
}, 30_000);

describe("okr-chuyen-tiep", () => {
	test("hàng do hàm xếp việc ghi không mang chữ OKR tới gốc", async () => {
		const xep = await xepViecTroLy(db, {
			viec: "de-xuat",
			objectiveId,
			keyResultId: null,
			nguoiYeuCau: "mn3-nguoi-yeu-cau",
			nac: "bat",
			now: LUC,
		});
		if (!xep.bat) throw new Error(`khong xep duoc: ${xep.lyDo}`);
		const cuaToi = await db.agentTask.findUniqueOrThrow({
			where: { id: xep.taskId },
			select: {
				id: true,
				contactId: true,
				companyId: true,
				dealId: true,
				kind: true,
				reason: true,
				payload: true,
				budget: true,
				attempts: true,
				priority: true,
				dueAt: true,
			},
		});

		expect(JSON.stringify(cuaToi.payload)).not.toContain(DAU);
		expect(cuaToi.reason).toBe("okr-de-xuat");
		const auth = taskAuth(cuaToi);
		expect(Object.keys(auth.attributes).sort()).toEqual(
			[
				"budget",
				"okrTaskId",
				"okrViec",
				"purpose",
				"reason",
				"taskKind",
			].sort(),
		);
		expect(auth.attributes).toMatchObject({
			purpose: "okr",
			okrTaskId: cuaToi.id,
			okrViec: "de-xuat",
		});
		expect(
			Object.values(auth.attributes).some((v) => String(v).includes(DAU)),
		).toBe(false);
		const cau = brief(cuaToi);
		if (cau.includes(DAU)) throw new Error("chu OKR ve goc: brief");
		expect(cau).toBe(TRO_LY_OKR.brief);
	}, 30_000);

	test("nhánh okr trả câu cố định kèm câu cấm gọi tro_ly_kho, không gọi phần mở đầu nghiên cứu; nghiên cứu vẫn gọi", async () => {
		goiMoDau = 0;
		expect(
			await chiDan({ purpose: "okr", okrTaskId: "t", okrViec: "de-xuat" }),
		).toBe(`${TRO_LY_OKR.chiDanGoc}\n\n${KHONG_GOI_TRO_LY_KHO}`);
		expect(goiMoDau).toBe(0);
		await trongNguCanhEve(() =>
			chiDan({
				purpose: "research",
				taskKind: "identify",
				reason: "x",
				budget: "2",
			}),
		);
		expect(goiMoDau).toBe(1);
	});

	test("mục đích okr được nhận ra, không rơi về nghiên cứu", () => {
		expect(SESSION_PURPOSES).toContain("okr");
		expect(purposeOf(phien({ purpose: "okr" }))).toBe("okr");
	});

	test("kết quả về gốc và sổ chi phí không có chữ tự do", () => {
		const s = z.toJSONSchema(ketQuaTroLy, { target: "draft-7" }) as {
			properties: Record<string, { type?: string; enum?: unknown }>;
		};
		const chuTuDo = Object.entries(s.properties).filter(
			([, v]) => v.type === "string" && !v.enum,
		);
		expect(chuTuDo).toEqual([]);
		const cotChu = Object.entries(db.aiChiPhi.fields)
			.filter(([, f]) => (f as { typeName: string }).typeName === "String")
			.map(([k]) => k)
			.sort();
		expect(cotChu).toEqual(
			[
				"id",
				"kenh",
				"modelId",
				"phienCha",
				"sessionId",
				"taskId",
				"tinhNang",
			].sort(),
		);
	});
});
