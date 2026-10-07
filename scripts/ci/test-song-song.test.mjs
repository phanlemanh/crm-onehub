import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import os from "node:os";
import { join, resolve } from "node:path";
import { after, describe, test } from "node:test";
import { NHOM_TEST } from "./cau-hinh.mjs";
import { chuyenDoiSo, dungNhom, goiCoTest, ketQua } from "./test-song-song.mjs";

const GOC = resolve(import.meta.dirname, "..", "..");
const CLI = join(GOC, "scripts", "ci", "test-song-song.mjs");
const TAM = mkdtempSync(join(os.tmpdir(), "ctd-"));
after(() => rmSync(TAM, { recursive: true, force: true }));

const GIA = join(TAM, "test-run-gia.mjs");
writeFileSync(
	GIA,
	`import { appendFileSync } from "node:fs";
const doiSo = process.argv.slice(2);
if (process.env.CTD_IN_ARGV) { console.log(JSON.stringify(doiSo)); process.exit(0); }
const bat = Date.now();
await new Promise((r) => setTimeout(r, Number(process.env.CTD_NGU || 0)));
appendFileSync(process.env.CTD_SO, JSON.stringify({ doiSo, bat, ket: Date.now() }) + "\\n");
console.log("test-run: crm_gia" + process.pid + "_test is this run's database");
const doNhom = (process.env.CTD_DO || "").split(",").filter(Boolean);
process.exit(doiSo.some((a) => doNhom.includes(a.replace("--filter=", ""))) ? 1 : 0);
`,
);

const TAT_CA = NHOM_TEST.flatMap((n) => n.goi).sort();

function chay(doiSo, env = {}) {
	const so = join(TAM, `so-${Math.random().toString(36).slice(2)}.jsonl`);
	writeFileSync(so, "");
	const r = spawnSync("node", [CLI, "--test-run", GIA, ...doiSo], {
		encoding: "utf8",
		env: { ...process.env, CTD_SO: so, ...env },
	});
	const dong = readFileSync(so, "utf8")
		.split("\n")
		.filter(Boolean)
		.map((d) => JSON.parse(d));
	return { ma: r.status, ra: `${r.stdout}\n${r.stderr}`, spawn: dong };
}

function workspaceGia(them) {
	const goc = join(TAM, `ws-${them.join("-") || "du"}`);
	mkdirSync(join(goc, ".githooks"), { recursive: true });
	writeFileSync(
		join(goc, "package.json"),
		JSON.stringify({ workspaces: ["pk/*"] }),
	);
	writeFileSync(
		join(goc, ".githooks", "gate-shape.json"),
		JSON.stringify({
			checkers: [{ id: "test", exempt: { "@crm/typescript-config": "x" } }],
		}),
	);
	for (const ten of [...TAT_CA, ...them, "@crm/typescript-config"]) {
		const d = join(goc, "pk", ten.replace("/", "__"));
		mkdirSync(d, { recursive: true });
		const scripts =
			ten === "@crm/typescript-config" ? {} : { test: "bun test" };
		writeFileSync(
			join(d, "package.json"),
			JSON.stringify({ name: ten, scripts }),
		);
	}
	return goc;
}

describe("ctd-ham", () => {
	test("(a) workspace that: du 11 goi, moi goi dung mot nhom", () => {
		const goi = goiCoTest(GOC);
		assert.equal(goi.length, 11);
		assert.deepEqual(dungNhom(goi, NHOM_TEST), []);
	});

	for (const bo of TAT_CA) {
		test(`(b) bo ${bo} khoi bon nhom -> loi goi dung ten`, () => {
			const nhom = NHOM_TEST.map((n) => ({
				...n,
				goi: n.goi.filter((g) => g !== bo),
			}));
			assert.deepEqual(dungNhom(TAT_CA, nhom), [
				`goi ${bo} khong thuoc nhom nao`,
			]);
		});
	}

	test("(c) mot goi o hai nhom -> loi goi ten goi trung", () => {
		const nhom = NHOM_TEST.map((n, i) =>
			i === 0 ? { ...n, goi: [...n.goi, "app"] } : n,
		);
		assert.deepEqual(dungNhom(TAT_CA, nhom), [
			"goi app nam o ca nhom api va app-ui",
		]);
	});

	test("(d) ket qua: bon nhom ma 0 -> 0", () => {
		assert.deepEqual(ketQua(NHOM_TEST.map((n) => ({ ten: n.ten, ma: 0 }))), {
			ma: 0,
			dong: [],
		});
	});

	for (const n of NHOM_TEST) {
		test(`(d) nhom ${n.ten} ma 1 -> khac 0, goi ten nhom`, () => {
			const k = ketQua(
				NHOM_TEST.map((x) => ({ ten: x.ten, ma: x.ten === n.ten ? 1 : 0 })),
			);
			assert.deepEqual(k, { ma: 1, dong: [`nhom ${n.ten} DO (ma 1)`] });
		});
	}

	test("(e) co doi so -> test-run + nguyen doi so; khong doi so -> null", () => {
		assert.deepEqual(chuyenDoiSo(['cd a && bun test "x y"'], "/t.ts"), [
			"/t.ts",
			'cd a && bun test "x y"',
		]);
		assert.equal(chuyenDoiSo([], "/t.ts"), null);
	});
});

describe("ctd-cli", () => {
	test("(f) doi chung: bon nhom xanh -> CLI thoat 0, bon dong ket qua, bon CSDL khac nhau", () => {
		const r = chay([]);
		assert.equal(r.ma, 0, r.ra);
		const csdl = [...r.ra.matchAll(/^nhom \S+: ma 0 · CSDL (\S+) · /gm)].map(
			(m) => m[1],
		);
		assert.equal(new Set(csdl).size, 4, r.ra);
	});

	for (const n of NHOM_TEST) {
		test(`(f) nhom ${n.ten} do -> CLI thoat khac 0, goi ten nhom`, () => {
			const r = chay([], { CTD_DO: n.goi[0] });
			assert.notEqual(r.ma, 0);
			assert.match(
				r.ra,
				new RegExp(`test-song-song: nhom ${n.ten} DO \\(ma 1\\)`),
			);
			assert.equal(r.spawn.length, 4);
		});
	}

	test("(g) goi thua ngoai bon nhom -> thoat khac 0, goi ten goi, 0 lan spawn", () => {
		const goc = workspaceGia(["@crm/goi-moi"]);
		const r = chay(["--goc", goc]);
		assert.equal(r.ma, 2, r.ra);
		assert.match(
			r.ra,
			/test-song-song: goi @crm\/goi-moi khong thuoc nhom nao/,
		);
		assert.equal(r.spawn.length, 0);
	});

	test("(g) doi chung: workspace gia du 11 goi -> chay", () => {
		const r = chay(["--goc", workspaceGia([])]);
		assert.equal(r.ma, 0, r.ra);
		assert.equal(r.spawn.length, 4);
	});

	test("(h) doi so co dau cach va nhay: argv trung tung byte voi loi goi thang", () => {
		const cau = readFileSync(join(GOC, "_acceptance", "config.yaml"), "utf8");
		const lenh = /^\s+nbn_ca_tep: bun run test -- "(.+)"$/m.exec(cau)?.[1];
		assert.ok(lenh, "khong thay lenh nbn_ca_tep trong config.yaml");
		const quaCli = spawnSync("node", [CLI, "--test-run", GIA, lenh], {
			encoding: "utf8",
			env: { ...process.env, CTD_IN_ARGV: "1" },
		});
		const thang = spawnSync("bun", [GIA, lenh], {
			encoding: "utf8",
			env: { ...process.env, CTD_IN_ARGV: "1" },
		});
		assert.equal(quaCli.status, 0);
		assert.equal(quaCli.stdout, thang.stdout);
		assert.deepEqual(JSON.parse(quaCli.stdout), [lenh]);
		const nhay = `cd apps/x && bun test -t "hai chu" 'mot'`;
		const r2 = spawnSync(
			"node",
			[CLI, "--test-run", GIA, nhay, "--filter=api"],
			{
				encoding: "utf8",
				env: { ...process.env, CTD_IN_ARGV: "1" },
			},
		);
		assert.deepEqual(JSON.parse(r2.stdout), [nhay, "--filter=api"]);
	});

	test("(i) --song-song 2: khong luc nao co qua 2 nhom chay", () => {
		const r = chay(["--song-song", "2"], { CTD_NGU: "300" });
		assert.equal(r.ma, 0, r.ra);
		const moc = r.spawn.flatMap((s) => [
			[s.bat, 1],
			[s.ket, -1],
		]);
		moc.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
		let dang = 0;
		let max = 0;
		for (const [, d] of moc) {
			dang += d;
			max = Math.max(max, dang);
		}
		assert.equal(max, 2);
	});
});
