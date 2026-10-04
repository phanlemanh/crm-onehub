import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { db } from "@crm/db";
import { ZALO } from "../agent/lib/zalo-config";
import chiDoc from "../agent/tools/zalo-chi-doc";
import {
	type CongCuGia,
	type CtxPhien,
	type GiaiCongCu,
	phienAudit,
} from "./support/eve-kieu";
import { TIEN_TO } from "./support/nhac-gieo";

const THU_MUC = resolve(import.meta.dir, "../agent/tools");
const KHOA = `${TIEN_TO}zcd_khoa`;

type Ctx = CtxPhien;

type CongCu = CongCuGia;

function phien(purpose: string): Ctx {
	return phienAudit("ses-zcd", purpose);
}

async function giai(purpose: string): Promise<Record<string, CongCu> | null> {
	const moc = chiDoc.events["step.started"] as unknown as GiaiCongCu;
	return (await moc({}, phien(purpose))) ?? null;
}

function tenTep(): string[] {
	return readdirSync(THU_MUC)
		.filter((f) => f.endsWith(".ts"))
		.map((f) => f.replace(/\.ts$/, ""))
		.sort();
}

let contactId = "";
let fieldId = "";

async function giaTri(): Promise<string | null> {
	const hang = await db.fieldValue.findFirst({ where: { fieldId, contactId } });
	return hang?.text ?? null;
}

beforeAll(async () => {
	await db.fieldValue.deleteMany({ where: { field: { key: KHOA } } });
	await db.fieldDefinition.deleteMany({ where: { key: KHOA } });
	await db.contact.deleteMany({ where: { firstName: `${TIEN_TO}zcd` } });
	const contact = await db.contact.create({
		data: { firstName: `${TIEN_TO}zcd` },
	});
	contactId = contact.id;
	const field = await db.fieldDefinition.create({
		data: {
			entity: "CONTACT",
			key: KHOA,
			label: "Zcd",
			type: "TEXT",
			position: 9_999,
		},
	});
	fieldId = field.id;
});

afterAll(async () => {
	await db.fieldValue.deleteMany({ where: { fieldId } });
	await db.fieldDefinition.deleteMany({ where: { id: fieldId } });
	await db.contact.deleteMany({ where: { id: contactId } });
});

describe("chi-doc", () => {
	test("chi-doc: bo giai chay o step.started, khong con session.started", async () => {
		expect(Object.keys(chiDoc.events), "chi con step.started").toEqual([
			"step.started",
		]);
		expect(await giai("research"), "phien web khong nhan ban thay").toBeNull();
		expect(
			await giai("builder"),
			"phien builder khong nhan ban thay",
		).toBeNull();
	});

	test("chi-doc: phien zalo nhan dung tap cong cu ghi, moi ban ghi de tu choi", async () => {
		const ban = await giai(ZALO.hoi.purpose);
		expect(ban).not.toBeNull();
		expect(Object.keys(ban ?? {}).sort()).toEqual(
			[...ZALO.hoi.congCu.ghi, ...ZALO.hoi.congCu.coSanChan].sort(),
		);
		expect(
			[...ZALO.hoi.congCu.coSanChan].sort(),
			"cong cu co san di ra mang va hoi lai",
		).toEqual(["ask_question", "web_search"]);
		let daGoi = 0;
		for (const ten of [...ZALO.hoi.congCu.ghi, ...ZALO.hoi.congCu.coSanChan]) {
			const tra = await ban?.[ten]?.execute({}, phien(ZALO.hoi.purpose));
			expect(tra, `ban ghi de ${ten} tu choi`).toEqual({
				ok: false,
				reason: ZALO.hoi.tuChoiGhi,
			});
			daGoi += 1;
		}
		expect(daGoi).toBe(
			ZALO.hoi.congCu.ghi.length + ZALO.hoi.congCu.coSanChan.length,
		);
	});

	test("chi-doc: moi ten ghi la mot tep cong cu don cung ten", async () => {
		let daKiem = 0;
		for (const ten of ZALO.hoi.congCu.ghi) {
			const mod = await import(`../agent/tools/${ten}.ts`);
			expect(
				mod.default.execute,
				`tep ${ten} xuat mot cong cu don`,
			).toBeInstanceOf(Function);
			expect(
				mod.default.events,
				`tep ${ten} khong phai bo giai dong`,
			).toBeUndefined();
			daKiem += 1;
		}
		expect(daKiem).toBe(ZALO.hoi.congCu.ghi.length);
	});

	test("chi-doc: ban ghi de khong doi DB, cong cu that o phien khac van ghi", async () => {
		const ban = await giai(ZALO.hoi.purpose);
		const truoc = await giaTri();
		await ban?.set_field_value?.execute(
			{ entity: "CONTACT", recordId: contactId, key: KHOA, value: "zalo-ghi" },
			phien(ZALO.hoi.purpose),
		);
		expect(await giaTri(), "gia tri khong doi").toBe(truoc);

		expect(await giai("builder")).toBeNull();
		const { writeField } = await import("../agent/lib/fields");
		const ket = await writeField({
			entity: "CONTACT",
			recordId: contactId,
			key: KHOA,
			value: "web-ghi",
		});
		expect(ket.written, "duong ghi that van song").toBe(true);
		expect(await giaTri()).toBe("web-ghi");
	});

	test("chi-doc: banh coc — moi tep cong cu thuoc dung mot danh sach", () => {
		const { doc, ghi, tat } = ZALO.hoi.congCu;
		const khai = [...doc, ...ghi, ...tat];
		expect(new Set(khai).size, "ba danh sach roi nhau").toBe(khai.length);
		const la = tenTep().filter((t) => !khai.includes(t));
		expect(la, `tep cong cu chua khai doc hay ghi: ${la.join(", ")}`).toEqual(
			[],
		);
		const thua = khai.filter((t) => !tenTep().includes(t));
		expect(thua, `ten khai khong con tep: ${thua.join(", ")}`).toEqual([]);
	});

	test("chi-doc: moi ten trong danh sach subagent la mot thu muc subagents co agent.ts", () => {
		for (const ten of ZALO.hoi.congCu.subagent) {
			expect(
				existsSync(
					join(import.meta.dir, "..", "agent", "subagents", ten, "agent.ts"),
				),
				`subagent khai cho Zalo khong co: ${ten}`,
			).toBe(true);
		}
		expect(ZALO.hoi.congCu.subagent).toEqual(["tro_ly_kho"]);
	});

	test("chi-doc: tep trong danh sach tat khong xuat cong cu", async () => {
		for (const ten of ZALO.hoi.congCu.tat) {
			const mod = await import(`../agent/tools/${ten}.ts`);
			expect(mod.default.kind).toBe("eve:disabled-tool");
		}
	});
});
