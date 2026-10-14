import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "../../../packages/validation/node_modules/zod/index.js";
import { neo } from "./ranh-gioi.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "..", "..", "..");
const SLUG = "gan-tay-va-kara-co-ly-do";
const DA_KY = new Set(["signed-off", "machine-cleared"]);
const MAY = new Set(["test"]);
const TEP_KHONG_DOI = [
	"apps/api/test/okr-can-chinh.spec.ts",
	"apps/api/test/okr-ly-do-can-chinh.spec.ts",
];

const git = (...a) =>
	execFileSync("git", ["-C", GOC, ...a], {
		encoding: "utf8",
		maxBuffer: 64 << 20,
	});

const config = Bun.YAML.parse(
	readFileSync(join(GOC, "_acceptance/config.yaml"), "utf8"),
);

function giaiLenh(cmd) {
	if (!cmd.startsWith("config:")) return cmd;
	const gt = cmd
		.slice("config:".length)
		.split(".")
		.reduce((o, k) => (o == null ? undefined : o[k]), config);
	const r = z.string().safeParse(gt);
	if (!r.success) throw new Error(`khong giai duoc ${cmd}`);
	return r.data;
}

const trangThai = (hoSo) => {
	const hd = join(GOC, "_acceptance", hoSo, "contract.md");
	if (!existsSync(hd)) return null;
	return readFileSync(hd, "utf8").match(/^status:\s*(\S+)/m)?.[1] ?? null;
};

const LOAI = [
	/^_acceptance\//,
	/^docs\//,
	/(^|\/)test\//,
	/^PRODUCT-MAP\.md$/,
	/^LO-TRINH\.html$/,
];
export const tepMa = (tepDoi) =>
	tepDoi.filter((t) => !LOAI.some((r) => r.test(t)));
const coDaiDien = (p) => /[*?[{]/.test(p);

const truong = (khoi, ten) =>
	khoi.match(new RegExp(`^ {4}${ten}: *(.*)$`, "m"))?.[1]?.trim() ?? null;

export function docTheoDong(tho) {
	const khoi = tho.split(/^ {2}- id: */m).slice(1);
	return khoi.map((k) => {
		const id = k.split("\n")[0].trim();
		const cmd = truong(k, "cmd");
		const executor = truong(k, "executor");
		if (!id || !executor || (executor === "test" && !cmd))
			throw new Error(`khoi eval thieu id/executor/cmd: ${id}`);
		const dongPaths = truong(k, "paths");
		const paths = dongPaths
			? dongPaths
					.replace(/^\[|\]$/g, "")
					.split(",")
					.map((x) => x.trim().replace(/^"|"$/g, ""))
					.filter(Boolean)
			: [];
		const ky = truong(k, "expected_exit");
		return {
			id,
			executor,
			cmd,
			status: truong(k, "status"),
			expected_exit: ky === null ? undefined : Number(ky),
			paths,
		};
	});
}

export function tapEval(tepDoi) {
	const ma = new Set(tepMa(tepDoi));
	const ra = [];
	const khongDoc = [];
	const docDong = [];
	for (const hoSo of readdirSync(join(GOC, "_acceptance")).sort()) {
		if (hoSo === SLUG || !DA_KY.has(trangThai(hoSo) ?? "")) continue;
		const tep = join(GOC, "_acceptance", hoSo, "evals.yaml");
		if (!existsSync(tep)) continue;
		const tho = readFileSync(tep, "utf8");
		let ds;
		try {
			ds = Bun.YAML.parse(tho)?.evals ?? [];
		} catch {
			try {
				ds = docTheoDong(tho);
				docDong.push(hoSo);
			} catch {
				if ([...ma].some((t) => tho.includes(t))) khongDoc.push(hoSo);
				continue;
			}
		}
		for (const e of ds) {
			if (!MAY.has(e.executor) || e.status === "not-run") continue;
			const paths = Array.isArray(e.paths) ? e.paths.map(String) : [];
			if (paths.some((p) => !coDaiDien(p) && ma.has(p)))
				ra.push({
					hoSo,
					id: e.id,
					cmd: String(e.cmd),
					ky: e.expected_exit ?? 0,
				});
		}
	}
	return { ra, khongDoc, docDong };
}

function doiChung() {
	const co = tapEval(["apps/api/src/okr/tro-ly.service.ts"]).ra;
	if (co.length === 0)
		throw new Error(
			"doi chung duong: bo loc khong thay eval da ky nao cua tro-ly.service.ts",
		);
	const khong = tapEval(["_acceptance/config.yaml"]).ra;
	if (khong.length !== 0) throw new Error(`doi chung am: N = ${khong.length}`);
}

function tepCo() {
	const n = neo();
	const loi = [];
	for (const t of TEP_KHONG_DOI) {
		if (!existsSync(join(GOC, t))) loi.push(`tep khong ton tai: ${t}`);
		else if (git("diff", "--name-only", n.tu, n.den, "--", t).trim())
			loi.push(`tep ho so da ky bi sua: ${t}`);
	}
	return { n, loi };
}

doiChung();
const { n, loi } = tepCo();
for (const l of loi) console.error(l);
if (loi.length > 0) process.exit(1);
const tepDoi = git("diff", "--name-only", n.tu, n.den)
	.split("\n")
	.filter(Boolean);
const { ra: tap, khongDoc, docDong } = tapEval(tepDoi);
for (const h of docDong) console.log(`doc theo dong (yaml hong): ${h}`);
for (const h of khongDoc) console.error(`evals khong doc duoc: ${h}`);
if (khongDoc.length > 0) process.exit(1);
console.log(`tep ma san pham doi: ${tepMa(tepDoi).join(", ")}`);
console.log(`N = ${tap.length} eval da ky cham diff`);
for (const e of tap) console.log(`  ${e.hoSo}#${e.id}`);
const theoLenh = new Map();
for (const e of tap) {
	const lenh = giaiLenh(e.cmd);
	theoLenh.set(lenh, [...(theoLenh.get(lenh) ?? []), e]);
}
let daChay = 0;
const doLoi = [];
for (const [lenh, ds] of theoLenh) {
	const r = spawnSync("bash", ["-c", lenh], { cwd: GOC, stdio: "inherit" });
	daChay += 1;
	for (const e of ds) {
		if (r.status !== e.ky)
			doLoi.push(
				`eval da ky do: ${e.hoSo}#${e.id} (ma ${r.status}, ky ${e.ky})`,
			);
	}
}
console.log(`da chay ${daChay}/${theoLenh.size} lenh khac nhau`);
for (const l of doLoi) console.error(l);
if (daChay !== theoLenh.size || doLoi.length > 0) process.exit(1);
console.log("giu ho so dat");
