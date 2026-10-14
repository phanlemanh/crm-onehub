import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "../../..");
const APP = join(GOC, "apps/app");
const TEP = "apps/app/test/noi-bon-nut.dom.tsx";
const BAN_TAM = "test/ngay-lich-ban-cu.tam.dom.tsx";
const SHA_TRUOC_VONG = "c1864a3a2e726d20c65fcd8f91596ae1966cd755";
const NGAY = { thang: "2026-10", gioUtc: "05:00:00Z" };
const THONG_DIEP_DO = "khong toi trang thai nut ngay hien 2026-10-15";
const NGOAI_VAT = [/^_acceptance\//, /^docs\//, /\.md$/, /^LO-TRINH\.html$/];

const MA_TRAN = [
	{ ban: "sua", ngay: 14, mong: "xanh" },
	{ ban: "sua", ngay: 15, mong: "xanh" },
	{ ban: "sua", ngay: 16, mong: "xanh" },
	{ ban: "truoc-vong", ngay: 14, mong: "xanh" },
	{ ban: "truoc-vong", ngay: 15, mong: "do" },
];

function git(...args) {
	const r = spawnSync("git", args, { cwd: GOC, encoding: "utf8" });
	if (r.status !== 0) throw new Error(`git ${args.join(" ")}: ${r.stderr}`);
	return r.stdout;
}

function chay(tep, preload) {
	const r = spawnSync(
		"bun",
		[
			"test",
			"--preload",
			"../../packages/ui/test/setup-dom.ts",
			"--preload",
			preload,
			`./${tep}`,
			"-t",
			"tao-ke-hoach",
		],
		{ cwd: APP, encoding: "utf8", env: { ...process.env, TZ: "Asia/Ho_Chi_Minh" } },
	);
	return { ma: r.status, ra: `${r.stdout}\n${r.stderr}` };
}

function baNgay() {
	const thuMuc = mkdtempSync(join(tmpdir(), "ngay-lich-"));
	writeFileSync(join(APP, BAN_TAM), git("show", `${SHA_TRUOC_VONG}:${TEP}`));
	const loi = [];
	try {
		for (const o of MA_TRAN) {
			const preload = join(thuMuc, `ngay-${o.ngay}.ts`);
			writeFileSync(
				preload,
				`import { setSystemTime } from "bun:test";\nsetSystemTime(new Date("${NGAY.thang}-${o.ngay}T${NGAY.gioUtc}"));\n`,
			);
			const tep = o.ban === "sua" ? "test/noi-bon-nut.dom.tsx" : BAN_TAM;
			const r = chay(tep, preload);
			const ra = r.ma === 0 ? "xanh" : "do";
			const ghim = o.mong === "do" ? r.ra.includes(THONG_DIEP_DO) : true;
			console.log(`${o.ban} ngay ${o.ngay}: ${ra} (mong ${o.mong})${o.mong === "do" ? ` · thong diep ghim ${ghim ? "co" : "KHONG"}` : ""}`);
			if (ra !== o.mong || !ghim) loi.push(`${o.ban} ngay ${o.ngay}`);
		}
	} finally {
		rmSync(join(APP, BAN_TAM), { force: true });
		rmSync(thuMuc, { recursive: true, force: true });
	}
	if (loi.length > 0) console.log(`SAI ${loi.join(", ")}`);
	console.log(loi.length === 0 ? "DAT" : "KHONG DAT");
	return loi.length === 0 ? 0 : 1;
}

function phamVi() {
	const goc = git("merge-base", "HEAD", SHA_TRUOC_VONG).trim();
	const doi = git("diff", "--name-only", `${goc}...HEAD`)
		.split("\n")
		.filter(Boolean);
	const vat = doi.filter((t) => !NGOAI_VAT.some((m) => m.test(t)));
	console.log(`tep vat doi: ${vat.join(", ") || "(khong)"}`);
	const dung = vat.length === 1 && vat[0] === TEP;
	console.log(dung ? "DAT" : `KHONG DAT: chi duoc doi ${TEP}`);
	return dung ? 0 : 1;
}

process.exit(process.argv.includes("--pham-vi") ? phamVi() : baNgay());
