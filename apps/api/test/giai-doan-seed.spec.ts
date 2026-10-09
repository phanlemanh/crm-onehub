import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { db } from "@crm/db";
import { GIAI_DOAN_GOC } from "@crm/db/giai-doan";
import { runScopedUrl } from "@crm/db/test-database";

const GOI_DB = resolve(import.meta.dirname, "..", "..", "..", "packages", "db");
const GIAY_SEED = 300;
const MS_TEST = 400_000;

const goc = process.env.TEST_DATABASE_URL ?? "";
const runId = `${process.env.TEST_RUN_ID ?? "local"}seed`;
const khoSeed = goc ? runScopedUrl(goc, runId) : "";
const thuMuc = mkdtempSync(join(tmpdir(), "gmd-seed-"));
const chanMang = join(thuMuc, "chan-mang.ts");

type DongThoaThuan = {
	id: string;
	stage: string;
	kind: string;
	closedAt: string | null;
};

const dem = { truoc: 0, sau: 0 };
let thoaThuan: DongThoaThuan[] = [];
let song = new Set<string>();
let coThat = new Set<string>();
let chuyen: { from: string | null; to: string | null }[] = [];
let demoDaCat = false;
let maSeed = -1;
let raSeed = "";

const TRUY_VAN = `
import pg from "pg";
const k = new pg.Client({ connectionString: process.env.KHO_SEED });
await k.connect();
const ra = [];
for (const [q, v] of JSON.parse(process.env.CAU_SQL)) ra.push((await k.query(q, v)).rows);
await k.end();
console.log(JSON.stringify(ra));
`;

const XOA_KHO = `
import { databaseName } from "./src/test-database.ts";
import { dropDatabase, withMaintenance } from "./scripts/test-db-admin.ts";
const url = process.env.KHO_SEED;
await withMaintenance(url, (client) => dropDatabase(client, databaseName(url)));
`;

function sql<T>(cau: [string, unknown[]][]): T[][] {
	const r = spawnSync("bun", ["-e", TRUY_VAN], {
		cwd: GOI_DB,
		encoding: "utf8",
		env: { ...process.env, KHO_SEED: khoSeed, CAU_SQL: JSON.stringify(cau) },
	});
	if (r.status !== 0) throw new Error(`sql kho seed: ${r.stderr}`);
	return JSON.parse(r.stdout.trim().split("\n").at(-1) ?? "[]");
}

function chay(lenh: string[], env: Record<string, string>) {
	return spawnSync(lenh[0] as string, lenh.slice(1), {
		cwd: GOI_DB,
		encoding: "utf8",
		env: { ...process.env, ...env },
		maxBuffer: 64 * 1024 * 1024,
	});
}

beforeAll(async () => {
	expect(goc, "TEST_DATABASE_URL vang — chay qua bun run test").not.toBe("");
	dem.truoc = await db.deal.count();
	writeFileSync(
		chanMang,
		'globalThis.fetch = async () => { throw new Error("giai-doan-seed: mang tat"); };\n',
	);
	const dung = chay(["bun", "run", "db:test"], {
		TEST_DATABASE_URL: khoSeed,
		TEST_RUN_ID: "",
	});
	expect(dung.status, `db:test kho seed: ${dung.stderr}`).toBe(0);
	sql([
		[
			`UPDATE "dealStage" SET "archivedAt" = now() WHERE id = $1`,
			[GIAI_DOAN_GOC.DEMO_BOOKED],
		],
	]);
	const seed = chay(
		[
			"perl",
			"-e",
			`alarm ${GIAY_SEED}; exec @ARGV`,
			"bun",
			"--preload",
			chanMang,
			"prisma/seed.ts",
		],
		{ DATABASE_URL: khoSeed, NODE_ENV: "development", TEST_RUN_ID: "" },
	);
	maSeed = seed.status ?? -1;
	raSeed = `${seed.stdout}\n${seed.stderr}`.slice(-2000);
	const [giaiDoan, rows, chuyenRows] = sql<Record<string, string | null>>([
		[`SELECT id, kind::text AS kind, "archivedAt" FROM "dealStage"`, []],
		[
			`SELECT d.id, d.stage, s.kind::text AS kind, d."closedAt" FROM deal d JOIN "dealStage" s ON s.id = d.stage WHERE d.id LIKE 'seed-deal-%'`,
			[],
		],
		[
			`SELECT meta->>'from' AS "from", meta->>'to' AS "to" FROM activity WHERE type = 'STAGE_CHANGE' AND "dealId" LIKE 'seed-deal-%'`,
			[],
		],
	]);
	const gd = giaiDoan ?? [];
	song = new Set(
		gd.filter((g) => g.archivedAt === null).map((g) => String(g.id)),
	);
	coThat = new Set(gd.map((g) => String(g.id)));
	demoDaCat = gd.some(
		(g) => g.id === GIAI_DOAN_GOC.DEMO_BOOKED && g.archivedAt !== null,
	);
	thoaThuan = (rows ?? []).map((r) => ({
		id: String(r.id),
		stage: String(r.stage),
		kind: String(r.kind),
		closedAt: r.closedAt ?? null,
	}));
	chuyen = (chuyenRows ?? []).map((c) => ({
		from: c.from ?? null,
		to: c.to ?? null,
	}));
	dem.sau = await db.deal.count();
}, MS_TEST);

afterAll(async () => {
	rmSync(thuMuc, { recursive: true, force: true });
	if (khoSeed) {
		const xoa = spawnSync("bun", ["-e", XOA_KHO], {
			cwd: GOI_DB,
			encoding: "utf8",
			env: { ...process.env, KHO_SEED: khoSeed },
		});
		if (xoa.status !== 0) throw new Error(`xoa kho seed: ${xoa.stderr}`);
	}
});

describe("seed-giai-doan-song", () => {
	it("seed chay xong", () => {
		expect(maSeed, `seed thoat ${maSeed}: ${raSeed}`).toBe(0);
		expect(thoaThuan.length, "seed khong tao thoa thuan nao").toBeGreaterThan(
			0,
		);
	});

	it("moi thoa thuan seed o giai doan song, dong khop loai", () => {
		const ngoai = thoaThuan.filter((t) => !song.has(t.stage)).map((t) => t.id);
		expect(ngoai.join(","), "seed vao giai doan da cat").toBe("");
		const lech = thoaThuan
			.filter((t) => (t.closedAt !== null) !== (t.kind !== "OPEN"))
			.map((t) => `${t.id}:${t.kind}`);
		expect(lech.join(","), "dong khong khop loai").toBe("");
	});

	it("du ba loai, khong o Demo da cat", () => {
		const loai = new Set(thoaThuan.map((t) => t.kind));
		expect([...loai].sort().join(",")).toBe("LOST,OPEN,WON");
		expect(
			thoaThuan.filter((t) => t.stage === GIAI_DOAN_GOC.DEMO_BOOKED).length,
			"seed vao giai doan da cat",
		).toBe(0);
		expect(demoDaCat, "seed go luu tru Demo").toBe(true);
	});

	it("dong STAGE_CHANGE tro toi giai doan co that", () => {
		expect(chuyen.length).toBeGreaterThan(0);
		const hong = chuyen
			.filter((c) => !coThat.has(c.from ?? "") || !coThat.has(c.to ?? ""))
			.map((c) => `${c.from}->${c.to}`);
		expect(hong.join(","), "STAGE_CHANGE tro giai doan khong co").toBe("");
	});

	it("khong ro sang kho dung chung", () => {
		expect(dem.sau, "seed ghi vao kho dung chung").toBe(dem.truoc);
	});
});
