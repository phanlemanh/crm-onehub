import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	test,
} from "bun:test";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { FIELD_TYPES } from "@crm/db/fields";
import { docLoiTruong, loiTruong } from "@crm/validation/loi-truong";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { z } from "zod";
import { createApp } from "../src/create-app";
import {
	fieldListOutput,
	serializedFieldOutput,
} from "../src/fields/fields.contracts";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const TIEN_TO = "ntl";
const NGAY_MAY_CHU_TRA = "2027-03-31T00:00:00.000Z";
const THU_MUC_FIXTURE = join(import.meta.dir, "../../app/test/fixtures");
const GHI_FIXTURE = process.env.GHI_FIXTURE_LOI_TAO === "1";

let dem = 0;
function ma(phan: string): string {
	dem += 1;
	return `${TIEN_TO}-${phan}-${Date.now().toString(36)}-${dem}`;
}

type GiaJson =
	| string
	| number
	| boolean
	| null
	| GiaJson[]
	| { [khoa: string]: GiaJson };
type DauVao = { [khoa: string]: GiaJson };
const loiTrpc = z
	.object({
		message: z.string(),
		code: z.number(),
		data: z.object({
			code: z.string(),
			httpStatus: z.number(),
			stack: z.string().optional(),
			path: z.string().optional(),
			truong: loiTruong.optional(),
		}),
	})
	.nullable()
	.catch(null);

type LoiTrpc = z.infer<typeof loiTrpc>;

type TraLoi = { status: number; data: unknown; ma: string; loi: LoiTrpc };
type Entity = "DEAL" | "COMPANY" | "CONTACT";
type Duong = "trpc" | "rest";

let app: INestApplication;
let cookie = "";
let khoaApi = "";
let chuId = "";
let congTyNen = "";
const daGieo = { nguoi: [] as string[], phien: [] as string[] };
const daTao = {
	congTy: [] as string[],
	thoaThuan: [] as string[],
	caNhan: [] as string[],
};

async function goi(thuTuc: string, dauVao: DauVao): Promise<TraLoi> {
	const res = await request(app.getHttpServer())
		.post(`/api/trpc/${thuTuc}`)
		.set("cookie", cookie)
		.set("content-type", "application/json")
		.send(JSON.stringify(dauVao));
	return {
		status: res.status,
		data: res.body?.result?.data,
		ma: String(res.body?.error?.data?.code ?? ""),
		loi: loiTrpc.parse(res.body?.error ?? null),
	};
}

async function doc(thuTuc: string, dauVao: DauVao): Promise<TraLoi> {
	const res = await request(app.getHttpServer())
		.get(
			`/api/trpc/${thuTuc}?input=${encodeURIComponent(JSON.stringify(dauVao))}`,
		)
		.set("cookie", cookie);
	return {
		status: res.status,
		data: res.body?.result?.data,
		ma: String(res.body?.error?.data?.code ?? ""),
		loi: loiTrpc.parse(res.body?.error ?? null),
	};
}

async function quaRest(duongDan: string, dauVao: DauVao): Promise<TraLoi> {
	const res = await request(app.getHttpServer())
		.post(`${REST_BRIDGE_PATH}/${duongDan}`)
		.set("x-api-key", khoaApi)
		.set("content-type", "application/json")
		.send(JSON.stringify(dauVao));
	return {
		status: res.status,
		data: res.body?.result?.data ?? res.body,
		ma: res.status === 400 ? "BAD_REQUEST" : String(res.status),
		loi: loiTrpc.parse(null),
	};
}

function ok(tra: TraLoi, nhan: string): unknown {
	if (tra.status !== 200)
		throw new Error(`${nhan}: HTTP ${tra.status} ${tra.ma}`);
	return tra.data;
}

const THU_TUC_TAO = {
	DEAL: "deals",
	COMPANY: "companies",
	CONTACT: "contacts",
} as const satisfies Record<Entity, string>;

const DEM_BAN_GHI = {
	DEAL: () => db.deal.count(),
	COMPANY: () => db.company.count(),
	CONTACT: () => db.contact.count(),
} as const satisfies Record<Entity, () => Promise<number>>;

async function taoTruong(
	entity: Entity,
	nhan: string,
	type: (typeof FIELD_TYPES)[number],
	them: DauVao = {},
) {
	return serializedFieldOutput.parse(
		ok(
			await goi("fields.create", {
				entity,
				label: ma(nhan),
				type,
				agentFilled: false,
				...them,
			}),
			`tao truong ${nhan}`,
		),
	);
}

async function goTruong(id: string) {
	await db.fieldValue.deleteMany({ where: { fieldId: id } });
	await db.fieldOption.deleteMany({ where: { fieldId: id } });
	await db.fieldDefinition.deleteMany({ where: { id } });
}

async function dauVaoTao(entity: Entity): Promise<DauVao> {
	if (entity === "DEAL")
		return {
			name: ma("Thoa thuan"),
			companyId: congTyNen,
			ownerId: chuId,
		};
	if (entity === "COMPANY") return { name: ma("Cong ty") };
	return { firstName: ma("Ca nhan") };
}

function ghiNhanTao(entity: Entity, id: string) {
	if (entity === "DEAL") daTao.thoaThuan.push(id);
	if (entity === "COMPANY") daTao.congTy.push(id);
	if (entity === "CONTACT") daTao.caNhan.push(id);
}

async function tao(
	entity: Entity,
	them: DauVao,
	duong: Duong = "trpc",
): Promise<TraLoi> {
	const dauVao = { ...(await dauVaoTao(entity)), ...them };
	const tra =
		duong === "trpc"
			? await goi(`${THU_TUC_TAO[entity]}.create`, dauVao)
			: await quaRest(THU_TUC_TAO[entity], dauVao);
	const id = (tra.data as { id?: string } | undefined)?.id;
	if (tra.status === 200 && id) ghiNhanTao(entity, id);
	return tra;
}

type GiaTriDoc = { key: string; value: unknown };

async function giaTriCua(entity: Entity, id: string): Promise<GiaTriDoc[]> {
	const banGhi = ok(
		await doc(`${THU_TUC_TAO[entity]}.byId`, { id }),
		`doc ${entity}`,
	) as { fields: GiaTriDoc[] };
	return banGhi.fields;
}

function loiDocDuoc(tra: TraLoi) {
	return tra.loi?.data.truong ?? null;
}

type ThayThe = [string, string][];

function chuanHoaLoi(loi: LoiTrpc, thay: ThayThe): string {
	const ban = loi ? { ...loi, data: { ...loi.data, stack: undefined } } : null;
	let chuoi = JSON.stringify(ban, null, "\t");
	for (const [cu, moi] of thay) chuoi = chuoi.replaceAll(cu, moi);
	return `${chuoi}\n`;
}

function ghiHaySo(tep: string, loi: LoiTrpc, thay: ThayThe, nhanLoi: string) {
	const duong = join(THU_MUC_FIXTURE, tep);
	const noiDung = chuanHoaLoi(loi, thay);
	if (GHI_FIXTURE) {
		writeFileSync(duong, noiDung);
		return;
	}
	if (readFileSync(duong, "utf8") !== noiDung) throw new Error(nhanLoi);
}

async function choHangCho(id: string, cot: "companyId") {
	for (let lan = 0; lan < 40; lan += 1) {
		const task = await db.agentTask.findFirst({
			where: { kind: "field-backfill", [cot]: id },
			select: { payload: true },
		});
		if (task) return (task.payload as { keys?: string[] }).keys ?? [];
		await Bun.sleep(50);
	}
	return [];
}

beforeAll(async () => {
	app = await createApp();
	chuId = ma("chu");
	await gieoThanhVien(chuId, "owner");
	const phien = await mintPhien(chuId);
	cookie = phien.cookie;
	daGieo.nguoi.push(chuId);
	daGieo.phien.push(phien.token);
	const nen = ok(
		await goi("companies.create", { name: ma("Cong ty nen") }),
		"tao cong ty nen",
	) as { id: string };
	congTyNen = nen.id;
	daTao.congTy.push(nen.id);
	khoaApi = String(
		(
			ok(
				await goi("apiKeys.create", { name: ma("khoa"), expiresInDays: null }),
				"tao khoa api",
			) as {
				key: string;
			}
		).key,
	);
});

async function goTruongBatBuoc() {
	const con = await db.fieldDefinition.findMany({
		where: { label: { startsWith: `${TIEN_TO}-` }, required: true },
		select: { id: true },
	});
	for (const { id } of con) await goTruong(id);
}

afterEach(goTruongBatBuoc);

afterAll(async () => {
	await app.close();
	const truong = await db.fieldDefinition.findMany({
		where: { label: { startsWith: `${TIEN_TO}-` } },
		select: { id: true },
	});
	for (const { id } of truong) await goTruong(id);
	await db.agentTask.deleteMany({
		where: {
			OR: [
				{ dealId: { in: daTao.thoaThuan } },
				{ companyId: { in: daTao.congTy } },
				{ contactId: { in: daTao.caNhan } },
			],
		},
	});
	await db.contact.deleteMany({ where: { id: { in: daTao.caNhan } } });
	await db.deal.deleteMany({ where: { id: { in: daTao.thoaThuan } } });
	await db.company.deleteMany({ where: { id: { in: daTao.congTy } } });
	await db.apikey.deleteMany({ where: { referenceId: { in: daGieo.nguoi } } });
	await db.session.deleteMany({ where: { token: { in: daGieo.phien } } });
	await db.member.deleteMany({ where: { userId: { in: daGieo.nguoi } } });
	await db.user.deleteMany({ where: { id: { in: daGieo.nguoi } } });
});

describe("ntl-api-tao-co-truong", () => {
	test("muoi kieu luu cung luot tao, doc lai dung", async () => {
		const maTran: {
			kieu: (typeof FIELD_TYPES)[number];
			gui: (t: { options: { id: string }[] }) => GiaJson;
		}[] = [
			{ kieu: "TEXT", gui: () => "HS-1" },
			{ kieu: "LONG_TEXT", gui: () => "Dong mot\nDong hai" },
			{ kieu: "NUMBER", gui: () => 1234.5 },
			{ kieu: "DATE", gui: () => "2027-03-31" },
			{ kieu: "CHECKBOX", gui: () => true },
			{ kieu: "SELECT", gui: (t) => t.options[1]?.id ?? "" },
			{ kieu: "URL", gui: () => "onehub.vn" },
			{ kieu: "EMAIL", gui: () => "an@onehub.vn" },
			{ kieu: "PHONE", gui: () => "0901234567" },
			{ kieu: "USER", gui: () => chuId },
		];
		if (maTran.length !== FIELD_TYPES.length)
			throw new Error(`ntl api tao co truong: thieu kieu ${maTran.length}`);

		const fields: DauVao = {};
		const theoKieu = new Map<string, string>();
		for (const dong of maTran) {
			const truong = await taoTruong(
				"DEAL",
				dong.kieu,
				dong.kieu,
				dong.kieu === "SELECT"
					? { options: [{ label: "Vang" }, { label: "Bac" }] }
					: {},
			);
			fields[truong.key] = dong.gui(truong);
			theoKieu.set(dong.kieu, truong.key);
		}

		const tra = await tao("DEAL", { fields });
		const id = (ok(tra, "tao thoa thuan co truong") as { id: string }).id;
		const doc = await giaTriCua("DEAL", id);
		let daSo = 0;
		for (const dong of maTran) {
			const khoa = theoKieu.get(dong.kieu) ?? "";
			const gia = doc.find((f) => f.key === khoa)?.value;
			const gui = fields[khoa];
			const khop =
				dong.kieu === "NUMBER"
					? Number(gia) === gui
					: dong.kieu === "DATE"
						? String(gia).slice(0, 10) === gui
						: gia === gui;
			if (!khop)
				throw new Error(
					`ntl api tao co truong: doc lai ${dong.kieu} ${JSON.stringify(gia)}`,
				);
			if (dong.kieu === "DATE" && gia !== NGAY_MAY_CHU_TRA)
				throw new Error(
					`ntl api tao co truong: dang ngay ${JSON.stringify(gia)}`,
				);
			daSo += 1;
		}
		if (daSo !== 10)
			throw new Error(`ntl api tao co truong: thieu kieu ${daSo}`);
		const soHang = await db.fieldValue.count({ where: { dealId: id } });
		if (soHang !== 10)
			throw new Error(`ntl api tao co truong: so hang ${soHang}`);

		const chuCongTy = await taoTruong("COMPANY", "Nganh", "TEXT");
		const idCongTy = (
			ok(
				await tao("COMPANY", { fields: { [chuCongTy.key]: "Ngan hang" } }),
				"tao cong ty co truong",
			) as { id: string }
		).id;
		const docCongTy = await giaTriCua("COMPANY", idCongTy);
		if (docCongTy.find((f) => f.key === chuCongTy.key)?.value !== "Ngan hang")
			throw new Error(
				`ntl api tao co truong: COMPANY ${JSON.stringify(docCongTy)}`,
			);

		const chonCaNhan = await taoTruong("CONTACT", "Kenh", "SELECT", {
			options: [{ label: "Zalo" }, { label: "Email" }],
		});
		const luaChon = chonCaNhan.options[0]?.id ?? "";
		const idCaNhan = (
			ok(
				await tao("CONTACT", { fields: { [chonCaNhan.key]: luaChon } }),
				"tao ca nhan co truong",
			) as { id: string }
		).id;
		const docCaNhan = await giaTriCua("CONTACT", idCaNhan);
		if (docCaNhan.find((f) => f.key === chonCaNhan.key)?.value !== luaChon)
			throw new Error(
				`ntl api tao co truong: CONTACT ${JSON.stringify(docCaNhan)}`,
			);

		const doiChung = (
			ok(await tao("DEAL", {}), "doi chung khong truong") as { id: string }
		).id;
		const soDoiChung = await db.fieldValue.count({
			where: { dealId: doiChung },
		});
		if (soDoiChung !== 0)
			throw new Error(`ntl api tao co truong: doi chung ${soDoiChung}`);
		expect(daSo).toBe(10);
	});
});

describe("ntl-api-bat-buoc", () => {
	test("thieu truong bat buoc bi chan o tRPC va REST, khong ban ghi nao", async () => {
		const loai: Entity[] = ["DEAL", "COMPANY", "CONTACT"];
		const batBuoc = new Map<Entity, string>();
		const nhanBatBuoc = new Map<Entity, string>();
		const luuTru: string[] = [];
		for (const entity of loai) {
			const truong = await taoTruong(entity, "Ma ho so", "TEXT", {
				required: true,
				agentFilled: true,
			});
			if (!truong.required || !truong.agentFilled)
				throw new Error("ntl api bat buoc: fixture khong kara dien");
			batBuoc.set(entity, truong.key);
			nhanBatBuoc.set(entity, truong.label);
			const cu = await taoTruong(entity, "Cu bat buoc", "TEXT", {
				required: true,
			});
			ok(await goi("fields.archive", { id: cu.id }), "luu tru cu bat buoc");
			luuTru.push(cu.id);
		}

		let soCa = 0;
		for (const entity of loai) {
			const khoa = batBuoc.get(entity) ?? "";
			for (const duong of ["trpc", "rest"] as const) {
				for (const cach of ["khong-khoa", "rong"] as const) {
					const truoc = await DEM_BAN_GHI[entity]();
					const tra = await tao(
						entity,
						cach === "rong" ? { fields: { [khoa]: null } } : {},
						duong,
					);
					if (tra.status !== 400)
						throw new Error(`ntl api bat buoc: lot ${entity} ${duong} ${cach}`);
					const sau = await DEM_BAN_GHI[entity]();
					if (sau !== truoc)
						throw new Error(
							`ntl api bat buoc: con ban ghi ${entity} ${duong} ${cach}`,
						);
					if (entity === "DEAL" && duong === "trpc" && cach === "khong-khoa")
						ghiHaySo(
							"loi-tao-thieu-bat-buoc.json",
							tra.loi,
							[
								[nhanBatBuoc.get(entity) ?? "", "Mã hồ sơ"],
								[khoa, "ma_ho_so"],
							],
							"ntl api bat buoc: fixture loi cu",
						);
					soCa += 1;
				}
				const du = await tao(entity, { fields: { [khoa]: "HS-1" } }, duong);
				if (du.status !== 200)
					throw new Error(
						`ntl api bat buoc: doi chung ${entity} ${duong} ${du.status}`,
					);
				if (du.status === 200) {
					const conLuuTru = await tao(
						entity,
						{ fields: { [khoa]: "HS-2" } },
						duong,
					);
					if (conLuuTru.status !== 200)
						throw new Error(
							`ntl api bat buoc: chan truong luu tru ${entity} ${duong}`,
						);
				}
			}
		}
		if (soCa !== 12) throw new Error(`ntl api bat buoc: thieu ca ${soCa}`);

		const nda = await taoTruong("DEAL", "NDA", "CHECKBOX", { required: true });
		const ndaVang = await tao("DEAL", {
			fields: { [batBuoc.get("DEAL") ?? ""]: "HS-3" },
		});
		if (ndaVang.status !== 400)
			throw new Error("ntl api bat buoc: o tich vang khoa");
		const ndaTich = await tao("DEAL", {
			fields: { [batBuoc.get("DEAL") ?? ""]: "HS-3", [nda.key]: true },
		});
		if (ndaTich.status !== 200)
			throw new Error("ntl api bat buoc: o tich tich");

		expect(soCa).toBe(12);
	});
});

describe("ntl-api-tu-choi", () => {
	test("gia tri sai: ca giao dich lui, loi noi khoa", async () => {
		const hang = await taoTruong("DEAL", "Hang doi tac", "SELECT", {
			options: [{ label: "Vang" }, { label: "Bac" }],
		});
		const [vang, bac] = hang.options;
		ok(
			await goi("fields.update", {
				id: hang.id,
				data: { options: [{ id: vang?.id ?? "", label: vang?.label ?? "" }] },
			}),
			"luu tru lua chon Bac",
		);
		const so = await taoTruong("DEAL", "So luong", "NUMBER");
		const nguoi = await taoTruong("DEAL", "Nguoi gioi thieu", "USER");
		const chu = await taoTruong("DEAL", "Ghi chu", "TEXT");

		const ca: { ten: string; khoa: string; gia: GiaJson }[] = [
			{ ten: "1", khoa: hang.key, gia: bac?.id ?? "" },
			{ ten: "2", khoa: so.key, gia: "abc" },
			{ ten: "3", khoa: nguoi.key, gia: "khong-co-nguoi-nay" },
		];
		let soCa = 0;
		for (const motCa of ca) {
			const truocDeal = await db.deal.count();
			const truocGiaTri = await db.fieldValue.count();
			const tra = await tao("DEAL", {
				fields: { [chu.key]: "hop le", [motCa.khoa]: motCa.gia },
			});
			if (tra.status !== 400 || tra.ma !== "BAD_REQUEST")
				throw new Error(`ntl api tu choi: lot ${motCa.ten}`);
			if ((await db.deal.count()) !== truocDeal)
				throw new Error(`ntl api tu choi: con deal ${motCa.ten}`);
			if ((await db.fieldValue.count()) !== truocGiaTri)
				throw new Error(`ntl api tu choi: con gia tri ${motCa.ten}`);
			const loi = loiDocDuoc(tra);
			if (loi?.khoa !== motCa.khoa)
				throw new Error(
					`ntl api tu choi: khong noi khoa ${motCa.ten} ${JSON.stringify(tra.loi)}`,
				);
			if (motCa.ten === "1")
				ghiHaySo(
					"loi-tao-lua-chon.json",
					tra.loi,
					[
						[hang.label, "Hạng đối tác"],
						[hang.key, "hang_doi_tac"],
						[bac?.id ?? "", "lc-bac"],
					],
					"ntl api tu choi: fixture loi cu",
				);
			soCa += 1;
		}
		if (soCa !== 3) throw new Error(`ntl api tu choi: thieu ${soCa}`);

		const thuocMu = docLoiTruong({ message: `sai ${hang.key}` });
		if (thuocMu !== null) throw new Error("ntl api tu choi: thuoc mu");

		const dung = await tao("DEAL", { fields: { [hang.key]: vang?.id ?? "" } });
		if (dung.status !== 200) throw new Error("ntl api tu choi: doi chung");
		expect(soCa).toBe(3);
	});
});

describe("ntl-api-kara-dien", () => {
	test("Kara chi dien truong con trong", async () => {
		const nganh = await taoTruong("COMPANY", "Nganh kd", "TEXT", {
			agentFilled: true,
		});
		const quyMo = await taoTruong("COMPANY", "Quy mo", "TEXT", {
			agentFilled: true,
		});
		const daKy = await taoTruong("COMPANY", "Da ky", "CHECKBOX", {
			agentFilled: true,
		});

		const id = (
			ok(
				await tao("COMPANY", { fields: { [nganh.key]: "Ngân hàng" } }),
				"tao cong ty co nganh",
			) as { id: string }
		).id;
		const khoa = await choHangCho(id, "companyId");
		if (!khoa.includes(quyMo.key))
			throw new Error("ntl api kara dien: thieu quy_mo");
		if (khoa.includes(nganh.key))
			throw new Error("ntl api kara dien: xep nganh");
		if (!khoa.includes(daKy.key))
			throw new Error("ntl api kara dien: o tich khong xep");
		const doc = await giaTriCua("COMPANY", id);
		if (doc.find((f) => f.key === nganh.key)?.value !== "Ngân hàng")
			throw new Error("ntl api kara dien: doi gia tri");

		const doiChung = (
			ok(await tao("COMPANY", {}), "tao cong ty trong") as { id: string }
		).id;
		const khoaDoiChung = await choHangCho(doiChung, "companyId");
		if (!khoaDoiChung.includes(nganh.key) || !khoaDoiChung.includes(quyMo.key))
			throw new Error(
				`ntl api kara dien: doi chung ${JSON.stringify(khoaDoiChung)}`,
			);
		for (const t of [nganh, quyMo, daKy]) await goTruong(t.id);
		expect(khoa).not.toContain(nganh.key);
	});
});

describe("ntl-api-ban-ghi-cu", () => {
	test("ban ghi cu trong truong vua bat buoc van sua duoc", async () => {
		const maHoSo = await taoTruong("DEAL", "Ma ho so cu", "TEXT");
		const cu = (
			ok(await tao("DEAL", {}), "tao thoa thuan cu") as { id: string }
		).id;
		const coGiaTri = (
			ok(
				await tao("DEAL", { fields: { [maHoSo.key]: "HS-1" } }),
				"tao thoa thuan co ma",
			) as { id: string }
		).id;
		ok(
			await goi("fields.update", {
				id: maHoSo.id,
				data: { required: true },
			}),
			"bat bat buoc",
		);

		const sua = await goi("deals.update", {
			id: cu,
			data: { name: "Tên mới" },
		});
		if (sua.status !== 200) throw new Error("ntl api ban ghi cu: chan sua");
		const banGhi = ok(
			await doc("deals.byId", { id: cu }),
			"doc ban ghi cu",
		) as {
			name: string;
		};
		if (banGhi.name !== "Tên mới")
			throw new Error("ntl api ban ghi cu: khong luu");

		const xoa = await goi("deals.update", {
			id: coGiaTri,
			data: { fields: { [maHoSo.key]: null } },
		});
		if (xoa.status !== 400 || xoa.ma !== "BAD_REQUEST")
			throw new Error("ntl api ban ghi cu: xoa trong lot");
		await goTruong(maHoSo.id);
		expect(sua.status).toBe(200);
	});
});

describe("ntl-api-danh-sach-truong", () => {
	test("fields.list doc duoc khong can quyen quan tri", async () => {
		const ds = fieldListOutput.parse(
			ok(await doc("fields.list", { entity: "DEAL" }), "doc danh sach"),
		);
		expect(Array.isArray(ds)).toBe(true);
	});
});
