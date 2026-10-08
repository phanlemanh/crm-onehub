import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
	chmodSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import os from "node:os";
import { join, resolve } from "node:path";
import { after, describe, test } from "node:test";
import { CHAY_TEST, NHOM_TEST } from "./cau-hinh.mjs";
import {
	chuyenDoiSo,
	dungNhom,
	goiCoTest,
	ketQua,
	lenhThieuTran,
} from "./test-song-song.mjs";

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
appendFileSync(process.env.CTD_SO, JSON.stringify({ loai: "nhom", doiSo, bat, ket: Date.now() }) + "\\n");
console.log("test-run: crm_gia" + process.pid + "_test is this run's database");
if (process.env.CTD_KHONG_XUONG) process.stdout.write("dong cuoi khong xuong dong");
if (doiSo.includes("--filter=" + process.env.CTD_NHIEU)) for (let i = 0; i < 60000; i++) process.stdout.write("dong dai cua nhom lon ".repeat(4) + i + "\\n");
if (process.env.CTD_TAT_CA_DO) process.exit(1);
const doNhom = (process.env.CTD_DO || "").split(",").filter(Boolean);
process.exit(doiSo.some((a) => doNhom.includes(a.replace("--filter=", ""))) ? 1 : 0);
`,
);

const GIA_TURBO = join(TAM, "turbo-gia.mjs");
writeFileSync(
	GIA_TURBO,
	`#!/usr/bin/env node
import { appendFileSync } from "node:fs";
const bat = Date.now();
await new Promise((r) => setTimeout(r, 50));
appendFileSync(process.env.CTD_SO, JSON.stringify({ loai: "turbo", doiSo: process.argv.slice(2), bat, ket: Date.now() }) + "\\n");
process.exit(process.env.CTD_TURBO_DO ? 1 : 0);
`,
);
chmodSync(GIA_TURBO, 0o755);

const TAT_CA = NHOM_TEST.flatMap((n) => n.goi).sort();

function chay(doiSo, env = {}) {
	const so = join(TAM, `so-${Math.random().toString(36).slice(2)}.jsonl`);
	writeFileSync(so, "");
	const r = spawnSync(
		"bun",
		[CLI, "--test-run", GIA, "--turbo", GIA_TURBO, ...doiSo],
		{
			encoding: "utf8",
			maxBuffer: 1 << 26,
			env: { ...process.env, CI: "true", CTD_SO: so, ...env },
		},
	);
	const dong = readFileSync(so, "utf8")
		.split("\n")
		.filter(Boolean)
		.map((d) => JSON.parse(d));
	return {
		ma: r.status,
		ra: `${r.stdout}\n${r.stderr}`,
		spawn: dong.filter((d) => d.loai === "nhom"),
		turbo: dong.filter((d) => d.loai === "turbo"),
	};
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

	test("(f) workspace that: moi lenh bun test cua moi goi mang tran moi ca", () => {
		assert.deepEqual(lenhThieuTran(GOC, CHAY_TEST.tranMoiCaMs), []);
	});

	test("(g) thieu tran hay sai tran -> goi ten goi, script va lenh", () => {
		const goc = workspaceGia([]);
		const tran = CHAY_TEST.tranMoiCaMs;
		writeFileSync(
			join(goc, "pk", "app", "package.json"),
			JSON.stringify({
				name: "app",
				scripts: {
					test: `bun test --timeout ${tran} && bun run test:dom`,
					"test:dom": "bun x/chay-tung-tep-dom.ts --timeout 5000",
					"test:watch": "bun test --watch",
				},
			}),
		);
		const thieu = lenhThieuTran(goc, tran);
		assert.ok(
			thieu.includes(
				"app: test:dom — bun x/chay-tung-tep-dom.ts --timeout 5000",
			),
		);
		assert.ok(thieu.includes("api: test — bun test"));
		assert.ok(!thieu.some((d) => d.startsWith("app: test —")));
		assert.ok(!thieu.some((d) => d.includes("test:watch")));
	});
});

describe("ctd-cli", () => {
	test("(m) tai cho: khong CI, khong co -> mot luot test-run argv rong, khong dung truoc, khong nhom", () => {
		const r = chay([], { CI: "", CTD_IN_ARGV: "1" });
		assert.equal(r.ma, 0, r.ra);
		assert.equal(
			r.turbo.length,
			0,
			`dung truoc khong duoc chay tai cho: ${r.ra}`,
		);
		const argv = r.ra.split("\n").filter((d) => d.startsWith("["));
		assert.deepEqual(
			argv,
			["[]"],
			`test-run phai nhan dung mot lan voi argv rong: ${r.ra}`,
		);
		assert.doesNotMatch(r.ra, /^nhom /m, "tai cho khong duoc co dong nhom");
	});

	test("(m) tai cho: test-run thoat 1 -> CLI thoat 1", () => {
		const r = chay([], { CI: "", CTD_DO: "", CTD_TAT_CA_DO: "1" });
		assert.equal(r.ma, 1, r.ra);
	});

	for (const [nhan, doiSo, env] of [
		["CI=true", [], { CI: "true" }],
		["--song-song 1 khong CI", ["--song-song", "1"], { CI: "" }],
	]) {
		test(`(m) ${nhan} -> bon nhom`, () => {
			const r = chay(doiSo, env);
			assert.equal(r.ma, 0, r.ra);
			assert.equal(r.spawn.length, 4, `phai chay bon nhom: ${r.ra}`);
			assert.equal(r.turbo.length, 1, r.ra);
		});
	}

	test("(f) doi chung: bon nhom xanh -> CLI thoat 0, bon dong ket qua, bon CSDL khac nhau", () => {
		const r = chay([]);
		assert.equal(r.ma, 0, r.ra);
		const csdl = [...r.ra.matchAll(/^nhom \S+: ma 0 · CSDL (\S+) · /gm)].map(
			(m) => m[1],
		);
		assert.equal(new Set(csdl).size, 4, r.ra);
	});

	test("(f) dau ra nhom khong ket thuc xuong dong van du bon dong ket qua", () => {
		const r = chay([], { CTD_KHONG_XUONG: "1" });
		assert.equal(r.ma, 0, r.ra);
		assert.equal(
			[...r.ra.matchAll(/^nhom \S+: ma 0 · CSDL \S+ · /gm)].length,
			4,
			r.ra,
		);
	});

	test("(f) mot nhom in rat nhieu dong: dong ket qua cua moi nhom van o dau dong", () => {
		const r = chay([], { CTD_NHIEU: "api" });
		assert.equal(r.ma, 0, r.ra.slice(-500));
		const dau = [...r.ra.matchAll(/^nhom (\S+): ma 0 · CSDL \S+ · /gm)]
			.map((m) => m[1])
			.sort();
		assert.deepEqual(dau, NHOM_TEST.map((n) => n.ten).sort());
		assert.doesNotMatch(r.ra, /\Snhom \S+: ma \d+ · CSDL/);
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

	test("(j) dung truoc dung mot lan, truoc moi nhom, du 11 goi; nhom nhan --only", () => {
		const r = chay([]);
		assert.equal(r.ma, 0, r.ra);
		assert.equal(r.turbo.length, 1);
		assert.deepEqual(r.turbo[0].doiSo, [
			"run",
			"build",
			...goiCoTest(GOC).map((g) => `--filter=${g}^...`),
		]);
		assert.ok(
			r.spawn.every((n) => n.bat >= r.turbo[0].ket),
			"nhom bat dau truoc khi dung xong",
		);
		assert.ok(r.spawn.every((n) => n.doiSo.includes("--only")));
	});

	test("(k) dung truoc do -> thoat 3, goi ten, 0 nhom chay", () => {
		const r = chay([], { CTD_TURBO_DO: "1" });
		assert.equal(r.ma, 3, r.ra);
		assert.match(
			r.ra,
			/test-song-song: dung truoc DO \(ma 1\), khong nhom nao chay/,
		);
		assert.equal(r.spawn.length, 0);
	});

	test("(g) goi thua ngoai bon nhom -> thoat khac 0, goi ten goi, 0 lan spawn", () => {
		const goc = workspaceGia(["@crm/goi-moi"]);
		const r = chay(["--goc", goc]);
		assert.equal(r.ma, 2, r.ra);
		assert.match(
			r.ra,
			/test-song-song: goi @crm\/goi-moi khong thuoc nhom nao/,
		);
		assert.equal(r.spawn.length, 0);
		assert.equal(r.turbo.length, 0);
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
		const quaCli = spawnSync("bun", [CLI, "--test-run", GIA, lenh], {
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
