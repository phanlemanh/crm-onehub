import { execFileSync, spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { GOC, LOI, SLUG, THE, capVong, git, giaiNenKit, thuMucTam } from "./kit.mjs";
import { soDoiChung } from "./luat.mjs";

function chay(lenh, doiSo) {
	return new Promise((xong) => {
		const p = spawn(lenh, doiSo, { stdio: ["ignore", "pipe", "pipe"] });
		let ra = "";
		p.stdout.on("data", (d) => (ra += d));
		p.stderr.on("data", (d) => (ra += d));
		p.on("close", (ma) => xong({ ma, ra }));
	});
}

const cap = capVong();
const mb = cap.nen;
const dau = git(GOC, "rev-parse", "HEAD").trim();
const nen = thuMucTam("nen");
execFileSync("git", ["clone", "-q", "--no-checkout", GOC, nen]);
git(nen, "checkout", "-q", "--detach", mb);
const kitMoi = giaiNenKit(LOI, thuMucTam("kit"));

const [cu, moi, sau] = await Promise.all([
	chay("bash", [join(nen, "scripts", "pre-merge-check.sh"), nen, "--recheck-all", "--base", mb]),
	chay("bash", [join(kitMoi, "scripts", "pre-merge-check.sh"), nen, "--recheck-all", "--base", mb]),
	chay("bash", [join(GOC, "scripts", "pre-merge-check.sh"), GOC, "--recheck-all", "--base", mb]),
]);

const nhat = join(GOC, ".acceptance-runs", SLUG, "doi-chung");
mkdirSync(nhat, { recursive: true });
writeFileSync(join(nhat, "nen-lop-chinh.log"), cu.ra);
writeFileSync(join(nhat, "nen-lop-moi.log"), moi.ra);
writeFileSync(join(nhat, "head.log"), sau.ra);

const kq = soDoiChung({ nenCu: cu.ra, nenMoi: moi.ra, dau: { van: sau.ra, slug: SLUG } });
if (kq.loi.length) {
	for (const l of kq.loi) console.log(`DO doi-chung: ${l}`);
	console.log(`nhật ký: ${nhat}`);
	process.exit(1);
}
console.log(
	`doi-chung: merge-base ${mb.slice(0, 8)} --recheck-all — lớp chép của nhánh chính và kit ${THE} cùng 0 VIOLATION, cùng ${kq.ok} hồ sơ OK`,
);
console.log(
	`doi-chung: HEAD ${dau.slice(0, 8)} --recheck-all lớp chép của HEAD — ${kq.okDau} hồ sơ OK (đủ ${kq.ok} của nền), VIOLATION ngoài vòng 0, của vòng ${kq.vongCuaVong}`,
);
