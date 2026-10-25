import {
	afterAll,
	beforeAll,
	describe,
	expect,
	type Mock,
	spyOn,
	test,
} from "bun:test";
import type { AddressInfo } from "node:net";
import { join } from "node:path";
import {
	API_KEY_HEADER,
	auth,
	NOT_A_MEMBER,
	type WorkspaceRole,
} from "@crm/auth";
import { db } from "@crm/db";
import {
	maskKey,
	readAgentModel,
	readArchiveRetentionDays,
	readContextDevKey,
	writeAgentModel,
	writeArchiveRetentionDays,
	writeContextDevKey,
} from "@crm/db/settings";
import { markOnboarded, WORKSPACE_ID } from "@crm/db/workspace";
import { congNghienCuu } from "@crm/validation/cong-nghien-cuu";
import type { INestApplication } from "@nestjs/common";
import request from "supertest";
import { z } from "zod";
import { ResearchKeyService } from "../src/agent/research-key.service";
import { BackfillService } from "../src/backfill/backfill.service";
import { createApp } from "../src/create-app";
import { ModelCatalogService } from "../src/settings/model-catalog.service";
import { SETTINGS_CONFIG } from "../src/settings/settings-config";
import { REST_BRIDGE_PATH } from "../src/trpc/openapi";
import { gieoThanhVien, mintPhien } from "./phien-thu";

const TIEN_TO = "ccq";
const THU_MUC_APP = join(import.meta.dir, "..", "..", "app");
const THONG_DIEP_CAM = SETTINGS_CONFIG.messages.forbidden;

const MODEL_GOC = { id: "ccq/model-goc", contextWindowTokens: 1000 };
const MODEL_MOI = {
	id: "ccq/model-moi",
	name: "Model moi",
	provider: "ccq",
	contextWindowTokens: 2000,
	pricing: null,
};
const KHOA_TRUOC = "ccq-khoa-truoc-0001";
const KHOA_MOI = "ccq-khoa-moi-12345";
const NGAY_TRUOC = 30;
const NGAY_MOI = 42;

let dem = 0;
function ma(phan: string): string {
	dem += 1;
	return `${TIEN_TO}-${phan}-${Date.now().toString(36)}-${dem}`;
}

type Loi =
	| "owner"
	| "admin"
	| "member"
	| "okr"
	| "nonMember"
	| "memberKey"
	| "adminKey";
type Lop = "trpc" | "rest";
type TraLoi = { status: number; data: unknown; loi: string };

const dauXac = {
	owner: { header: "cookie", value: "" },
	admin: { header: "cookie", value: "" },
	member: { header: "cookie", value: "" },
	okr: { header: "cookie", value: "" },
	nonMember: { header: "cookie", value: "" },
	memberKey: { header: API_KEY_HEADER, value: "" },
	adminKey: { header: API_KEY_HEADER, value: "" },
} satisfies Record<Loi, { header: string; value: string }>;
const daGieo = { nguoi: [] as string[], phien: [] as string[] };

let app: INestApplication;
let demVerify: Mock<ResearchKeyService["verify"]>;
let demModels: Mock<ModelCatalogService["models"]>;
let demBackfill: Mock<BackfillService["run"]>;
type GiaTriGoc = {
	khoa: string | null;
	model: string | null;
	ngay: number;
	metadata: string | null;
};
let goc: GiaTriGoc;

type ThaoTac = {
	ten: "setResearchKey" | "setAgentModel" | "setArchiveRetention";
	rest: string;
	vao: Record<string, string | number>;
	docDb: () => Promise<string | number | null>;
	truoc: string | number;
	sau: string | number;
};

const BA_THAO_TAC: readonly ThaoTac[] = [
	{
		ten: "setResearchKey",
		rest: "/settings/research-key",
		vao: { apiKey: KHOA_MOI },
		docDb: () => readContextDevKey(db),
		truoc: KHOA_TRUOC,
		sau: KHOA_MOI,
	},
	{
		ten: "setAgentModel",
		rest: "/settings/agent-model",
		vao: { modelId: MODEL_MOI.id },
		docDb: async () => (await readAgentModel(db)).id,
		truoc: MODEL_GOC.id,
		sau: MODEL_MOI.id,
	},
	{
		ten: "setArchiveRetention",
		rest: "/settings/archive-retention",
		vao: { days: NGAY_MOI },
		docDb: () => readArchiveRetentionDays(db),
		truoc: NGAY_TRUOC,
		sau: NGAY_MOI,
	},
];

async function datTruoc(): Promise<void> {
	await writeContextDevKey(db, KHOA_TRUOC);
	await writeAgentModel(db, MODEL_GOC);
	await writeArchiveRetentionDays(db, NGAY_TRUOC);
	demVerify.mockClear();
	demModels.mockClear();
	demBackfill.mockClear();
}

async function doiQua(ai: Loi, lop: Lop, thaoTac: ThaoTac): Promise<TraLoi> {
	const may = request(app.getHttpServer());
	const res =
		lop === "trpc"
			? await may
					.post(`/api/trpc/settings.${thaoTac.ten}`)
					.set(dauXac[ai].header, dauXac[ai].value)
					.set("content-type", "application/json")
					.send(JSON.stringify(thaoTac.vao))
			: await may
					.patch(`${REST_BRIDGE_PATH}${thaoTac.rest}`)
					.set(dauXac[ai].header, dauXac[ai].value)
					.set("content-type", "application/json")
					.send(JSON.stringify(thaoTac.vao));
	const body = res.body ?? {};
	return {
		status: res.status,
		data: lop === "trpc" ? body?.result?.data : body,
		loi: String(body?.error?.message ?? body?.message ?? ""),
	};
}

async function doc(ai: Loi, thuTuc: string): Promise<TraLoi> {
	const res = await request(app.getHttpServer())
		.get(`/api/trpc/settings.${thuTuc}`)
		.set(dauXac[ai].header, dauXac[ai].value);
	return {
		status: res.status,
		data: res.body?.result?.data,
		loi: String(res.body?.error?.message ?? ""),
	};
}

const traLoiCoCo = z
	.object({ canManage: z.boolean().optional() })
	.catch({ canManage: undefined });

function coCo(tra: TraLoi): boolean | undefined {
	return traLoiCoCo.parse(tra.data ?? {}).canManage;
}

async function moPhien(loi: Loi, vai: WorkspaceRole | null): Promise<string> {
	const id = ma(loi);
	if (vai === null) {
		const now = new Date();
		await db.user.create({
			data: {
				id,
				name: id,
				email: `${id}@thu.test`,
				emailVerified: true,
				createdAt: now,
				updatedAt: now,
			},
		});
	} else {
		await gieoThanhVien(id, vai);
	}
	const phien = await mintPhien(id);
	dauXac[loi].value = phien.cookie;
	daGieo.nguoi.push(id);
	daGieo.phien.push(phien.token);
	return id;
}

async function moKhoa(loi: Loi, userId: string): Promise<void> {
	const khoa = await auth.api.createApiKey({
		body: { name: ma("khoa"), userId },
	});
	dauXac[loi].value = khoa.key;
}

async function locationQuaProxy(
	cookie: string,
	apiUrl: string,
): Promise<string | null> {
	const kichBan = [
		`const { NextRequest } = await import("next/server");`,
		`const { proxy } = await import(${JSON.stringify(join(THU_MUC_APP, "proxy.ts"))});`,
		`const res = await proxy(new NextRequest("http://localhost:3000/contacts", { headers: { cookie: process.env.COOKIE_THU } }));`,
		`console.log(JSON.stringify({ location: res.headers.get("location") }));`,
	].join("\n");
	const con = Bun.spawn(["bun", "-e", kichBan], {
		cwd: THU_MUC_APP,
		env: { ...process.env, NEXT_PUBLIC_API_URL: apiUrl, COOKIE_THU: cookie },
		stdout: "pipe",
		stderr: "pipe",
	});
	const [ra, loi, maThoat] = await Promise.all([
		new Response(con.stdout).text(),
		new Response(con.stderr).text(),
		con.exited,
	]);
	expect(maThoat, `tien trinh proxy loi: ${loi}`).toBe(0);
	const dong = ra.trim().split("\n").at(-1) ?? "{}";
	const location = (JSON.parse(dong) as { location: string | null }).location;
	return location ? new URL(location).pathname : null;
}

beforeAll(async () => {
	goc = {
		khoa: await readContextDevKey(db),
		model: (await readAgentModel(db)).isDefault
			? null
			: (await readAgentModel(db)).id,
		ngay: await readArchiveRetentionDays(db),
		metadata: null,
	};
	app = await createApp();
	await app.listen(0, "127.0.0.1");
	demVerify = spyOn(app.get(ResearchKeyService), "verify").mockResolvedValue({
		outcome: "valid",
	});
	demModels = spyOn(app.get(ModelCatalogService), "models").mockResolvedValue([
		MODEL_MOI,
	]);
	spyOn(app.get(ModelCatalogService), "find").mockResolvedValue(MODEL_MOI);
	demBackfill = spyOn(app.get(BackfillService), "run").mockResolvedValue({
		queued: 0,
		remaining: 0,
	} as Awaited<ReturnType<BackfillService["run"]>>);

	await moPhien("owner", "owner");
	const adminId = await moPhien("admin", "admin");
	const memberId = await moPhien("member", "member");
	await moPhien("okr", "okr");
	await moPhien("nonMember", null);
	await moKhoa("memberKey", memberId);
	await moKhoa("adminKey", adminId);
	const kho = await db.organization.findUniqueOrThrow({
		where: { id: WORKSPACE_ID },
		select: { metadata: true },
	});
	goc.metadata = kho.metadata;
	await db.organization.update({
		where: { id: WORKSPACE_ID },
		data: { metadata: markOnboarded(kho.metadata, new Date()) },
	});
});

afterAll(async () => {
	await app.close();
	await writeContextDevKey(db, goc.khoa ?? "");
	await writeAgentModel(
		db,
		goc.model === null ? null : { id: goc.model, contextWindowTokens: 0 },
	);
	await writeArchiveRetentionDays(db, goc.ngay);
	await db.organization.update({
		where: { id: WORKSPACE_ID },
		data: { metadata: goc.metadata },
	});
	await db.apikey.deleteMany({ where: { referenceId: { in: daGieo.nguoi } } });
	await db.session.deleteMany({ where: { token: { in: daGieo.phien } } });
	await db.member.deleteMany({ where: { userId: { in: daGieo.nguoi } } });
	await db.user.deleteMany({ where: { id: { in: daGieo.nguoi } } });
});

const LOI_BI_CHAN: ReadonlyArray<[Loi, Lop]> = [
	["member", "trpc"],
	["memberKey", "trpc"],
	["okr", "trpc"],
	["nonMember", "trpc"],
	["member", "rest"],
];

const LOI_DUOC: ReadonlyArray<[Loi, Lop]> = [
	["admin", "trpc"],
	["owner", "trpc"],
	["adminKey", "trpc"],
	["admin", "rest"],
];

describe("ccq-member-bi-chan", () => {
	test("ccq-member-bi-chan: bon loi x ba thao tac deu 403, khong doi du lieu, khong goi ra ngoai", async () => {
		let soCa = 0;
		for (const [ai, lop] of LOI_BI_CHAN) {
			for (const thaoTac of BA_THAO_TAC) {
				await datTruoc();
				const nhan = `${ai} ${lop} ${thaoTac.ten}`;
				const tra = await doiQua(ai, lop, thaoTac);
				const thongDiep = ai === "nonMember" ? NOT_A_MEMBER : THONG_DIEP_CAM;
				expect(`${nhan}: HTTP ${tra.status}`).toBe(`${nhan}: HTTP 403`);
				expect(`${nhan}: ${tra.loi.includes(thongDiep)}`).toBe(`${nhan}: true`);
				expect(`${nhan}: db ${await thaoTac.docDb()}`).toBe(
					`${nhan}: db ${thaoTac.truoc}`,
				);
				expect(
					`${nhan}: verify ${demVerify.mock.calls.length} lan, models ${demModels.mock.calls.length} lan, backfill ${demBackfill.mock.calls.length} lan`,
				).toBe(`${nhan}: verify 0 lan, models 0 lan, backfill 0 lan`);
				soCa += 1;
			}
		}
		expect(`so ca ${soCa}`).toBe(
			`so ca ${LOI_BI_CHAN.length * BA_THAO_TAC.length}`,
		);
	});
});

describe("ccq-quan-tri-lam-duoc", () => {
	test("ccq-quan-tri-lam-duoc: bon loi x ba thao tac deu thanh cong nhu truoc", async () => {
		let soCa = 0;
		for (const [ai, lop] of LOI_DUOC) {
			for (const thaoTac of BA_THAO_TAC) {
				await datTruoc();
				const nhan = `${ai} ${lop} ${thaoTac.ten}`;
				const tra = await doiQua(ai, lop, thaoTac);
				expect(`${nhan}: HTTP ${tra.status} ${tra.loi}`).toBe(
					`${nhan}: HTTP 200 `,
				);
				expect(`${nhan}: canManage ${coCo(tra)}`).toBe(
					`${nhan}: canManage true`,
				);
				expect(`${nhan}: db ${await thaoTac.docDb()}`).toBe(
					`${nhan}: db ${thaoTac.sau}`,
				);
				if (thaoTac.ten === "setResearchKey") {
					expect(`${nhan}: verify ${demVerify.mock.calls.length}`).toBe(
						`${nhan}: verify 1`,
					);
					expect(
						`${nhan}: backfill ${JSON.stringify(demBackfill.mock.calls)}`,
					).toBe(`${nhan}: backfill [["companies"]]`);
				}
				if (thaoTac.ten === "setAgentModel") {
					expect(`${nhan}: models goi ${demModels.mock.calls.length > 0}`).toBe(
						`${nhan}: models goi true`,
					);
				}
				soCa += 1;
			}
		}
		expect(`so ca ${soCa}`).toBe(
			`so ca ${LOI_DUOC.length * BA_THAO_TAC.length}`,
		);
	});
});

describe("ccq-member-doc-duoc", () => {
	test("ccq-member-doc-duoc: member doc duoc bon thu tuc, khoa chi hien dang che", async () => {
		await datTruoc();
		const BON_THU_TUC = [
			"researchKey",
			"agentModel",
			"archiveRetention",
			"modelCatalog",
		] as const;
		let soCa = 0;
		for (const thuTuc of BON_THU_TUC) {
			const tra = await doc("member", thuTuc);
			expect(`member ${thuTuc}: HTTP ${tra.status} ${tra.loi}`).toBe(
				`member ${thuTuc}: HTTP 200 `,
			);
			soCa += 1;
		}
		const khoa = (await doc("member", "researchKey")).data as {
			hint: string | null;
		};
		expect(`hint ${khoa.hint}`).toBe(`hint ${maskKey(KHOA_TRUOC)}`);
		expect(khoa.hint === KHOA_TRUOC).toBe(false);
		const ngay = (await doc("member", "archiveRetention")).data as {
			days: number;
		};
		expect(`days ${ngay.days}`).toBe(`days ${NGAY_TRUOC}`);
		expect(`so ca ${soCa}`).toBe(`so ca ${BON_THU_TUC.length}`);
	});
});

describe("ccq-co-quyen", () => {
	test("ccq-co-quyen: bon phien x ba query tra co dung vai", async () => {
		await datTruoc();
		const MONG_DOI: ReadonlyArray<[Loi, boolean | "khong-thanh-vien"]> = [
			["owner", true],
			["admin", true],
			["member", false],
			["okr", false],
			["nonMember", "khong-thanh-vien"],
		];
		const BA_QUERY = ["researchKey", "agentModel", "archiveRetention"] as const;
		let soCa = 0;
		for (const [ai, mong] of MONG_DOI) {
			for (const thuTuc of BA_QUERY) {
				const tra = await doc(ai, thuTuc);
				const nhan = `${ai} ${thuTuc}`;
				if (mong === "khong-thanh-vien") {
					expect(`${nhan}: HTTP ${tra.status} ${tra.loi}`).toBe(
						`${nhan}: HTTP 403 ${NOT_A_MEMBER}`,
					);
					expect(`${nhan}: data ${tra.data}`).toBe(`${nhan}: data undefined`);
				} else {
					expect(`${nhan}: HTTP ${tra.status} canManage ${coCo(tra)}`).toBe(
						`${nhan}: HTTP 200 canManage ${mong}`,
					);
				}
				soCa += 1;
			}
		}
		expect(`so ca ${soCa}`).toBe(`so ca ${MONG_DOI.length * BA_QUERY.length}`);
	});
});

describe("ccq-cong-that", () => {
	test("ccq-cong-that: tra loi that cua may chu qua ham doc cua proxy va qua proxy that", async () => {
		await writeContextDevKey(db, "");
		const traMember = await doc("member", "researchKey");
		const traAdmin = await doc("admin", "researchKey");
		expect(`member: ${congNghienCuu(traMember.data)}`).toBe("member: settled");
		expect(`admin bi day: ${congNghienCuu(traAdmin.data)}`).toBe(
			"admin bi day: required",
		);

		const server = app.getHttpServer();
		const { port } = server.address() as AddressInfo;
		const apiUrl = `http://127.0.0.1:${port}`;
		const [choMember, choAdmin] = await Promise.all([
			locationQuaProxy(dauXac.member.value, apiUrl),
			locationQuaProxy(dauXac.admin.value, apiUrl),
		]);
		expect(`proxy member: ${choMember}`).not.toBe(
			"proxy member: /onboarding/research",
		);
		expect(`proxy admin bi day: ${choAdmin}`).toBe(
			"proxy admin bi day: /onboarding/research",
		);

		await writeContextDevKey(db, KHOA_TRUOC);
		const lai = await doc("admin", "researchKey");
		expect(`admin co khoa: ${congNghienCuu(lai.data)}`).toBe(
			"admin co khoa: settled",
		);

		const nguon = await Bun.file(join(THU_MUC_APP, "lib/onboarding.ts")).text();
		expect(
			`onboarding dung ham chung: ${nguon.includes(`from "@crm/validation/cong-nghien-cuu"`)}`,
		).toBe("onboarding dung ham chung: true");
	});
});
