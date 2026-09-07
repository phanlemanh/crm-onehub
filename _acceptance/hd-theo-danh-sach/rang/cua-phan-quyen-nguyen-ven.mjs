import { execSync } from "node:child_process";
import { join } from "node:path";

const GOC = join(import.meta.dirname, "..", "..", "..");
const SHA = "5ac85ef9f1a811afb4d101c832904fd5a691cfca";
const BO_TEST = "apps/api/test/workspace.spec.ts";

const HANH_VI = [
	["acme.com", "lewis@acme.com", true],
	["acme.com", "someone@mail.acme.com", true],
	["acme.com", "lewis@gmail.com", false],
	["acme.com", "a@acme.com.evil.com", false],
	["lewis@gmail.com", "lewis@gmail.com", true],
	["lewis@gmail.com", "someone.else@gmail.com", false],
	["acme.com, contractor@gmail.com", "lewis@acme.com", true],
	["acme.com, contractor@gmail.com", "contractor@gmail.com", true],
	["acme.com, contractor@gmail.com", "stranger@gmail.com", false],
	["", "lewis@acme.com", false],
];

function chay(lenh, cwd = GOC) {
	try {
		return { ma: 0, ra: execSync(lenh, { cwd, encoding: "utf8", stdio: "pipe", maxBuffer: 20e6 }) };
	} catch (e) {
		return { ma: e.status ?? 1, ra: `${e.stdout ?? ""}${e.stderr ?? ""}` };
	}
}

const coSha = chay(`git cat-file -e ${SHA}^{commit}`);
if (coSha.ma !== 0) {
	console.error(`KHONG DO DUOC: khong doc duoc sha ghim ${SHA} trong clone nay.`);
	process.exit(2);
}

const diff = chay(`git diff ${SHA} -- ${BO_TEST}`);
const soDong = diff.ra.trim() === "" ? 0 : diff.ra.trim().split("\n").length;
console.log(`(1) diff voi sha ghim ${SHA.slice(0, 8)}: ${soDong} dong`);
if (soDong !== 0) {
	console.error(`DO: ${BO_TEST} da doi so voi sha ghim — cua phan quyen khong duoc dung toi.`);
	console.error(diff.ra.slice(0, 1200));
	process.exit(1);
}

const bo = chay("bun test test/workspace.spec.ts 2>&1", join(GOC, "apps/api"));
const xanh = /(\d+) pass/.exec(bo.ra);
const do_ = /(\d+) fail/.exec(bo.ra);
if (xanh === null) {
	console.error("KHONG DO DUOC: bo test cua cua phan quyen khong chay duoc.");
	console.error(bo.ra.slice(-600));
	process.exit(2);
}
console.log(`(2) bo test chay that: ${xanh[1]} ca xanh · ${do_?.[1] ?? "?"} ca do`);
if (bo.ma !== 0 || Number(do_?.[1] ?? 0) > 0) {
	console.error("DO: bo test cua cua phan quyen khong con xanh.");
	process.exit(1);
}

const kich = HANH_VI.map(
	([ds, mail, mong]) =>
		`process.env.ALLOWED_SIGN_IN=${JSON.stringify(ds)};console.log(${JSON.stringify(`${ds}|${mail}|${mong}`)}+"|"+m.isWorkspaceEmail(${JSON.stringify(mail)}));`,
).join("");
const ra = chay(
	`bun -e 'import("@crm/auth/workspace").then(m=>{${kich}})' 2>&1`,
	join(GOC, "apps/api"),
);
if (ra.ma !== 0) {
	console.error("KHONG DO DUOC: khong nap duoc isWorkspaceEmail de doi chung hanh vi.");
	console.error(ra.ra.slice(-500));
	process.exit(2);
}
const lech = [];
for (const dong of ra.ra.trim().split("\n")) {
	const [ds, mail, mong, that] = dong.split("|");
	if (mong !== that) lech.push(`danh sach ${JSON.stringify(ds)} · ${mail}: mong ${mong}, nhan ${that}`);
}
console.log(`(3) doi chung hanh vi: ${HANH_VI.length} ca cua bo test cu chay lai`);
if (lech.length > 0) {
	for (const l of lech) console.error(`DO: hanh vi cua cua phan quyen DA DOI — ${l}`);
	process.exit(1);
}
console.log(
	`XANH: ${BO_TEST} khong doi mot ky tu so voi sha ghim, ${xanh[1]} ca cua no van xanh, va ${HANH_VI.length} ca hanh vi chay lai cho ket qua y het.`,
);
