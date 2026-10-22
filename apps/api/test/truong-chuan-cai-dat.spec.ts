import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { db } from "@crm/db";
import { STANDARD_FIELD_KEYS } from "@crm/db/fields-chuan";
import {
	type BoTriTruong,
	parseBoTriTruong,
} from "@crm/validation/bo-tri-truong";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { companyDetailOutput } from "../src/companies/companies.contracts";
import { createApp } from "../src/create-app";
import { dealDetailOutput } from "../src/deals/deals.contracts";
import {
	fieldListOutput,
	serializedFieldOutput,
} from "../src/fields/fields.contracts";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const TIEN_TO = "tcc";

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
type TraLoi = { status: number; data: unknown; ma: string };
type Entity = "DEAL" | "COMPANY" | "CONTACT";

let app: INestApplication;
const cookie = { quanTri: "", thuong: "" };
let chuId = "";
const daGieo = { nguoi: [] as string[], phien: [] as string[] };
const daTao = { congTy: [] as string[], thoaThuan: [] as string[] };

async function goi(
	thuTuc: string,
	dauVao: DauVao,
	ai: keyof typeof cookie = "quanTri",
): Promise<TraLoi> {
	const res = await request(app.getHttpServer())
		.post(`/api/trpc/${thuTuc}`)
		.set("cookie", cookie[ai])
		.set("content-type", "application/json")
		.send(JSON.stringify(dauVao));
	return {
		status: res.status,
		data: res.body?.result?.data,
		ma: String(res.body?.error?.data?.code ?? ""),
	};
}

async function doc(
	thuTuc: string,
	dauVao: DauVao,
	ai: keyof typeof cookie = "quanTri",
): Promise<TraLoi> {
	const res = await request(app.getHttpServer())
		.get(
			`/api/trpc/${thuTuc}?input=${encodeURIComponent(JSON.stringify(dauVao))}`,
		)
		.set("cookie", cookie[ai]);
	return {
		status: res.status,
		data: res.body?.result?.data,
		ma: String(res.body?.error?.data?.code ?? ""),
	};
}

function ok(tra: TraLoi, nhan: string): unknown {
	if (tra.status !== 200)
		throw new Error(`${nhan}: HTTP ${tra.status} ${tra.ma}`);
	return tra.data;
}

async function boTri(entity: Entity): Promise<BoTriTruong> {
	return parseBoTriTruong(
		ok(await doc("fields.layout", { entity }), `doc bo tri ${entity}`),
	);
}

const ten = (muc: BoTriTruong[number]) => muc.key;

function sapLaiTu(dsMuc: BoTriTruong): DauVao[] {
	return dsMuc.map(
		(muc): DauVao =>
			muc.kind === "standard" ? { standard: muc.key } : { custom: muc.id },
	);
}

async function taoTruong(
	entity: Entity,
	nhan: string,
	them: DauVao = {},
): Promise<{ id: string; key: string }> {
	return serializedFieldOutput.parse(
		ok(
			await goi("fields.create", {
				entity,
				label: ma(nhan),
				type: "TEXT",
				agentFilled: false,
				...them,
			}),
			`tao truong ${nhan}`,
		),
	);
}

async function docTruong(entity: Entity, id: string) {
	const ds = fieldListOutput.parse(
		ok(await doc("fields.list", { entity }), "doc truong"),
	);
	const truong = ds.find((f) => f.id === id);
	if (!truong) throw new Error(`khong thay truong ${id}`);
	return truong;
}

async function taoCongTy(them: DauVao = {}): Promise<string> {
	const congTy = ok(
		await goi("companies.create", { name: ma("Cong ty"), ...them }),
		"tao cong ty",
	) as { id: string };
	daTao.congTy.push(congTy.id);
	return congTy.id;
}

async function taoThoaThuan(): Promise<string> {
	const companyId = await taoCongTy();
	const thoaThuan = ok(
		await goi("deals.create", {
			name: ma("Thoa thuan"),
			companyId,
			ownerId: chuId,
		}),
		"tao thoa thuan",
	) as { id: string };
	daTao.thoaThuan.push(thoaThuan.id);
	return thoaThuan.id;
}

async function xoaBoTri() {
	await db.standardFieldLayout.deleteMany({});
}

beforeAll(async () => {
	app = await createApp();

	chuId = ma("chu");
	await gieoThanhVien(chuId, "owner");
	const phien = await mintPhien(chuId);
	cookie.quanTri = phien.cookie;
	daGieo.nguoi.push(chuId);
	daGieo.phien.push(phien.token);

	const thuongId = ma("thuong");
	await gieoThanhVien(thuongId, "member");
	const phienThuong = await mintPhien(thuongId);
	cookie.thuong = phienThuong.cookie;
	daGieo.nguoi.push(thuongId);
	daGieo.phien.push(phienThuong.token);

	await xoaBoTri();
});

afterAll(async () => {
	await app.close();
	await xoaBoTri();
	await db.fieldValue.deleteMany({
		where: { dealId: { in: daTao.thoaThuan } },
	});
	await db.agentTask.deleteMany({
		where: {
			OR: [
				{ dealId: { in: daTao.thoaThuan } },
				{ companyId: { in: daTao.congTy } },
				{ kind: "field-backfill", reason: { contains: `${TIEN_TO}-` } },
			],
		},
	});
	await db.deal.deleteMany({ where: { id: { in: daTao.thoaThuan } } });
	await db.company.deleteMany({ where: { id: { in: daTao.congTy } } });
	await db.fieldDefinition.deleteMany({
		where: { label: { startsWith: `${TIEN_TO}-` } },
	});
	await db.session.deleteMany({ where: { token: { in: daGieo.phien } } });
	await db.member.deleteMany({ where: { userId: { in: daGieo.nguoi } } });
	await db.user.deleteMany({ where: { id: { in: daGieo.nguoi } } });
});

describe("tcc-api-mac-dinh", () => {
	test("chua sap lan nao: chuan theo danh muc roi tu tao; truong moi dung cuoi", async () => {
		await xoaBoTri();
		const soThich = await taoTruong("CONTACT", "So thich");
		const kenh = await taoTruong("CONTACT", "Kenh ua dung");
		const cuaMinh = new Set([soThich.key, kenh.key]);
		const dapAn = [
			"firstName",
			"lastName",
			"title",
			"email",
			"phone",
			"linkedin",
			"x",
			"github",
			"company",
			"owner",
		];
		if (JSON.stringify(dapAn) !== JSON.stringify(STANDARD_FIELD_KEYS.CONTACT)) {
			throw new Error("tcc api mac dinh: dap an lech danh muc");
		}

		const truoc = await boTri("CONTACT");
		const thuTu = truoc
			.filter((m) => m.kind === "standard" || cuaMinh.has(m.key))
			.map(ten);
		const chuanXong = truoc.findIndex((m) => m.kind === "custom");
		if (
			JSON.stringify(thuTu) !==
				JSON.stringify([...dapAn, soThich.key, kenh.key]) ||
			(chuanXong !== -1 && chuanXong < dapAn.length)
		) {
			throw new Error(`tcc api mac dinh: thu tu ${JSON.stringify(thuTu)}`);
		}
		for (const m of truoc) {
			if (m.kind === "standard" && m.hidden)
				throw new Error(`tcc api mac dinh: an ${m.key}`);
		}

		const dua = [
			truoc.find((m) => m.key === soThich.key),
			...truoc.filter((m) => m.key !== soThich.key),
		].filter((m): m is BoTriTruong[number] => m !== undefined);
		ok(
			await goi("fields.reorder", {
				entity: "CONTACT",
				items: sapLaiTu(dua),
			}),
			"sap so thich len dau",
		);
		const ghiChu = await taoTruong("CONTACT", "Ghi chu rieng");
		const sau = await boTri("CONTACT");
		if (sau.at(-1)?.key !== ghiChu.key) {
			throw new Error(
				`tcc api mac dinh: truong moi khong cuoi ${JSON.stringify(sau.map(ten))}`,
			);
		}
		expect(sau[0]?.key).toBe(soThich.key);
	});
});

describe("tcc-api-sap-lai", () => {
	test("danh sach tron luu dung; thieu, lap, thua bi tu choi", async () => {
		await xoaBoTri();
		const hang = await taoTruong("DEAL", "Hang doi tac");
		const truoc = await boTri("DEAL");
		const khongHang = truoc.filter((m) => m.key !== hang.key);
		const viTri = khongHang.findIndex((m) => m.key === "expectedCloseDate");
		const muc = truoc.find((m) => m.key === hang.key);
		if (!muc) throw new Error("thieu muc hang doi tac");
		const moi = [...khongHang.slice(0, viTri), muc, ...khongHang.slice(viTri)];
		ok(
			await goi("fields.reorder", { entity: "DEAL", items: sapLaiTu(moi) }),
			"sap lai",
		);
		const docLai = await boTri("DEAL");
		const chiSo = docLai.findIndex((m) => m.key === hang.key);
		if (docLai[chiSo + 1]?.key !== "expectedCloseDate") {
			throw new Error(
				`tcc api sap lai: doc lai ${JSON.stringify(docLai.map(ten))}`,
			);
		}
		const daLuu = JSON.stringify(docLai.map(ten));

		const goc = sapLaiTu(moi);
		const ca: [string, DauVao[]][] = [
			["thieu", goc.filter((m) => m.standard !== "owner")],
			["lap", [...goc, { standard: "name" }]],
			["thua", [...goc, { standard: "stage" }]],
		];
		let daChay = 0;
		for (const [nhan, items] of ca) {
			const tra = await goi("fields.reorder", { entity: "DEAL", items });
			if (tra.status === 200 || tra.ma !== "BAD_REQUEST") {
				throw new Error(`tcc api sap lai: lot ${nhan}`);
			}
			const lai = JSON.stringify((await boTri("DEAL")).map(ten));
			if (lai !== daLuu) throw new Error(`tcc api sap lai: doi thu tu ${nhan}`);
			daChay += 1;
		}
		if (daChay !== 3) throw new Error(`tcc api sap lai: thieu ca ${daChay}`);
		expect(daChay).toBe(3);
	});
});

describe("tcc-api-reorder-cu", () => {
	test("hinh dang cu {entity, ids} chi doi cho truong tu tao", async () => {
		await xoaBoTri();
		const a = await taoTruong("DEAL", "Cu a");
		const b = await taoTruong("DEAL", "Cu b");
		const truoc = await boTri("DEAL");
		const chuanTruoc = truoc
			.map((m, i) => (m.kind === "standard" ? `${i}:${m.key}` : ""))
			.filter(Boolean);
		ok(
			await goi("fields.reorder", { entity: "DEAL", ids: [b.id, a.id] }),
			"sap cu",
		);
		const sau = await boTri("DEAL");
		const chuanSau = sau
			.map((m, i) => (m.kind === "standard" ? `${i}:${m.key}` : ""))
			.filter(Boolean);
		if (JSON.stringify(chuanSau) !== JSON.stringify(chuanTruoc)) {
			throw new Error("tcc api reorder cu: chuan xe dich");
		}
		const iA = sau.findIndex((m) => m.key === a.key);
		const iB = sau.findIndex((m) => m.key === b.key);
		if (!(iB < iA)) throw new Error("tcc api reorder cu: khong doi cho");

		const rest = await request(app.getHttpServer())
			.post(`${REST_BRIDGE_PATH}/fields/reorder`)
			.set("cookie", cookie.quanTri)
			.set("content-type", "application/json")
			.send(JSON.stringify({ entity: "DEAL", ids: [a.id, b.id] }));
		if (rest.status !== 200)
			throw new Error(`tcc api reorder cu: rest ${rest.status}`);
		const quaRest = await boTri("DEAL");
		if (
			!(
				quaRest.findIndex((m) => m.key === a.key) <
				quaRest.findIndex((m) => m.key === b.key)
			)
		)
			throw new Error("tcc api reorder cu: rest khong doi cho");
		const tai = await request(app.getHttpServer()).get("/openapi.json");
		const duong = Object.keys(tai.body?.paths ?? {});
		for (const can of [
			"/fields/reorder",
			"/fields/{entity}/layout",
			"/fields/{entity}/standard/{key}/hidden",
		])
			if (!duong.includes(can))
				throw new Error(`tcc api reorder cu: openapi thieu ${can}`);
		expect(iB).toBeLessThan(iA);
	});
});

describe("tcc-api-an", () => {
	test("an truong chuan giu gia tri; hien lai dung cho cu", async () => {
		await xoaBoTri();
		const id = await taoCongTy();
		ok(
			await goi("companies.update", { id, data: { city: "Đà Nẵng" } }),
			"dat city",
		);
		const truoc = await boTri("COMPANY");
		const cho = truoc.findIndex((m) => m.key === "city");

		ok(
			await goi("fields.setStandardHidden", {
				entity: "COMPANY",
				key: "city",
				hidden: true,
			}),
			"an city",
		);
		const congTy = companyDetailOutput.parse(
			ok(await doc("companies.byId", { id }), "doc cong ty"),
		);
		if (congTy.city !== "Đà Nẵng")
			throw new Error(`tcc api an: mat gia tri ${congTy.city}`);
		const daAn = (await boTri("COMPANY")).find((m) => m.key === "city");
		if (daAn?.kind !== "standard" || !daAn.hidden)
			throw new Error("tcc api an: khong an");

		ok(
			await goi("fields.setStandardHidden", {
				entity: "COMPANY",
				key: "city",
				hidden: false,
			}),
			"hien city",
		);
		const sau = (await boTri("COMPANY")).findIndex((m) => m.key === "city");
		if (sau !== cho) throw new Error(`tcc api an: doi cho ${cho} ${sau}`);
		expect(sau).toBe(cho);
	});
});

const CAP_BAT_BUOC: [Entity, string][] = [
	["DEAL", "name"],
	["DEAL", "currency"],
	["DEAL", "company"],
	["DEAL", "owner"],
	["COMPANY", "name"],
	["CONTACT", "firstName"],
];

function cotCua(key: string): string {
	if (key === "company") return "companyId";
	if (key === "owner") return "ownerId";
	return key;
}

const MO_HINH = {
	DEAL: "Deal",
	COMPANY: "Company",
	CONTACT: "Contact",
} as const satisfies Record<Entity, string>;

function cotKhongNull(moHinh: string): Set<string> {
	const schema = readFileSync(
		join(import.meta.dir, "..", "..", "..", "packages/db/prisma/schema.prisma"),
		"utf8",
	);
	const khoi = schema.match(
		new RegExp(`model ${moHinh} \\{([\\s\\S]*?)\\n\\}`),
	);
	if (!khoi?.[1]) throw new Error(`khong doc duoc model ${moHinh}`);
	const cot = new Set<string>();
	for (const dong of khoi[1].split("\n")) {
		const m = dong.trim().match(/^(\w+)\s+(\w+)(\??)(\[\])?/);
		if (m?.[1] && m[3] !== "?" && !m[4]) cot.add(m[1]);
	}
	return cot;
}

describe("tcc-api-chuan-bat-buoc", () => {
	test("truong chuan bat buoc khong an duoc", async () => {
		await xoaBoTri();
		let soCa = 0;
		for (const [entity, key] of CAP_BAT_BUOC) {
			const tra = await goi("fields.setStandardHidden", {
				entity,
				key,
				hidden: true,
			});
			if (tra.status === 200 || tra.ma !== "BAD_REQUEST")
				throw new Error(`tcc api chuan bat buoc: lot ${entity} ${key}`);
			const muc = (await boTri(entity)).find((m) => m.key === key);
			if (muc?.kind === "standard" && muc.hidden)
				throw new Error(`tcc api chuan bat buoc: da an ${entity} ${key}`);
			soCa += 1;
		}
		if (soCa !== 6) throw new Error(`tcc api chuan bat buoc: thieu ${soCa}`);

		const doiChung = await goi("fields.setStandardHidden", {
			entity: "COMPANY",
			key: "city",
			hidden: true,
		});
		if (doiChung.status !== 200)
			throw new Error("tcc api chuan bat buoc: doi chung");

		for (const entity of ["DEAL", "COMPANY", "CONTACT"] as const) {
			const cot = cotKhongNull(MO_HINH[entity]);
			const batBuoc = new Set(
				CAP_BAT_BUOC.filter(([e]) => e === entity).map(([, k]) => k),
			);
			for (const key of STANDARD_FIELD_KEYS[entity]) {
				const khongNull = cot.has(cotCua(key));
				if (khongNull !== batBuoc.has(key))
					throw new Error(`tcc api chuan bat buoc: lech mo hinh ${key}`);
			}
		}
		expect(soCa).toBe(6);
	});
});

describe("tcc-api-bat-buoc-luu", () => {
	test("bat buoc chan de trong; tat thi de trong duoc", async () => {
		const truong = await taoTruong("DEAL", "Ma ho so", { required: true });
		if (!(await docTruong("DEAL", truong.id)).required)
			throw new Error("tcc api bat buoc: doc lai false");
		const id = await taoThoaThuan();
		ok(
			await goi("deals.update", {
				id,
				data: { fields: { [truong.key]: "HS-1" } },
			}),
			"luu HS-1",
		);
		const trong = await goi("deals.update", {
			id,
			data: { fields: { [truong.key]: null } },
		});
		if (trong.status === 200 || trong.ma !== "BAD_REQUEST")
			throw new Error("tcc api bat buoc: de trong lot");
		const ban = dealDetailOutput.parse(
			ok(await doc("deals.byId", { id }), "doc thoa thuan"),
		);
		if (ban.fields.find((f) => f.key === truong.key)?.value !== "HS-1")
			throw new Error("tcc api bat buoc: mat gia tri");

		ok(
			await goi("fields.update", {
				id: truong.id,
				data: { required: false },
			}),
			"tat bat buoc",
		);
		const tat = await goi("deals.update", {
			id,
			data: { fields: { [truong.key]: null } },
		});
		if (tat.status !== 200) throw new Error("tcc api bat buoc: tat khong an");
		expect(tat.status).toBe(200);
	});
});

describe("tcc-api-bat-buoc-hien", () => {
	test("bat buoc thi phai hien tren phieu", async () => {
		let soCa = 0;
		const ca1 = await goi("fields.create", {
			entity: "DEAL",
			label: ma("Bat buoc an"),
			type: "TEXT",
			agentFilled: false,
			required: true,
			showOnSheet: false,
		});
		if (ca1.status === 200 || ca1.ma !== "BAD_REQUEST")
			throw new Error("tcc api bat buoc hien: lot 1");
		soCa += 1;

		const hai = await taoTruong("DEAL", "Hai");
		const ca2 = await goi("fields.update", {
			id: hai.id,
			data: { required: true, showOnSheet: false },
		});
		if (ca2.status === 200 || ca2.ma !== "BAD_REQUEST")
			throw new Error("tcc api bat buoc hien: lot 2");
		const haiSau = await docTruong("DEAL", hai.id);
		if (haiSau.required || !haiSau.showOnSheet)
			throw new Error("tcc api bat buoc hien: doi gia tri 2");
		soCa += 1;

		const ba = await taoTruong("DEAL", "Ba", { showOnSheet: false });
		ok(
			await goi("fields.update", { id: ba.id, data: { required: true } }),
			"bat buoc ba",
		);
		const baSau = await docTruong("DEAL", ba.id);
		if (!baSau.required || !baSau.showOnSheet)
			throw new Error(
				`tcc api bat buoc hien: khong bat hien ${JSON.stringify({ required: baSau.required, showOnSheet: baSau.showOnSheet })}`,
			);
		soCa += 1;
		if (soCa !== 3) throw new Error(`tcc api bat buoc hien: thieu ${soCa}`);
		expect(soCa).toBe(3);
	});
});

describe("tcc-api-quyen", () => {
	test("nguoi thuong khong sap, khong an; van doc bo tri", async () => {
		await xoaBoTri();
		await taoTruong("DEAL", "Quyen");
		const truoc = await boTri("DEAL");
		const items = sapLaiTu([...truoc].reverse());
		const lenh: [string, DauVao][] = [
			["fields.reorder", { entity: "DEAL", items }],
			[
				"fields.setStandardHidden",
				{ entity: "COMPANY", key: "city", hidden: true },
			],
		];
		for (const [thuTuc, dauVao] of lenh) {
			const tra = await goi(thuTuc, dauVao, "thuong");
			if (tra.status === 200 || tra.ma !== "FORBIDDEN")
				throw new Error(`tcc api quyen: lot ${thuTuc}`);
		}
		if (JSON.stringify(await boTri("DEAL")) !== JSON.stringify(truoc))
			throw new Error("tcc api quyen: doi bo tri fields.reorder");

		const docThuong = await doc("fields.layout", { entity: "DEAL" }, "thuong");
		if (docThuong.status !== 200)
			throw new Error("tcc api quyen: khong doc duoc");

		for (const [thuTuc, dauVao] of lenh) {
			const tra = await goi(thuTuc, dauVao);
			if (tra.status !== 200)
				throw new Error(`tcc api quyen: doi chung ${thuTuc}`);
		}
		expect(docThuong.status).toBe(200);
	});
});
