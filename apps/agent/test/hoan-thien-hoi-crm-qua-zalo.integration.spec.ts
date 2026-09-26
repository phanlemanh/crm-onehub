import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	spyOn,
	test,
} from "bun:test";
import { readdirSync } from "node:fs";
import { resolve } from "node:path";
import { db } from "@crm/db";
import { webFetch } from "eve/tools/defaults";
import { z } from "zod";
import type { Evidence } from "../agent/lib/evidence";
import { recordFact } from "../agent/lib/facts";
import { writeField } from "../agent/lib/fields";
import { ZALO } from "../agent/lib/zalo-config";
import { nhanWebhook } from "../agent/lib/zalo-webhook";
import { eveGia } from "./support/eve-gia";
import type { CtxPhien } from "./support/eve-kieu";
import { donHoi, gieoVai } from "./support/hoi-gieo";
import { donDep, moXuong, TIEN_TO } from "./support/nhac-gieo";
import { DU_BIEN, noiZalo } from "./support/tra-loi-gieo";
import { zaloGia } from "./support/zalo-gia";
import { type ChonTin, thanWebhook, yeuCauWebhook } from "./support/zalo-tin";

const GHI_20 = [
	"archive_field",
	"enrich_company",
	"fetch_contact_photo",
	"find_contact_socials",
	"get_contact_work_history",
	"get_linkedin_profile",
	"identify_contact",
	"manage_fields",
	"record_fact",
	"record_job_change",
	"research_company",
	"research_person",
	"resolve_linkedin_profile",
	"schedule_recheck",
	"set_chat_title",
	"set_contact_socials",
	"set_field_value",
	"web_fetch",
	"write_brief",
	"write_workspace_profile",
];

const MUC_DICH_KHAC = [
	["web", {}],
	["builder", { purpose: "builder" }],
	["team-agent", { purpose: "team-agent" }],
] as const;

const KHOA_HTH = `${TIEN_TO}hth_khoa`;

const goiAuth = z.object({
	attributes: z.record(z.string(), z.string()),
});

type Eve = ReturnType<typeof eveGia>;

type CongCu = {
	execute: (input: unknown, ctx: CtxPhien) => Promise<unknown>;
};

beforeAll(async () => {
	await moXuong();
});

beforeEach(async () => {
	await donHoi();
	await db.fieldValue.deleteMany({ where: { field: { key: KHOA_HTH } } });
	await db.fieldDefinition.deleteMany({ where: { key: KHOA_HTH } });
	await db.contact.deleteMany({ where: { firstName: `${TIEN_TO}hth` } });
});

afterAll(async () => {
	await donHoi();
	await db.fieldValue.deleteMany({ where: { field: { key: KHOA_HTH } } });
	await db.fieldDefinition.deleteMany({ where: { key: KHOA_HTH } });
	await db.contact.deleteMany({ where: { firstName: `${TIEN_TO}hth` } });
	await donDep();
});

let soWebhook = 0;

async function guiTho(fromId: string, chon: Partial<ChonTin>, eve: Eve | null) {
	soWebhook += 1;
	const zalo = zaloGia();
	const messageId = `hthw-${Date.now()}-${soWebhook}`;
	const than = JSON.stringify(
		thanWebhook({ ...chon, messageId, fromId, ten: `Zalo ${fromId}` }),
	);
	const res = await nhanWebhook(yeuCauWebhook(than, DU_BIEN.khoa).request, {
		fetcher: zalo.fetcher,
		now: () => new Date(),
		env: DU_BIEN,
		hoi: eve?.deps,
	});
	return {
		res,
		messageId,
		tra: () => zalo.guiToi(fromId).map((g) => g.body.text ?? ""),
	};
}

function phienTuSend(eve: Eve, i: number): CtxPhien {
	const goi = eve.send[i];
	if (!goi) throw new Error(`eve gia chua co send ${i}`);
	const auth = goiAuth.parse(goi.auth);
	return {
		session: {
			id: `ses-gia-${i + 1}`,
			auth: { current: { attributes: auth.attributes }, initiator: null },
		},
	};
}

function ctxMucDich(attributes: Record<string, string>): CtxPhien {
	return {
		session: {
			id: "ses-hth",
			auth: { current: { attributes }, initiator: null },
		},
	};
}

async function ctxZaloThat(): Promise<CtxPhien> {
	const A = await gieoVai("Hth", "member");
	await noiZalo(A.id, "ZH");
	const eve = eveGia();
	await guiTho("ZH", { text: "Thoả thuận nào sắp hạn?" }, eve);
	await eve.xong();
	return phienTuSend(eve, 0);
}

async function congCu(ten: string): Promise<CongCu> {
	const mod = await import(`../agent/tools/${ten}.ts`);
	return mod.default as CongCu;
}

async function goi(ten: string, ctx: CtxPhien): Promise<string | null> {
	try {
		await (await congCu(ten)).execute({}, ctx);
		return null;
	} catch (loi) {
		return loi instanceof Error ? loi.message : String(loi);
	}
}

async function khongMang<T>(chay: () => Promise<T>): Promise<T> {
	const cu = globalThis.fetch;
	globalThis.fetch = (() =>
		Promise.reject(
			new Error("mang bi chan trong test"),
		)) as unknown as typeof fetch;
	try {
		return await chay();
	} finally {
		globalThis.fetch = cu;
	}
}

function tapGhi(): string[] {
	const { doc, tat } = ZALO.hoi.congCu;
	const daKhai: readonly string[] = [...doc, ...tat];
	return readdirSync(resolve(import.meta.dir, "../agent/tools"))
		.filter((f) => f.endsWith(".ts"))
		.map((f) => f.replace(/\.ts$/, ""))
		.filter((t) => !daKhai.includes(t))
		.sort();
}

describe("chan-ghi", () => {
	test("chan-ghi: tap cong cu ghi dung 20 ten viet truoc", () => {
		expect(tapGhi()).toEqual([...GHI_20].sort());
	});

	test("chan-ghi: moi cong cu ghi tu choi o phien Zalo that, khong chan nham muc dich khac", async () => {
		const zalo = await ctxZaloThat();
		let soZalo = 0;
		for (const ten of GHI_20) {
			expect(await goi(ten, zalo), `${ten} tu choi tren Zalo`).toBe(
				ZALO.hoi.tuChoiGhi,
			);
			soZalo += 1;
		}
		expect(soZalo).toBe(20);
		let soKhac = 0;
		await khongMang(async () => {
			for (const [nhan, attributes] of MUC_DICH_KHAC) {
				for (const ten of GHI_20) {
					expect(
						await goi(ten, ctxMucDich(attributes)),
						`${ten} khong tu choi o phien ${nhan}`,
					).not.toBe(ZALO.hoi.tuChoiGhi);
					soKhac += 1;
				}
			}
		});
		expect(soKhac).toBe(60);
	});

	test("chan-ghi: phien con mang purpose zalo o initiator van bi chan", async () => {
		const ctx: CtxPhien = {
			session: {
				id: "ses-con",
				auth: { current: { attributes: {} }, initiator: null },
			},
		};
		const con = {
			session: {
				...ctx.session,
				auth: {
					current: { attributes: {} },
					initiator: { attributes: { purpose: ZALO.hoi.purpose } },
				},
			},
		};
		expect(
			await goi("set_field_value", con as unknown as CtxPhien),
			"phien con uy thac bi chan",
		).toBe(ZALO.hoi.tuChoiGhi);
	});
});

async function giaTri(contactId: string): Promise<string | null> {
	const hang = await db.fieldValue.findFirst({
		where: { contactId, field: { key: KHOA_HTH } },
	});
	return hang?.text ?? null;
}

describe("ghi-that", () => {
	test("ghi-that: set_field_value va record_fact that khong ghi tren Zalo, ghi o web", async () => {
		const zalo = await ctxZaloThat();
		const C = await db.contact.create({
			data: { firstName: `${TIEN_TO}hth` },
		});
		await db.fieldDefinition.create({
			data: {
				entity: "CONTACT",
				key: KHOA_HTH,
				label: "Hth",
				type: "TEXT",
				position: 9_998,
			},
		});
		const dau = await writeField({
			entity: "CONTACT",
			recordId: C.id,
			key: KHOA_HTH,
			value: "truoc",
		});
		expect(dau.written, "gieo gia tri truoc").toBe(true);
		const R = {
			contactId: C.id,
			field: "title",
			value: "CFO",
			evidence: [
				{ kind: "linkedin.employer-and-name", detail: "Hồ sơ ghi CFO" },
			],
			method: "web",
		};
		const demFact = () => db.contactFact.count({ where: { contactId: C.id } });
		const truoc = await demFact();
		const sfv = await congCu("set_field_value");
		const rf = await congCu("record_fact");
		await expect(
			sfv.execute(
				{ entity: "CONTACT", recordId: C.id, key: KHOA_HTH, value: "zalo" },
				zalo,
			),
		).rejects.toThrow(ZALO.hoi.tuChoiGhi);
		await expect(rf.execute(R, zalo)).rejects.toThrow(ZALO.hoi.tuChoiGhi);
		expect(await giaTri(C.id), "gia tri giu nguyen tren Zalo").toBe("truoc");
		expect(await demFact(), "record_fact khong ghi tren Zalo").toBe(truoc);
		const ghiWeb = await writeField({
			entity: "CONTACT",
			recordId: C.id,
			key: KHOA_HTH,
			value: "web",
		});
		expect(ghiWeb.written, "writer that ghi duoc o web").toBe(true);
		await recordFact({
			contactId: R.contactId,
			field: "title",
			value: R.value,
			evidence: R.evidence as Evidence[],
			method: R.method,
		});
		expect(await giaTri(C.id), "web ghi duoc").toBe("web");
		expect(await demFact(), "web ghi duoc mot fact").toBe(truoc + 1);
	});
});

describe("web-fetch", () => {
	test("web-fetch: phien Zalo khong toi bo tai cua eve, phien web uy thac dung dau vao", async () => {
		const dau = `hth-web-fetch-${crypto.randomUUID()}`;
		const input = { url: "https://hth.test/x" };
		const zalo = await ctxZaloThat();
		const web = ctxMucDich({});
		const wf = await congCu("web_fetch");
		const goc = spyOn(webFetch, "execute").mockImplementation(async () => ({
			content: dau,
		}));
		try {
			await expect(wf.execute(input, zalo)).rejects.toThrow(ZALO.hoi.tuChoiGhi);
			expect(goc, "web_fetch khong goi mang tren Zalo").toHaveBeenCalledTimes(
				0,
			);
			const ra = await wf.execute(input, web);
			expect(goc, "web_fetch web van tai trang").toHaveBeenCalledTimes(1);
			expect(goc.mock.calls[0]?.[0], "uy thac dung dau vao").toEqual(input);
			expect(JSON.stringify(ra)).toContain(dau);
		} finally {
			goc.mockRestore();
		}
	});
});
