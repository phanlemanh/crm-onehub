import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const GOC = resolve(import.meta.dirname, "../../..");
const APP = join(GOC, "apps/app");
const TEP = "apps/app/test/noi-bon-nut.dom.tsx";
const BAN_TAM = "test/ngay-lich-ban-cu.tam.tsx";
const SHA_TRUOC_VONG = "c1864a3a2e726d20c65fcd8f91596ae1966cd755";
const NHANH_CHINH = "origin/onehub";
const THONG_DIEP_DO = "khong toi trang thai nut ngay hien 2026-10-15";
const NGOAI_VAT = [/^_acceptance\//, /^docs\//, /\.md$/, /^LO-TRINH\.html$/];

const MA_TRAN = [
	{ ban: "sua", luc: "2026-10-14T05:00:00Z", ten: "12:00 ngay 14 VN", mong: "xanh" },
	{ ban: "sua", luc: "2026-10-15T05:00:00Z", ten: "12:00 ngay 15 VN", mong: "xanh" },
	{ ban: "sua", luc: "2026-10-16T05:00:00Z", ten: "12:00 ngay 16 VN", mong: "xanh" },
	{ ban: "sua", luc: "2026-10-14T17:30:00Z", ten: "00:30 ngay 15 VN", mong: "xanh" },
	{ ban: "sua", luc: "2026-10-15T16:30:00Z", ten: "23:30 ngay 15 VN", mong: "xanh" },
	{ ban: "truoc-vong", luc: "2026-10-14T05:00:00Z", ten: "12:00 ngay 14 VN", mong: "xanh" },
	{ ban: "truoc-vong", luc: "2026-10-15T05:00:00Z", ten: "12:00 ngay 15 VN", mong: "do" },
	{ ban: "truoc-vong", luc: "2026-10-14T17:30:00Z", ten: "00:30 ngay 15 VN", mong: "do" },
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
	const ra = `${r.stdout}\n${r.stderr}`;
	const dem = (nhan) => Number(ra.match(new RegExp(`^\\s*(\\d+) ${nhan}$`, "m"))?.[1] ?? 0);
	return { ma: r.status, ra, pass: dem("pass"), fail: dem("fail") };
}

function ketQua(r) {
	if (r.ma === 0 && r.pass === 1 && r.fail === 0) return "xanh";
	if (r.ma !== 0 && r.pass === 0 && r.fail === 1) return "do";
	return `la (ma ${r.ma}, ${r.pass} pass, ${r.fail} fail)`;
}

function baNgay() {
	const thuMuc = mkdtempSync(join(tmpdir(), "ngay-lich-"));
	writeFileSync(join(APP, BAN_TAM), git("show", `${SHA_TRUOC_VONG}:${TEP}`));
	const loi = [];
	try {
		for (const [i, o] of MA_TRAN.entries()) {
			const preload = join(thuMuc, `dong-ho-${i}.ts`);
			writeFileSync(
				preload,
				`import { setSystemTime } from "bun:test";\nsetSystemTime(new Date("${o.luc}"));\n`,
			);
			const r = chay(o.ban === "sua" ? "test/noi-bon-nut.dom.tsx" : BAN_TAM, preload);
			const kq = ketQua(r);
			const ghim = o.mong === "do" ? r.ra.includes(THONG_DIEP_DO) : true;
			console.log(
				`${o.ban} ${o.ten}: ${kq} (mong ${o.mong})${o.mong === "do" ? ` · thong diep ghim ${ghim ? "co" : "KHONG"}` : ""}`,
			);
			if (kq !== o.mong || !ghim) loi.push(`${o.ban} ${o.ten}`);
		}
	} finally {
		rmSync(join(APP, BAN_TAM), { force: true });
		rmSync(thuMuc, { recursive: true, force: true });
	}
	const du = git("status", "--porcelain", "--", "apps/app/test")
		.split("\n")
		.filter((d) => d.includes(".tam."));
	if (du.length > 0) loi.push(`cay con tep tam: ${du.join(", ")}`);
	for (const l of loi) console.log(`SAI ${l}`);
	console.log(loi.length === 0 ? "DAT" : "KHONG DAT");
	return loi.length === 0 ? 0 : 1;
}

function chiDoiTepTest(doi) {
	const vat = doi.filter((t) => !NGOAI_VAT.some((m) => m.test(t)));
	return { vat, dung: vat.length === 1 && vat[0] === TEP };
}

function phamVi() {
	const doi = git("diff", "--name-only", `${NHANH_CHINH}...HEAD`)
		.split("\n")
		.filter(Boolean);
	const { vat, dung } = chiDoiTepTest(doi);
	const doiChung = chiDoiTepTest([...doi, "apps/app/lib/tep-ngoai.ts"]).dung;
	console.log(`goc: merge-base ${NHANH_CHINH} HEAD · tep vat doi: ${vat.join(", ") || "(khong)"}`);
	console.log(`doi chung them mot tep ngoai: ${doiChung ? "VAN DAT (thuoc hong)" : "khong dat (dung)"}`);
	const dat = dung && !doiChung;
	console.log(dat ? "DAT" : `KHONG DAT: chi duoc doi ${TEP}`);
	return dat ? 0 : 1;
}

process.exit(process.argv.includes("--pham-vi") ? phamVi() : baNgay());
