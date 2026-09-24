import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const TEP = process.env.VVC_TEP ?? "apps/api/test/go-la-cat-quyen.spec.ts";
const VONG = Object.freeze({
	truoc: "41e04c7261b33db746558978b1ed01309b13257f",
	sau: "f969304e7ec0118cd20efeb27af9fb8d73baa53b",
});

function git(...args) {
	return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim();
}

const dong = git("diff", "--numstat", VONG.truoc, VONG.sau, "--", TEP);
const [them, xoa] = dong ? dong.split(/\s+/).map(Number) : [0, 0];

console.log(
	`${TEP} tu ${VONG.truoc.slice(0, 8)} toi ${VONG.sau.slice(0, 8)}: them=${them} xoa=${xoa}`,
);

if (xoa > 0) {
	console.error(
		`bai cu cua go-la-cat-quyen bi sua: ${xoa} dong bi xoa hoac sua`,
	);
	process.exit(1);
}
if (them === 0) {
	console.error("khong thay thay doi — phep do mo");
	process.exit(1);
}
