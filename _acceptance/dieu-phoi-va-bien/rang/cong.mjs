import { spawnSync } from "node:child_process";
import { cpSync, globSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const GOC = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const ID = "test:dieu-phoi";
const DIR = "scripts/dieu-phoi/test";
const TEP = [".githooks/pre-push", ".githooks/gate-shape.json", "package.json", ".github/workflows/acceptance.yml"];
const ghi = (s) => process.stdout.write(`${s}\n`);
const tam = [];
const thuMucTam = () => {
	const d = mkdtempSync(join(tmpdir(), "dpvb-cong-"));
	tam.push(d);
	return d;
};

function kiemPrePush(goc) {
	const text = readFileSync(join(goc, ".githooks/pre-push"), "utf8");
	const m = /^for task in (.+); do\n([\s\S]*?)\ndone$/m.exec(text);
	if (!m) return "khong thay vong for task trong pre-push";
	if (!/bun run "\$task"/.test(m[2])) return "than vong pre-push khong goi bun run \"$task\"";
	const r = spawnSync("bash", ["-c", `for task in ${m[1]}; do echo "$task"; done`], { encoding: "utf8" });
	const nhiemVu = r.stdout.trim().split("\n");
	return nhiemVu.includes(ID) ? null : `vong pre-push chay [${nhiemVu.join(", ")}], thieu ${ID}`;
}

function kiemGateShape(goc) {
	const shape = JSON.parse(readFileSync(join(goc, ".githooks/gate-shape.json"), "utf8"));
	const c = shape.checkers.find((x) => x.id === ID);
	if (!c) return `gate-shape khong khai checker ${ID}`;
	if (c.kind !== "node-test") return `checker ${ID} co kind ${c.kind}`;
	if (c.dir !== DIR) return `checker ${ID} tro dir ${c.dir}`;
	if (!String(c.note ?? "").includes("bun run test")) return `checker ${ID} khong neu ly do khong nam trong bun run test`;
	return null;
}

function kiemGlob(goc) {
	const script = JSON.parse(readFileSync(join(goc, "package.json"), "utf8")).scripts?.[ID] ?? "";
	const m = /^node --test "([^"]+)"$/.exec(script);
	if (!m) return `script ${ID} khong co dang node --test "<glob>": ${script}`;
	const chay = globSync(m[1], { cwd: goc }).sort();
	const co = readdirSync(join(goc, DIR)).filter((f) => f.endsWith(".test.mjs")).map((f) => `${DIR}/${f}`).sort();
	const thieu = co.filter((f) => !chay.includes(f));
	return thieu.length === 0 && co.length > 0 ? null : `glob ${m[1]} bo sot ${thieu.join(", ") || "(thu muc rong)"}`;
}

function kiemCi(goc) {
	const wf = Bun.YAML.parse(readFileSync(join(goc, ".github/workflows/acceptance.yml"), "utf8"));
	for (const [ten, job] of Object.entries(wf.jobs ?? {})) {
		const buoc = job.steps ?? [];
		const chay = buoc.some((b) => String(b.run ?? "").trim() === `bun run ${ID}`);
		const node24 = buoc.some((b) => String(b.uses ?? "").startsWith("actions/setup-node@") && String(b.with?.["node-version"]) === "24");
		if (chay && node24) return null;
		if (chay) return `job ${ten} chay ${ID} nhung khong dung Node 24`;
	}
	return `acceptance.yml khong co job nao chay bun run ${ID}`;
}

const QUAN_HE = [
	["pre-push", kiemPrePush],
	["gate-shape", kiemGateShape],
	["glob", kiemGlob],
	["ci", kiemCi],
];

const PHA = [
	["pre-push", ".githooks/pre-push", (t) => t.replace(` ${ID}; do`, "; do")],
	["gate-shape", ".githooks/gate-shape.json", (t) => t.replace('"kind": "node-test"', '"kind": "turbo"')],
	["glob", "package.json", (t) => t.replace('scripts/dieu-phoi/test/*.test.mjs', "scripts/dieu-phoi/test/lich.test.mjs")],
	["ci", ".github/workflows/acceptance.yml", (t) => t.replace(`      - run: bun run ${ID}\n`, "")],
];

function banSao() {
	const d = thuMucTam();
	for (const t of TEP) {
		mkdirSync(dirname(join(d, t)), { recursive: true });
		cpSync(join(GOC, t), join(d, t));
	}
	cpSync(join(GOC, DIR), join(d, DIR), { recursive: true });
	return d;
}

function noiCong() {
	let sai = 0;
	for (const [ten, kiem] of QUAN_HE) {
		const loi = kiem(GOC);
		if (loi) {
			sai++;
			ghi(`DO ${ten}: ${loi}`);
		} else ghi(`xanh ${ten}`);
	}
	for (const [ten, tep, pha] of PHA) {
		const d = banSao();
		const cu = readFileSync(join(d, tep), "utf8");
		const moi = pha(cu);
		if (moi === cu) {
			ghi(`MOC VANG pha ${ten}`);
			process.exit(2);
		}
		writeFileSync(join(d, tep), moi);
		const loi = QUAN_HE.find(([t]) => t === ten)[1](d);
		if (loi) ghi(`BAT ${ten}: DO ${ten} — ${loi}`);
		else {
			sai++;
			ghi(`SOT ${ten}: pha ${tep} ma thuoc van xanh`);
		}
	}
	ghi(sai === 0 ? "XANH noi-cong" : `DO noi-cong: ${sai}`);
	return sai === 0;
}

async function checkerNodeTest() {
	const mod = await import(pathToFileURL(join(GOC, "scripts", "gate-shape-node-test.mjs")).href);
	const that = spawnSync("bun", ["run", ID], { cwd: GOC, encoding: "utf8" });
	const ra = `${that.stdout || ""}${that.stderr || ""}`;
	const tong = mod.nodeTestSummary(ra);
	if (that.status !== 0 || !tong || tong.fail !== 0) {
		ghi(`KHONG DO DUOC: bun run ${ID} tren cay that khong xanh (ma ${that.status})`);
		process.exit(2);
	}
	const thamChieu = mod.runReference(GOC, DIR);
	const checker = { id: ID, kind: "node-test", dir: DIR };
	const log = (than) => `pre-push: bun run test\nℹ tests 999\nℹ fail 0\npre-push: bun run ${ID}\n${than}\npre-push: bun run build\n`;
	const bot = ra.replace(new RegExp(`^ℹ tests ${tong.tests}$`, "m"), `ℹ tests ${tong.tests - 1}`);
	const hong = ra.replace(/^ℹ fail 0$/m, "ℹ fail 1");
	const ca = [
		["lanh", log(ra), (k) => k.problems.length === 0 && k.report.includes(`  ${ID}: ${tong.tests} tests`)],
		["thieu-muc", "pre-push: bun run test\nℹ tests 999\nℹ fail 0\n", (k) => k.problems.some((p) => p.includes("reported no test summary"))],
		["bot-mot", log(bot), (k) => k.problems.some((p) => p.includes(String(tong.tests - 1)) && p.includes(String(thamChieu.tests)))],
		["co-ca-do", log(hong), (k) => k.problems.some((p) => p.includes("1 failed"))],
	];
	let sai = 0;
	if (bot === ra || hong === ra) {
		ghi("MOC VANG: dau ra that khong co dong tong ket de sua");
		process.exit(2);
	}
	for (const [ten, l, dung] of ca) {
		const k = mod.checkNodeTest(checker, l, { root: GOC, reference: thamChieu });
		if (dung(k)) ghi(`xanh ${ten}: ${k.problems.join(" | ") || k.report.join(" | ")}`);
		else {
			sai++;
			ghi(`DO ${ten}: ${JSON.stringify(k)}`);
		}
	}
	const d = thuMucTam();
	const shape = join(d, "shape.json");
	writeFileSync(shape, JSON.stringify({ roots: ["apps", "packages"], checkers: [{ id: "x", kind: "la" }] }));
	const truoc = join(d, "runs-before");
	let runs = [];
	try {
		runs = readdirSync(join(GOC, ".turbo", "runs"));
	} catch {
		runs = [];
	}
	writeFileSync(truoc, runs.join("\n"));
	const la = spawnSync("bun", [join(GOC, "scripts", "verify-gate-shape.mjs"), "--shape", shape, "--runs-before", truoc], { cwd: GOC, encoding: "utf8" });
	if (la.status !== 0 && `${la.stdout}${la.stderr}`.includes("checker 'x' has an unknown kind 'la'")) ghi("xanh kieu-la: unknown kind");
	else {
		sai++;
		ghi(`DO kieu-la: ma ${la.status} ${la.stderr}`);
	}

	const saoMod = join(thuMucTam(), "gate-shape-node-test.mjs");
	const goc = readFileSync(join(GOC, "scripts", "gate-shape-node-test.mjs"), "utf8");
	const moc = "} else if (gate.tests < reference.tests) {";
	if (goc.split(moc).length !== 2) {
		ghi("MOC VANG V16");
		process.exit(2);
	}
	writeFileSync(saoMod, goc.replace(moc, "} else if (false) {"));
	const dot = await import(pathToFileURL(saoMod).href);
	const kDot = dot.checkNodeTest(checker, log(bot), { root: GOC, reference: thamChieu });
	if (ca[2][2](kDot)) {
		sai++;
		ghi("SONG V16: bo so so ca ma ca bot-mot van xanh");
	} else ghi("BAT V16: bo so so ca → ca bot-mot do");
	ghi(sai === 0 ? "XANH checker-node-test" : `DO checker-node-test: ${sai}`);
	return sai === 0;
}

let xanh = false;
try {
	const a = noiCong();
	const b = await checkerNodeTest();
	xanh = a && b;
} finally {
	for (const d of tam) rmSync(d, { recursive: true, force: true });
}
ghi(`KET LUAN: ${xanh ? "xanh" : "do"}`);
process.exit(xanh ? 0 : 1);
