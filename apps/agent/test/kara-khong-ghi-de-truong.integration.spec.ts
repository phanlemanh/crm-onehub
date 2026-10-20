import { afterAll, beforeAll, describe, test } from "bun:test";
import { db } from "@crm/db";
import type { FieldEntity } from "@crm/db/enums";
import { writeValues } from "@crm/db/fields";
import { WORKSPACE_ID } from "@crm/db/workspace";
import { z } from "zod";
import { isAutomated } from "../agent/lib/approval";
import { taskAuth } from "../agent/lib/dispatch";
import { focusOn } from "../agent/lib/focus";
import type { LeasedTask } from "../agent/lib/tasks";
import { thanhVienPrincipal } from "../agent/lib/thanh-vien-principal";
import setFieldValue from "../agent/tools/set_field_value";
import { trongNguCanhEve } from "./support/eve-ngu-canh";
import { moXuong } from "./support/nhac-gieo";

const TIEN_TO = "kgd-";
const MOC = `kgd${Date.now().toString(36)}`;
const NGUOI_GO = "Người gõ";
const DIEU_KIEN = "only if the rep asked you to in this conversation";

let dem = 0;
const ma = (ten: string) => `${TIEN_TO}${MOC}-${ten}-${++dem}`;

type Auth = {
	authenticator: string;
	principalId: string;
	principalType: string;
	attributes: Record<string, string>;
};

type NguCanh = {
	session: { id: string; auth: { current: Auth; initiator: null } };
	taskKind?: string;
};

const ketQua = z
	.object({ written: z.boolean(), reason: z.string().optional() })
	.loose();

type KetQua = z.infer<typeof ketQua>;

type DauVao = {
	recordId: string;
	key: string;
	value: string | null;
	replace?: boolean;
};

let truongF = "";
let idF = "";
let truongM = "";
let idM = "";
let nguoiThu = "";

function phai(dung: boolean, thongDiep: string): void {
	if (!dung) throw new Error(thongDiep);
}

function ngucanh(auth: Auth): NguCanh {
	return {
		session: { id: ma("ses"), auth: { current: auth, initiator: null } },
	};
}

async function ctxCoNguoi(): Promise<NguCanh> {
	const principal = await thanhVienPrincipal(nguoiThu, "crm-app");
	if (!principal) throw new Error("kgd: fixture thanh vien");
	const ctx = ngucanh({ ...principal, attributes: { purpose: "research" } });
	phai(!isAutomated(ctx.session), "kgd: ctx co nguoi la nen");
	return ctx;
}

function tacVu(kind: string, contactId: string): LeasedTask {
	return {
		id: ma("task"),
		contactId,
		companyId: null,
		dealId: null,
		kind,
		reason: "kgd",
		payload:
			kind === "field-backfill" ? { entity: "CONTACT", keys: [truongF] } : null,
		budget: 4,
		attempts: 0,
		priority: 0,
		dueAt: new Date(),
	};
}

function ctxNen(kind: string, contactId: string): NguCanh {
	const auth = taskAuth(tacVu(kind, contactId));
	const ctx = ngucanh({
		authenticator: auth.authenticator,
		principalId: auth.principalId,
		principalType: auth.principalType,
		attributes: Object.fromEntries(
			Object.entries(auth.attributes).map(([k, v]) => [k, String(v)]),
		),
	});
	phai(isAutomated(ctx.session), `kgd: ctx nen khong phai nen ${kind}`);
	return { ...ctx, taskKind: kind };
}

function ctxTacNhan(): NguCanh {
	const ctx = ngucanh({
		authenticator: "crm-user",
		principalType: "user",
		principalId: nguoiThu,
		attributes: {
			purpose: "team-agent",
			runId: ma("run"),
			agentId: ma("agent"),
			versionId: ma("ver"),
			userId: nguoiThu,
		},
	});
	phai(isAutomated(ctx.session), "kgd: ctx nen khong phai nen team-agent");
	return ctx;
}

async function goi(ctx: NguCanh, dauVao: DauVao): Promise<KetQua> {
	const execute = setFieldValue.execute as unknown as (
		input: DauVao & { entity: FieldEntity },
		ctx: NguCanh,
	) => Promise<unknown>;
	return trongNguCanhEve(async () => {
		if (ctx.taskKind) focusOn({ taskKind: ctx.taskKind });
		return ketQua.parse(await execute({ entity: "CONTACT", ...dauVao }, ctx));
	});
}

async function lienHe(ten: string): Promise<string> {
	const contact = await db.contact.create({
		data: { firstName: ma(ten) },
		select: { id: true },
	});
	return contact.id;
}

async function nguoiGo(contactId: string): Promise<void> {
	const definitions = await db.fieldDefinition.findMany({
		where: { entity: "CONTACT", archivedAt: null },
		include: { options: { orderBy: { position: "asc" } } },
	});
	await db.$transaction((tx) =>
		writeValues(tx, "CONTACT", contactId, definitions, {
			[truongF]: NGUOI_GO,
		}),
	);
	phai((await giaTri(idF, contactId)) === NGUOI_GO, "kgd: fixture nguoi go");
}

async function hang(fieldId: string, contactId: string) {
	return db.fieldValue.findFirst({ where: { fieldId, contactId } });
}

async function giaTri(
	fieldId: string,
	contactId: string,
): Promise<string | null> {
	return (await hang(fieldId, contactId))?.text ?? null;
}

beforeAll(async () => {
	await moXuong();
	truongF = `${TIEN_TO.replace("-", "_")}${MOC}_f`;
	truongM = `${TIEN_TO.replace("-", "_")}${MOC}_m`;
	const f = await db.fieldDefinition.create({
		data: {
			entity: "CONTACT",
			key: truongF,
			label: `Kgd F ${MOC}`,
			type: "TEXT",
			position: 9_990,
		},
	});
	idF = f.id;
	const m = await db.fieldDefinition.create({
		data: {
			entity: "CONTACT",
			key: truongM,
			label: `Kgd M ${MOC}`,
			type: "TEXT",
			agentFilled: false,
			position: 9_991,
		},
	});
	idM = m.id;
	nguoiThu = ma("u");
	await db.user.create({
		data: { id: nguoiThu, name: nguoiThu, email: `${nguoiThu}@thu.test` },
	});
	await db.member.create({
		data: {
			id: `${nguoiThu}-mem`,
			organizationId: WORKSPACE_ID,
			userId: nguoiThu,
			role: "member",
			createdAt: new Date(),
		},
	});
});

afterAll(async () => {
	await db.fieldValue.deleteMany({ where: { fieldId: { in: [idF, idM] } } });
	await db.fieldDefinition.deleteMany({ where: { id: { in: [idF, idM] } } });
	await db.contact.deleteMany({
		where: { firstName: { startsWith: `${TIEN_TO}${MOC}` } },
	});
	await db.member.deleteMany({ where: { userId: nguoiThu } });
	await db.user.deleteMany({ where: { id: nguoiThu } });
});

describe("kara-khong-ghi-de-truong", () => {
	test("kgd-co-nguoi-dat: phien co nguoi khong thay o da co gia tri", async () => {
		const c = await lienHe("dat");
		await nguoiGo(c);
		const kq = await goi(await ctxCoNguoi(), {
			recordId: c,
			key: truongF,
			value: "Kara thấy",
		});
		phai(kq.written === false, "kgd: co nguoi ghi de");
		const lyDo = kq.reason ?? "";
		phai(lyDo.includes(NGUOI_GO), "kgd: ly do thieu gia tri");
		phai(lyDo.includes("replace"), "kgd: ly do thieu cach thay");
		phai(lyDo.includes(DIEU_KIEN), "kgd: ly do thieu dieu kien");
		phai((await giaTri(idF, c)) === NGUOI_GO, "kgd: co nguoi mat gia tri");
	});

	test("kgd-co-nguoi-xoa: phien co nguoi khong xoa o da co gia tri", async () => {
		const c = await lienHe("xoa");
		await nguoiGo(c);
		const kq = await goi(await ctxCoNguoi(), {
			recordId: c,
			key: truongF,
			value: null,
		});
		phai(kq.written === false, "kgd: co nguoi xoa duoc");
		const con = await hang(idF, c);
		phai(con !== null, "kgd: hang bi xoa");
		phai(con?.text === NGUOI_GO, "kgd: xoa doi gia tri");
	});

	test("kgd-co-nguoi-thay: co replace thi thay va xoa duoc", async () => {
		const c = await lienHe("thay");
		await nguoiGo(c);
		const ctx = await ctxCoNguoi();
		const thay = await goi(ctx, {
			recordId: c,
			key: truongF,
			value: "Kara thấy",
			replace: true,
		});
		phai(thay.written === true, "kgd: thay bi chan");
		phai((await giaTri(idF, c)) === "Kara thấy", "kgd: thay khong ghi");
		const xoa = await goi(ctx, {
			recordId: c,
			key: truongF,
			value: null,
			replace: true,
		});
		phai(xoa.written === true, "kgd: xoa co co bi chan");
		phai((await hang(idF, c)) === null, "kgd: xoa co co khong xoa");
	});

	test("kgd-nen: phien nen khong bao gio thay o da co gia tri", async () => {
		const c = await lienHe("nen");
		await nguoiGo(c);
		const MA_TRAN = [
			{ ten: "field-backfill", ctx: () => ctxNen("field-backfill", c) },
			{ ten: "profile", ctx: () => ctxNen("profile", c) },
			{ ten: "team-agent", ctx: () => ctxTacNhan() },
		] as const;
		let daGoi = 0;
		for (const o of MA_TRAN) {
			for (const replace of [false, true]) {
				const kq = await goi(o.ctx(), {
					recordId: c,
					key: truongF,
					value: "Kara thấy",
					replace: replace || undefined,
				});
				phai(
					kq.written === false,
					`kgd: nen ghi de ${o.ten} ${replace ? "co" : "khong"}`,
				);
				daGoi += 1;
			}
		}
		phai((await giaTri(idF, c)) === NGUOI_GO, "kgd: nen mat gia tri");
		phai(daGoi === 6, `kgd: nen thieu o ${daGoi}`);
	});

	test("kgd-o-trong: o trong van dien duoc o moi phien", async () => {
		const c1 = await lienHe("trong-1");
		const a = await goi(await ctxCoNguoi(), {
			recordId: c1,
			key: truongF,
			value: "A",
		});
		phai(
			a.written === true && (await giaTri(idF, c1)) === "A",
			"kgd: o trong co nguoi khong ghi",
		);
		const c2 = await lienHe("trong-2");
		const b = await goi(ctxNen("profile", c2), {
			recordId: c2,
			key: truongF,
			value: "B",
		});
		phai(
			b.written === true && (await giaTri(idF, c2)) === "B",
			"kgd: o trong nen khong ghi",
		);
		const c3 = await lienHe("trong-3");
		const xoa = await goi(await ctxCoNguoi(), {
			recordId: c3,
			key: truongF,
			value: null,
		});
		phai(xoa.written === true, "kgd: xoa o trong bi chan");
		phai((await hang(idF, c3)) === null, "kgd: xoa o trong tao hang");
	});

	test("kgd-dong-thoi: hai luot nen cung dien mot o trong, mot lan thang", async () => {
		for (let vong = 0; vong < 3; vong += 1) {
			const c = await lienHe(`dong-thoi-${vong}`);
			const ket = await Promise.all(
				["X", "Y"].map((value) =>
					goi(ctxNen("profile", c), { recordId: c, key: truongF, value }),
				),
			);
			const thang = ket.flatMap((kq, i) => (kq.written ? [["X", "Y"][i]] : []));
			phai(thang.length === 1, `kgd: dong thoi ${thang.length}`);
			phai((await giaTri(idF, c)) === thang[0], "kgd: dong thoi lech gia tri");
		}
	});

	test("kgd-chi-tay: truong chi nhap tay van chan ke ca co replace", async () => {
		const c = await lienHe("chi-tay");
		const kq = await goi(await ctxCoNguoi(), {
			recordId: c,
			key: truongM,
			value: "Kara thấy",
			replace: true,
		});
		phai(kq.written === false, "kgd: chi tay ghi duoc");
		phai((kq.reason ?? "").includes("manual only"), "kgd: chi tay sai ly do");
		phai((await hang(idM, c)) === null, "kgd: chi tay tao hang");
	});

	test("kgd-mo-ta: loi mo ta cong cu noi luat khong ghi de", () => {
		phai(
			setFieldValue.description.includes("already has a value"),
			"kgd: mo ta thieu luat o co gia tri",
		);
		const shape = z
			.object({ replace: z.custom<z.ZodType>().optional() })
			.loose()
			.parse(setFieldValue.inputSchema.shape);
		phai(
			(shape.replace?.description ?? "").includes(DIEU_KIEN),
			"kgd: mo ta replace thieu dieu kien",
		);
		const coSo = { entity: "CONTACT", recordId: "x", key: "k", value: "v" };
		phai(
			setFieldValue.inputSchema.safeParse({ ...coSo, replace: true }).success,
			"kgd: schema khong nhan replace",
		);
		phai(
			setFieldValue.inputSchema.safeParse(coSo).success,
			"kgd: replace bat buoc",
		);
	});
});
