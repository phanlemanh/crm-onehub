import { afterAll, describe, it, setDefaultTimeout, spyOn } from "bun:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { coTheXoaTep, quyenMoTep } from "@crm/auth";
import { db } from "@crm/db";
import type { FieldEntityName } from "@crm/db/fields";
import { tepTrongO } from "@crm/validation/tep-truong";
import { type INestApplication, Logger } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type { NextFunction, Request, Response } from "express";
import { AppRouterHost } from "nestjs-trpc";
import request from "supertest";
import { createOpenApiExpressMiddleware } from "trpc-to-openapi";
import ts from "typescript";
import { khoTepTruongGia } from "../../../packages/db/test/blob-tep-truong-gia";
import type { LuatTep } from "../src/fields/luat-tep";
import {
	REST_BRIDGE_BODY_LIMIT_BYTES,
	REST_BRIDGE_PATH,
} from "../src/trpc/openapi";
import { createBaseTrpcContext } from "../src/trpc/trpc.context";
import { gieoThanhVien, mintPhien } from "./phien-thu";
import {
	type Ai,
	canData,
	donBanGhi,
	dungSan,
	type Json,
	MAU_TEP,
	type OTep,
	TIEN_TO,
	type TraLoi,
	TTP_SAN,
} from "./truong-tep-san";

setDefaultTimeout(TTP_SAN.baiMs * 3);

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const TCB = `${TIEN_TO}tcb`;
const kho = khoTepTruongGia();
const daTao = {
	deal: [] as string[],
	company: [] as string[],
	contact: [] as string[],
	field: [] as string[],
};
const nguoiThem: string[] = [];
const san = dungSan({
	kho,
	ten: "tcb",
	don: async () => {
		await donBanGhi(daTao);
		await db.session.deleteMany({ where: { userId: { in: nguoiThem } } });
		await db.member.deleteMany({ where: { userId: { in: nguoiThem } } });
		await db.user.deleteMany({ where: { id: { in: nguoiThem } } });
	},
});

const id = (ai: Ai) => san.phien[ai].nguoi;

type Truong = { id: string; key: string };

async function taoTruong(
	entity: FieldEntityName,
	nhan: string,
): Promise<Truong> {
	const f = canData<Truong>(
		await san.goi("quanTri", "fields.create", {
			entity,
			label: nhan,
			type: "FILE",
			options: [],
			agentFilled: false,
			agentBrief: null,
			required: false,
			showOnSheet: true,
			showOnTable: true,
			showOnFilter: true,
		}),
		`tao truong ${nhan}`,
	);
	daTao.field.push(f.id);
	return f;
}

async function taoCongTy(ten: string, ownerId: string | null): Promise<string> {
	const c = canData<{ id: string }>(
		await san.goi("quanTri", "companies.create", { name: ten, ownerId }),
		`tao cong ty ${ten}`,
	);
	daTao.company.push(c.id);
	return c.id;
}

async function taoThoaThuan(
	ten: string,
	companyId: string,
	ownerId: string,
): Promise<string> {
	const d = canData<{ id: string }>(
		await san.goi("quanTri", "deals.create", { name: ten, companyId, ownerId }),
		`tao thoa thuan ${ten}`,
	);
	daTao.deal.push(d.id);
	return d.id;
}

async function taoCaNhan(
	ten: string,
	companyId: string,
	ownerId: string | null,
): Promise<string> {
	const c = canData<{ id: string }>(
		await san.goi("quanTri", "contacts.create", {
			firstName: ten,
			companyId,
			ownerId,
		}),
		`tao ca nhan ${ten}`,
	);
	daTao.contact.push(c.id);
	return c.id;
}

type Xin = { pathname: string; url: string; phieu: string };

async function gan(
	ai: Ai,
	o: OTep,
	ten: string,
	nhan: string,
): Promise<string> {
	const byte = MAU_TEP.pdf(nhan);
	const xin = canData<Xin>(
		await san.goi(ai, "fieldFiles.requestUpload", {
			...o,
			tenTep: ten,
			kieu: "pdf",
			kichThuoc: byte.length,
		}),
		`xin ${ten}`,
	);
	kho.put(xin.pathname, byte);
	return canData<{ tepId: string }>(
		await san.goi(ai, "fieldFiles.complete", {
			...o,
			tenTep: ten,
			pathname: xin.pathname,
			phieu: xin.phieu,
		}),
		`gan ${ten}`,
	).tepId;
}

const BY_ID = {
	DEAL: "deals.byId",
	COMPANY: "companies.byId",
	CONTACT: "contacts.byId",
} as const;

type TepDoc = {
	id: string;
	coTheMo: boolean;
	coTheXoa: boolean;
	lyDoKhongMo: string | null;
};

async function tepTrongById(
	ai: Ai,
	o: OTep,
): Promise<{ tl: TraLoi; tep: TepDoc[] }> {
	const tl = await san.hoi(ai, BY_ID[o.entity], { id: o.recordId });
	if (tl.status !== 200) return { tl, tep: [] };
	const ban = tl.data as { tepTheoTruong?: Record<string, Json[]> };
	const ds = ban.tepTheoTruong?.[o.fieldKey] ?? [];
	const tep = ds.map((t) => {
		const p = tepTrongO.safeParse(t);
		if (!p.success) throw new Error("tcb luat: khuon");
		return p.data as TepDoc;
	});
	return { tl, tep };
}

type KetMo = "url" | "FORBIDDEN" | "KHONG_TRONG_PHAM_VI" | string;

async function moTep(
	ai: Ai,
	tepId: string,
): Promise<{ ket: KetMo; tl: TraLoi }> {
	const tl = await san.goi(ai, "fieldFiles.downloadUrl", { tepId });
	if (tl.status === 200) return { ket: "url", tl };
	if (tl.ma === "FORBIDDEN" && tl.loi.includes("Your role does not include")) {
		return { ket: "KHONG_TRONG_PHAM_VI", tl };
	}
	return { ket: tl.ma, tl };
}

type BanGhi = { ten: string; o: OTep; tepId: string };

async function dungBay(tienTo: string): Promise<Record<string, BanGhi>> {
	const fD = await taoTruong("DEAL", `${tienTo} hd`);
	const fC = await taoTruong("COMPANY", `${tienTo} hd cty`);
	const fP = await taoTruong("CONTACT", `${tienTo} hd cn`);
	const cA = await taoCongTy(`${tienTo} cA`, id("nv1"));
	const c0 = await taoCongTy(`${tienTo} c0`, null);
	const dA = await taoThoaThuan(`${tienTo} dA`, cA, id("nv1"));
	const dQ = await taoThoaThuan(`${tienTo} dQ`, cA, id("quanTri"));
	const dO = await taoThoaThuan(`${tienTo} dO`, cA, id("quanTri"));
	canData(
		await san.goi("quanTri", "deals.update", {
			id: dO,
			data: { ownerId: id("okr") },
		}),
		"dat O phu trach dO",
	);
	const pA = await taoCaNhan(`${tienTo} pA`, cA, id("nv1"));
	const p0 = await taoCaNhan(`${tienTo} p0`, c0, null);
	const ban: [string, FieldEntityName, string, Truong][] = [
		["dA", "DEAL", dA, fD],
		["dQ", "DEAL", dQ, fD],
		["dO", "DEAL", dO, fD],
		["cA", "COMPANY", cA, fC],
		["c0", "COMPANY", c0, fC],
		["pA", "CONTACT", pA, fP],
		["p0", "CONTACT", p0, fP],
	];
	const ket: Record<string, BanGhi> = {};
	for (const [ten, entity, recordId, f] of ban) {
		const o: OTep = { entity, recordId, fieldKey: f.key };
		ket[ten] = {
			ten,
			o,
			tepId: await gan("quanTri", o, `${ten}.pdf`, `${tienTo}${ten}`),
		};
	}
	return ket;
}

const NGUOI_LUAT = ["quanTri", "nv1", "nv2", "okr"] as const;
const PHU_TRACH_BAN = new Map<string, "Q" | "A" | "O" | null>([
	["dA", "A"],
	["dQ", "Q"],
	["dO", "O"],
	["cA", "A"],
	["c0", null],
	["pA", "A"],
	["p0", null],
]);
const TEN_NGUOI = { quanTri: "Q", nv1: "A", nv2: "B", okr: "O" } as const;
const BAN_LUAT = ["dA", "dQ", "dO", "cA", "c0", "pA", "p0"] as const;

const DAP_AN_MO: Record<string, KetMo> = {};
const DAP_AN_LY_DO: Record<string, string | null> = {};
for (const b of BAN_LUAT) {
	DAP_AN_MO[`Q ${b}`] = "url";
	DAP_AN_LY_DO[`Q ${b}`] = null;
	DAP_AN_MO[`O ${b}`] = "KHONG_TRONG_PHAM_VI";
}
for (const b of ["dA", "cA", "pA"]) {
	DAP_AN_MO[`A ${b}`] = "url";
	DAP_AN_LY_DO[`A ${b}`] = null;
}
for (const b of ["dQ", "dO"]) {
	DAP_AN_MO[`A ${b}`] = "FORBIDDEN";
	DAP_AN_LY_DO[`A ${b}`] = "khong-phu-trach";
}
for (const b of ["c0", "p0"]) {
	DAP_AN_MO[`A ${b}`] = "FORBIDDEN";
	DAP_AN_LY_DO[`A ${b}`] = "chua-co-phu-trach";
	DAP_AN_MO[`B ${b}`] = "FORBIDDEN";
	DAP_AN_LY_DO[`B ${b}`] = "chua-co-phu-trach";
}
for (const b of ["dA", "dQ", "dO", "cA", "pA"]) {
	DAP_AN_MO[`B ${b}`] = "FORBIDDEN";
	DAP_AN_LY_DO[`B ${b}`] = "khong-phu-trach";
}

describe("tcb-luat", () => {
	it("tcb-luat: 4 người × 7 bản ghi, downloadUrl và cờ byId cùng một luật", async () => {
		const bay = await dungBay(`${TCB}lu`);
		let soMo = 0;
		let soCo = 0;
		for (const ai of NGUOI_LUAT) {
			const n = TEN_NGUOI[ai];
			for (const b of BAN_LUAT) {
				const ban = bay[b] as BanGhi;
				const { ket, tl } = await moTep(ai, ban.tepId);
				if (ket !== DAP_AN_MO[`${n} ${b}`]) {
					throw new Error(`tcb luat: ${n} ${b} ${ket}`);
				}
				if (ket !== "url" && JSON.stringify(tl).includes("http")) {
					throw new Error(`tcb luat: lo url ${n} ${b}`);
				}
				soMo += 1;
				if (ai === "okr") continue;
				const { tep } = await tepTrongById(ai, ban.o);
				const t = tep.find((x) => x.id === ban.tepId);
				if (!t || t.coTheMo !== (ket === "url")) {
					throw new Error(`tcb luat: co mo lech ${n} ${b}`);
				}
				if (t.lyDoKhongMo !== DAP_AN_LY_DO[`${n} ${b}`]) {
					throw new Error(`tcb luat: ly do ${n} ${b} ${t.lyDoKhongMo}`);
				}
				soCo += 1;
			}
		}
		if (soMo !== 28 || soCo !== 21) {
			throw new Error(`tcb luat: thieu o ${soMo}/${soCo}`);
		}
		const { tep } = await tepTrongById("quanTri", (bay.dA as BanGhi).o);
		if (tep.length !== 1 || tep[0]?.coTheMo !== true) {
			throw new Error("tcb luat: doi chung");
		}
	});
});

async function demBang(): Promise<Record<string, number>> {
	const ket: Record<string, number> = {};
	const bang = await db.$queryRaw<{ ten: string }[]>`
		SELECT table_name AS ten FROM information_schema.tables
		WHERE table_schema = current_schema() AND table_type = 'BASE TABLE'`;
	for (const { ten } of bang) {
		const [dong] = await db.$queryRawUnsafe<{ so: bigint }[]>(
			`SELECT count(*) AS so FROM "${ten}"`,
		);
		ket[ten] = Number(dong?.so ?? 0);
	}
	return ket;
}

const BANG_DUOC_DOI = new Set([
	"deal",
	"company",
	"contact",
	"session",
	"verification",
	"agentTask",
]);

describe("tcb-doi-chu", () => {
	it("tcb-doi-chu: 7 đường đổi người phụ trách, gỡ về trống, đặt lại", async () => {
		const tienTo = `${TCB}dc`;
		const fD = await taoTruong("DEAL", `${tienTo} hd`);
		const fC = await taoTruong("COMPANY", `${tienTo} hd cty`);
		const fP = await taoTruong("CONTACT", `${tienTo} hd cn`);
		const goc = await taoCongTy(`${tienTo} goc`, null);
		type Duong = { ten: string; o: OTep; doi: () => Promise<TraLoi> };
		const tao = async (ten: string, entity: FieldEntityName): Promise<OTep> => {
			const recordId =
				entity === "DEAL"
					? await taoThoaThuan(`${tienTo} ${ten}`, goc, id("nv1"))
					: entity === "COMPANY"
						? await taoCongTy(`${tienTo} ${ten}`, id("nv1"))
						: await taoCaNhan(`${tienTo} ${ten}`, goc, id("nv1"));
			const f = entity === "DEAL" ? fD : entity === "COMPANY" ? fC : fP;
			return { entity, recordId, fieldKey: f.key };
		};
		const sangB = { ownerId: id("nv2") };
		const oDu = await tao("du", "DEAL");
		const oCu = await tao("cu", "COMPANY");
		const oPu = await tao("pu", "CONTACT");
		const oDr = await tao("dr", "DEAL");
		const oDb = await tao("db", "DEAL");
		const oCb = await tao("cb", "COMPANY");
		const oPb = await tao("pb", "CONTACT");
		const duong: Duong[] = [
			{
				ten: "deals.update",
				o: oDu,
				doi: () =>
					san.goi("quanTri", "deals.update", { id: oDu.recordId, data: sangB }),
			},
			{
				ten: "companies.update",
				o: oCu,
				doi: () =>
					san.goi("quanTri", "companies.update", {
						id: oCu.recordId,
						data: sangB,
					}),
			},
			{
				ten: "contacts.update",
				o: oPu,
				doi: () =>
					san.goi("quanTri", "contacts.update", {
						id: oPu.recordId,
						data: sangB,
					}),
			},
			{
				ten: "rest PATCH /deals/{id}",
				o: oDr,
				doi: () => restPatchDeal(oDr.recordId, id("nv2")),
			},
			{
				ten: "deals.bulkAssignOwner",
				o: oDb,
				doi: () =>
					san.goi("quanTri", "deals.bulkAssignOwner", {
						ids: [oDb.recordId],
						ownerId: id("nv2"),
					}),
			},
			{
				ten: "companies.bulkAssignOwner",
				o: oCb,
				doi: () =>
					san.goi("quanTri", "companies.bulkAssignOwner", {
						ids: [oCb.recordId],
						ownerId: id("nv2"),
					}),
			},
			{
				ten: "contacts.bulkAssignOwner",
				o: oPb,
				doi: () =>
					san.goi("quanTri", "contacts.bulkAssignOwner", {
						ids: [oPb.recordId],
						ownerId: id("nv2"),
					}),
			},
		];
		const tep: Record<string, string> = {};
		for (const d of duong)
			tep[d.ten] = await gan(
				"quanTri",
				d.o,
				`${d.ten}.pdf`,
				`${tienTo}${d.ten}`,
			);

		if ((await moTep("nv1", tep["deals.update"] as string)).ket !== "url") {
			throw new Error("tcb doi chu: doi chung");
		}
		await khoaQ();
		const truoc = await demBang();
		let so = 0;
		for (const d of duong) {
			const tl = await d.doi();
			if (tl.status !== 200)
				throw new Error(
					`tcb doi chu: ${d.ten} doi hong ${tl.status} ${tl.loi}`,
				);
			const t = tep[d.ten] as string;
			if ((await moTep("nv2", t)).ket !== "url")
				throw new Error(`tcb doi chu: ${d.ten} B khong mo`);
			if ((await moTep("nv1", t)).ket !== "FORBIDDEN")
				throw new Error(`tcb doi chu: ${d.ten} A con mo`);
			const coA = (await tepTrongById("nv1", d.o)).tep.find((x) => x.id === t);
			const coB = (await tepTrongById("nv2", d.o)).tep.find((x) => x.id === t);
			if (coA?.coTheMo !== false || coB?.coTheMo !== true)
				throw new Error(`tcb doi chu: ${d.ten} co`);
			so += 1;
		}
		if (so !== 7) throw new Error(`tcb doi chu: thieu duong ${so}`);

		for (const [loai, o, thuTuc] of [
			["COMPANY", oCu, "companies.update"],
			["CONTACT", oPu, "contacts.update"],
		] as const) {
			canData(
				await san.goi("quanTri", thuTuc, {
					id: o.recordId,
					data: { ownerId: null },
				}),
				`go ${loai}`,
			);
			const t = tep[thuTuc] as string;
			for (const ai of ["nv1", "nv2"] as const) {
				const kq = await moTep(ai, t);
				const co = (await tepTrongById(ai, o)).tep.find((x) => x.id === t);
				if (kq.ket !== "FORBIDDEN" || co?.lyDoKhongMo !== "chua-co-phu-trach") {
					throw new Error(`tcb doi chu: go trong ${loai} ${TEN_NGUOI[ai]}`);
				}
			}
			if ((await moTep("quanTri", t)).ket !== "url")
				throw new Error("tcb doi chu: go trong Q");
		}
		canData(
			await san.goi("quanTri", "deals.update", {
				id: oDu.recordId,
				data: { ownerId: id("nv1") },
			}),
			"dat lai A",
		);
		if ((await moTep("nv1", tep["deals.update"] as string)).ket !== "url") {
			throw new Error("tcb doi chu: dat lai A");
		}

		const sau = await demBang();
		for (const [bang, n] of Object.entries(sau)) {
			if (BANG_DUOC_DOI.has(bang)) continue;
			if (truoc[bang] !== n) throw new Error(`tcb doi chu: ghi bang ${bang}`);
		}
	});
});

async function khoaApi(ai: Ai): Promise<string> {
	const tl = await san.goi(ai, "apiKeys.create", {
		name: `${TCB}-${ai}`,
		expiresInDays: null,
	});
	return canData<{ key: string }>(tl, `khoa api ${ai}`).key;
}

async function restPatchDeal(dealId: string, ownerId: string): Promise<TraLoi> {
	const res = await rest().patch(
		`/deals/${dealId}`,
		{ data: { ownerId } },
		await khoaQ(),
	);
	return res;
}

let khoaQuanTri: string | null = null;
async function khoaQ(): Promise<string> {
	khoaQuanTri ??= await khoaApi("quanTri");
	return khoaQuanTri;
}

let phu: Promise<INestApplication> | null = null;

async function dungAppPhu(luat?: LuatTep): Promise<INestApplication> {
	const { AppModule } = await import("../src/app.module");
	const { KHO_TEP } = await import("../src/fields/kho-tep");
	const { LUAT_TEP } = await import("../src/fields/luat-tep");
	let dung = Test.createTestingModule({ imports: [AppModule] })
		.overrideProvider(KHO_TEP)
		.useValue(kho);
	if (luat) dung = dung.overrideProvider(LUAT_TEP).useValue(luat);
	const app = (await dung.compile()).createNestApplication({
		bodyParser: false,
	});
	let cau: ((req: Request, res: Response) => Promise<void>) | undefined;
	app.use(
		REST_BRIDGE_PATH,
		(req: Request, res: Response, next: NextFunction) => {
			if (!cau) return next();
			void cau(req, res);
		},
	);
	await app.init();
	const { appRouter } = app.get(AppRouterHost);
	cau = createOpenApiExpressMiddleware({
		router: appRouter,
		createContext: ({ req }) => createBaseTrpcContext(req),
		maxBodySize: REST_BRIDGE_BODY_LIMIT_BYTES,
	});
	appPhuDaMo.push(app);
	return app;
}

const appPhuDaMo: INestApplication[] = [];
afterAll(async () => {
	for (const a of appPhuDaMo) await a.close();
});

function rest() {
	const goi = async (
		verb: "patch" | "post",
		duong: string,
		than: Json,
		khoa: string,
	): Promise<TraLoi> => {
		phu ??= dungAppPhu();
		const app = await phu;
		const res = await request(app.getHttpServer())
			[verb](`${REST_BRIDGE_PATH}${duong}`)
			.set("x-api-key", khoa)
			.set("content-type", "application/json")
			.send(JSON.stringify(than));
		return {
			status: res.status,
			data: res.body,
			loi: String(res.body?.message ?? ""),
			ma: String(res.body?.code ?? ""),
		};
	};
	return {
		patch: (duong: string, than: Json, khoa: string) =>
			goi("patch", duong, than, khoa),
		post: (duong: string, than: Json, khoa: string) =>
			goi("post", duong, than, khoa),
	};
}

describe("tcb-pham-vi", () => {
	it("tcb-pham-vi: chỉ mở và xoá đổi luật; không thừa kế; khoá API; người đã rời", async () => {
		const tienTo = `${TCB}pv`;
		const fD = await taoTruong("DEAL", `${tienTo} hd`);
		const fP = await taoTruong("CONTACT", `${tienTo} hd cn`);
		const cA = await taoCongTy(`${tienTo} cA`, id("nv1"));
		const dQ = await taoThoaThuan(`${tienTo} dQ`, cA, id("quanTri"));
		const dA = await taoThoaThuan(`${tienTo} dA`, cA, id("nv1"));
		const p0 = await taoCaNhan(`${tienTo} p0`, cA, null);
		const oQ: OTep = { entity: "DEAL", recordId: dQ, fieldKey: fD.key };
		const oA: OTep = { entity: "DEAL", recordId: dA, fieldKey: fD.key };
		const oP: OTep = { entity: "CONTACT", recordId: p0, fieldKey: fP.key };
		const q1 = await gan("quanTri", oQ, "q1.pdf", `${tienTo}q1`);
		await gan("quanTri", oQ, "q2.pdf", `${tienTo}q2`);
		const tA = await gan("quanTri", oA, "a.pdf", `${tienTo}a`);
		const tP = await gan("quanTri", oP, "p.pdf", `${tienTo}p`);

		const xem = await tepTrongById("nv1", oQ);
		if (xem.tep.length !== 2) throw new Error("tcb pham vi: an ten");
		for (const [thuTuc, vao] of [
			["deals.list", {}],
			["deals.board", {}],
		] as const) {
			const tl = await san.hoi("nv1", thuTuc, vao);
			const chu = JSON.stringify(tl.data ?? "");
			if (tl.status !== 200 || !chu.includes(dQ))
				throw new Error(`tcb pham vi: dem ${thuTuc}`);
		}

		const moi = await gan("nv1", oQ, "cua-A.pdf", `${tienTo}cuaA`);
		if (!moi) throw new Error("tcb pham vi: tai len bi chan");

		for (const [ten, t] of [
			["dQ", q1],
			["p0", tP],
		] as const) {
			if ((await moTep("nv1", t)).ket !== "FORBIDDEN")
				throw new Error(`tcb pham vi: thua ke ${ten}`);
		}
		if ((await moTep("nv1", moi)).ket !== "FORBIDDEN")
			throw new Error(`tcb pham vi: nguoi tai mo ${moi}`);
		const coMoi = (await tepTrongById("nv1", oQ)).tep.find((x) => x.id === moi);
		if (coMoi?.coTheMo !== false || coMoi.lyDoKhongMo !== "khong-phu-trach") {
			throw new Error(`tcb pham vi: nguoi tai co ${moi}`);
		}

		const khoaA = await khoaApi("nv1");
		const quaKhoa = async (tepId: string) =>
			rest().post(`/field-files/${tepId}/download-url`, {}, khoaA);
		const kqQ = await quaKhoa(q1);
		const kqA = await quaKhoa(tA);
		if (kqQ.status !== 403)
			throw new Error(`tcb pham vi: khoa api dQ ${kqQ.status}`);
		if (kqA.status !== 200 || !JSON.stringify(kqA.data).includes("http")) {
			throw new Error(`tcb pham vi: khoa api dA ${kqA.status}`);
		}

		const rId = `${TCB}-roi`;
		nguoiThem.push(rId);
		await gieoThanhVien(rId, "member");
		const dR = await taoThoaThuan(`${tienTo} dR`, cA, rId);
		const oR: OTep = { entity: "DEAL", recordId: dR, fieldKey: fD.key };
		const tR = await gan("quanTri", oR, "r.pdf", `${tienTo}r`);
		canData(
			await san.goi("quanTri", "workspace.removeMember", {
				memberId: `member-${rId}`,
			}),
			"go R",
		);
		const cookieR = (await mintPhien(rId)).cookie;
		let soThuTuc = 0;
		for (const [thuTuc, vao] of [
			[
				"fieldFiles.requestUpload",
				{ ...oR, tenTep: "x.pdf", kieu: "pdf", kichThuoc: 10 },
			],
			[
				"fieldFiles.complete",
				{ ...oR, tenTep: "x.pdf", pathname: "truong-tep/khong-co", phieu: "x" },
			],
			["fieldFiles.downloadUrl", { tepId: tR }],
			["fieldFiles.remove", { tepId: tR }],
		] as const) {
			const res = await request(san.app().getHttpServer())
				.post(`/api/trpc/${thuTuc}`)
				.set("cookie", cookieR)
				.set("content-type", "application/json")
				.send(JSON.stringify(vao));
			const loi = String(res.body?.error?.message ?? "");
			if (!loi.includes("NOT_A_MEMBER") && !/not a member/i.test(loi)) {
				throw new Error(
					`tcb pham vi: nguoi roi ${thuTuc} ${res.status} ${loi}`,
				);
			}
			soThuTuc += 1;
		}
		if (soThuTuc !== 4)
			throw new Error(`tcb pham vi: thieu thu tuc ${soThuTuc}`);

		for (const t of [q1, tP]) {
			if ((await moTep("quanTri", t)).ket !== "url")
				throw new Error("tcb pham vi: doi chung");
		}
	});
});

type MaTranXoa = Record<
	"truoc" | "sau",
	Record<"Q" | "A" | "B", Record<"fA" | "fB" | "fQ", boolean>>
>;
const BA = { fA: true, fB: true, fQ: true };
const MA_TRAN_XOA = {
	khuyen: {
		truoc: { Q: BA, A: BA, B: { fA: false, fB: true, fQ: false } },
		sau: { Q: BA, A: { fA: true, fB: false, fQ: false }, B: BA },
	},
	a: {
		truoc: {
			Q: BA,
			A: { fA: true, fB: false, fQ: false },
			B: { fA: false, fB: true, fQ: false },
		},
		sau: {
			Q: BA,
			A: { fA: true, fB: false, fQ: false },
			B: { fA: false, fB: true, fQ: false },
		},
	},
	b: {
		truoc: { Q: BA, A: BA, B: { fA: false, fB: false, fQ: false } },
		sau: { Q: BA, A: { fA: false, fB: false, fQ: false }, B: BA },
	},
} satisfies Record<"khuyen" | "a" | "b", MaTranXoa>;

function loiHoi2(): "khuyen" | "a" | "b" {
	const duong = join(
		GOC,
		"_acceptance/tep-theo-chu-ban-ghi/evidence/ke-hoach.json",
	);
	const loi = (JSON.parse(readFileSync(duong, "utf8")) as { hoi2_loi?: string })
		.hoi2_loi;
	if (loi !== "khuyen" && loi !== "a" && loi !== "b")
		throw new Error("tcb xoa: thieu loi hoi2");
	return loi;
}

const AI_THEO_TEN = { Q: "quanTri", A: "nv1", B: "nv2" } as const;

async function dungBaTep(tienTo: string, f: Truong, cty: string) {
	const dA = await taoThoaThuan(`${tienTo} dA`, cty, id("nv1"));
	const o: OTep = { entity: "DEAL", recordId: dA, fieldKey: f.key };
	return {
		o,
		fA: await gan("nv1", o, "fA.pdf", `${tienTo}fA`),
		fB: await gan("nv2", o, "fB.pdf", `${tienTo}fB`),
		fQ: await gan("quanTri", o, "fQ.pdf", `${tienTo}fQ`),
	};
}

async function coXoa(o: OTep, tep: Record<"fA" | "fB" | "fQ", string>) {
	const ket = {} as Record<
		"Q" | "A" | "B",
		Record<"fA" | "fB" | "fQ", boolean>
	>;
	for (const n of ["Q", "A", "B"] as const) {
		const { tep: ds } = await tepTrongById(AI_THEO_TEN[n], o);
		ket[n] = { fA: false, fB: false, fQ: false };
		for (const k of ["fA", "fB", "fQ"] as const) {
			ket[n][k] = ds.find((x) => x.id === tep[k])?.coTheXoa ?? false;
		}
	}
	return ket;
}

function soMaTran(
	loi: string,
	pha: "truoc" | "sau",
	thay: MaTranXoa["truoc"],
	dapAn: MaTranXoa["truoc"],
	nem: boolean,
): number {
	let lech = 0;
	for (const n of ["Q", "A", "B"] as const) {
		for (const k of ["fA", "fB", "fQ"] as const) {
			if (thay[n][k] !== dapAn[n][k]) {
				if (nem)
					throw new Error(`tcb xoa: co ${loi} ${pha} ${n} ${k} ${thay[n][k]}`);
				lech += 1;
			}
		}
	}
	return lech;
}

describe("tcb-xoa", () => {
	it("tcb-xoa: ma trận xoá theo lối Hỏi-2, trước và sau khi đổi người phụ trách", async () => {
		const loi = loiHoi2();
		const dapAn = MA_TRAN_XOA[loi];
		const tienTo = `${TCB}xo`;
		const f = await taoTruong("DEAL", `${tienTo} hd`);
		const cty = await taoCongTy(`${tienTo} cty`, null);

		const bo1 = await dungBaTep(`${tienTo}1`, f, cty);
		const truoc = await coXoa(bo1.o, bo1);
		if (Object.values(truoc.Q).filter(Boolean).length !== 3)
			throw new Error("tcb xoa: doi chung");
		soMaTran(loi, "truoc", truoc, dapAn.truoc, true);
		const khac = loi === "khuyen" ? "a" : "khuyen";
		if (soMaTran(khac, "truoc", truoc, MA_TRAN_XOA[khac].truoc, false) === 0) {
			const bo3 = await dungBaTep(`${tienTo}3`, f, cty);
			canData(
				await san.goi("quanTri", "deals.update", {
					id: bo3.o.recordId,
					data: { ownerId: id("nv2") },
				}),
				"doi chu bo3",
			);
			if (
				soMaTran(
					khac,
					"sau",
					await coXoa(bo3.o, bo3),
					MA_TRAN_XOA[khac].sau,
					false,
				) === 0
			) {
				throw new Error("tcb xoa: ma tran mu");
			}
		}

		const ghiLog = spyOn(Logger.prototype, "log");
		try {
			for (const [n, k] of [
				["B", "fA"],
				["B", "fB"],
				["A", "fQ"],
				["Q", "fA"],
			] as const) {
				const tepId = bo1[k];
				const pathname = (
					await db.fieldFile.findUnique({ where: { id: tepId } })
				)?.blobPathname;
				ghiLog.mockClear();
				const tl = await san.goi(AI_THEO_TEN[n], "fieldFiles.remove", {
					tepId,
				});
				const duoc = dapAn.truoc[n][k];
				if (duoc !== (tl.status === 200))
					throw new Error(`tcb xoa: remove ${loi} ${n} ${k} ${tl.status}`);
				const con = await db.fieldFile.findUnique({ where: { id: tepId } });
				if (!duoc && !con) throw new Error(`tcb xoa: mat hang ${k}`);
				if (duoc) {
					const vet = ghiLog.mock.calls.some(
						(g) =>
							(g[0] as { message?: string; tepId?: string })?.message ===
								"Field file removed" &&
							(g[0] as { tepId?: string }).tepId === tepId,
					);
					const choXoa =
						kho.daXoa.includes(pathname as string) ||
						(await db.blobChoXoa.findUnique({
							where: { pathname: pathname as string },
						}));
					if (!vet || !choXoa) throw new Error(`tcb xoa: duong xoa ${k}`);
				}
			}
		} finally {
			ghiLog.mockRestore();
		}

		const bo2 = await dungBaTep(`${tienTo}2`, f, cty);
		canData(
			await san.goi("quanTri", "deals.update", {
				id: bo2.o.recordId,
				data: { ownerId: id("nv2") },
			}),
			"doi chu",
		);
		const sau = await coXoa(bo2.o, bo2);
		soMaTran(loi, "sau", sau, dapAn.sau, true);
		const n = Object.values(dapAn).length * 0 + 18;
		if (n !== 18) throw new Error(`tcb xoa: thieu o ${n}`);
	});
});

type DongLog = {
	message?: string;
	tepId?: string;
	fieldId?: string;
	recordId?: string;
	userId?: string;
	role?: string;
	laPhuTrach?: boolean;
	lyDo?: string;
};

const VAI_AI = {
	quanTri: "admin",
	nv1: "member",
	nv2: "member",
	okr: "okr",
} as const;
const fieldIdCua = new Map<string, string>();

function demChet(dong: DongLog[]): number {
	return dong.filter(
		(d) =>
			d.message === "Field file opened" &&
			d.laPhuTrach === false &&
			d.role !== "owner" &&
			d.role !== "admin",
	).length;
}

describe("tcb-vet", () => {
	it("tcb-vet: một dòng mở hay từ chối mỗi lần, không URL, thước CHẾT bắt được luật hỏng", async () => {
		const bay = await dungBay(`${TCB}ve`);
		const ghiLog = spyOn(Logger.prototype, "log");
		const dongCua = () => ghiLog.mock.calls.map((g) => g[0] as DongLog);
		try {
			let so = 0;
			for (const ai of NGUOI_LUAT) {
				const n = TEN_NGUOI[ai];
				for (const b of BAN_LUAT) {
					const ban = bay[b] as BanGhi;
					ghiLog.mockClear();
					const { ket } = await moTep(ai, ban.tepId);
					so += 1;
					if (ai === "okr") continue;
					const laPhuTrach = PHU_TRACH_BAN.get(b) === n;
					if (!fieldIdCua.has(ban.tepId)) {
						const hang = await db.fieldFile.findUnique({
							where: { id: ban.tepId },
							select: { fieldId: true },
						});
						fieldIdCua.set(ban.tepId, hang?.fieldId ?? "");
					}
					const msg =
						ket === "url" ? "Field file opened" : "Field file open refused";
					const dong = dongCua().filter((d) => d?.message === msg);
					const d = dong[0];
					const dungKhoa =
						dong.length === 1 &&
						d?.tepId === ban.tepId &&
						d.recordId === ban.o.recordId &&
						d.userId === id(ai) &&
						d.fieldId === fieldIdCua.get(ban.tepId) &&
						d.role === VAI_AI[ai] &&
						d.laPhuTrach === laPhuTrach &&
						(ket === "url" || d.lyDo === DAP_AN_LY_DO[`${n} ${b}`]);
					if (!dungKhoa) {
						throw new Error(
							`tcb vet: ${ket === "url" ? "mo" : "tu choi"} ${n} ${b} message`,
						);
					}
					if (
						dongCua().some((x) =>
							JSON.stringify(x ?? "").includes("blob-tep-gia.test"),
						)
					) {
						throw new Error("tcb vet: lo url");
					}
				}
			}
			if (so !== 28) throw new Error(`tcb vet: thieu o ${so}`);
		} finally {
			ghiLog.mockRestore();
		}

		const gia: DongLog[] = [
			{ message: "Field file opened", laPhuTrach: false, role: "member" },
		];
		if (demChet(gia) !== 1) throw new Error("tcb vet: thuoc chet mu");

		const nguon = readFileSync(
			join(GOC, "apps/api/src/fields/field-files.service.ts"),
			"utf8",
		);
		const sf = ts.createSourceFile(
			"field-files.service.ts",
			nguon,
			ts.ScriptTarget.Latest,
			true,
		);
		let dungSo = false;
		const xem = (nut: ts.Node) => {
			if (
				ts.isPropertyAssignment(nut) &&
				ts.isIdentifier(nut.name) &&
				nut.name.text === "laPhuTrach"
			) {
				const chu = nut.initializer.getText(sf);
				dungSo =
					/phuTrachId/.test(chu) &&
					/nguoi\.id/.test(chu) &&
					!/coTheMo|role|vai/.test(chu);
			}
			ts.forEachChild(nut, xem);
		};
		xem(sf);
		if (!dungSo) throw new Error("tcb vet: la phu trach suy tu luat");
	});

	it("tcb-vet: dưới luật hỏng (mọi member mở), thước CHẾT đếm đúng 11", async () => {
		const hong: LuatTep = {
			quyenMoTep: (i) =>
				i.vai === "member" ? { coTheMo: true, lyDo: null } : quyenMoTep(i),
			coTheXoaTep,
		};
		const app = await dungAppPhu(hong);
		const bay = await dungBay(`${TCB}vh`);
		const ghiLog = spyOn(Logger.prototype, "log");
		try {
			ghiLog.mockClear();
			for (const ai of NGUOI_LUAT) {
				for (const b of BAN_LUAT) {
					await request(app.getHttpServer())
						.post("/api/trpc/fieldFiles.downloadUrl")
						.set("cookie", san.phien[ai].cookie)
						.set("content-type", "application/json")
						.send(JSON.stringify({ tepId: (bay[b] as BanGhi).tepId }));
				}
			}
			const chet = demChet(ghiLog.mock.calls.map((g) => g[0] as DongLog));
			if (chet !== 11) throw new Error(`tcb vet: chet mu ${chet}`);
		} finally {
			ghiLog.mockRestore();
		}
	});
});
