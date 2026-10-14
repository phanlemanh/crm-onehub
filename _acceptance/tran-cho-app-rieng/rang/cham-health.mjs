import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "../../..");
const APP = join(GOC, "apps/agent-okr");
const TEP = "apps/agent-okr/test/app-rieng.integration.spec.ts";
const TEP_CAU_HINH = "apps/agent-okr/test/support/khoi-dong.ts";
const BAN_TAM = "test/app-rieng-cu.tam.ts";
const SHA_TRUOC_VONG = "3818ad4ecbaa06034dd83d0fa904a03cdc20aaeb";
const NHANH_CHINH = "origin/onehub";
const TEN_BAI = "chạy cạnh apps/agent";
const DUONG_CHAM = "/eve/v1/health";
const CHAM_MS = 6_000;
const THONG_DIEP_DO = "timed out after 5000ms";
const NGOAI_VAT = [/^_acceptance\//, /^docs\//, /\.md$/, /^LO-TRINH\.html$/];

const MA_TRAN = [
	{ ban: "sua", cham: 0, mong: "xanh" },
	{ ban: "sua", cham: CHAM_MS, mong: "xanh" },
	{ ban: "truoc-vong", cham: 0, mong: "xanh" },
	{ ban: "truoc-vong", cham: CHAM_MS, mong: "do" },
];

function git(...args) {
	const r = spawnSync("git", args, { cwd: GOC, encoding: "utf8" });
	if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
	return r.stdout;
}

function preloadCham(thuMuc, ms) {
	const tep = join(thuMuc, `cham-${ms}.ts`);
	writeFileSync(
		tep,
		`const goc = globalThis.fetch;\nglobalThis.fetch = (async (vao, tuyChon) => {\n\tif (String(vao instanceof Request ? vao.url : vao).includes(${JSON.stringify(DUONG_CHAM)})) await Bun.sleep(${ms});\n\treturn goc(vao, tuyChon);\n}) as typeof fetch;\n`,
	);
	return tep;
}

function chay(tep, preload) {
	const r = spawnSync("bun", ["test", "--preload", preload, `./${tep}`, "-t", TEN_BAI], {
		cwd: APP,
		encoding: "utf8",
		env: process.env,
	});
	const ra = `${r.stdout}\n${r.stderr}`;
	const dem = (nhan) => Number(ra.match(new RegExp(`^\\s*(\\d+) ${nhan}$`, "m"))?.[1] ?? 0);
	const boQua = /bo qua ca chay canh apps\/agent/.test(ra);
	return { ma: r.status, ra, pass: dem("pass"), fail: dem("fail"), boQua };
}

function ketQua(r) {
	if (r.boQua) return "bo qua (khong chay ca canh apps/agent)";
	if (r.ma === 0 && r.pass === 1 && r.fail === 0) return "xanh";
	if (r.ma !== 0 && r.pass === 0 && r.fail >= 1) return "do";
	return `la (ma ${r.ma}, ${r.pass} pass, ${r.fail} fail)`;
}

function bonO() {
	const thuMuc = mkdtempSync(join(tmpdir(), "cham-health-"));
	writeFileSync(join(APP, BAN_TAM), git("show", `${SHA_TRUOC_VONG}:${TEP}`));
	const loi = [];
	try {
		for (const o of MA_TRAN) {
			const r = chay(
				o.ban === "sua" ? "test/app-rieng.integration.spec.ts" : BAN_TAM,
				preloadCham(thuMuc, o.cham),
			);
			const kq = ketQua(r);
			const ghim = o.mong === "do" ? r.ra.includes(THONG_DIEP_DO) : true;
			console.log(
				`${o.ban} cham ${o.cham} ms: ${kq} (mong ${o.mong})${o.mong === "do" ? ` · thong diep ghim ${ghim ? "co" : "KHONG"}` : ""}`,
			);
			if (kq !== o.mong || !ghim) loi.push(`${o.ban} cham ${o.cham} ms`);
		}
	} finally {
		rmSync(join(APP, BAN_TAM), { force: true });
		rmSync(thuMuc, { recursive: true, force: true });
	}
	const du = git("status", "--porcelain", "--", "apps/agent-okr/test")
		.split("\n")
		.filter((d) => d.includes(".tam."));
	if (du.length > 0) loi.push(`cay con tep tam: ${du.join(", ")}`);
	for (const l of loi) console.log(`SAI ${l}`);
	console.log(loi.length === 0 ? "DAT" : "KHONG DAT");
	return loi.length === 0 ? 0 : 1;
}

function chiDoiTepTest(doi) {
	const vat = doi.filter((t) => !NGOAI_VAT.some((m) => m.test(t))).sort();
	const dung = JSON.stringify(vat) === JSON.stringify([TEP, TEP_CAU_HINH].sort());
	return { vat, dung };
}

function phamVi() {
	const doi = git("diff", "--name-only", `${NHANH_CHINH}...HEAD`)
		.split("\n")
		.filter(Boolean);
	const { vat, dung } = chiDoiTepTest(doi);
	const doiChung = chiDoiTepTest([...doi, "apps/agent-okr/agent/lib/tep-ngoai.ts"]).dung;
	console.log(`goc: merge-base ${NHANH_CHINH} HEAD · tep vat doi: ${vat.join(", ") || "(khong)"}`);
	console.log(`doi chung them mot tep ngoai: ${doiChung ? "VAN DAT (thuoc hong)" : "khong dat (dung)"}`);
	const dat = dung && !doiChung;
	console.log(dat ? "DAT" : `KHONG DAT: chi duoc doi ${TEP} va ${TEP_CAU_HINH}`);
	return dat ? 0 : 1;
}

process.exit(process.argv.includes("--pham-vi") ? phamVi() : bonO());
