import { execFileSync, spawnSync } from "node:child_process";
import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	symlinkSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "../../../packages/validation/node_modules/zod/index.js";
import { neo } from "./ranh-gioi.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const GOC = resolve(HERE, "..", "..", "..");
const SLUG = "so-do-can-chinh-don-vi";
const DA_KY = new Set(["signed-off", "machine-cleared"]);
const MAY = new Set(["test", "script"]);
const TEP_KHONG_DOI = [
	"apps/api/test/okr-can-chinh.spec.ts",
	"apps/api/src/okr/can-chinh.ts",
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

function daNghi() {
	const hd = readFileSync(join(GOC, `_acceptance/${SLUG}/contract.md`), "utf8");
	const dong = hd.split("\n").find((d) => d.startsWith("- Eval đã nghỉ"));
	return new Set(
		dong ? [...dong.matchAll(/`([^`#]+#E\d+)`/g)].map((m) => m[1]) : [],
	);
}

function doiChung() {
	const co = tapEval(["apps/api/src/okr/okr-xem.service.ts"]).ra;
	if (co.length === 0)
		throw new Error(
			"doi chung duong: bo loc khong thay eval da ky nao cua okr-xem.service.ts",
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
			loi.push(`sua tep cam: ${t.split("/").pop()}`);
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
const nghi = daNghi();
const { ra: tatCa, khongDoc, docDong } = tapEval(tepDoi);
const tap = tatCa.filter((e) => !nghi.has(`${e.hoSo}#${e.id}`));
for (const e of tatCa)
	if (nghi.has(`${e.hoSo}#${e.id}`))
		console.log(`bo qua eval da nghi: ${e.hoSo}#${e.id}`);
for (const h of docDong) console.log(`doc theo dong (yaml hong): ${h}`);
for (const h of khongDoc) console.error(`evals khong doc duoc: ${h}`);
if (khongDoc.length > 0) process.exit(1);
console.log(`tep ma san pham doi: ${tepMa(tepDoi).join(", ")}`);
console.log(`N = ${tap.length} eval da ky cham diff`);
for (const e of tap) console.log(`  ${e.hoSo}#${e.id}`);
if (process.argv.includes("--liet-ke")) process.exit(0);
const theoLenh = new Map();
for (const e of tap) {
	const lenh = giaiLenh(e.cmd);
	theoLenh.set(lenh, [...(theoLenh.get(lenh) ?? []), e]);
}
function banNen(sha) {
	const tam = mkdtempSync(join(tmpdir(), "dh4-giu-nen-"));
	execFileSync("bash", [
		"-c",
		`git -C "${GOC}" archive ${sha} | tar -x -C "${tam}"`,
	]);
	const nm = execFileSync(
		"bash",
		[
			"-c",
			`cd "${GOC}" && ls -d node_modules apps/*/node_modules packages/*/node_modules 2>/dev/null`,
		],
		{ encoding: "utf8" },
	)
		.split("\n")
		.filter(Boolean);
	for (const d of nm) {
		mkdirSync(dirname(join(tam, d)), { recursive: true });
		symlinkSync(join(GOC, d), join(tam, d));
	}
	if (existsSync(join(GOC, ".env")))
		symlinkSync(join(GOC, ".env"), join(tam, ".env"));
	return tam;
}

let daChay = 0;
const doTrenVat = [];
for (const [lenh, ds] of theoLenh) {
	const r = spawnSync("bash", ["-c", lenh], { cwd: GOC, stdio: "inherit" });
	daChay += 1;
	for (const e of ds) {
		if (r.status !== e.ky) doTrenVat.push({ e, lenh, ma: r.status });
		else console.log(`DUNG ${e.hoSo}/${e.id}`);
	}
}
console.log(`da chay ${daChay}/${theoLenh.size} lenh khac nhau`);
const doLoi = [];
if (doTrenVat.length > 0) {
	const nen = banNen(n.tu);
	try {
		const daChayNen = new Map();
		for (const { e, lenh, ma } of doTrenVat) {
			if (!daChayNen.has(lenh))
				daChayNen.set(
					lenh,
					spawnSync("bash", ["-c", lenh], { cwd: nen, stdio: "inherit" })
						.status,
				);
			const maNen = daChayNen.get(lenh);
			if (maNen === e.ky)
				doLoi.push(
					`eval da ky do do vong: ${e.hoSo}#${e.id} (ma ${ma}, ky ${e.ky}, nen ${n.tu.slice(0, 9)} xanh)`,
				);
			else
				console.log(
					`DO SAN ${e.hoSo}/${e.id} (ma ${ma}; tren nen ${n.tu.slice(0, 9)} cung ma ${maNen}, ky ${e.ky})`,
				);
		}
	} finally {
		rmSync(nen, { recursive: true, force: true });
	}
}
for (const l of doLoi) console.error(l);
if (daChay !== theoLenh.size || doLoi.length > 0) process.exit(1);
console.log("giu ho so dat");
